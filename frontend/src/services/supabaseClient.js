import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = 'https://bqurvqysmwsropdaqwot.supabase.co';

// IMPORTANT: Replace this with your actual anon key from the Supabase dashboard
// Go to: Project Settings -> API -> anon public key
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log the values for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key (first 10 chars):', supabaseAnonKey?.substring(0, 10));

// Check if the values are valid
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure .env.local is set up correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
