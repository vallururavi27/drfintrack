/**
 * This script helps create and fix Row Level Security (RLS) policies for Supabase tables
 * Run this script with Node.js: node fix-rls-policies.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://bqurvqysmwsropdaqwot.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDc4MzU2NCwiZXhwIjoyMDYwMzU5NTY0fQ.ojFM53vyvbtQC80yQHAm77X3dxlzcBZhUsFtFLYQAu4';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('DrFinTrack RLS Policy Fixer');
console.log('==========================');
console.log('This script will help create and fix RLS policies for your Supabase tables.');

// List of tables that need RLS policies
const tables = [
  {
    name: 'bank_accounts',
    enableRls: true,
    policies: [
      {
        name: 'Users can only access their own bank accounts',
        definition: 'auth.uid() = user_id',
        check: 'auth.uid() = user_id',
        command: 'ALL',
        roles: ['authenticated']
      }
    ]
  },
  {
    name: 'transactions',
    enableRls: true,
    policies: [
      {
        name: 'Users can only access their own transactions',
        definition: 'auth.uid() = user_id',
        check: 'auth.uid() = user_id',
        command: 'ALL',
        roles: ['authenticated']
      }
    ]
  },
  {
    name: 'categories',
    enableRls: true,
    policies: [
      {
        name: 'Users can only access their own categories',
        definition: 'auth.uid() = user_id OR is_default = true',
        check: 'auth.uid() = user_id',
        command: 'ALL',
        roles: ['authenticated']
      }
    ]
  },
  {
    name: 'budgets',
    enableRls: true,
    policies: [
      {
        name: 'Users can only access their own budgets',
        definition: 'auth.uid() = user_id',
        check: 'auth.uid() = user_id',
        command: 'ALL',
        roles: ['authenticated']
      }
    ]
  },
  {
    name: 'investments',
    enableRls: true,
    policies: [
      {
        name: 'Users can only access their own investments',
        definition: 'auth.uid() = user_id',
        check: 'auth.uid() = user_id',
        command: 'ALL',
        roles: ['authenticated']
      }
    ]
  },
  {
    name: 'api_keys',
    enableRls: true,
    policies: [
      {
        name: 'Users can only access their own API keys',
        definition: 'auth.uid() = user_id',
        check: 'auth.uid() = user_id',
        command: 'ALL',
        roles: ['authenticated']
      }
    ]
  },
  {
    name: 'upi_transactions',
    enableRls: true,
    policies: [
      {
        name: 'Users can only access their own UPI transactions',
        definition: 'auth.uid() = user_id',
        check: 'auth.uid() = user_id',
        command: 'ALL',
        roles: ['authenticated']
      }
    ]
  },
  {
    name: 'profiles',
    enableRls: true,
    policies: [
      {
        name: 'Users can only access their own profile',
        definition: 'auth.uid() = id',
        check: 'auth.uid() = id',
        command: 'ALL',
        roles: ['authenticated']
      }
    ]
  }
];

// Function to enable RLS on a table
async function enableRls(tableName) {
  try {
    const { error } = await supabase.rpc('enable_rls', { table_name: tableName });
    
    if (error) {
      console.error(`Error enabling RLS on ${tableName}:`, error.message);
      return false;
    }
    
    console.log(`✅ Enabled RLS on ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error enabling RLS on ${tableName}:`, error.message);
    return false;
  }
}

// Function to create a policy
async function createPolicy(tableName, policy) {
  try {
    const { error } = await supabase.rpc('create_policy', {
      table_name: tableName,
      policy_name: policy.name,
      policy_definition: policy.definition,
      policy_check: policy.check,
      policy_command: policy.command,
      policy_roles: policy.roles
    });
    
    if (error) {
      console.error(`Error creating policy "${policy.name}" on ${tableName}:`, error.message);
      return false;
    }
    
    console.log(`✅ Created policy "${policy.name}" on ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error creating policy "${policy.name}" on ${tableName}:`, error.message);
    return false;
  }
}

// Main function to fix RLS policies
async function fixRlsPolicies() {
  for (const table of tables) {
    console.log(`\nProcessing table: ${table.name}`);
    
    if (table.enableRls) {
      await enableRls(table.name);
    }
    
    for (const policy of table.policies) {
      await createPolicy(table.name, policy);
    }
  }
  
  console.log('\nRLS policy setup complete!');
}

// Run the main function
fixRlsPolicies().catch(error => {
  console.error('Error fixing RLS policies:', error);
});
