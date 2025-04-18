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

console.log('This script will help you add Firebase credentials to your .env file.');
console.log('You will need to enter the following information from your Firebase service account JSON file:');
console.log('- Project ID');
console.log('- Private Key');
console.log('- Client Email');
console.log('- Client ID (optional)');
console.log('- Client Certificate URL (optional)');
console.log('\nMake sure you have your Firebase service account JSON file ready.');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error(`Error: .env file not found at ${envPath}`);
  console.log('Please run scripts/setup-env.js first to create the .env file.');
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
async function addFirebaseCredentials() {
  try {
    console.log('\n--- Firebase Credentials ---');
    
    // Project ID
    const projectId = await prompt('Enter your Firebase Project ID: ');
    if (!projectId) {
      console.error('Project ID is required.');
      return;
    }
    
    // Client Email
    const clientEmail = await prompt('Enter your Firebase Client Email: ');
    if (!clientEmail) {
      console.error('Client Email is required.');
      return;
    }
    
    // Private Key
    console.log('\nFor the Private Key:');
    console.log('1. Open your Firebase service account JSON file');
    console.log('2. Find the "private_key" field');
    console.log('3. Copy the entire value including the BEGIN and END lines');
    console.log('4. Paste it below (it will be automatically formatted)');
    let privateKey = await prompt('Enter your Firebase Private Key: ');
    if (!privateKey) {
      console.error('Private Key is required.');
      return;
    }
    
    // Format private key
    privateKey = privateKey.replace(/\\n/g, '\\\\n');
    if (!privateKey.includes('\\\\n')) {
      privateKey = privateKey.replace(/\r?\n/g, '\\\\n');
    }
    if (!privateKey.startsWith('"') && !privateKey.endsWith('"')) {
      privateKey = `"${privateKey}"`;
    }
    
    // Client ID (optional)
    const clientId = await prompt('Enter your Firebase Client ID (optional, press Enter to skip): ');
    
    // Client Certificate URL (optional)
    const clientCertUrl = await prompt('Enter your Firebase Client Certificate URL (optional, press Enter to skip): ');
    
    // Confirm
    console.log('\nReview your Firebase credentials:');
    console.log(`Project ID: ${projectId}`);
    console.log(`Client Email: ${clientEmail}`);
    console.log(`Private Key: ${privateKey.substring(0, 20)}...${privateKey.substring(privateKey.length - 20)}`);
    if (clientId) console.log(`Client ID: ${clientId}`);
    if (clientCertUrl) console.log(`Client Certificate URL: ${clientCertUrl}`);
    
    const confirm = await prompt('\nDo you want to add these credentials to your .env file? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Operation cancelled.');
      return;
    }
    
    // Add credentials to .env file
    if (!envContent.endsWith('\n')) envContent += '\n';
    
    envContent += `\n# Firebase Credentials\n`;
    envContent += `FIREBASE_PROJECT_ID=${projectId}\n`;
    envContent += `FIREBASE_PRIVATE_KEY=${privateKey}\n`;
    envContent += `FIREBASE_CLIENT_EMAIL=${clientEmail}\n`;
    
    if (clientId) {
      envContent += `FIREBASE_CLIENT_ID=${clientId}\n`;
    }
    
    if (clientCertUrl) {
      envContent += `FIREBASE_CLIENT_CERT_URL=${clientCertUrl}\n`;
    }
    
    // Write to .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\nFirebase credentials added successfully to your .env file!');
    console.log(`File saved at: ${envPath}`);
    console.log('\nYou can now run the migration script:');
    console.log('node scripts/migrateToFirebase.js');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
addFirebaseCredentials();
