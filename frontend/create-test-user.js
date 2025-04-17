// Script to create a test user in Supabase
// Run this script with Node.js to create a test user

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://bqurvqysmwsropdaqwot.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3ODM1NjQsImV4cCI6MjA2MDM1OTU2NH0.9ZIVWp-PLXSfD_Ku7C9GvLTFZBnU_qS6HLVuZ4lc8hM';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test user details
const testUser = {
  email: 'test@example.com',
  password: 'Password123!',
  name: 'Test User'
};

async function createTestUser() {
  console.log('Creating test user...');
  
  try {
    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('name', testUser.name)
      .limit(1);
    
    if (checkError) {
      console.error('Error checking for existing user:', checkError);
    } else if (existingUsers && existingUsers.length > 0) {
      console.log('Test user already exists!');
      return;
    }
    
    // Register the user
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: testUser.name
        }
      }
    });
    
    if (error) {
      console.error('Error creating test user:', error);
      return;
    }
    
    console.log('Test user created successfully!');
    console.log('User ID:', data.user.id);
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);
    
    // Create profile if needed
    setTimeout(async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      if (profileError || !profileData) {
        console.log('Creating profile manually...');
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            name: testUser.name,
            is_email_verified: true,
            two_factor_enabled: false
          }]);
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('Profile created successfully!');
        }
      } else {
        console.log('Profile already exists!');
      }
    }, 1000);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createTestUser();
