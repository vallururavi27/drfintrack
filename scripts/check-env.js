const fs = require('fs');
const path = require('path');

// Path to .env file
const envPath = path.join(__dirname, '..', '.env');

console.log('Checking .env file at:', envPath);

// Check if file exists
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file does not exist!');
  process.exit(1);
}

// Read file content
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('\n.env file content:');
console.log('----------------------------------------');
console.log(envContent);
console.log('----------------------------------------');

// Parse .env file
const envVars = {};
envContent.split('\n').forEach(line => {
  // Skip empty lines and comments
  if (!line || line.startsWith('#')) return;
  
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

console.log('\nParsed environment variables:');
Object.keys(envVars).forEach(key => {
  // Don't show the actual values for security
  console.log(`${key}: ${key.includes('KEY') || key.includes('SECRET') ? '[HIDDEN]' : 'Found'}`);
});

// Check for Firebase variables
console.log('\nChecking for Firebase variables:');
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

let missingVars = false;
requiredVars.forEach(varName => {
  if (!envVars[varName]) {
    console.error(`Missing: ${varName}`);
    missingVars = true;
  } else {
    console.log(`Found: ${varName}`);
  }
});

if (missingVars) {
  console.error('\nSome required Firebase variables are missing!');
} else {
  console.log('\nAll required Firebase variables are present.');
}

// Try loading with dotenv
try {
  require('dotenv').config();
  console.log('\nLoaded with dotenv:');
  requiredVars.forEach(varName => {
    console.log(`${varName}: ${process.env[varName] ? 'Loaded' : 'Not loaded'}`);
  });
} catch (error) {
  console.error('\nError loading with dotenv:', error);
}
