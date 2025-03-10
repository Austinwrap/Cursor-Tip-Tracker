import { supabase } from './supabase';
import sql from './postgres';

// Example function using Supabase client
export async function getTipsWithSupabase(userId) {
  const { data, error } = await supabase
    .from('tips')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching tips with Supabase client:', error);
    return { error };
  }
  
  return { data };
}

// Example function using direct Postgres connection
export async function getTipsWithPostgres(userId) {
  try {
    const tips = await sql`
      SELECT * FROM tips 
      WHERE user_id = ${userId} 
      ORDER BY date DESC
    `;
    
    return { data: tips };
  } catch (error) {
    console.error('Error fetching tips with Postgres:', error);
    return { error };
  }
}

// Example function to save a tip using Postgres
export async function saveTipWithPostgres(userId, date, amount) {
  try {
    // Format date to YYYY-MM-DD for consistency
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    // Check if a tip already exists for this date
    const existingTips = await sql`
      SELECT * FROM tips 
      WHERE user_id = ${userId} 
      AND date = ${formattedDate}
    `;
    
    let result;
    
    // If a tip exists for this date, update it
    if (existingTips && existingTips.length > 0) {
      result = await sql`
        UPDATE tips 
        SET amount = ${amount} 
        WHERE id = ${existingTips[0].id} 
        RETURNING *
      `;
    } else {
      // Otherwise, insert a new tip
      result = await sql`
        INSERT INTO tips (user_id, date, amount) 
        VALUES (${userId}, ${formattedDate}, ${amount}) 
        RETURNING *
      `;
    }
    
    return { data: result[0] };
  } catch (error) {
    console.error('Error saving tip with Postgres:', error);
    return { error };
  }
} 