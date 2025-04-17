import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for direct access
const SUPABASE_URL = 'https://bqurvqysmwsropdaqwot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjQ0NzQsImV4cCI6MjA2MDU0MDQ3NH0.Yx-Ij_Uf4ypJXbCQPKrtfhJZHLTX9_D0j7X6PL0JpUE';

// Create a Supabase client with explicit headers to ensure API key is included
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_KEY, {
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

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Authentication result
 */
export const signIn = async (email, password) => {
  try {
    console.log('Signing in with Supabase Auth:', { email });
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      return { success: false, error };
    }

    console.log('Sign in successful:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error during sign in:', err);
    return { success: false, error: err };
  }
};

/**
 * Sign in with demo account
 * @returns {Promise<Object>} Authentication result
 */
export const signInWithDemo = async () => {
  try {
    console.log('Signing in with demo account');
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: 'demo@example.com',
      password: 'password'
    });

    if (error) {
      console.error('Demo sign in error:', error);
      return { success: false, error };
    }

    console.log('Demo sign in successful:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error during demo sign in:', err);
    return { success: false, error: err };
  }
};

/**
 * Create a demo user if it doesn't exist
 * @returns {Promise<Object>} Result of the operation
 */
export const createDemoUser = async () => {
  try {
    console.log('Checking if demo user exists...');

    // First try to sign in with demo credentials
    const { success, data } = await signInWithDemo();

    // If sign in succeeds, the user exists
    if (success && data?.user) {
      console.log('Demo user exists');
      return { success: true, message: 'Demo user exists', user: data.user };
    }

    // Try to create the demo user
    console.log('Demo user does not exist, creating...');
    const { data: signUpData, error: signUpError } = await supabaseAuth.auth.signUp({
      email: 'demo@example.com',
      password: 'password',
      options: {
        data: {
          name: 'Demo User',
          role: 'user'
        }
      }
    });

    if (signUpError) {
      console.error('Error creating demo user:', signUpError);
      return { success: false, message: `Error creating demo user: ${signUpError.message}` };
    }

    console.log('Demo user created successfully');
    return { success: true, message: 'Demo user created successfully', user: signUpData?.user };
  } catch (error) {
    console.error('Unexpected error checking/creating demo user:', error);
    return { success: false, message: `Unexpected error: ${error.message}` };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<Object>} Sign out result
 */
export const signOut = async () => {
  try {
    const { error } = await supabaseAuth.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return { success: false, error };
    }

    console.log('Sign out successful');
    return { success: true };
  } catch (err) {
    console.error('Unexpected error during sign out:', err);
    return { success: false, error: err };
  }
};

/**
 * Get the current user
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabaseAuth.auth.getUser();

    if (error) {
      console.error('Get user error:', error);
      return { success: false, error };
    }

    console.log('Get user successful:', data);
    return { success: true, user: data.user };
  } catch (err) {
    console.error('Unexpected error getting user:', err);
    return { success: false, error: err };
  }
};

/**
 * Handle 2FA verification
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} code - 2FA verification code
 * @returns {Promise<Object>} Verification result
 */
export const verify2FA = async (email, password, code) => {
  try {
    console.log('Verifying 2FA code...');

    // First authenticate with email/password
    console.log('Re-authenticating with email/password...');
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Authentication error:', error);
      return { success: false, error };
    }

    if (!data || !data.user) {
      console.error('Authentication successful but no user data returned');
      return { success: false, error: new Error('Authentication failed: No user data returned') };
    }

    console.log('Authentication successful');

    // Get MFA factors
    console.log('Getting MFA factors...');
    const { data: factorsData, error: factorsError } = await supabaseAuth.auth.mfa.listFactors();

    if (factorsError) {
      console.error('Error getting MFA factors:', factorsError);
      return { success: false, error: factorsError };
    }

    if (!factorsData) {
      console.error('No MFA factors data returned');
      return { success: false, error: new Error('Failed to retrieve MFA factors') };
    }

    console.log('MFA factors:', factorsData);

    // Find the TOTP factor
    const totpFactor = factorsData.totp.find(f => f.factor_type === 'totp');
    if (!totpFactor) {
      console.error('No TOTP factor found');
      return { success: false, error: new Error('No TOTP factor found') };
    }

    // Create a challenge
    console.log('Creating MFA challenge...');
    const { data: challengeData, error: challengeError } = await supabaseAuth.auth.mfa.challenge({
      factorId: totpFactor.id
    });

    if (challengeError) {
      console.error('Error creating MFA challenge:', challengeError);
      return { success: false, error: challengeError };
    }

    console.log('MFA challenge created:', challengeData);

    // Verify the challenge
    console.log('Verifying MFA challenge...');
    const { data: verifyData, error: verifyError } = await supabaseAuth.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challengeData.id,
      code
    });

    if (verifyError) {
      console.error('MFA verification error:', verifyError);
      return { success: false, error: verifyError };
    }

    console.log('MFA verification successful:', verifyData);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error during 2FA verification:', err);
    return { success: false, error: err };
  }
};

export default supabaseAuth;
