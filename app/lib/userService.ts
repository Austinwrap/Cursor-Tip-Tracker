import { supabase } from './supabase';

export interface EnhancedUser {
  id: string;
  email: string;
  is_paid: boolean;
  created_at: string;
  display_name?: string;
  profile_image_url?: string;
  timezone?: string;
  last_login?: string;
  subscription_expires_at?: string;
  subscription_type?: string;
  settings?: Record<string, any>;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  currency: string;
  date_format: string;
  notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  default_view: string;
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * Get enhanced user information
 */
export async function getUser(userId: string): Promise<EnhancedUser | null> {
  console.log(`UserService: Getting user information for ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('UserService: Error fetching user:', error);
      return null;
    }
    
    if (!data) {
      console.error('UserService: User not found');
      return null;
    }
    
    console.log('UserService: User found:', data);
    return data as EnhancedUser;
  } catch (err) {
    console.error('UserService: Unexpected error in getUser:', err);
    return null;
  }
}

/**
 * Update user profile information
 */
export async function updateUserProfile(
  userId: string,
  profileData: Partial<EnhancedUser>
): Promise<boolean> {
  console.log(`UserService: Updating profile for user ${userId}`);
  
  try {
    // Remove any fields that shouldn't be directly updated
    const { id, created_at, is_paid, ...updateData } = profileData;
    
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);
    
    if (error) {
      console.error('UserService: Error updating user profile:', error);
      return false;
    }
    
    console.log('UserService: User profile updated successfully');
    return true;
  } catch (err) {
    console.error('UserService: Unexpected error in updateUserProfile:', err);
    return false;
  }
}

/**
 * Get user settings
 */
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  console.log(`UserService: Getting settings for user ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('UserService: Error fetching user settings:', error);
      
      // If settings don't exist yet, create default settings
      if (error.code === 'PGRST116') {
        return createDefaultUserSettings(userId);
      }
      
      return null;
    }
    
    console.log('UserService: User settings found:', data);
    return data as UserSettings;
  } catch (err) {
    console.error('UserService: Unexpected error in getUserSettings:', err);
    return null;
  }
}

/**
 * Create default user settings
 */
async function createDefaultUserSettings(userId: string): Promise<UserSettings | null> {
  console.log(`UserService: Creating default settings for user ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .insert([{ user_id: userId }])
      .select()
      .single();
    
    if (error) {
      console.error('UserService: Error creating default user settings:', error);
      return null;
    }
    
    console.log('UserService: Default user settings created:', data);
    return data as UserSettings;
  } catch (err) {
    console.error('UserService: Unexpected error in createDefaultUserSettings:', err);
    return null;
  }
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  settingsData: Partial<UserSettings>
): Promise<boolean> {
  console.log(`UserService: Updating settings for user ${userId}`);
  
  try {
    // First check if settings exist
    const existingSettings = await getUserSettings(userId);
    
    if (!existingSettings) {
      console.error('UserService: Cannot update settings, no settings found');
      return false;
    }
    
    // Remove any fields that shouldn't be directly updated
    const { id, user_id, created_at, ...updateData } = settingsData;
    
    // Add updated_at timestamp
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('user_settings')
      .update(dataToUpdate)
      .eq('id', existingSettings.id);
    
    if (error) {
      console.error('UserService: Error updating user settings:', error);
      return false;
    }
    
    console.log('UserService: User settings updated successfully');
    return true;
  } catch (err) {
    console.error('UserService: Unexpected error in updateUserSettings:', err);
    return false;
  }
}

/**
 * Log user activity
 */
export async function logUserActivity(
  userId: string,
  activityType: string,
  activityDetails: Record<string, any> = {},
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> {
  console.log(`UserService: Logging activity for user ${userId}: ${activityType}`);
  
  try {
    // Call the RPC function to log activity
    const { error } = await supabase.rpc('log_user_activity', {
      p_user_id: userId,
      p_activity_type: activityType,
      p_activity_details: activityDetails,
      p_ip_address: ipAddress,
      p_user_agent: userAgent
    });
    
    if (error) {
      console.error('UserService: Error logging user activity:', error);
      return false;
    }
    
    console.log('UserService: User activity logged successfully');
    return true;
  } catch (err) {
    console.error('UserService: Unexpected error in logUserActivity:', err);
    return false;
  }
}

/**
 * Update user last login
 */
export async function updateUserLastLogin(userId: string): Promise<boolean> {
  console.log(`UserService: Updating last login for user ${userId}`);
  
  try {
    // Call the RPC function to update last login
    const { error } = await supabase.rpc('update_user_last_login', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('UserService: Error updating user last login:', error);
      return false;
    }
    
    console.log('UserService: User last login updated successfully');
    return true;
  } catch (err) {
    console.error('UserService: Unexpected error in updateUserLastLogin:', err);
    return false;
  }
}

/**
 * Get user activity history
 */
export async function getUserActivityHistory(userId: string, limit = 50): Promise<UserActivity[]> {
  console.log(`UserService: Getting activity history for user ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('UserService: Error fetching user activity history:', error);
      return [];
    }
    
    console.log(`UserService: Found ${data.length} activity records`);
    return data as UserActivity[];
  } catch (err) {
    console.error('UserService: Unexpected error in getUserActivityHistory:', err);
    return [];
  }
} 