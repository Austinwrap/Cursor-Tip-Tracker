import { supabase } from '../lib/supabaseClient'; // Adjust path if needed

/**
 * Saves an array of tips to the database for a specific user
 * @param {string} userId - The user ID
 * @param {Array} tips - Array of tip objects with date and amount
 * @returns {Promise} - Promise that resolves when all tips are saved
 */
export async function saveTipsToDatabase(userId, tips) {
  if (!userId) throw new Error('User ID is required');
  if (!tips || !Array.isArray(tips)) throw new Error('Tips must be an array');
  
  // Check for duplicate dates to avoid importing the same tips twice
  const existingTips = await getUserTips(userId);
  const existingDates = new Set(existingTips.map(tip => tip.date.toDateString()));
  
  const filteredTips = tips.filter(tip => !existingDates.has(tip.date.toDateString()));
  
  // If all tips already exist, throw an error
  if (filteredTips.length === 0) {
    throw new Error('All tips already exist in the database');
  }
  
  // Format tips for Supabase
  const tipsToInsert = filteredTips.map(tip => ({
    user_id: userId,
    date: tip.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    amount: tip.amount,
    note: tip.note || '',
    type: tip.type || 'cash',
    created_at: new Date().toISOString()
  }));
  
  // Insert tips into Supabase - using the new tip_imports table
  const { error } = await supabase
    .from('tip_imports')
    .insert(tipsToInsert);
  
  if (error) throw new Error(error.message);
  
  return filteredTips.length;
}

/**
 * Gets all tips for a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Promise that resolves to an array of tip objects
 */
export async function getUserTips(userId) {
  if (!userId) throw new Error('User ID is required');
  
  // Query the tip_imports table
  const { data, error } = await supabase
    .from('tip_imports')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw new Error(error.message);
  
  return data.map(tip => ({
    id: tip.id,
    date: new Date(tip.date),
    amount: tip.amount,
    note: tip.note || '',
    type: tip.type || 'cash'
  }));
} 