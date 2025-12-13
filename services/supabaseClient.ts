import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// Helper to safely access env vars in various environments (Vite, Webpack, etc.)
const getEnv = (key: string) => {
  try {
    // Check import.meta.env (Vite standard)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // Check process.env (Node/Webpack standard)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore errors in strict environments
  }
  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Prevent crash if env vars are missing by using a Mock Client
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      // MOCK IMPLEMENTATION (Prevents "supabaseUrl is required" crash)
      auth: {
         getSession: async () => ({ data: { session: null }, error: null }),
         onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
         signInWithPassword: async () => ({ error: { message: "Supabase not configured (Missing SUPABASE_URL)" } }),
         signUp: async () => ({ error: { message: "Supabase not configured (Missing SUPABASE_URL)" } }),
         signOut: async () => ({ error: null }),
      },
      from: (table: string) => ({
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
 * Maps the raw DB row to our frontend UserProfile type
 */
export const mapProfileToUser = (row: any): UserProfile => {
  return {
    name: row.name,
    level: row.level,
    interests: row.interests || [],
    credits: row.credits,
    xp: row.xp,
    streak: row.streak,
    completedModules: row.completed_modules || [],
    unlockedModules: row.unlocked_modules || [],
    ownedLevels: row.owned_levels || []
  };
};

/**
 * Updates the user profile in Supabase
 */
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  // Convert frontend camelCase to DB snake_case where necessary
  const dbUpdates: any = {};
  if (updates.credits !== undefined) dbUpdates.credits = updates.credits;
  if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
  if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
  if (updates.completedModules) dbUpdates.completed_modules = updates.completedModules;
  if (updates.unlockedModules) dbUpdates.unlocked_modules = updates.unlockedModules;
  if (updates.ownedLevels) dbUpdates.owned_levels = updates.ownedLevels;
  if (updates.level) dbUpdates.level = updates.level;

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
 * Records a transaction in the purchases table
 */
export const recordPurchase = async (userId: string, itemId: string, amount: number, currency: string = 'INR') => {
  const { error } = await supabase
    .from('purchases')
    .insert({
      user_id: userId,
      item_id: itemId,
      amount_paid: amount,
      currency: currency
    });
    
  if (error) console.error('Purchase record failed:', error);
};