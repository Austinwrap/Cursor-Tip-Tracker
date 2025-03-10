// This is a mock version of the Supabase client for compatibility
// The actual Supabase functionality has been removed to use localStorage instead

// Mock Supabase client
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ data: null, error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          single: () => ({ data: null, error: null }),
          eq: () => ({ data: null, error: null })
        }),
        single: () => ({ data: null, error: null })
      })
    }),
    insert: () => ({ select: () => ({ data: null, error: null }) }),
    update: () => ({ eq: () => ({ data: null, error: null }) }),
    delete: () => ({ eq: () => ({ error: null }) }),
    upsert: () => ({ error: null })
  })
};

// Mock functions
export async function saveTipToSupabase(userId: string, date: string, amount: number) {
  console.log('Mock saveTipToSupabase called:', { userId, date, amount });
  return { success: true };
}

export async function getSupabaseTips(userId: string) {
  console.log('Mock getSupabaseTips called:', { userId });
  
  // Try to get tips from localStorage
  try {
    const storageKey = `tips_${userId}`;
    const storedTips = localStorage.getItem(storageKey);
    
    if (storedTips) {
      return { data: JSON.parse(storedTips) };
    }
  } catch (error) {
    console.error('Error getting tips from localStorage:', error);
  }
  
  return { data: [] };
}

export async function deleteTipFromSupabase(tipId: string) {
  console.log('Mock deleteTipFromSupabase called:', { tipId });
  return { success: true };
} 