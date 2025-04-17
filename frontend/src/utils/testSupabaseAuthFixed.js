import supabaseAuth, { signInWithDemo } from '../services/supabaseAuth';

/**
 * Test Supabase authentication with the fixed auth service
 * @returns {Promise<Object>} Test results
 */
export const testSupabaseAuthFixed = async () => {
  const results = {
    clientInitialized: false,
    signInAttempted: false,
    signInSuccessful: false,
    userData: null,
    error: null
  };

  try {
    // Test if client is initialized
    console.log('Testing if Supabase Auth client is initialized...');
    if (supabaseAuth) {
      results.clientInitialized = true;
      console.log('Supabase Auth client is initialized');
    } else {
      throw new Error('Supabase Auth client is not initialized');
    }

    // Test sign in with demo account
    console.log('Attempting to sign in with demo account...');
    results.signInAttempted = true;

    const result = await signInWithDemo();

    console.log('Sign in response:', result);

    if (!result.success) {
      throw result.error || new Error('Sign in failed with no specific error');
    }

    results.signInSuccessful = true;
    
    if (result.data?.user) {
      results.userData = {
        id: result.data.user.id,
        email: result.data.user.email,
        role: result.data.user.role
      };
    }

    return results;
  } catch (error) {
    console.error('Error in Supabase Auth test:', error);
    results.error = error.message || 'Unknown error occurred';
    return results;
  }
};
