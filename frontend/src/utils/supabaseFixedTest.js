import { supabaseFixed } from '../services/supabaseClientFixed';

/**
 * Test direct connection to Supabase with fixed headers
 */
export const testFixedConnection = async () => {
  try {
    console.log('Testing connection with fixed headers...');
    const { data, error } = await supabaseFixed.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Fixed connection error:', error);
      return { success: false, error };
    }
    
    console.log('Fixed connection successful:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in fixed connection test:', err);
    return { success: false, error: err };
  }
};

/**
 * Create a demo user with fixed headers
 */
export const createDemoUserFixed = async () => {
  try {
    console.log('Creating demo user with fixed headers...');
    
    // Create the user
    const { data, error } = await supabaseFixed.auth.signUp({
      email: 'demo@example.com',
      password: 'password',
      options: {
        data: {
          name: 'Demo User',
        }
      }
    });
    
    if (error) {
      // If user already exists, this will fail
      console.error('Error creating demo user:', error);
      
      // Try to sign in instead
      const { data: signInData, error: signInError } = await supabaseFixed.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'password',
      });
      
      if (signInError) {
        console.error('Also failed to sign in as demo user:', signInError);
        return { success: false, error: signInError };
      }
      
      console.log('Demo user already exists and sign in successful:', signInData);
      return { success: true, user: signInData.user, message: 'User already exists' };
    }
    
    console.log('Demo user created successfully:', data);
    return { success: true, user: data.user, message: 'User created successfully' };
  } catch (err) {
    console.error('Unexpected error creating demo user:', err);
    return { success: false, error: err };
  }
};

/**
 * Test signing in with fixed headers
 */
export const testSignInFixed = async () => {
  try {
    console.log('Testing sign in with fixed headers...');
    const { data, error } = await supabaseFixed.auth.signInWithPassword({
      email: 'demo@example.com',
      password: 'password',
    });
    
    if (error) {
      console.error('Sign in error with fixed headers:', error);
      return { success: false, error };
    }
    
    console.log('Sign in successful with fixed headers:', data);
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    console.error('Unexpected error in sign in test with fixed headers:', err);
    return { success: false, error: err };
  }
};
