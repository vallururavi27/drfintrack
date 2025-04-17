import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for direct testing
const SUPABASE_URL = 'https://bqurvqysmwsropdaqwot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3ODM1NjQsImV4cCI6MjA2MDM1OTU2NH0.9ZIVWp-PLXSfD_Ku7C9GvLTFZBnU_qS6HLVuZ4lc8hM';

// Create a direct Supabase client without any middleware or custom config
const directSupabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Test direct connection to Supabase
 */
export const testDirectConnection = async () => {
  try {
    console.log('Testing direct connection to Supabase...');
    const { data, error } = await directSupabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Direct connection error:', error);
      return { success: false, error };
    }
    
    console.log('Direct connection successful:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in direct connection test:', err);
    return { success: false, error: err };
  }
};

/**
 * Create a test user directly in Supabase
 */
export const createTestUser = async () => {
  try {
    console.log('Creating test user directly in Supabase...');
    
    // First check if user exists by trying to sign in
    const { data: signInData, error: signInError } = await directSupabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123',
    });
    
    if (signInData?.user) {
      console.log('Test user already exists:', signInData.user);
      return { success: true, user: signInData.user, message: 'User already exists' };
    }
    
    // Create the user
    const { data, error } = await directSupabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          name: 'Test User',
        }
      }
    });
    
    if (error) {
      console.error('Error creating test user:', error);
      return { success: false, error };
    }
    
    console.log('Test user created successfully:', data);
    return { success: true, user: data.user, message: 'User created successfully' };
  } catch (err) {
    console.error('Unexpected error creating test user:', err);
    return { success: false, error: err };
  }
};

/**
 * Test signing in with the test user
 */
export const testSignIn = async () => {
  try {
    console.log('Testing sign in with test user...');
    const { data, error } = await directSupabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123',
    });
    
    if (error) {
      console.error('Sign in error:', error);
      return { success: false, error };
    }
    
    console.log('Sign in successful:', data);
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    console.error('Unexpected error in sign in test:', err);
    return { success: false, error: err };
  }
};

/**
 * Create a demo user directly in Supabase
 */
export const createDemoUser = async () => {
  try {
    console.log('Creating demo user directly in Supabase...');
    
    // Create the user
    const { data, error } = await directSupabase.auth.signUp({
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
      const { data: signInData, error: signInError } = await directSupabase.auth.signInWithPassword({
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
