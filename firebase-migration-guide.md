# Firebase Migration Guide for drFinTrack

This guide will help you migrate your finance app from Supabase to Firebase.

## Prerequisites

1. Node.js installed on your computer
2. Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)
3. Supabase access (for data migration)

## Step 1: Set Up Firebase Project

1. **Create a Firebase project** (if you haven't already)
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter "drFinTrack" as the project name
   - Configure Google Analytics (optional)
   - Click "Create project"

2. **Add a web app to your project**
   - From the project dashboard, click the web icon (</>) 
   - Register your app with the nickname "drFinTrack Web"
   - Copy the Firebase configuration

3. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable Email/Password provider
   - Configure settings (password requirements, etc.)

4. **Create Firestore Database**
   - Go to Firestore Database → Create database
   - Start in production mode
   - Choose a location close to your users (e.g., asia-south1 for India)

5. **Set Up Security Rules**
   - Go to the "Rules" tab in Firestore
   - Use the following rules:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated users to read and write their own data
       match /users/{userId} {
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
     }
   }
   ```

## Step 2: Update Environment Variables

1. **Update your `.env.local` file** with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Step 3: Test Firebase Connection

1. **Open the test-firebase-connection.html file** in your browser
2. Enter your Firebase configuration
3. Click "Initialize Firebase"
4. Test Firestore connection and authentication

## Step 4: Migrate Data from Supabase to Firebase

1. **Install required packages**:
   ```bash
   npm install firebase-admin @supabase/supabase-js
   ```

2. **Generate a Firebase service account key**:
   - Go to Firebase Console → Project settings → Service accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-service-account.json` in your project root

3. **Update the migration script**:
   - Open `migrate-to-firebase.js`
   - Update the Supabase service role key

4. **Run the migration script**:
   ```bash
   node migrate-to-firebase.js
   ```

## Step 5: Update Your Application Code

1. **Install Firebase SDK** (if not already installed):
   ```bash
   npm install firebase
   ```

2. **Update imports in your components**:
   - Replace Supabase imports with Firebase imports
   - Use the Firebase authentication and Firestore services

3. **Test the application**:
   - Run your app locally
   - Test authentication
   - Test database operations

## Step 6: Deploy to Production

1. **Update environment variables in Vercel**:
   - Go to your Vercel project settings
   - Add the Firebase environment variables

2. **Deploy your app**:
   ```bash
   git add .
   git commit -m "Migrate from Supabase to Firebase"
   git push
   ```

## Troubleshooting

- **Authentication issues**: Check Firebase Authentication console for any errors
- **Database issues**: Verify Firestore security rules
- **Migration issues**: Check the console output for errors during migration

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
