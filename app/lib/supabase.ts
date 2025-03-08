import { createClient } from '@supabase/supabase-js';

// Define the types for our database tables
export type User = {
  id: string;
  email: string;
  is_paid: boolean;
  created_at: string;
};

export type Tip = {
  id: number;
  user_id: string;
  date: string;
  amount: number;
  created_at: string;
};

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User functions
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data as User;
  } catch (err) {
    console.error('Unexpected error in getUserProfile:', err);
    return null;
  }
};

export const updateUserPaidStatus = async (userId: string, isPaid: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_paid: isPaid })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user paid status:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error in updateUserPaidStatus:', err);
    return false;
  }
};

// Tip functions
export const addTip = async (userId: string, date: string, amount: number): Promise<boolean> => {
  try {
    // First check if a tip already exists for this date
    const { data: existingTip, error: fetchError } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking for existing tip:', fetchError);
      return false;
    }
    
    let result;
    
    if (existingTip) {
      // Update existing tip
      result = await supabase
        .from('tips')
        .update({ amount })
        .eq('id', existingTip.id);
    } else {
      // Insert new tip
      result = await supabase
        .from('tips')
        .insert([{ 
          user_id: userId, 
          date, 
          amount 
        }]);
    }
    
    if (result.error) {
      console.error('Error saving tip:', result.error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error in addTip:', err);
    return false;
  }
};

export const getTips = async (userId: string): Promise<Tip[]> => {
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching tips:', error);
      return [];
    }

    return data as Tip[];
  } catch (err) {
    console.error('Unexpected error in getTips:', err);
    return [];
  }
};

export const getTipsByDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<Tip[]> => {
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching tips by date range:', error);
      return [];
    }

    return data as Tip[];
  } catch (err) {
    console.error('Unexpected error in getTipsByDateRange:', err);
    return [];
  }
};

export const deleteTip = async (tipId: number, userId: string): Promise<boolean> => {
  try {
    // Verify the tip belongs to the user before deleting
    const { error } = await supabase
      .from('tips')
      .delete()
      .eq('id', tipId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting tip:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error in deleteTip:', err);
    return false;
  }
};

export default supabase; 