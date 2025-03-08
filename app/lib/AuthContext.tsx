'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User, getUserSubscriptionStatus } from './supabase';
import { useRouter } from 'next/navigation';
import * as userService from './userService';

type AuthContextType = {
  user: User | null;
  enhancedUser: userService.EnhancedUser | null;
  userSettings: userService.UserSettings | null;
  isPaid: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; success: boolean }>;
  signUp: (email: string, password: string) => Promise<{ error: any; success: boolean }>;
  signOut: () => Promise<void>;
  devMode: boolean;
  toggleDevMode: () => void;
  updateProfile: (profileData: Partial<userService.EnhancedUser>) => Promise<boolean>;
  updateSettings: (settingsData: Partial<userService.UserSettings>) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  enhancedUser: null,
  userSettings: null,
  isPaid: false,
  loading: true,
  signIn: async () => ({ error: null, success: false }),
  signUp: async () => ({ error: null, success: false }),
  signOut: async () => {},
  devMode: false,
  toggleDevMode: () => {},
  updateProfile: async () => false,
  updateSettings: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [enhancedUser, setEnhancedUser] = useState<userService.EnhancedUser | null>(null);
  const [userSettings, setUserSettings] = useState<userService.UserSettings | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [devMode, setDevMode] = useState<boolean>(false);
  const router = useRouter();

  // Load enhanced user data
  const loadEnhancedUserData = async (userId: string) => {
    try {
      // Get enhanced user data
      const enhancedUserData = await userService.getUser(userId);
      if (enhancedUserData) {
        setEnhancedUser(enhancedUserData);
      }
      
      // Get user settings
      const settings = await userService.getUserSettings(userId);
      if (settings) {
        setUserSettings(settings);
      }
      
      // Update last login
      await userService.updateUserLastLogin(userId);
      
      // Log login activity
      await userService.logUserActivity(userId, 'login', {
        method: 'session',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error loading enhanced user data:', err);
    }
  };

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { id, email } = session.user;
          setUser({ 
            id, 
            email: email || '', 
            is_paid: false, 
            created_at: new Date().toISOString() 
          });
          
          // Check if user is on paid tier
          const isPaidUser = await getUserSubscriptionStatus(id);
          setIsPaid(isPaidUser);
          
          // Load enhanced user data
          await loadEnhancedUserData(id);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const { id, email } = session.user;
          setUser({ 
            id, 
            email: email || '', 
            is_paid: false, 
            created_at: new Date().toISOString() 
          });
          
          // Check if user exists in our users table
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
            
          if (!existingUser) {
            // Create user record if it doesn't exist
            const { error: insertError } = await supabase
              .from('users')
              .insert([{ id, email: email || '', is_paid: false }]);
              
            if (insertError) {
              console.error('Error creating user record:', insertError);
            }
          }
          
          // Check if user is on paid tier
          const isPaidUser = await getUserSubscriptionStatus(id);
          setIsPaid(isPaidUser);
          
          // Load enhanced user data
          await loadEnhancedUserData(id);
          
          // Redirect to dashboard on successful sign-in
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setEnhancedUser(null);
          setUserSettings(null);
          setIsPaid(false);
          router.push('/');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error, success: false };
      }
      
      // Log sign in activity
      if (data.user) {
        await userService.logUserActivity(data.user.id, 'sign_in', {
          method: 'password',
          timestamp: new Date().toISOString()
        });
      }
      
      return { error: null, success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error, success: false };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        return { error, success: false };
      }
      
      // If email confirmation is not required, create user record immediately
      if (data.user && !data.session) {
        console.log('Email confirmation required. Please check your email.');
        return { 
          error: { message: 'Please check your email to confirm your account.' }, 
          success: true 
        };
      }
      
      // Log sign up activity
      if (data.user) {
        await userService.logUserActivity(data.user.id, 'sign_up', {
          method: 'email',
          timestamp: new Date().toISOString()
        });
      }
      
      return { error: null, success: true };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    try {
      // Log sign out activity before signing out
      if (user) {
        await userService.logUserActivity(user.id, 'sign_out', {
          timestamp: new Date().toISOString()
        });
      }
      
      await supabase.auth.signOut();
      setUser(null);
      setEnhancedUser(null);
      setUserSettings(null);
      setIsPaid(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDevMode = () => {
    const newDevMode = !devMode;
    setDevMode(newDevMode);
    console.log(`Development mode ${newDevMode ? 'enabled' : 'disabled'}`);
    if (newDevMode) {
      setIsPaid(true);
    } else {
      if (user) {
        getUserSubscriptionStatus(user.id).then(status => {
          setIsPaid(status);
        });
      } else {
        setIsPaid(false);
      }
    }
  };

  const updateProfile = async (profileData: Partial<userService.EnhancedUser>) => {
    if (!user) return false;
    
    const success = await userService.updateUserProfile(user.id, profileData);
    
    if (success) {
      // Refresh enhanced user data
      const updatedUser = await userService.getUser(user.id);
      if (updatedUser) {
        setEnhancedUser(updatedUser);
      }
      
      // Log profile update activity
      await userService.logUserActivity(user.id, 'profile_update', {
        fields_updated: Object.keys(profileData),
        timestamp: new Date().toISOString()
      });
    }
    
    return success;
  };

  const updateSettings = async (settingsData: Partial<userService.UserSettings>) => {
    if (!user) return false;
    
    const success = await userService.updateUserSettings(user.id, settingsData);
    
    if (success) {
      // Refresh user settings
      const updatedSettings = await userService.getUserSettings(user.id);
      if (updatedSettings) {
        setUserSettings(updatedSettings);
      }
      
      // Log settings update activity
      await userService.logUserActivity(user.id, 'settings_update', {
        fields_updated: Object.keys(settingsData),
        timestamp: new Date().toISOString()
      });
    }
    
    return success;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        enhancedUser,
        userSettings,
        isPaid: isPaid || devMode,
        loading,
        signIn,
        signUp,
        signOut,
        devMode,
        toggleDevMode,
        updateProfile,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 