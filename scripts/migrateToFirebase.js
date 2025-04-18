/**
 * Migration script to transfer data from Supabase to Firebase
 *
 * This script will:
 * 1. Connect to both Supabase and Firebase
 * 2. Fetch data from Supabase
 * 3. Transform the data as needed
 * 4. Upload the data to Firebase
 *
 * Usage:
 * 1. Set up your environment variables in a .env file:
 *    - SUPABASE_URL
 *    - SUPABASE_KEY
 *    - FIREBASE_PROJECT_ID
 *    - FIREBASE_PRIVATE_KEY
 *    - FIREBASE_CLIENT_EMAIL
 *
 * 2. Run the script:
 *    node migrateToFirebase.js
 */

// Load environment variables
try {
  require('dotenv').config();

  // Debug environment variables
  console.log('Environment variables loaded:');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Found ✓' : 'Not found ✗');
  console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Found ✓' : 'Not found ✗');
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Found ✓' : 'Not found ✗');
  console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Found ✓' : 'Not found ✗');
  console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Found ✓' : 'Not found ✗');

  // Check for required variables
  if (!process.env.SUPABASE_URL) {
    console.error('Error: SUPABASE_URL is missing in your .env file');
    console.log('Try running: node scripts/setup-env.js');
    process.exit(1);
  }

  if (!process.env.SUPABASE_KEY) {
    console.error('Error: SUPABASE_KEY is missing in your .env file');
    console.log('Try running: node scripts/setup-env.js');
    process.exit(1);
  }

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
    console.error('Error: Firebase credentials are missing in your .env file');
    console.log('Please add your Firebase service account details to the .env file');
    process.exit(1);
  }
} catch (error) {
  console.error('Error loading environment variables:', error);
  process.exit(1);
}
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase;

try {
  console.log('Initializing Supabase client...');
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized successfully.');
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  process.exit(1);
}

