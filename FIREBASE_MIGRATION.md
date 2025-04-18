# Firebase Migration Guide

This guide will help you migrate your finance app from Supabase to Firebase.

## Prerequisites

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firebase Authentication with email/password provider
3. Enable Firestore Database
4. Create a Firebase web app in your project
5. Generate a service account key for server-side operations

## Step 1: Set up Firebase Configuration

Create a `.env.local` file in the root of your project with the following Firebase configuration:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

You can find these values in your Firebase project settings.

## Step 2: Deploy Firestore Security Rules

1. Install the Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in your project:
   ```
   firebase init
   ```
   - Select Firestore
   - Choose your Firebase project
   - Use the existing `firestore.rules` file

4. Deploy the security rules:
   ```
   firebase deploy --only firestore:rules
   ```

## Step 3: Run the Data Migration Script

1. Create a `.env` file in the root of your project with the following configuration:

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-role-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_CLIENT_ID=your-firebase-client-id
FIREBASE_CLIENT_CERT_URL=your-firebase-client-cert-url
```

2. Install the required dependencies:
   ```
   npm install dotenv @supabase/supabase-js firebase-admin
   ```

3. Run the migration script:
   ```
   node scripts/migrateToFirebase.js
   ```

4. Follow the prompts to confirm and complete the migration.

## Step 4: Update Environment Variables in Vercel

If you're deploying to Vercel, update your environment variables in the Vercel project settings:

1. Go to your Vercel project
2. Navigate to Settings > Environment Variables
3. Add the Firebase configuration variables listed in Step 1

## Step 5: Test the Migration

1. Run your app locally:
   ```
   npm start
   ```

2. Test the following features:
   - User authentication (login, register, password reset)
   - Bank accounts (create, read, update, delete)
   - Transactions (create, read, update, delete)
   - Categories (create, read, update, delete)
   - Investments (create, read, update, delete)
   - Reports and analytics

## Troubleshooting

### Authentication Issues

If users are having trouble logging in:

1. Check that Firebase Authentication is properly configured
2. Verify that the email/password provider is enabled
3. Check the Firebase Authentication console for any errors

### Data Access Issues

If users can't access their data:

1. Check the Firestore security rules
2. Verify that the user ID is correctly associated with the data
3. Check the Firestore console for any permission errors

### Migration Issues

If the migration script fails:

1. Check the error messages in the console
2. Verify that your Supabase and Firebase credentials are correct
3. Try running the migration again with specific data types

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
