/**
 * This script helps fix the bank_accounts table schema issue
 * Run this script with Node.js: node fix-bank-accounts.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://bqurvqysmwsropdaqwot.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDc4MzU2NCwiZXhwIjoyMDYwMzU5NTY0fQ.ojFM53vyvbtQC80yQHAm77X3dxlzcBZhUsFtFLYQAu4';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('DrFinTrack Bank Accounts Fixer');
console.log('==============================');
console.log('This script will help fix the bank_accounts table schema issue.');

async function main() {
  try {
    console.log('\nChecking bank_accounts table schema...');
    
    // Check if bank_name column exists
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'bank_accounts');
    
    if (columnsError) {
      console.error('Error checking columns:', columnsError.message);
      return;
    }
    
    const columnNames = columns.map(col => col.column_name);
    console.log('Existing columns:', columnNames.join(', '));
    
    const hasBankNameColumn = columnNames.includes('bank_name');
    
    if (!hasBankNameColumn) {
      console.log('\n❌ bank_name column is missing from bank_accounts table');
      
      // Add the bank_name column
      console.log('Adding bank_name column...');
      
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE bank_accounts ADD COLUMN bank_name VARCHAR(255)'
      });
      
      if (alterError) {
        console.error('Error adding bank_name column:', alterError.message);
        console.log('\nAlternative: You need to run this SQL in the Supabase SQL Editor:');
        console.log('ALTER TABLE bank_accounts ADD COLUMN bank_name VARCHAR(255);');
        return;
      }
      
      console.log('✅ bank_name column added successfully');
    } else {
      console.log('✅ bank_name column already exists');
    }
    
    // Check for any existing accounts that need updating
    console.log('\nChecking for accounts that need bank_name updates...');
    
    const { data: accounts, error: accountsError } = await supabase
      .from('bank_accounts')
      .select('id, name, bank_name')
      .is('bank_name', null);
    
    if (accountsError) {
      console.error('Error checking accounts:', accountsError.message);
      return;
    }
    
    if (accounts && accounts.length > 0) {
      console.log(`Found ${accounts.length} accounts without bank_name values`);
      
      // Update accounts to set bank_name = name for accounts where bank_name is null
      console.log('Updating accounts to set bank_name = name...');
      
      for (const account of accounts) {
        const { error: updateError } = await supabase
          .from('bank_accounts')
          .update({ bank_name: account.name })
          .eq('id', account.id);
        
        if (updateError) {
          console.error(`Error updating account ${account.id}:`, updateError.message);
        } else {
          console.log(`Updated account ${account.id}: set bank_name to "${account.name}"`);
        }
      }
      
      console.log('✅ Account updates completed');
    } else {
      console.log('✅ No accounts need bank_name updates');
    }
    
    console.log('\nDrFinTrack Bank Accounts Fixer completed!');
    console.log('You should now be able to add bank accounts without errors.');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

main();
