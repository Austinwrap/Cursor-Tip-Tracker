// This file provides utility functions for working with tips data
// It now uses localStorage instead of Supabase or Postgres

// Example function to get tips from localStorage
export async function getTips(userId) {
  try {
    const storageKey = `tips_${userId}`;
    const storedTips = localStorage.getItem(storageKey);
    
    if (storedTips) {
      const parsedTips = JSON.parse(storedTips);
      return parsedTips;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting tips from localStorage:', error);
    return [];
  }
}

// Example function to save a tip to localStorage
export async function saveTip(userId, date, amount) {
  try {
    // Format date to YYYY-MM-DD for consistency
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    // Get existing tips
    const storageKey = `tips_${userId}`;
    const storedTips = localStorage.getItem(storageKey) || '[]';
    const tips = JSON.parse(storedTips);
    
    // Check if a tip already exists for this date
    const existingTipIndex = tips.findIndex(tip => tip.date === formattedDate);
    
    if (existingTipIndex >= 0) {
      // Update existing tip
      tips[existingTipIndex].amount = amount;
      tips[existingTipIndex].updated_at = new Date().toISOString();
    } else {
      // Add new tip
      tips.push({
        id: `local_${Date.now()}`,
        user_id: userId,
        date: formattedDate,
        amount: amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(tips));
    
    return { success: true };
  } catch (error) {
    console.error('Error saving tip to localStorage:', error);
    return { error };
  }
}

// Example function to delete a tip from localStorage
export async function deleteTip(userId, tipId) {
  try {
    // Get existing tips
    const storageKey = `tips_${userId}`;
    const storedTips = localStorage.getItem(storageKey) || '[]';
    const tips = JSON.parse(storedTips);
    
    // Filter out the tip to delete
    const updatedTips = tips.filter(tip => tip.id !== tipId);
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(updatedTips));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting tip from localStorage:', error);
    return { error };
  }
} 