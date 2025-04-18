/**
 * This script tests the Supabase connection using Node.js
 * Run this script with Node.js: node test-supabase-node.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://bqurvqysmwsropdaqwot.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjQ0NzQsImV4cCI6MjA2MDU0MDQ3NH0.Yx-Ij_Uf4ypJXbCQPKrtfhJZHLTX9_D0j7X6PL0JpUE';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDc4MzU2NCwiZXhwIjoyMDYwMzU5NTY0fQ.ojFM53vyvbtQC80yQHAm77X3dxlzcBZhUsFtFLYQAu4';

// Initialize Supabase clients
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

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  }
});

console.log('DrFinTrack Supabase Connection Test (Node.js)');
console.log('============================================');

// Test anon key connection
async function testAnonKey() {
  try {
    console.log('\nTesting anon key connection...');
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Anon key connection error:', error);
      return false;
    }
    
    console.log('✅ Anon key connection successful!');
    console.log('Response:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error with anon key:', error);
    return false;
  }
}

// Test service role key connection
async function testServiceRoleKey() {
  try {
    console.log('\nTesting service role key connection...');
    
    const { data, error } = await supabaseAdmin
      .from('bank_accounts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Service role key connection error:', error);
      return false;
    }
    
    console.log('✅ Service role key connection successful!');
    console.log('Response:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error with service role key:', error);
    return false;
  }
}

// Test direct API call
async function testDirectApiCall() {
  try {
    console.log('\nTesting direct API call...');
    
    const fetch = require('node-fetch');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bank_accounts?select=count&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Direct API call error:', response.status, errorData);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Direct API call successful!');
    console.log('Response:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error in direct API call:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  await testAnonKey();
  await testServiceRoleKey();
  
  try {
    await testDirectApiCall();
  } catch (error) {
    console.log('Skipping direct API call test (node-fetch may not be installed)');
  }
  
  console.log('\nAll tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
