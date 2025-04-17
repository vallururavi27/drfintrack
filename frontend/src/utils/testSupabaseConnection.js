import { supabase } from '../services/supabaseClient';

/**
 * Test the Supabase connection and database access
 * @returns {Promise<Object>} Result of the test
 */
export const testSupabaseConnection = async () => {
  const results = {
    connection: false,
    auth: false,
    database: false,
    bankAccounts: false,
    error: null
  };

  try {
    // Test basic connection
    console.log('Testing Supabase connection...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      results.error = `Session error: ${sessionError.message}`;
      return results;
    }
    
    results.connection = true;
    console.log('Supabase connection successful');
    
    // Test authentication
    if (sessionData?.session) {
      results.auth = true;
      console.log('User is authenticated');
    } else {
      console.log('User is not authenticated');
    }
    
    // Test database access
    console.log('Testing database access...');
    const { data: dbData, error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (dbError) {
      results.error = `Database error: ${dbError.message}`;
      return results;
    }
    
    results.database = true;
    console.log('Database access successful');
    
    // Test bank_accounts table
    console.log('Testing bank_accounts table...');
    const { data: bankData, error: bankError } = await supabase
      .from('bank_accounts')
      .select('id, name, balance')
      .limit(1);
    
    if (bankError) {
      results.error = `Bank accounts error: ${bankError.message}`;
      return results;
    }
    
    results.bankAccounts = true;
    console.log('Bank accounts table access successful');
    console.log('Sample bank account:', bankData);
    
    return results;
  } catch (error) {
    results.error = `Unexpected error: ${error.message}`;
    console.error('Error testing Supabase connection:', error);
    return results;
  }
};
