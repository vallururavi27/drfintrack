import { supabase } from '../services/supabaseClient';
import { supabaseFixed } from '../services/supabaseClientFixed';

/**
 * Check if the demo user exists and create it if it doesn't
 * @returns {Promise<Object>} Result of the operation
 */
export const checkAndCreateDemoUser = async () => {
  try {
    console.log('Checking if demo user exists with fixed client...');

    // First try to sign in with demo credentials using the fixed client
    const { data: signInData, error: signInError } = await supabaseFixed.auth.signInWithPassword({
      email: 'demo@example.com',
      password: 'password',
    });

    // If sign in succeeds, the user exists
    if (signInData?.user) {
      console.log('Demo user exists (fixed client)');
      return { success: true, message: 'Demo user exists', user: signInData.user };
    }

    // If fixed client fails, try regular client
    if (signInError) {
      console.log('Fixed client failed, trying regular client...');

      const regularResult = await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'password',
      });

      if (regularResult.data?.user) {
        console.log('Demo user exists (regular client)');
        return { success: true, message: 'Demo user exists (regular client)', user: regularResult.data.user };
      }

      // If error is not "Invalid login credentials", something else is wrong
      if (regularResult.error && !regularResult.error.message.includes('Invalid login credentials')) {
        console.error('Error checking demo user with regular client:', regularResult.error);
        return { success: false, message: `Error checking demo user: ${regularResult.error.message}` };
      }
    }

    // Try to create the demo user with fixed client
    console.log('Demo user does not exist, creating with fixed client...');
    const { data: signUpData, error: signUpError } = await supabaseFixed.auth.signUp({
      email: 'demo@example.com',
      password: 'password',
      options: {
        data: {
          name: 'Demo User',
          role: 'user'
        }
      }
    });

    // If fixed client fails, try regular client
    if (signUpError) {
      console.log('Fixed client failed to create user, trying regular client...');

      const regularSignUp = await supabase.auth.signUp({
        email: 'demo@example.com',
        password: 'password',
        options: {
          data: {
            name: 'Demo User',
            role: 'user'
          }
        }
      });

      if (regularSignUp.error) {
        console.error('Error creating demo user with both clients:', regularSignUp.error);
        return { success: false, message: `Error creating demo user: ${regularSignUp.error.message}` };
      }

      console.log('Demo user created successfully with regular client');
      return { success: true, message: 'Demo user created successfully (regular client)', user: regularSignUp.data?.user };
    }

    console.log('Demo user created successfully with fixed client');
    return { success: true, message: 'Demo user created successfully (fixed client)', user: signUpData?.user };
  } catch (error) {
    console.error('Unexpected error checking/creating demo user:', error);
    return { success: false, message: `Unexpected error: ${error.message}` };
  }
};
