const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envPath = path.join(__dirname, '..', '.env');

console.log('This script will help you update your Supabase API key in the .env file.');
console.log('You need to use the service_role key, not the anon/public key.');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error(`Error: .env file not found at ${envPath}`);
  rl.close();
  process.exit(1);
}

// Read existing .env content
let envContent = fs.readFileSync(envPath, 'utf8');

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Main function
async function updateSupabaseKey() {
  try {
    console.log('\nPlease follow these steps:');
    console.log('1. Go to https://app.supabase.io/');
    console.log('2. Select your project');
    console.log('3. Go to Project Settings > API');
    console.log('4. Copy the "service_role key" (NOT the anon/public key)');
    
    const supabaseKey = await prompt('\nPaste your Supabase service_role key here: ');
    
    if (!supabaseKey) {
      console.error('Supabase key is required.');
      rl.close();
      return;
    }
    
    // Remove existing Supabase key from .env file
    const envLines = envContent.split('\n');
    const newEnvLines = [];
    
    for (const line of envLines) {
      if (!line.startsWith('SUPABASE_KEY=')) {
        newEnvLines.push(line);
      }
    }
    
    // Add the new Supabase key
    newEnvLines.push(`SUPABASE_KEY=${supabaseKey}`);
    
    // Write back to .env file
    fs.writeFileSync(envPath, newEnvLines.join('\n'));
    
    console.log('\nSupabase key has been updated in your .env file.');
    console.log('Try testing the Supabase connection:');
    console.log('node scripts/test-supabase.js');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
updateSupabaseKey();
