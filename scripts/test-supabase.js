require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('Testing Supabase connection...');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 10)}...${supabaseKey.substring(supabaseKey.length - 10)}` : 'Not found');

// Initialize Supabase client
try {
  console.log('\nInitializing Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized successfully.');

  // Test a simple query
  console.log('\nTesting a simple query...');
  supabase
    .from('profiles')
    .select('count', { count: 'exact', head: true })
    .then(({ count, error }) => {
      if (error) {
        console.error('Error executing query:', error);
      } else {
        console.log(`Success! Found ${count} profiles.`);
      }
    })
    .catch(error => {
      console.error('Error executing query:', error);
    });

  // Test auth admin API
  console.log('\nTesting auth admin API...');
  supabase.auth.admin.listUsers()
    .then(({ data, error }) => {
      if (error) {
        console.error('Error listing users:', error);
        
        if (error.message === 'Invalid API key') {
          console.log('\nThe "Invalid API key" error usually means:');
          console.log('1. You are using the anon/public key instead of the service_role key');
          console.log('2. Your Supabase project might be on the free tier which has limitations');
          console.log('3. The key might be malformed or expired');
          
          console.log('\nPlease make sure you are using the service_role key from:');
          console.log('Supabase Dashboard > Your Project > Project Settings > API > service_role key');
        }
      } else {
        console.log(`Success! Found ${data.length} users.`);
        console.log('First user email:', data[0]?.email || 'No users found');
      }
    })
    .catch(error => {
      console.error('Error listing users:', error);
    });

} catch (error) {
  console.error('Error initializing Supabase client:', error);
}
