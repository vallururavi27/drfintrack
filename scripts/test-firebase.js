require('dotenv').config();
const admin = require('firebase-admin');

console.log('Testing Firebase connection...');

// Get Firebase credentials from environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

console.log('Firebase Project ID:', projectId || 'Not found');
console.log('Firebase Private Key:', privateKey ? 'Found (not showing for security)' : 'Not found');
console.log('Firebase Client Email:', clientEmail || 'Not found');

// Check if all required credentials are present
if (!projectId || !privateKey || !clientEmail) {
  console.error('\nError: Missing Firebase credentials in .env file');
  console.log('Please run scripts/update-firebase-credentials.js to update your credentials.');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  console.log('\nInitializing Firebase Admin...');
  
  // Format private key if needed
  let formattedPrivateKey = privateKey;
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    formattedPrivateKey = JSON.parse(privateKey);
  }
  
  const serviceAccount = {
    "type": "service_account",
    "project_id": projectId,
    "private_key": formattedPrivateKey.replace(/\\n/g, '\n'),
    "client_email": clientEmail,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
  };
  
  // Initialize Firebase Admin SDK
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('Firebase Admin initialized successfully!');
  
  // Test Firestore connection
  console.log('\nTesting Firestore connection...');
  const db = admin.firestore();
  
  // Create a test document
  const testDocRef = db.collection('_test_connection').doc('test');
  testDocRef.set({
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    test: 'Connection successful'
  })
  .then(() => {
    console.log('Firestore connection successful!');
    
    // Delete the test document
    return testDocRef.delete();
  })
  .then(() => {
    console.log('Test document deleted.');
    console.log('\nAll Firebase tests passed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error testing Firestore connection:', error);
    process.exit(1);
  });
  
} catch (error) {
  console.error('\nError initializing Firebase Admin:', error);
  
  if (error.message.includes('invalid_grant')) {
    console.log('\nThe "invalid_grant" error usually means:');
    console.log('1. Your service account key has been revoked or is invalid');
    console.log('2. Your server time might be out of sync');
    
    console.log('\nPlease generate a new service account key:');
    console.log('1. Go to Firebase Console > Project Settings > Service accounts');
    console.log('2. Click "Generate new private key"');
    console.log('3. Run scripts/update-firebase-credentials.js to update your credentials');
  }
  
  process.exit(1);
}
