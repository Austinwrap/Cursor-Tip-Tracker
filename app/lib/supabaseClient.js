import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with hardcoded values for static export
const supabaseUrl = 'https://bggsscexogsptcnnwckj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZ3NzY2V4b2dzcHRjbm53Y2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjgwMDQsImV4cCI6MjA1Njk0NDAwNH0.yRmBEA5ddBqoM-N9iOjQpyMtxQcBlbEUJ-diV396J94';

// Helper function to check if we're in a browser environment
export const isBrowser = () => typeof window !== 'undefined';

// Create the Supabase client only in browser environment
export const supabase = isBrowser() 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// SUPER SIMPLE function to add a tip - just save the number!
export async function addTip(userId, date, amount) {
  if (!isBrowser()) {
    console.error('addTip called on server side');
    return { error: { message: 'Cannot add tip on server side' } };
  }
  
  console.log('Saving tip:', { userId, date, amount });
  
  try {
    // Format the date as YYYY-MM-DD
    const formattedDate = typeof date === 'string' 
      ? date 
      : date.toISOString().split('T')[0];
    
    // Convert amount to a number
    const numericAmount = Number(amount);
    
    // Simple validation
    if (!userId) {
      console.error('No user ID provided');
      return { error: { message: 'User ID is required' } };
    }
    
    if (isNaN(numericAmount)) {
      console.error('Invalid amount:', amount);
      return { error: { message: 'Amount must be a number' } };
    }
    
    // First check if a tip already exists for this date
    const { data: existingTip, error: fetchError } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .eq('date', formattedDate)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking for existing tip:', fetchError);
      return { error: fetchError };
    }
    
    let result;
    
    if (existingTip) {
      // Update existing tip
      console.log('Updating existing tip:', existingTip.id);
      result = await supabase
        .from('tips')
        .update({ amount: numericAmount })
        .eq('id', existingTip.id);
    } else {
      // Insert new tip
      console.log('Inserting new tip');
      result = await supabase
        .from('tips')
        .insert([{ 
          user_id: userId, 
          date: formattedDate, 
          amount: numericAmount 
        }]);
    }
    
    if (result.error) {
      console.error('Error saving tip:', result.error);
      return { error: result.error };
    }
    
    console.log('Tip saved successfully:', result.data);
    return { data: result.data, error: null };
  } catch (err) {
    console.error('Error in addTip:', err);
    return { error: { message: err.message } };
  }
}

// Simple function to get tips for a user
export async function getUserTips(userId) {
  if (!isBrowser()) {
    console.error('getUserTips called on server side');
    return { data: [], error: { message: 'Cannot get tips on server side' } };
  }
  
  if (!userId) {
    console.error('No user ID provided');
    return { data: [], error: { message: 'User ID is required' } };
  }
  
  try {
    console.log('Getting tips for user:', userId);
    
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Supabase error:', error);
      return { data: [], error };
    }
    
    console.log('Got tips:', data);
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error in getUserTips:', err);
    return { data: [], error: { message: err.message } };
  }
} 