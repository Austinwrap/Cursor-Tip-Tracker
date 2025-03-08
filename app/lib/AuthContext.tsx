'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User, getUserSubscriptionStatus } from './supabase';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  isPaid: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; success: boolean }>;
  signUp: (email: string, password: string) => Promise<{ error: any; success: boolean }>;
  signOut: () => Promise<void>;
  devMode: boolean;
  toggleDevMode: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isPaid: false,
  loading: true,
  signIn: async () => ({ error: null, success: false }),
  signUp: async () => ({ error: null, success: false }),
  signOut: async () => {},
  devMode: false,
  toggleDevMode: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [devMode, setDevMode] = useState<boolean>(false);
  const router = useRouter();

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
          
          // Redirect to dashboard on successful sign-in
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
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
      
      return { error: null, success: true };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isPaid: isPaid || devMode,
        loading,
        signIn,
        signUp,
        signOut,
        devMode,
        toggleDevMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 