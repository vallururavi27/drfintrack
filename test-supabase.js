/**
 * This script tests the Supabase connection
 * Run this script with Node.js: node test-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://bqurvqysmwsropdaqwot.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjQ0NzQsImV4cCI6MjA2MDU0MDQ3NH0.Yx-Ij_Uf4ypJXbCQPKrtfhJZHLTX9_D0j7X6PL0JpUE';

// Initialize Supabase client with anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  global: {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  }
});

console.log('DrFinTrack Supabase Connection Test');
console.log('==================================');

// Test connection
async function testConnection() {
  try {
    console.log('Testing connection to Supabase...');
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Connection error:', error);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('Response:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Test authentication
async function testAuth() {
  try {
    console.log('\nTesting Supabase authentication...');
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Authentication error:', error);
      return false;
    }
    
    console.log('✅ Authentication check successful!');
    console.log('Session:', data.session ? 'Active' : 'None');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Test RLS
async function testRls() {
  try {
    console.log('\nTesting Row Level Security...');
    
    // Try to insert a test API key
    const { data, error } = await supabase
      .from('api_keys')
      .insert([
        { 
          name: 'Test Key',
          key: 'test_' + Math.random().toString(36).substring(2, 15),
          is_active: true
        }
      ])
      .select();
    
    if (error) {
      if (error.code === 'PGRST301') {
        console.log('✅ RLS is working correctly (blocked unauthorized insert)');
        return true;
      }
      
      console.error('RLS test error:', error);
      return false;
    }
    
    console.log('⚠️ RLS test passed but might not be configured correctly');
    console.log('Response:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  await testConnection();
  await testAuth();
  await testRls();
  
  console.log('\nAll tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
