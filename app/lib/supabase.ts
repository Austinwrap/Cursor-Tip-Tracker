import { createClient } from '@supabase/supabase-js';

// Use default values for build environments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';

// Only show warning in development
if (process.env.NODE_ENV === 'development' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Supabase credentials are missing. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type User = {
  id: string;
  email: string;
  is_paid: boolean;
};

export type Tip = {
  id: string;
  user_id: string;
  date: string;
  amount: number; // Stored in cents
};

// Helper functions for database operations
export async function getTips(userId: string): Promise<Tip[]> {
  const { data, error } = await supabase
    .from('tips')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching tips:', error);
    return [];
  }

  return data || [];
}

export async function getTipByDate(userId: string, date: string): Promise<Tip | null> {
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

  return data;
}

export async function addTip(userId: string, date: string, amount: number): Promise<Tip | null> {
  try {
    // Check if a tip already exists for this date
    const existingTip = await getTipByDate(userId, date);
    
    if (existingTip) {
      // Update existing tip
      const { data, error } = await supabase
        .from('tips')
        .update({ amount })
        .eq('id', existingTip.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating tip:', error);
        return null;
      }

      return data;
    } else {
      // Create new tip with explicit fields
      const newTip = {
        user_id: userId,
        date: date,
        amount: amount
      };
      
      const { data, error } = await supabase
        .from('tips')
        .insert([newTip])
        .select()
        .single();

      if (error) {
        console.error('Error adding tip:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Unexpected error in addTip:', error);
    return null;
  }
}

export async function getUserSubscriptionStatus(userId: string): Promise<boolean> {
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
}

// Analytics functions (for paid tier)
export async function getMonthlyTotals(userId: string, year: number): Promise<Record<string, number>> {
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
}

export async function getDailyAverages(userId: string): Promise<Record<string, number>> {
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
}

export async function getBestAndWorstDays(userId: string): Promise<{ best: Tip | null; worst: Tip | null }> {
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
}

export async function getProjectedEarnings(userId: string, days: number): Promise<number> {
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
} 