import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to save a tip to Supabase
export async function saveTipToSupabase(userId: string, date: string, amount: number) {
  console.log('Saving tip to Supabase:', { userId, date, amount });
  
  // Validate inputs
  if (!userId) {
    console.error('Cannot save tip: No user ID provided');
    return { error: 'No user ID provided' };
  }
  
  if (!date) {
    console.error('Cannot save tip: No date provided');
    return { error: 'No date provided' };
  }
  
  if (amount === undefined || amount === null || isNaN(amount)) {
    console.error('Cannot save tip: Invalid amount', amount);
    return { error: 'Invalid amount' };
  }
  
  // Format date to YYYY-MM-DD for consistency
  const formattedDate = new Date(date).toISOString().split('T')[0];
  
  try {
    // Check if a tip already exists for this date
    const { data: existingTips, error: fetchError } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .eq('date', formattedDate);
    
    if (fetchError) {
      console.error('Error fetching existing tips:', fetchError);
      return { error: fetchError };
    }
    
    let result;
    
    // If a tip exists for this date, update it
    if (existingTips && existingTips.length > 0) {
      console.log('Updating existing tip for date:', formattedDate);
      result = await supabase
        .from('tips')
        .update({ amount })
        .eq('id', existingTips[0].id);
    } else {
      // Otherwise, insert a new tip
      console.log('Inserting new tip for date:', formattedDate);
      result = await supabase
        .from('tips')
        .insert([
          { user_id: userId, date: formattedDate, amount }
        ]);
    }
    
    if (result.error) {
      console.error('Error saving tip to Supabase:', result.error);
      return { error: result.error };
    }
    
    console.log('Tip saved successfully to Supabase');
    return { success: true };
  } catch (error) {
    console.error('Exception saving tip to Supabase:', error);
    return { error };
  }
}

// Function to get tips from Supabase
export async function getSupabaseTips(userId: string) {
  if (!userId) {
    console.error('Cannot get tips: No user ID provided');
    return { error: 'No user ID provided' };
  }
  
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching tips from Supabase:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Exception fetching tips from Supabase:', error);
    return { error };
  }
}

// Function to delete a tip from Supabase
export async function deleteTipFromSupabase(tipId: string) {
  if (!tipId) {
    console.error('Cannot delete tip: No tip ID provided');
    return { error: 'No tip ID provided' };
  }
  
  try {
    const { error } = await supabase
      .from('tips')
      .delete()
      .eq('id', tipId);
    
    if (error) {
      console.error('Error deleting tip from Supabase:', error);
      return { error };
    }
    
    console.log('Tip deleted successfully from Supabase');
    return { success: true };
  } catch (error) {
    console.error('Exception deleting tip from Supabase:', error);
    return { error };
  }
} 