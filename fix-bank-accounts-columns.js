/**
 * This script helps fix the bank_accounts table schema issues with missing columns
 * Run this script with Node.js: node fix-bank-accounts-columns.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://bqurvqysmwsropdaqwot.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDc4MzU2NCwiZXhwIjoyMDYwMzU5NTY0fQ.ojFM53vyvbtQC80yQHAm77X3dxlzcBZhUsFtFLYQAu4';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('DrFinTrack Bank Accounts Columns Fixer');
console.log('=====================================');
console.log('This script will help fix the bank_accounts table schema issues with missing columns.');

async function main() {
  try {
    console.log('\nChecking bank_accounts table schema...');
    
    // Get all columns from the bank_accounts table
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
    
    // Check for missing columns
    const requiredColumns = [
      { name: 'bank_name', type: 'VARCHAR(255)', description: 'Name of the bank' },
      { name: 'color', type: 'VARCHAR(50)', description: 'Color code for the bank' },
      { name: 'icon_name', type: 'VARCHAR(100)', description: 'Icon name for the bank' }
    ];
    
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col.name));
    
    if (missingColumns.length === 0) {
      console.log('\n✅ All required columns exist in the bank_accounts table');
    } else {
      console.log(`\n❌ Found ${missingColumns.length} missing columns in bank_accounts table`);
      
      // Add each missing column
      for (const column of missingColumns) {
        console.log(`Adding ${column.name} column (${column.description})...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', {
            sql: `ALTER TABLE bank_accounts ADD COLUMN ${column.name} ${column.type}`
          });
          
          if (error) {
            console.error(`Error adding ${column.name} column:`, error.message);
            console.log(`\nAlternative: You need to run this SQL in the Supabase SQL Editor:`);
            console.log(`ALTER TABLE bank_accounts ADD COLUMN ${column.name} ${column.type};`);
          } else {
            console.log(`✅ ${column.name} column added successfully`);
          }
        } catch (err) {
          console.error(`Error adding ${column.name} column:`, err.message);
        }
      }
    }
    
    // Verify the columns were added
    const { data: updatedColumns, error: updatedColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'bank_accounts');
    
    if (updatedColumnsError) {
      console.error('Error checking updated columns:', updatedColumnsError.message);
    } else {
      const updatedColumnNames = updatedColumns.map(col => col.column_name);
      console.log('\nUpdated columns:', updatedColumnNames.join(', '));
      
      const stillMissingColumns = requiredColumns.filter(col => !updatedColumnNames.includes(col.name));
      
      if (stillMissingColumns.length === 0) {
        console.log('✅ All required columns are now present in the bank_accounts table');
      } else {
        console.log(`⚠️ ${stillMissingColumns.length} columns are still missing. You may need to add them manually.`);
        console.log('Missing columns:', stillMissingColumns.map(col => col.name).join(', '));
        
        console.log('\nTo add these columns manually, run the following SQL in the Supabase SQL Editor:');
        for (const column of stillMissingColumns) {
          console.log(`ALTER TABLE bank_accounts ADD COLUMN ${column.name} ${column.type};`);
        }
      }
    }
    
    console.log('\nDrFinTrack Bank Accounts Columns Fixer completed!');
    console.log('You should now be able to add bank accounts without errors.');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

main();
