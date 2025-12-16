import { createClient } from '@supabase/supabase-js';
import { UserProfile, GermanLevel } from '../types';

// Access environment variables with hardcoded fallbacks from your provided env.txt
// This ensures the app works immediately even if the .env file isn't being read correctly.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://bzwdxfjdrkoomzsvpidk.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_65nX0uP7fuAm1ZDOd-LDUg_oZa46Mqm';

// Initialize the Supabase client
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      // Mock implementation should rarely be hit now that we have fallbacks
      auth: {
         getSession: async () => ({ data: { session: null }, error: null }),
         onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
         signInWithPassword: async () => ({ error: { message: "Supabase configuration error" } }),
         signUp: async () => ({ error: { message: "Supabase configuration error" } }),
         signOut: async () => ({ error: null }),
      },
      from: () => ({
         select: () => ({
            eq: () => ({
               single: async () => ({ data: null, error: null }),
               maybeSingle: async () => ({ data: null, error: null })
            })
         }),
         insert: async () => ({ error: { message: "Offline Mode - Cannot write to DB" } }),
         update: async () => ({ error: { message: "Offline Mode - Cannot update DB" } })
      })
    } as any;

/**
 * Maps the raw DB row (snake_case) to the frontend UserProfile type (camelCase).
 */
export const mapProfileToUser = (row: any): UserProfile => {
  return {
    name: row.full_name || 'Traveler',
    level: (row.current_level as GermanLevel) || GermanLevel.A1,
    interests: row.interests || [],
    credits: row.credits || 0,
    xp: row.xp || 0,
    streak: row.streak_count || 0,
    completedModules: row.completed_modules || [],
    unlockedModules: row.unlocked_modules || [],
    ownedLevels: row.owned_levels || []
  };
};

/**
 * Updates the user profile in Supabase by mapping camelCase updates to snake_case columns.
 */
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const dbUpdates: any = {};
  
  if (updates.name !== undefined) dbUpdates.full_name = updates.name;
  if (updates.level !== undefined) dbUpdates.current_level = updates.level;
  if (updates.streak !== undefined) dbUpdates.streak_count = updates.streak;
  if (updates.credits !== undefined) dbUpdates.credits = updates.credits;
  if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
  if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
  if (updates.completedModules !== undefined) dbUpdates.completed_modules = updates.completedModules;
  if (updates.unlockedModules !== undefined) dbUpdates.unlocked_modules = updates.unlockedModules;
  if (updates.ownedLevels !== undefined) dbUpdates.owned_levels = updates.ownedLevels;

  dbUpdates.last_active = new Date().toISOString();

  const { error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
  }
};

/**
 * Records a transaction in the transactions table.
 */
export const recordPurchase = async (userId: string, description: string, amountPaid: number) => {
  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      description: description,
      amount_inr: amountPaid,
      amount_credits: 0
    });
    
  if (error) {
    console.error('Purchase record failed:', error);
  }
};