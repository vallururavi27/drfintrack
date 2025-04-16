import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bqurvqysmwsropdaqwot.supabase.co';

// Use a fallback key if environment variable is not available
// This is not ideal for production but helps with development
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg2NzY4MDAsImV4cCI6MjAxNDI1MjgwMH0.qmZ5wy0XC7bj2Tf9XWQirLWCVB5q-XHCnwT0rYg9Ub4';

// Log the values for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key available:', !!supabaseAnonKey);
console.log('Supabase Anon Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);

// Check if the values are valid
if (!supabaseUrl) {
  console.error('Missing Supabase URL. Make sure environment variables are set correctly.');
}

if (!supabaseAnonKey) {
  console.error('Missing Supabase Anon Key. Make sure environment variables are set correctly.');
}

// Create the Supabase client with error handling
let supabaseClient;

try {
  console.log('Creating Supabase client...');
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });
  console.log('Supabase client created successfully');
} catch (error) {
  console.error('Error creating Supabase client:', error);
  // Create a dummy client that logs errors
  supabaseClient = {
    auth: {
      signUp: () => {
        console.error('Supabase client not initialized properly');
        return { error: new Error('Supabase client not initialized') };
      },
      signInWithPassword: () => {
        console.error('Supabase client not initialized properly');
        return { error: new Error('Supabase client not initialized') };
      },
      getUser: () => {
        console.error('Supabase client not initialized properly');
        return { data: { user: null }, error: new Error('Supabase client not initialized') };
      },
      mfa: {
        enroll: () => {
          console.error('Supabase client not initialized properly');
          return { error: new Error('Supabase client not initialized') };
        }
      }
    }
  };
}

export const supabase = supabaseClient;
