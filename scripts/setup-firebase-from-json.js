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

console.log('This script will help you set up Firebase credentials from a service account JSON file.');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error(`Error: .env file not found at ${envPath}`);
  console.log('Please run scripts/setup-env.js first to create the .env file.');
  rl.close();
  process.exit(1);
}

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Main function
async function setupFirebaseFromJson() {
  try {
    // Ask for the path to the JSON file
    const jsonPath = await prompt('Enter the path to your Firebase service account JSON file: ');
    
    if (!jsonPath) {
      console.error('JSON file path is required.');
      rl.close();
      return;
    }
    
    // Resolve the path (handle relative paths)
    const resolvedPath = path.resolve(jsonPath);
    
    // Check if the file exists
    if (!fs.existsSync(resolvedPath)) {
      console.error(`Error: File not found at ${resolvedPath}`);
      rl.close();
      return;
    }
    
    // Read the JSON file
    const jsonContent = fs.readFileSync(resolvedPath, 'utf8');
    let serviceAccount;
    
    try {
      serviceAccount = JSON.parse(jsonContent);
    } catch (error) {
      console.error('Error parsing JSON file:', error.message);
      rl.close();
      return;
    }
    
    // Extract the required fields
    const projectId = serviceAccount.project_id;
    const privateKey = JSON.stringify(serviceAccount.private_key);
    const clientEmail = serviceAccount.client_email;
    const clientId = serviceAccount.client_id;
    const clientCertUrl = serviceAccount.client_x509_cert_url;
    
    if (!projectId || !privateKey || !clientEmail) {
      console.error('Error: Missing required fields in the service account JSON file.');
      rl.close();
      return;
    }
    
    // Read existing .env content
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Remove existing Firebase credentials
    const envLines = envContent.split('\n');
    const newEnvLines = [];
    
    for (const line of envLines) {
      if (!line.startsWith('FIREBASE_PROJECT_ID=') && 
          !line.startsWith('FIREBASE_PRIVATE_KEY=') && 
          !line.startsWith('FIREBASE_CLIENT_EMAIL=') && 
          !line.startsWith('FIREBASE_CLIENT_ID=') && 
          !line.startsWith('FIREBASE_CLIENT_CERT_URL=')) {
        newEnvLines.push(line);
      }
    }
    
    // Add Firebase credentials
    newEnvLines.push('');
    newEnvLines.push('# Firebase Credentials');
    newEnvLines.push(`FIREBASE_PROJECT_ID=${projectId}`);
    newEnvLines.push(`FIREBASE_PRIVATE_KEY=${privateKey}`);
    newEnvLines.push(`FIREBASE_CLIENT_EMAIL=${clientEmail}`);
    
    if (clientId) {
      newEnvLines.push(`FIREBASE_CLIENT_ID=${clientId}`);
    }
    
    if (clientCertUrl) {
      newEnvLines.push(`FIREBASE_CLIENT_CERT_URL=${clientCertUrl}`);
    }
    
    // Write to .env file
    fs.writeFileSync(envPath, newEnvLines.join('\n'));
    
    console.log('\nFirebase credentials have been added to your .env file from the JSON file.');
    console.log('Try testing the Firebase connection:');
    console.log('node scripts/test-firebase.js');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
setupFirebaseFromJson();
