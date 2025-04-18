// This script helps migrate data from Supabase to Firebase
// You'll need to run this with Node.js

const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://bqurvqysmwsropdaqwot.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // Use service role key for full access
const supabase = createClient(supabaseUrl, supabaseKey);

// Firebase configuration
const serviceAccount = require('./firebase-service-account.json'); // Download from Firebase console
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Tables to migrate
const tables = [
  'profiles',
  'bank_accounts',
  'transactions',
  'categories',
  'investments',
  'login_history'
];

// Helper function to convert Supabase timestamp to Firebase timestamp
const convertTimestamp = (timestamp) => {
  if (!timestamp) return null;
  return admin.firestore.Timestamp.fromDate(new Date(timestamp));
};

// Helper function to process data before saving to Firebase
const processData = (data, table) => {
  const processed = { ...data };
  
  // Convert timestamps
  if (processed.created_at) {
    processed.created_at = convertTimestamp(processed.created_at);
  }
  if (processed.updated_at) {
    processed.updated_at = convertTimestamp(processed.updated_at);
  }
  if (processed.transaction_date) {
    processed.transaction_date = convertTimestamp(processed.transaction_date);
  }
  if (processed.purchase_date) {
    processed.purchase_date = convertTimestamp(processed.purchase_date);
  }
  if (processed.maturity_date) {
    processed.maturity_date = convertTimestamp(processed.maturity_date);
  }
  
  // Convert numeric values
  if (processed.balance) {
    processed.balance = parseFloat(processed.balance);
  }
  if (processed.amount) {
    processed.amount = parseFloat(processed.amount);
  }
  if (processed.current_value) {
    processed.current_value = parseFloat(processed.current_value);
  }
  
  return processed;
};

// Main migration function
const migrateData = async () => {
  try {
    console.log('Starting migration from Supabase to Firebase...');
    
    // Create a directory for backups
    const backupDir = path.join(__dirname, 'supabase_backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    // Process each table
    for (const table of tables) {
      console.log(`Migrating table: ${table}`);
      
      // Fetch data from Supabase
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        console.error(`Error fetching data from ${table}:`, error);
        continue;
      }
      
      if (!data || data.length === 0) {
        console.log(`No data found in table ${table}`);
        continue;
      }
      
      console.log(`Found ${data.length} records in ${table}`);
      
      // Save backup
      fs.writeFileSync(
        path.join(backupDir, `${table}.json`),
        JSON.stringify(data, null, 2)
      );
      
      // Batch write to Firebase
      const batch = db.batch();
      let batchCount = 0;
      const batchSize = 500; // Firestore batch limit is 500
      
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const processedItem = processData(item, table);
        
        // Use the same ID if available
        const docRef = item.id 
          ? db.collection(table).doc(item.id.toString())
          : db.collection(table).doc();
          
        batch.set(docRef, processedItem);
        batchCount++;
        
        // Commit batch when it reaches the limit
        if (batchCount >= batchSize || i === data.length - 1) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} records for ${table}`);
          batchCount = 0;
        }
      }
      
      console.log(`Successfully migrated ${data.length} records from ${table}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Run the migration
migrateData();
