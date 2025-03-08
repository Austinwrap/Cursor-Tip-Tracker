import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with hardcoded values for static export
const supabaseUrl = 'https://bggsscexogsptcnnwckj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZ3NzY2V4b2dzcHRjbm53Y2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjgwMDQsImV4cCI6MjA1Njk0NDAwNH0.yRmBEA5ddBqoM-N9iOjQpyMtxQcBlbEUJ-diV396J94';

// Check if credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 