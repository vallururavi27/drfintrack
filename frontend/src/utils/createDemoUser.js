import { supabase } from '../services/supabaseClient';

/**
 * Check if the demo user exists and create it if it doesn't
 * @returns {Promise<Object>} Result of the operation
 */
export const checkAndCreateDemoUser = async () => {
  try {
    console.log('Checking if demo user exists...');
    
    // First try to sign in with demo credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'demo@example.com',
      password: 'password',
    });
    
    // If sign in succeeds, the user exists
    if (signInData?.user) {
      console.log('Demo user exists');
      return { success: true, message: 'Demo user exists', user: signInData.user };
    }
    
    // If error is not "Invalid login credentials", something else is wrong
    if (signInError && !signInError.message.includes('Invalid login credentials')) {
      console.error('Error checking demo user:', signInError);
      return { success: false, message: `Error checking demo user: ${signInError.message}` };
    }
    
    // Try to create the demo user
    console.log('Demo user does not exist, creating...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
