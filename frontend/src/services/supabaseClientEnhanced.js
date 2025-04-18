import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for direct access
const SUPABASE_URL = 'https://bqurvqysmwsropdaqwot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjQ0NzQsImV4cCI6MjA2MDU0MDQ3NH0.Yx-Ij_Uf4ypJXbCQPKrtfhJZHLTX9_D0j7X6PL0JpUE';

// Log the values for debugging
console.log('Enhanced Supabase Client');
console.log('URL:', SUPABASE_URL);
console.log('Key available:', !!SUPABASE_KEY);

// Create the Supabase client with comprehensive configuration
let supabaseClient;

try {
  console.log('Creating enhanced Supabase client...');

  // Check if we're on the production domain
  const isProduction = typeof window !== 'undefined' && window.location.hostname === 'drfintrack.vercel.app';
  console.log('Is production environment:', isProduction);

  // Create a client with explicit headers and all necessary options
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'drfintrack_supabase_auth',
      flowType: 'pkce'
    },
    global: {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'X-Client-Info': 'drfintrack-web'
      },
      fetch: (url, options = {}) => {
        // Add timestamp to prevent caching
        const separator = url.includes('?') ? '&' : '?';
        const urlWithTimestamp = `${url}${separator}_t=${Date.now()}`;
        
        // Ensure headers are properly set
        const enhancedOptions = {
          ...options,
          headers: {
            ...options.headers,
            'apikey': SUPABASE_KEY,
            'Authorization': options.headers?.Authorization || `Bearer ${SUPABASE_KEY}`
          }
        };
        
        return fetch(urlWithTimestamp, enhancedOptions);
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    db: {
      schema: 'public'
    }
  });

  console.log('Enhanced Supabase client created successfully');

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
  console.error('Error creating enhanced Supabase client:', error);
  // Create a dummy client that logs errors
  supabaseClient = {
    auth: {
      signUp: () => {
        console.error('Enhanced Supabase client not initialized properly');
        return { error: new Error('Enhanced Supabase client not initialized') };
      },
      signInWithPassword: () => {
        console.error('Enhanced Supabase client not initialized properly');
        return { error: new Error('Enhanced Supabase client not initialized') };
      },
      getUser: () => {
        console.error('Enhanced Supabase client not initialized properly');
        return { data: { user: null }, error: new Error('Enhanced Supabase client not initialized') };
      },
      getSession: () => {
        console.error('Enhanced Supabase client not initialized properly');
        return { data: { session: null }, error: new Error('Enhanced Supabase client not initialized') };
      },
      mfa: {
        enroll: () => {
          console.error('Enhanced Supabase client not initialized properly');
          return { error: new Error('Enhanced Supabase client not initialized') };
        },
        listFactors: () => {
          console.error('Enhanced Supabase client not initialized properly');
          return { error: new Error('Enhanced Supabase client not initialized') };
        }
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({ data: null, error: new Error('Enhanced Supabase client not initialized') })
        })
      }),
      insert: () => ({ error: new Error('Enhanced Supabase client not initialized') })
    })
  };
}

export const supabaseEnhanced = supabaseClient;
