import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase URL and anon key for reliability
const supabaseUrl = 'https://bqurvqysmwsropdaqwot.supabase.co';
// Get the latest anon key from your Supabase dashboard
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjQ0NzQsImV4cCI6MjA2MDU0MDQ3NH0.Yx-Ij_Uf4ypJXbCQPKrtfhJZHLTX9_D0j7X6PL0JpUE';

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

  // Create a client configuration with explicit headers and enhanced options
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'drfintrack_supabase_auth' // Custom storage key to avoid conflicts
    },
    global: {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'X-Client-Info': 'drfintrack-web'
      },
      // Custom fetch function to add timestamp and ensure headers
      fetch: (url, options = {}) => {
        // Add timestamp to prevent caching
        const separator = url.includes('?') ? '&' : '?';
        const urlWithTimestamp = `${url}${separator}_t=${Date.now()}`;

        // Ensure headers are properly set
        const enhancedOptions = {
          ...options,
          headers: {
            ...options.headers,
            'apikey': supabaseAnonKey,
            'Authorization': options.headers?.Authorization || `Bearer ${supabaseAnonKey}`
          }
        };

        console.log('Enhanced Supabase request:', { url: urlWithTimestamp });
        return fetch(urlWithTimestamp, enhancedOptions);
      }
    }
  });
  console.log('Supabase client created successfully');

  // Test the connection with comprehensive diagnostics
  console.log('Testing Supabase connection...');

  // Test auth connection
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Error getting session:', error);
    } else {
      console.log('Auth connection successful');
      console.log('Session retrieved successfully:', !!data.session);
      if (data.session) {
        console.log('User is authenticated:', data.session.user.email);
      } else {
        console.log('No active session found');
      }
    }
  }).catch(err => {
    console.error('Unexpected error in auth connection test:', err);
  });

  // Test database connection
  supabaseClient.from('bank_accounts').select('count').limit(1).then(({ data, error }) => {
    if (error) {
      console.error('Database connection error:', error);
    } else {
      console.log('Database connection successful');
      console.log('Data retrieved:', data);
    }
  }).catch(err => {
    console.error('Unexpected error in database connection test:', err);
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
