import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with hardcoded values for static export
const supabaseUrl = 'https://bggsscexogsptcnnwckj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZ3NzY2V4b2dzcHRjbm53Y2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjgwMDQsImV4cCI6MjA1Njk0NDAwNH0.yRmBEA5ddBqoM-N9iOjQpyMtxQcBlbEUJ-diV396J94';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper function to check if we're in a browser environment
export const isBrowser = () => typeof window !== 'undefined';

// Simple function to add a tip
export async function addTip(userId, date, amount, note = '') {
  if (!userId) return { error: { message: 'User ID is required' } };
  
  try {
    const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('tips')
      .insert([
        { 
          user_id: userId, 
          date: formattedDate, 
          amount: Number(amount),
          note: note || '',
          type: 'cash'
        }
      ]);
    
    return { data, error };
  } catch (err) {
    console.error('Error in addTip:', err);
    return { error: { message: err.message } };
  }
}

// Simple function to get tips for a user
export async function getUserTips(userId) {
  if (!userId) return { data: [], error: { message: 'User ID is required' } };
  
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    return { data: data || [], error };
  } catch (err) {
    console.error('Error in getUserTips:', err);
    return { data: [], error: { message: err.message } };
  }
} 