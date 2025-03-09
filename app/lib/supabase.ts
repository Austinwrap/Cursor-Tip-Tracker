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

// Add back the missing functions that are being imported by other components
export const getTipByDate = async (userId: string, date: string): Promise<Tip | null> => {
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
        console.error('Error fetching tip by date:', error);
      }
      return null;
    }

    return data as Tip;
  } catch (err) {
    console.error('Unexpected error in getTipByDate:', err);
    return null;
  }
};

export const getUserSubscriptionStatus = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_paid')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user subscription status:', error);
      return false;
    }

    return data?.is_paid || false;
  } catch (err) {
    console.error('Unexpected error in getUserSubscriptionStatus:', err);
    return false;
  }
};

// Analytics functions (for paid tier)
export const getMonthlyTotals = async (userId: string, year: number): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`);

    if (error) {
      console.error('Error fetching monthly totals:', error);
      return {};
    }

    const monthlyTotals: Record<string, number> = {};
    
    // Initialize all months with 0
    for (let i = 1; i <= 12; i++) {
      const monthKey = i.toString().padStart(2, '0');
      monthlyTotals[monthKey] = 0;
    }

    // Sum up tips by month
    data?.forEach((tip) => {
      const month = tip.date.split('-')[1]; // Extract month from YYYY-MM-DD
      monthlyTotals[month] = (monthlyTotals[month] || 0) + tip.amount;
    });

    return monthlyTotals;
  } catch (err) {
    console.error('Unexpected error in getMonthlyTotals:', err);
    return {};
  }
};

export const getDailyAverages = async (userId: string): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching daily averages:', error);
      return {};
    }

    const dayTotals: Record<string, { sum: number; count: number }> = {
      '0': { sum: 0, count: 0 }, // Sunday
      '1': { sum: 0, count: 0 }, // Monday
      '2': { sum: 0, count: 0 }, // Tuesday
      '3': { sum: 0, count: 0 }, // Wednesday
      '4': { sum: 0, count: 0 }, // Thursday
      '5': { sum: 0, count: 0 }, // Friday
      '6': { sum: 0, count: 0 }, // Saturday
    };

    // Sum up tips by day of week
    data?.forEach((tip) => {
      const date = new Date(tip.date);
      const dayOfWeek = date.getDay().toString();
      dayTotals[dayOfWeek].sum += tip.amount;
      dayTotals[dayOfWeek].count += 1;
    });

    // Calculate averages
    const dayAverages: Record<string, number> = {};
    Object.entries(dayTotals).forEach(([day, { sum, count }]) => {
      dayAverages[day] = count > 0 ? sum / count : 0;
    });

    return dayAverages;
  } catch (err) {
    console.error('Unexpected error in getDailyAverages:', err);
    return {};
  }
};

export const getBestAndWorstDays = async (userId: string): Promise<{ best: Tip | null; worst: Tip | null }> => {
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching best and worst days:', error);
      return { best: null, worst: null };
    }

    if (!data || data.length === 0) {
      return { best: null, worst: null };
    }

    // Find best and worst days
    let best = data[0];
    let worst = data[0];

    data.forEach((tip) => {
      if (tip.amount > best.amount) {
        best = tip;
      }
      if (tip.amount < worst.amount) {
        worst = tip;
      }
    });

    return { best, worst };
  } catch (err) {
    console.error('Unexpected error in getBestAndWorstDays:', err);
    return { best: null, worst: null };
  }
};

export const getProjectedEarnings = async (userId: string, days: number): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30); // Use last 30 days for projection

    if (error) {
      console.error('Error fetching tips for projection:', error);
      return 0;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    // Calculate average daily tips
    const totalAmount = data.reduce((sum, tip) => sum + tip.amount, 0);
    const avgDailyTips = totalAmount / data.length;

    // Project earnings for specified number of days
    return Math.round(avgDailyTips * days);
  } catch (err) {
    console.error('Unexpected error in getProjectedEarnings:', err);
    return 0;
  }
};

// Add this function to check premium features status
export async function getUserPremiumStatus(userId: string): Promise<{
  isPaid: boolean;
  planType: string;
  premiumFeaturesEnabled: boolean;
  subscriptionStatus: string;
}> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_paid, plan_type, premium_features_enabled, subscription_status, subscription_type')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user premium status:', error);
      return {
        isPaid: false,
        planType: '',
        premiumFeaturesEnabled: false,
        subscriptionStatus: ''
      };
    }
    
    return {
      isPaid: data.is_paid || false,
      planType: data.plan_type || 'starter',
      premiumFeaturesEnabled: data.premium_features_enabled || false,
      subscriptionStatus: data.subscription_status || ''
    };
  } catch (error) {
    console.error('Error in getUserPremiumStatus:', error);
    return {
      isPaid: false,
      planType: '',
      premiumFeaturesEnabled: false,
      subscriptionStatus: ''
    };
  }
}

export default supabase; 