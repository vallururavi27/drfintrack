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

console.log('This script will help you fix the Firebase private key format in your .env file.');

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
async function fixPrivateKey() {
  try {
    console.log('\nPlease follow these steps:');
    console.log('1. Open your Firebase service account JSON file');
    console.log('2. Find the "private_key" field');
    console.log('3. Copy the EXACT value (including quotes)');
    
    const privateKey = await prompt('\nPaste your Firebase private key here: ');
    
    if (!privateKey) {
      console.error('Private key is required.');
      rl.close();
      return;
    }
    
    // Remove existing private key from .env file
    const envLines = envContent.split('\n');
    const newEnvLines = [];
    
    for (const line of envLines) {
      if (!line.startsWith('FIREBASE_PRIVATE_KEY=')) {
        newEnvLines.push(line);
      }
    }
    
    // Add the new private key
    newEnvLines.push(`FIREBASE_PRIVATE_KEY=${privateKey}`);
    
    // Write back to .env file
    fs.writeFileSync(envPath, newEnvLines.join('\n'));
    
    console.log('\nPrivate key has been updated in your .env file.');
    console.log('Try running the migration script again:');
    console.log('node scripts/migrateToFirebase.js');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
fixPrivateKey();
