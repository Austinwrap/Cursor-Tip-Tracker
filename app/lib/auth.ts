import { supabase } from './supabase';

// Function to get the current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Exception getting current user:', error);
    return null;
  }
}

// Function to sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return { error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Exception signing out:', error);
    return { error };
  }
}

// Function to get user profile
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user profile:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Exception getting user profile:', error);
    return { error };
  }
}

// Function to update user profile
export async function updateUserProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Exception updating user profile:', error);
    return { error };
  }
} 