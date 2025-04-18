# Generate a New Firebase Service Account Key

Follow these steps to generate a new Firebase service account key:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the gear icon (⚙️) in the top left to open Project Settings
4. Go to the "Service accounts" tab
5. Click "Generate new private key" at the bottom of the page
6. Save the JSON file to your computer
7. Open the JSON file in a text editor

## Update Your .env File

After generating the new key, you need to update your `.env` file with the new credentials:

1. Run the following script to update your Firebase credentials:
   ```
   node scripts/update-firebase-credentials.js
   ```

2. When prompted, enter the following information from your JSON file:
   - Project ID
   - Private Key (the entire string including BEGIN and END lines)
   - Client Email
   - Client ID (optional)
   - Client Certificate URL (optional)

## Verify the Credentials

After updating your credentials, run the following script to verify that they work:

```
node scripts/test-firebase.js
```

If the test is successful, you should see a message indicating that the Firebase Admin SDK was initialized successfully.

## Run the Migration Script Again

Once your credentials are verified, run the migration script again:

```
node scripts/migrateToFirebase.js
```

This should resolve the "invalid_grant" error you were encountering.
