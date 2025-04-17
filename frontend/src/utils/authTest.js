import { supabase } from '../services/supabaseClient';

/**
 * Test Supabase authentication connection
 * @returns {Promise<Object>} Test results
 */
export const testSupabaseConnection = async () => {
  const results = {
    connection: false,
    auth: false,
    error: null
  };

  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      results.error = `Session error: ${error.message}`;
      console.error('Supabase connection error:', error);
      return results;
    }
    
    results.connection = true;
    console.log('Supabase connection successful');
    
    if (data?.session) {
      results.auth = true;
      console.log('User is authenticated:', data.session.user.email);
    } else {
      console.log('No active session found');
    }
    
    return results;
  } catch (err) {
    results.error = `Unexpected error: ${err.message}`;
    console.error('Unexpected error testing Supabase connection:', err);
    return results;
  }
};

/**
 * Test login with provided credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login test results
 */
export const testLogin = async (email, password) => {
  const results = {
    attempted: true,
    successful: false,
    userData: null,
    error: null
  };

  try {
    console.log('Testing login with:', { email });
    
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      results.error = error.message;
      console.error('Login error:', error);
      return results;
    }
    
    results.successful = true;
    results.userData = {
      id: data.user.id,
      email: data.user.email,
      hasSession: !!data.session
    };
    
    console.log('Login successful:', results.userData);
    return results;
  } catch (err) {
    results.error = `Unexpected error: ${err.message}`;
    console.error('Unexpected error during login test:', err);
    return results;
  }
};

/**
 * Create a test user account
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name
 * @returns {Promise<Object>} Registration results
 */
export const createTestUser = async (email, password, name = 'Test User') => {
  const results = {
    attempted: true,
    successful: false,
    userData: null,
    error: null
  };

  try {
    console.log('Creating test user:', { email, name });
    
    // Attempt to create user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });
    
    if (error) {
      results.error = error.message;
      console.error('User creation error:', error);
      return results;
    }
    
    results.successful = true;
    results.userData = {
      id: data.user.id,
      email: data.user.email,
      emailConfirmed: data.user.email_confirmed_at !== null
    };
    
    console.log('User created successfully:', results.userData);
    return results;
  } catch (err) {
    results.error = `Unexpected error: ${err.message}`;
    console.error('Unexpected error creating test user:', err);
    return results;
  }
};

export default {
  testSupabaseConnection,
  testLogin,
  createTestUser
};
