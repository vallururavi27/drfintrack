import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bqurvqysmwsropdaqwot.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If the key is not available, show a warning
if (!supabaseAnonKey) {
  console.warn('Supabase anon key not found. Make sure your .env.local file is set up correctly.');
}

// Log the values for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key available:', !!supabaseAnonKey);

// Check if the values are valid
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure environment variables are set correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
