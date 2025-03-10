'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Define user type
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// Define enhanced user type
export interface EnhancedUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

// Define user settings type
export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
}

type AuthContextType = {
  user: User | null;
  enhancedUser: EnhancedUser | null;
  userSettings: UserSettings | null;
  isPaid: boolean;
  premiumStatus: {
    planType: string;
    premiumFeaturesEnabled: boolean;
    subscriptionStatus: string;
  };
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; success: boolean }>;
  signUp: (email: string, password: string) => Promise<{ error: any; success: boolean }>;
  signOut: () => Promise<void>;
  devMode: boolean;
  toggleDevMode: () => void;
  updateProfile: (profileData: Partial<EnhancedUser>) => Promise<boolean>;
  updateSettings: (settingsData: Partial<UserSettings>) => Promise<boolean>;
  refreshPremiumStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  enhancedUser: null,
  userSettings: null,
  isPaid: false,
  premiumStatus: {
    planType: '',
    premiumFeaturesEnabled: false,
    subscriptionStatus: ''
  },
  loading: true,
  signIn: async () => ({ error: null, success: false }),
  signUp: async () => ({ error: null, success: false }),
  signOut: async () => {},
  devMode: false,
  toggleDevMode: () => {},
  updateProfile: async () => false,
  updateSettings: async () => false,
  refreshPremiumStatus: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [enhancedUser, setEnhancedUser] = useState<EnhancedUser | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [premiumStatus, setPremiumStatus] = useState<{
    planType: string;
    premiumFeaturesEnabled: boolean;
    subscriptionStatus: string;
  }>({
    planType: '',
    premiumFeaturesEnabled: false,
    subscriptionStatus: ''
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [devMode, setDevMode] = useState<boolean>(false);
  const router = useRouter();

  // Function to refresh premium status (simplified)
  const refreshPremiumStatus = async () => {
    if (!user) return;
    
    // In this simplified version, we'll just use localStorage to check premium status
    const storedPremiumStatus = localStorage.getItem(`premium_status_${user.id}`);
    if (storedPremiumStatus) {
      try {
        const parsedStatus = JSON.parse(storedPremiumStatus);
        setPremiumStatus(parsedStatus);
        setIsPaid(parsedStatus.premiumFeaturesEnabled);
      } catch (error) {
        console.error('Error parsing premium status:', error);
      }
    }
  };

  // Load enhanced user data from localStorage
  const loadEnhancedUserData = async (userId: string) => {
    try {
      // Get enhanced user data from localStorage
      const storedUserData = localStorage.getItem(`user_${userId}`);
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setEnhancedUser(parsedUserData);
      } else {
        // Create default enhanced user if not found
        const defaultEnhancedUser: EnhancedUser = {
          id: userId,
          email: user?.email || '',
          created_at: new Date().toISOString()
        };
        setEnhancedUser(defaultEnhancedUser);
        localStorage.setItem(`user_${userId}`, JSON.stringify(defaultEnhancedUser));
      }
      
      // Get user settings from localStorage
      const storedSettings = localStorage.getItem(`settings_${userId}`);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setUserSettings(parsedSettings);
      } else {
        // Create default settings if not found
        const defaultSettings: UserSettings = {
          id: `settings_${userId}`,
          user_id: userId,
          theme: 'dark',
          notifications_enabled: true
        };
        setUserSettings(defaultSettings);
        localStorage.setItem(`settings_${userId}`, JSON.stringify(defaultSettings));
      }
      
      // Check premium status
      await refreshPremiumStatus();
      
      // Update last login
      const now = new Date().toISOString();
      localStorage.setItem(`last_login_${userId}`, now);
      
      // Log login activity (simplified)
      const activities = JSON.parse(localStorage.getItem(`activities_${userId}`) || '[]');
      activities.push({
        type: 'login',
        method: 'session',
        timestamp: now
      });
      localStorage.setItem(`activities_${userId}`, JSON.stringify(activities));
    } catch (err) {
      console.error('Error loading enhanced user data:', err);
    }
  };

  useEffect(() => {
    // Check if user is already authenticated using localStorage
    const checkUser = async () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Load enhanced user data
          await loadEnhancedUserData(parsedUser.id);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      // In a real app, you would validate against a server
      // For this simplified version, we'll check against localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        return { error: { message: 'Invalid email or password' }, success: false };
      }
      
      // Create user object without password
      const { password: _, ...userWithoutPassword } = user;
      
      // Store user in localStorage
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      
      // Update state
      setUser(userWithoutPassword);
      
      // Load enhanced user data
      await loadEnhancedUserData(userWithoutPassword.id);
      
      // Log sign in activity
      const activities = JSON.parse(localStorage.getItem(`activities_${userWithoutPassword.id}`) || '[]');
      activities.push({
        type: 'sign_in',
        method: 'password',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(`activities_${userWithoutPassword.id}`, JSON.stringify(activities));
      
      return { error: null, success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error, success: false };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Check if email already exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        return { error: { message: 'Email already in use' }, success: false };
      }
      
      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password, // In a real app, you would hash this
        created_at: new Date().toISOString()
      };
      
      // Add to users array
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Create user object without password
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Store user in localStorage
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      
      // Update state
      setUser(userWithoutPassword);
      
      // Create enhanced user
      const enhancedUser: EnhancedUser = {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        created_at: userWithoutPassword.created_at
      };
      localStorage.setItem(`user_${userWithoutPassword.id}`, JSON.stringify(enhancedUser));
      setEnhancedUser(enhancedUser);
      
      // Create default settings
      const defaultSettings: UserSettings = {
        id: `settings_${userWithoutPassword.id}`,
        user_id: userWithoutPassword.id,
        theme: 'dark',
        notifications_enabled: true
      };
      localStorage.setItem(`settings_${userWithoutPassword.id}`, JSON.stringify(defaultSettings));
      setUserSettings(defaultSettings);
      
      return { error: null, success: true };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    // Remove user from localStorage
    localStorage.removeItem('auth_user');
    
    // Update state
    setUser(null);
    setEnhancedUser(null);
    setUserSettings(null);
    setIsPaid(false);
    
    // Redirect to home
    router.push('/');
  };

  const toggleDevMode = () => {
    setDevMode(!devMode);
    localStorage.setItem('dev_mode', (!devMode).toString());
  };

  const updateProfile = async (profileData: Partial<EnhancedUser>) => {
    if (!user) return false;
    
    try {
      // Get current enhanced user
      const currentUser = enhancedUser || {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      };
      
      // Update with new data
      const updatedUser = { ...currentUser, ...profileData };
      
      // Save to localStorage
      localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
      
      // Update state
      setEnhancedUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const updateSettings = async (settingsData: Partial<UserSettings>) => {
    if (!user || !userSettings) return false;
    
    try {
      // Update with new data
      const updatedSettings = { ...userSettings, ...settingsData };
      
      // Save to localStorage
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(updatedSettings));
      
      // Update state
      setUserSettings(updatedSettings);
      
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        enhancedUser,
        userSettings,
        isPaid,
        premiumStatus,
        loading,
        signIn,
        signUp,
        signOut,
        devMode,
        toggleDevMode,
        updateProfile,
        updateSettings,
        refreshPremiumStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 