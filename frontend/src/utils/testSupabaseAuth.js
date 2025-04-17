import { supabase } from '../services/supabaseClient';

/**
 * Test Supabase authentication with a demo account
 * @returns {Promise<Object>} Test results
 */
export const testSupabaseAuth = async () => {
  const results = {
    clientInitialized: false,
    signInAttempted: false,
    signInSuccessful: false,
    userData: null,
    sessionData: null,
    error: null
  };

  try {
    // Test if Supabase client is initialized
    if (supabase && supabase.auth) {
      results.clientInitialized = true;
      console.log('Supabase client initialized successfully');
    } else {
      results.error = 'Supabase client not initialized properly';
      return results;
    }

    // Test sign in with demo account
    console.log('Attempting to sign in with demo account...');
    results.signInAttempted = true;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123',
    });

    // If that fails, try the demo user
    if (error) {
      console.log('Trying demo user instead...');
      const demoResult = await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'password',
      });

      if (demoResult.data?.user) {
        console.log('Demo user login successful');
        return { ...results, signInSuccess: true, user: demoResult.data.user };
      }
    }

    console.log('Sign in response:', { data, error });

    if (error) {
      results.error = `Sign in error: ${error.message}`;
      return results;
    }

    if (!data || !data.user) {
      results.error = 'Sign in successful but no user data returned';
      return results;
    }

    results.signInSuccessful = true;
    results.userData = data.user;
    results.sessionData = data.session;

    // Sign out after successful test
    await supabase.auth.signOut();

    return results;
  } catch (error) {
    console.error('Error testing Supabase auth:', error);
    results.error = `Unexpected error: ${error.message}`;
    return results;
  }
};
