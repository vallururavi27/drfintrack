/**
 * This script helps diagnose and fix common Supabase authentication issues
 * Run this script with Node.js: node fix-supabase-auth.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SUPABASE_URL = 'https://bqurvqysmwsropdaqwot.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3ODM1NjQsImV4cCI6MjA2MDM1OTU2NH0.9ZIVWp-PLXSfD_Ku7C9GvLTFZBnU_qS6HLVuZ4lc8hM';

// Paths
const supabaseClientPath = path.join(__dirname, 'frontend', 'src', 'services', 'supabaseClient.js');
const localStoragePath = path.join(__dirname, 'localStorage.json');

console.log('DrFinTrack Supabase Authentication Fixer');
console.log('======================================');
console.log('This script will help diagnose and fix common Supabase authentication issues.');

// Check if Supabase client file exists
if (!fs.existsSync(supabaseClientPath)) {
  console.error(`Error: Could not find supabaseClient.js at ${supabaseClientPath}`);
  process.exit(1);
}

// Read the current supabaseClient.js file
console.log('\nChecking supabaseClient.js configuration...');
const supabaseClientContent = fs.readFileSync(supabaseClientPath, 'utf8');

// Check if the file contains the correct URL and key
const hasCorrectUrl = supabaseClientContent.includes(SUPABASE_URL);
const hasCorrectKey = supabaseClientContent.includes(SUPABASE_ANON_KEY);

if (!hasCorrectUrl || !hasCorrectKey) {
  console.log('❌ supabaseClient.js has incorrect Supabase URL or key');
  
  // Create a backup of the original file
  const backupPath = `${supabaseClientPath}.backup`;
  fs.writeFileSync(backupPath, supabaseClientContent);
  console.log(`Created backup at ${backupPath}`);
  
  // Fix the file
  let fixedContent = supabaseClientContent;
  
  if (!hasCorrectUrl) {
    console.log('Fixing Supabase URL...');
    // Replace the URL with the correct one using regex
    fixedContent = fixedContent.replace(
      /const\s+supabaseUrl\s*=\s*['"].*['"]/,
      `const supabaseUrl = '${SUPABASE_URL}'`
    );
  }
  
  if (!hasCorrectKey) {
    console.log('Fixing Supabase anon key...');
    // Replace the key with the correct one using regex
    fixedContent = fixedContent.replace(
      /const\s+supabaseAnonKey\s*=\s*['"].*['"]/,
      `const supabaseAnonKey = '${SUPABASE_ANON_KEY}'`
    );
  }
  
  // Write the fixed content
  fs.writeFileSync(supabaseClientPath, fixedContent);
  console.log('✅ Fixed supabaseClient.js configuration');
} else {
  console.log('✅ supabaseClient.js has correct Supabase URL and key');
}

// Check if the client is properly configured with headers
const hasExplicitHeaders = supabaseClientContent.includes('global: {') && 
                          supabaseClientContent.includes('headers: {') && 
                          supabaseClientContent.includes('apikey');

if (!hasExplicitHeaders) {
  console.log('\n❌ supabaseClient.js is missing explicit headers configuration');
  
  // Create a backup if not already done
  if (hasCorrectUrl && hasCorrectKey) {
    const backupPath = `${supabaseClientPath}.backup`;
    fs.writeFileSync(backupPath, supabaseClientContent);
    console.log(`Created backup at ${backupPath}`);
  }
  
  // Fix the client configuration
  let fixedContent = supabaseClientContent;
  const clientConfigRegex = /supabaseClient\s*=\s*createClient\(\s*supabaseUrl\s*,\s*supabaseAnonKey\s*,\s*\{([^}]*)\}\s*\)/;
  
  if (clientConfigRegex.test(fixedContent)) {
    console.log('Adding explicit headers to client configuration...');
    
    fixedContent = fixedContent.replace(
      clientConfigRegex,
      `supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {$1,
    global: {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': \`Bearer \${supabaseAnonKey}\`
      }
    }
  })`
    );
    
    // Write the fixed content
    fs.writeFileSync(supabaseClientPath, fixedContent);
    console.log('✅ Added explicit headers to client configuration');
  } else {
    console.log('⚠️ Could not automatically fix client configuration. Manual intervention required.');
  }
} else {
  console.log('✅ supabaseClient.js has explicit headers configuration');
}

// Check localStorage for any issues
console.log('\nChecking localStorage for authentication issues...');
console.log('Note: This is a simulation as we cannot directly access browser localStorage');
console.log('To fix localStorage issues, please:');
console.log('1. Open your browser\'s developer tools (F12)');
console.log('2. Go to the Application tab');
console.log('3. Select "Local Storage" from the left sidebar');
console.log('4. Clear all items by right-clicking and selecting "Clear"');
console.log('5. Refresh the page and try logging in again');

// Provide instructions for testing
console.log('\nTo test authentication:');
console.log('1. Start your development server: npm run dev');
console.log('2. Navigate to: http://localhost:3000/auth-test');
console.log('3. Use the test page to verify Supabase connection and authentication');

console.log('\nIf you\'re still experiencing issues:');
console.log('1. Check browser console for any errors');
console.log('2. Verify that your Supabase project is properly configured');
console.log('3. Ensure that email confirmations are properly set up in Supabase');

console.log('\nDrFinTrack Supabase Authentication Fixer completed!');