// Initialize Firebase Admin
try {
  console.log('Initializing Firebase Admin...');
  const serviceAccount = {
    "type": "service_account",
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID || undefined,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL || undefined
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for confirmation
function confirm(question) {
  return new Promise((resolve) => {
    rl.question(question + ' (y/n): ', (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Helper function to log progress
function logProgress(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Helper function to convert Supabase timestamp to Firestore timestamp
function toFirestoreTimestamp(supabaseTimestamp) {
  if (!supabaseTimestamp) return null;
  return admin.firestore.Timestamp.fromDate(new Date(supabaseTimestamp));
}

// Main migration function
async function migrateData() {
  try {
    logProgress('Starting migration from Supabase to Firebase');

    // Confirm before proceeding
    const shouldProceed = await confirm('This will migrate data from Supabase to Firebase. Are you sure you want to proceed?');
    if (!shouldProceed) {
      logProgress('Migration cancelled by user');
      rl.close();
      return;
    }

    // Step 1: Migrate users
    logProgress('Migrating users...');
    const { data, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      throw new Error(`Error fetching users from Supabase: ${usersError.message}`);
    }

    // Handle case where data might be undefined or not in expected format
    const users = data?.users || data || [];

    logProgress(`Found ${users.length} users to migrate`);

    // Create a mapping of Supabase user IDs to Firebase user IDs
    const userIdMap = {};

    if (users.length === 0) {
      logProgress('No users found to migrate. Creating a default user in Firebase.');
      // Create a default user in Firebase
      try {
        // Create a default user with a random email
        const defaultEmail = `default_user_${Date.now()}@example.com`;
        const defaultPassword = Math.random().toString(36).slice(-8);

        const firebaseUser = await auth.createUser({
          email: defaultEmail,
          password: defaultPassword,
          displayName: 'Default User',
          emailVerified: true
        });

        userIdMap['default_user_id'] = firebaseUser.uid;
        logProgress(`Created default user in Firebase with ID: ${firebaseUser.uid}`);

        // Save the default user credentials for reference
        fs.writeFileSync(
          path.join(__dirname, 'default_user_credentials.json'),
          JSON.stringify({
            email: defaultEmail,
            password: defaultPassword,
            uid: firebaseUser.uid
          }, null, 2)
        );

        logProgress('Default user credentials saved to default_user_credentials.json');
      } catch (error) {
        logProgress(`Error creating default user: ${error.message}`);
        userIdMap['default_user_id'] = 'default_firebase_user_id';
      }
    } else {
      for (const user of users) {
      try {
        // Check if user already exists in Firebase
        try {
          const firebaseUser = await auth.getUserByEmail(user.email);
          userIdMap[user.id] = firebaseUser.uid;
          logProgress(`User ${user.email} already exists in Firebase with ID: ${firebaseUser.uid}`);
          continue;
        } catch (error) {
          // User doesn't exist, create new user
          if (error.code !== 'auth/user-not-found') {
            throw error;
          }
        }

        // Create user in Firebase
        const firebaseUser = await auth.createUser({
          email: user.email,
          emailVerified: user.email_confirmed_at ? true : false,
          displayName: user.user_metadata?.name || user.email.split('@')[0],
          disabled: false
        });

        userIdMap[user.id] = firebaseUser.uid;
        logProgress(`Created user ${user.email} in Firebase with ID: ${firebaseUser.uid}`);
      } catch (error) {
        logProgress(`Error migrating user ${user.email}: ${error.message}`);
      }
    }
    }

    // Save user ID mapping for reference
    fs.writeFileSync(
      path.join(__dirname, 'user_id_mapping.json'),
      JSON.stringify(userIdMap, null, 2)
    );

    logProgress('User migration completed');

    // Step 2: Migrate user profiles
    logProgress('Migrating user profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      throw new Error(`Error fetching profiles from Supabase: ${profilesError.message}`);
    }

    logProgress(`Found ${profiles?.length || 0} profiles to migrate`);

    // Handle case where no profiles exist
    if (!profiles || profiles.length === 0) {
      logProgress('No profiles found. Creating a default profile.');

      // Create a default profile for the default user
      if (userIdMap['default_user_id']) {
        const defaultFirebaseUserId = userIdMap['default_user_id'];

        await db.collection('user_profiles').doc(defaultFirebaseUserId).set({
          user_id: defaultFirebaseUserId,
          display_name: 'Default User',
          avatar_url: '',
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
          preferences: {},
          theme: 'light'
        });

        logProgress(`Created default profile for user ID: ${defaultFirebaseUserId}`);
      }
    } else {
      // Migrate existing profiles
      for (const profile of profiles) {
        try {
          // Try to find a matching Firebase user ID
          let firebaseUserId = userIdMap[profile.id];

          // If no matching ID found but we have a default ID, use that
          if (!firebaseUserId && userIdMap['default_user_id']) {
            firebaseUserId = userIdMap['default_user_id'];
            logProgress(`Using default Firebase user ID for profile: ${profile.id}`);
          }

          if (!firebaseUserId) {
            logProgress(`No Firebase user ID found for Supabase user ID: ${profile.id}`);
            continue;
          }

          // Create profile document in Firestore
          await db.collection('user_profiles').doc(firebaseUserId).set({
            user_id: firebaseUserId,
            display_name: profile.full_name || '',
            avatar_url: profile.avatar_url || '',
            created_at: toFirestoreTimestamp(profile.created_at),
            updated_at: toFirestoreTimestamp(profile.updated_at),
            preferences: profile.preferences || {},
            theme: profile.theme || 'light'
          });

          logProgress(`Migrated profile for user ID: ${firebaseUserId}`);
        } catch (error) {
          logProgress(`Error migrating profile for user ID ${profile.id}: ${error.message}`);
        }
      }
    }

    logProgress('Profile migration completed');

    // Step 3: Migrate bank accounts
    logProgress('Migrating bank accounts...');
    const { data: bankAccounts, error: bankAccountsError } = await supabase
      .from('bank_accounts')
      .select('*');

    if (bankAccountsError) {
      throw new Error(`Error fetching bank accounts from Supabase: ${bankAccountsError.message}`);
    }

    logProgress(`Found ${bankAccounts?.length || 0} bank accounts to migrate`);

    // Handle case where no bank accounts exist
    if (!bankAccounts || bankAccounts.length === 0) {
      logProgress('No bank accounts found. Creating a default bank account.');

      // Create a default bank account for the default user
      if (userIdMap['default_user_id']) {
        const defaultFirebaseUserId = userIdMap['default_user_id'];

        await db.collection('bank_accounts').add({
          user_id: defaultFirebaseUserId,
          name: 'My Primary Account',
          bank_name: 'Default Bank',
          account_type: 'Savings',
          account_number: '',
          ifsc_code: '',
          balance: 0,
          is_active: true,
          color: '#3b82f6',
          icon_name: 'bank',
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

        logProgress(`Created default bank account for user ID: ${defaultFirebaseUserId}`);
      }
    } else {
      // Migrate existing bank accounts
      for (const account of bankAccounts) {
        try {
          // Try to find a matching Firebase user ID
          let firebaseUserId = userIdMap[account.user_id];

          // If no matching ID found but we have a default ID, use that
          if (!firebaseUserId && userIdMap['default_user_id']) {
            firebaseUserId = userIdMap['default_user_id'];
            logProgress(`Using default Firebase user ID for bank account: ${account.id}`);
          }

          if (!firebaseUserId) {
            logProgress(`No Firebase user ID found for Supabase user ID: ${account.user_id}`);
            continue;
          }

          // Create bank account document in Firestore
          const docRef = await db.collection('bank_accounts').add({
            user_id: firebaseUserId,
            name: account.name || '',
            bank_name: account.bank_name || '',
            account_type: account.account_type || '',
            account_number: account.account_number || '',
            ifsc_code: account.ifsc_code || '',
            balance: parseFloat(account.balance) || 0,
            is_active: account.is_active === true,
            color: account.color || '#3b82f6',
            icon_name: account.icon_name || 'bank',
            created_at: toFirestoreTimestamp(account.created_at),
            updated_at: toFirestoreTimestamp(account.updated_at)
          });

          logProgress(`Migrated bank account ${account.name} for user ID: ${firebaseUserId}`);
        } catch (error) {
          logProgress(`Error migrating bank account ${account.id}: ${error.message}`);
        }
      }
    }

    logProgress('Bank account migration completed');

    // Step 4: Migrate categories
    logProgress('Migrating categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      throw new Error(`Error fetching categories from Supabase: ${categoriesError.message}`);
    }

    logProgress(`Found ${categories.length} categories to migrate`);

    for (const category of categories) {
      try {
        const firebaseUserId = userIdMap[category.user_id];

        if (!firebaseUserId) {
          logProgress(`No Firebase user ID found for Supabase user ID: ${category.user_id}`);
          continue;
        }

        // Create category document in Firestore
        const docRef = await db.collection('categories').add({
          user_id: firebaseUserId,
          name: category.name || '',
          type: category.type || '',
          icon_name: category.icon_name || '',
          color: category.color || '#3b82f6',
          is_default: category.is_default === true,
          created_at: toFirestoreTimestamp(category.created_at),
          updated_at: toFirestoreTimestamp(category.updated_at)
        });

        logProgress(`Migrated category ${category.name} for user ID: ${firebaseUserId}`);
      } catch (error) {
        logProgress(`Error migrating category ${category.id}: ${error.message}`);
      }
    }

    logProgress('Category migration completed');

    // Step 5: Migrate transactions
    logProgress('Migrating transactions...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*');

    if (transactionsError) {
      throw new Error(`Error fetching transactions from Supabase: ${transactionsError.message}`);
    }

    logProgress(`Found ${transactions.length} transactions to migrate`);

    for (const transaction of transactions) {
      try {
        const firebaseUserId = userIdMap[transaction.user_id];

        if (!firebaseUserId) {
          logProgress(`No Firebase user ID found for Supabase user ID: ${transaction.user_id}`);
          continue;
        }

        // Create transaction document in Firestore
        const docRef = await db.collection('transactions').add({
          user_id: firebaseUserId,
          type: transaction.type || '',
          amount: parseFloat(transaction.amount) || 0,
          description: transaction.description || '',
          category_id: transaction.category_id || '',
          account_id: transaction.account_id || '',
          transaction_date: toFirestoreTimestamp(transaction.transaction_date),
          payment_method: transaction.payment_method || '',
          notes: transaction.notes || '',
          created_at: toFirestoreTimestamp(transaction.created_at),
          updated_at: toFirestoreTimestamp(transaction.updated_at)
        });

        logProgress(`Migrated transaction ${transaction.id} for user ID: ${firebaseUserId}`);
      } catch (error) {
        logProgress(`Error migrating transaction ${transaction.id}: ${error.message}`);
      }
    }

    logProgress('Transaction migration completed');

    // Step 6: Migrate investments
    logProgress('Migrating investments...');
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('*');

    if (investmentsError) {
      throw new Error(`Error fetching investments from Supabase: ${investmentsError.message}`);
    }

    logProgress(`Found ${investments.length} investments to migrate`);

    for (const investment of investments) {
      try {
        const firebaseUserId = userIdMap[investment.user_id];

        if (!firebaseUserId) {
          logProgress(`No Firebase user ID found for Supabase user ID: ${investment.user_id}`);
          continue;
        }

        // Create investment document in Firestore
        const docRef = await db.collection('investments').add({
          user_id: firebaseUserId,
          name: investment.name || '',
          investment_type: investment.investment_type || '',
          category_id: investment.category_id || '',
          initial_value: parseFloat(investment.initial_value) || 0,
          current_value: parseFloat(investment.current_value) || 0,
          current_units: parseFloat(investment.current_units) || 0,
          start_date: toFirestoreTimestamp(investment.start_date),
          notes: investment.notes || '',
          color: investment.color || '#3b82f6',
          created_at: toFirestoreTimestamp(investment.created_at),
          updated_at: toFirestoreTimestamp(investment.updated_at)
        });

        logProgress(`Migrated investment ${investment.name} for user ID: ${firebaseUserId}`);
      } catch (error) {
        logProgress(`Error migrating investment ${investment.id}: ${error.message}`);
      }
    }

    logProgress('Investment migration completed');

    // Step 7: Migrate investment categories
    logProgress('Migrating investment categories...');
    try {
      const { data: investmentCategories, error: investmentCategoriesError } = await supabase
        .from('investment_categories')
        .select('*');

      if (investmentCategoriesError) {
        if (investmentCategoriesError.message.includes('does not exist')) {
          logProgress('Investment categories table does not exist. Creating default categories.');

          // Create default investment categories if we have a default user
          if (userIdMap['default_user_id']) {
            const defaultFirebaseUserId = userIdMap['default_user_id'];
            const defaultCategories = [
              { name: 'Large Cap', color: '#3b82f6' },
              { name: 'Mid Cap', color: '#10b981' },
              { name: 'Small Cap', color: '#f59e0b' },
              { name: 'Debt', color: '#6366f1' },
              { name: 'Gold', color: '#f97316' },
              { name: 'Real Estate', color: '#8b5cf6' },
              { name: 'Fixed Income', color: '#ec4899' },
              { name: 'International', color: '#14b8a6' }
            ];

            for (const category of defaultCategories) {
              await db.collection('investment_categories').add({
                user_id: defaultFirebaseUserId,
                name: category.name,
                color: category.color,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
              });

              logProgress(`Created default investment category: ${category.name}`);
            }
          }
        } else {
          throw new Error(`Error fetching investment categories from Supabase: ${investmentCategoriesError.message}`);
        }
      } else if (investmentCategories && investmentCategories.length > 0) {
        logProgress(`Found ${investmentCategories.length} investment categories to migrate`);

        for (const category of investmentCategories) {
          try {
            // Try to find a matching Firebase user ID
            let firebaseUserId = userIdMap[category.user_id];

            // If no matching ID found but we have a default ID, use that
            if (!firebaseUserId && userIdMap['default_user_id']) {
              firebaseUserId = userIdMap['default_user_id'];
              logProgress(`Using default Firebase user ID for investment category: ${category.id}`);
            }

            if (!firebaseUserId) {
              logProgress(`No Firebase user ID found for Supabase user ID: ${category.user_id}`);
              continue;
            }

            // Create investment category document in Firestore
            const docRef = await db.collection('investment_categories').add({
              user_id: firebaseUserId,
              name: category.name || '',
              color: category.color || '#3b82f6',
              created_at: toFirestoreTimestamp(category.created_at),
              updated_at: toFirestoreTimestamp(category.updated_at)
            });

            logProgress(`Migrated investment category ${category.name} for user ID: ${firebaseUserId}`);
          } catch (error) {
            logProgress(`Error migrating investment category ${category.id}: ${error.message}`);
          }
        }
      } else {
        logProgress('No investment categories found to migrate.');
      }
    } catch (error) {
      logProgress(`Error in investment categories migration: ${error.message}`);
    }

    logProgress('Investment category migration completed');

    logProgress('Migration completed successfully!');
  } catch (error) {
    logProgress(`Migration failed: ${error.message}`);
    console.error(error);
  } finally {
    rl.close();
  }
}

// Run the migration
migrateData();
