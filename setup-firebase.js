// This script helps set up Firebase for your project
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Main setup function
const setupFirebase = async () => {
  console.log('Firebase Setup Helper');
  console.log('====================');
  console.log('This script will help you set up Firebase for your project.');
  console.log('');
  
  // Get Firebase config
  console.log('Please enter your Firebase configuration:');
  const apiKey = await prompt('API Key: ');
  const authDomain = await prompt('Auth Domain: ');
  const projectId = await prompt('Project ID: ');
  const storageBucket = await prompt('Storage Bucket: ');
  const messagingSenderId = await prompt('Messaging Sender ID: ');
  const appId = await prompt('App ID: ');
  
  // Create .env.local file
  const envContent = `# Firebase Configuration
VITE_FIREBASE_API_KEY=${apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain}
VITE_FIREBASE_PROJECT_ID=${projectId}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
VITE_FIREBASE_APP_ID=${appId}

# Other environment variables
VITE_APP_NAME=drFinTrack
`;

  fs.writeFileSync(path.join(__dirname, 'frontend', '.env.local'), envContent);
  console.log('Created .env.local file with Firebase configuration');
  
  // Create firebase.json file
  const firebaseJsonContent = {
    "firestore": {
      "rules": "firestore.rules",
      "indexes": "firestore.indexes.json"
    },
    "hosting": {
      "public": "frontend/dist",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  };
  
  fs.writeFileSync('firebase.json', JSON.stringify(firebaseJsonContent, null, 2));
  console.log('Created firebase.json file');
  
  // Create firestore.indexes.json file
  const firestoreIndexesContent = {
    "indexes": [
      {
        "collectionGroup": "transactions",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "user_id", "order": "ASCENDING" },
          { "fieldPath": "transaction_date", "order": "DESCENDING" }
        ]
      },
      {
        "collectionGroup": "bank_accounts",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "user_id", "order": "ASCENDING" },
          { "fieldPath": "created_at", "order": "DESCENDING" }
        ]
      }
    ],
    "fieldOverrides": []
  };
  
  fs.writeFileSync('firestore.indexes.json', JSON.stringify(firestoreIndexesContent, null, 2));
  console.log('Created firestore.indexes.json file');
  
  console.log('');
  console.log('Firebase setup completed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Download your service account key from the Firebase console');
  console.log('   - Go to Firebase Console > Project Settings > Service accounts');
  console.log('   - Click "Generate new private key"');
  console.log('   - Save the JSON file as "firebase-service-account.json" in the project root');
  console.log('');
  console.log('2. Install the Firebase CLI:');
  console.log('   npm install -g firebase-tools');
  console.log('');
  console.log('3. Login to Firebase:');
  console.log('   firebase login');
  console.log('');
  console.log('4. Initialize your project:');
  console.log('   firebase init');
  console.log('');
  console.log('5. Deploy your security rules:');
  console.log('   firebase deploy --only firestore:rules');
  
  rl.close();
};

// Run the setup
setupFirebase();
