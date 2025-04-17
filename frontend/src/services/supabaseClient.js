import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase URL and anon key for reliability
const supabaseUrl = 'https://bqurvqysmwsropdaqwot.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4OTYzMjUsImV4cCI6MjA2MDQ3MjMyNX0.RwNNeunXPC7VRmq78DWgqixjbUyw7w2CZMfmRsnQNTw';

// Log the values for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key available:', !!supabaseAnonKey);

// Create the Supabase client with error handling
let supabaseClient;

try {
  console.log('Creating Supabase client...');

  // Check if we're on the production domain
  const isProduction = window.location.hostname === 'drfintrack.vercel.app';
  console.log('Is production environment:', isProduction);

  // Create a minimal client configuration to avoid potential issues
  // Using the simplest possible configuration to minimize errors
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client created successfully');

  // Test the connection
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Error getting session:', error);
    } else {
      console.log('Session retrieved successfully:', !!data.session);
      if (data.session) {
        console.log('User is authenticated:', data.session.user.email);
      } else {
        console.log('No active session found');
      }
    }
  });

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
      getSession: () => {
        console.error('Supabase client not initialized properly');
        return { data: { session: null }, error: new Error('Supabase client not initialized') };
      },
      mfa: {
        enroll: () => {
          console.error('Supabase client not initialized properly');
          return { error: new Error('Supabase client not initialized') };
        },
        listFactors: () => {
          console.error('Supabase client not initialized properly');
          return { error: new Error('Supabase client not initialized') };
        }
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({ data: null, error: new Error('Supabase client not initialized') })
        })
      }),
      insert: () => ({ error: new Error('Supabase client not initialized') })
    })
  };
}

export const supabase = supabaseClient;
