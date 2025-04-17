/**
 * This script helps diagnose and fix common Supabase login issues
 * Run this script with Node.js: node fix-login.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SUPABASE_URL = 'https://bqurvqysmwsropdaqwot.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3ODM1NjQsImV4cCI6MjA2MDM1OTU2NH0.9ZIVWp-PLXSfD_Ku7C9GvLTFZBnU_qS6HLVuZ4lc8hM';

// Paths
const supabaseClientPath = path.join(__dirname, 'frontend', 'src', 'services', 'supabaseClient.js');
const loginPagePath = path.join(__dirname, 'frontend', 'src', 'pages', 'Login.jsx');

console.log('DrFinTrack Login Fixer');
console.log('=====================');
console.log('This script will help diagnose and fix common login issues.');

// Check if files exist
if (!fs.existsSync(supabaseClientPath)) {
  console.error(`Error: Could not find supabaseClient.js at ${supabaseClientPath}`);
  process.exit(1);
}

if (!fs.existsSync(loginPagePath)) {
  console.error(`Error: Could not find Login.jsx at ${loginPagePath}`);
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

// Check for complex client configuration
const hasComplexConfig = supabaseClientContent.includes('global: {') || 
                         supabaseClientContent.includes('headers: {');

if (hasComplexConfig) {
  console.log('\n❌ supabaseClient.js has complex configuration that might cause issues');
  
  // Create a backup if not already done
  if (hasCorrectUrl && hasCorrectKey) {
    const backupPath = `${supabaseClientPath}.backup`;
    fs.writeFileSync(backupPath, supabaseClientContent);
    console.log(`Created backup at ${backupPath}`);
  }
  
  // Simplify the client configuration
  let fixedContent = supabaseClientContent.replace(
    /supabaseClient\s*=\s*createClient\(\s*supabaseUrl\s*,\s*supabaseAnonKey\s*,\s*\{[^}]*\}\s*\)/s,
    'supabaseClient = createClient(supabaseUrl, supabaseAnonKey)'
  );
  
  // Write the fixed content
  fs.writeFileSync(supabaseClientPath, fixedContent);
  console.log('✅ Simplified supabaseClient.js configuration');
} else {
  console.log('✅ supabaseClient.js has simple configuration');
}

// Check Login.jsx for any issues
console.log('\nChecking Login.jsx for issues...');
const loginPageContent = fs.readFileSync(loginPagePath, 'utf8');

// Check for complex error handling that might cause issues
const hasComplexErrorHandling = loginPageContent.includes('error.message.includes(');

if (hasComplexErrorHandling) {
  console.log('⚠️ Login.jsx has complex error handling that might cause issues');
  console.log('Consider simplifying error handling in Login.jsx');
}

// Provide instructions for testing
console.log('\nTo test login functionality:');
console.log('1. Open the standalone test page: supabase-web-login-test.html');
console.log('2. Try logging in with your credentials');
console.log('3. If successful, try the main app login page');

console.log('\nIf you\'re still experiencing issues:');
console.log('1. Clear your browser\'s local storage');
console.log('2. Check browser console for any errors');
console.log('3. Verify that your Supabase project is properly configured');
console.log('4. Ensure that your user account exists and is active in Supabase');

console.log('\nDrFinTrack Login Fixer completed!');
