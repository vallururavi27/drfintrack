import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for direct access
const SUPABASE_URL = 'https://bqurvqysmwsropdaqwot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3ODM1NjQsImV4cCI6MjA2MDM1OTU2NH0.9ZIVWp-PLXSfD_Ku7C9GvLTFZBnU_qS6HLVuZ4lc8hM';

// Log the values for debugging
console.log('Using Supabase URL:', SUPABASE_URL);
console.log('Using hardcoded Supabase key');

// Create the Supabase client with explicit headers
let supabaseClient;

try {
  console.log('Creating Supabase client with explicit headers...');
  
  // Create client with explicit headers to ensure API key is included
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }
  });
  
  console.log('Supabase client created successfully with explicit headers');
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

export const supabaseFixed = supabaseClient;
