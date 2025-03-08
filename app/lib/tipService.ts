import { supabase } from './supabase';

// Create a service role client for admin operations
const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

// Only create this if we have the service role key
const serviceRoleClient = SUPABASE_SERVICE_ROLE_KEY ? 
  supabase : null;

export interface Tip {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  created_at: string;
}

/**
 * Save a tip for a user on a specific date
 * If a tip already exists for that date, it will be updated
 */
export async function saveTip(userId: string, date: string, amountInCents: number): Promise<boolean> {
  console.log(`TipService: Saving tip for user ${userId} on ${date} with amount ${amountInCents} cents`);
  
  if (!userId) {
    console.error('TipService: Cannot save tip - userId is empty or null');
    return false;
  }
  
  if (!date) {
    console.error('TipService: Cannot save tip - date is empty or null');
    return false;
  }
  
  if (isNaN(amountInCents) || amountInCents <= 0) {
    console.error(`TipService: Cannot save tip - invalid amount: ${amountInCents}`);
    return false;
  }
  
  try {
    // First, check if the user exists in the users table
    console.log(`TipService: Checking if user ${userId} exists`);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('TipService: Error checking user existence:', userError);
      console.error('TipService: Error details:', JSON.stringify(userError));
      
      // If the user doesn't exist, create a user record
      if (userError.code === 'PGRST116') {
        console.log(`TipService: User ${userId} not found, creating user record`);
        
        // Get user email from auth
        const { data: authData } = await supabase.auth.getUser();
        const email = authData?.user?.email || 'unknown@example.com';
        
        // Create user record - use a workaround for RLS
        // Instead of inserting directly, we'll use a special RPC function
        const { error: rpcError } = await supabase.rpc('create_user_record', {
          p_user_id: userId,
          p_email: email,
          p_is_paid: false
        });
        
        if (rpcError) {
          console.error('TipService: Error creating user record via RPC:', rpcError);
          console.error('TipService: Error details:', JSON.stringify(rpcError));
          
          // Fallback: Try direct insert with auth context
          const { error: insertUserError } = await supabase
            .from('users')
            .insert([{ 
              id: userId, 
              email: email,
              is_paid: false
            }]);
          
          if (insertUserError) {
            console.error('TipService: Error creating user record:', insertUserError);
            console.error('TipService: Error details:', JSON.stringify(insertUserError));
            return false;
          }
        }
        
        console.log(`TipService: Created user record for ${userId}`);
      } else {
        // Some other error occurred
        return false;
      }
    }
    
    // Now check if a tip already exists for this date
    console.log(`TipService: Checking for existing tip on ${date}`);
    const { data: existingTip, error: fetchError } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    
    if (fetchError) {
      console.error('TipService: Error checking for existing tip:', fetchError);
      console.error('TipService: Error details:', JSON.stringify(fetchError));
      return false;
    }
    
    if (existingTip) {
      console.log(`TipService: Found existing tip (${existingTip.id}), updating...`);
      
      // Update existing tip
      const { error: updateError } = await supabase
        .from('tips')
        .update({ amount: amountInCents })
        .eq('id', existingTip.id);
      
      if (updateError) {
        console.error('TipService: Error updating tip:', updateError);
        console.error('TipService: Error details:', JSON.stringify(updateError));
        return false;
      }
      
      console.log('TipService: Tip updated successfully');
      return true;
    } else {
      console.log('TipService: No existing tip found, creating new tip...');
      
      // Insert new tip
      const { data: insertData, error: insertError } = await supabase
        .from('tips')
        .insert([{ 
          user_id: userId, 
          date, 
          amount: amountInCents 
        }])
        .select();
      
      if (insertError) {
        console.error('TipService: Error inserting tip:', insertError);
        console.error('TipService: Error details:', JSON.stringify(insertError));
        return false;
      }
      
      console.log('TipService: Tip created successfully:', insertData);
      return true;
    }
  } catch (err) {
    console.error('TipService: Unexpected error in saveTip:', err);
    console.error('TipService: Error details:', JSON.stringify(err));
    return false;
  }
}

/**
 * Get all tips for a user
 */
export async function getAllTips(userId: string): Promise<Tip[]> {
  console.log(`TipService: Getting all tips for user ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('TipService: Error fetching tips:', error);
      return [];
    }
    
    console.log(`TipService: Found ${data.length} tips`);
    return data as Tip[];
  } catch (err) {
    console.error('TipService: Unexpected error in getAllTips:', err);
    return [];
  }
}

/**
 * Get tips for a user within a date range
 */
export async function getTipsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Tip[]> {
  console.log(`TipService: Getting tips for user ${userId} from ${startDate} to ${endDate}`);
  
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (error) {
      console.error('TipService: Error fetching tips by date range:', error);
      return [];
    }
    
    console.log(`TipService: Found ${data.length} tips in date range`);
    return data as Tip[];
  } catch (err) {
    console.error('TipService: Unexpected error in getTipsByDateRange:', err);
    return [];
  }
}

/**
 * Get tips for a specific month
 */
export async function getTipsForMonth(userId: string, year: number, month: number): Promise<Tip[]> {
  // Month is 0-indexed (0 = January, 11 = December)
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  
  console.log(`TipService: Getting tips for user ${userId} for month ${month + 1}/${year} (${startDate} to ${endDate})`);
  
  return getTipsByDateRange(userId, startDate, endDate);
}

/**
 * Calculate total tips for a specific month
 */
export async function getMonthlyTotal(userId: string, year: number, month: number): Promise<number> {
  const tips = await getTipsForMonth(userId, year, month);
  
  const total = tips.reduce((sum, tip) => sum + tip.amount, 0);
  console.log(`TipService: Monthly total for ${month + 1}/${year}: ${total} cents`);
  
  return total;
}

/**
 * Calculate total tips for a specific week
 */
export async function getWeeklyTotal(userId: string, startDate: string): Promise<number> {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  const endDateStr = end.toISOString().split('T')[0];
  
  console.log(`TipService: Getting weekly total for user ${userId} from ${startDate} to ${endDateStr}`);
  
  const tips = await getTipsByDateRange(userId, startDate, endDateStr);
  
  const total = tips.reduce((sum, tip) => sum + tip.amount, 0);
  console.log(`TipService: Weekly total: ${total} cents`);
  
  return total;
}

/**
 * Delete a tip
 */
export async function deleteTip(userId: string, tipId: string): Promise<boolean> {
  console.log(`TipService: Deleting tip ${tipId} for user ${userId}`);
  
  try {
    // First verify the tip belongs to the user
    const { data: tip, error: fetchError } = await supabase
      .from('tips')
      .select('*')
      .eq('id', tipId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      console.error('TipService: Error verifying tip ownership:', fetchError);
      return false;
    }
    
    if (!tip) {
      console.error('TipService: Tip not found or does not belong to user');
      return false;
    }
    
    // Delete the tip
    const { error: deleteError } = await supabase
      .from('tips')
      .delete()
      .eq('id', tipId);
    
    if (deleteError) {
      console.error('TipService: Error deleting tip:', deleteError);
      return false;
    }
    
    console.log('TipService: Tip deleted successfully');
    return true;
  } catch (err) {
    console.error('TipService: Unexpected error in deleteTip:', err);
    return false;
  }
} 