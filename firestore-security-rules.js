// This script deploys Firestore security rules
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check if service account file exists
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: firebase-service-account.json not found!');
  console.error('Please download your service account key from the Firebase console:');
  console.error('1. Go to Firebase Console > Project Settings > Service accounts');
  console.error('2. Click "Generate new private key"');
  console.error('3. Save the JSON file as "firebase-service-account.json" in the project root');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Firestore security rules
const rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /bank_accounts/{accountId} {
      allow read, write: if request.auth != null && 
                           resource.data.user_id == request.auth.uid;
    }
    
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
                           resource.data.user_id == request.auth.uid;
    }
    
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
                           resource.data.user_id == request.auth.uid;
    }
    
    match /investments/{investmentId} {
      allow read, write: if request.auth != null && 
                           resource.data.user_id == request.auth.uid;
    }
    
    match /login_history/{historyId} {
      allow read: if request.auth != null && 
                    resource.data.user_id == request.auth.uid;
      allow write: if request.auth != null;
    }
    
    match /connection_test/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
`;

// Save rules to a file
fs.writeFileSync('firestore.rules', rules);
console.log('Firestore security rules saved to firestore.rules');

// Note: To deploy these rules, you need to use the Firebase CLI
console.log('To deploy these rules, install the Firebase CLI and run:');
console.log('firebase deploy --only firestore:rules');
