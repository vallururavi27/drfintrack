import { supabase } from './supabaseClient';

export const bankAccountService = {
  // Get all bank accounts for the current user
  async getBankAccounts() {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bank accounts:', error.message);
      throw error;
    }
  },

  // Get a single bank account by ID
  async getBankAccountById(accountId) {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching bank account with ID ${accountId}:`, error.message);
      throw error;
    }
  },

  // Create a new bank account
  async createBankAccount(accountData) {
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');

      // Check if bank_name exists in the schema
      // If not, we'll handle it by not sending that field
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'bank_accounts')
        .eq('column_name', 'bank_name');

      // Prepare the account data
      let processedData = {
        ...accountData,
        user_id: userData.user.id
      };

      // If bank_name column doesn't exist in the schema, remove it from the data
      if (schemaError || !schemaData || schemaData.length === 0) {
        console.warn('bank_name column not found in schema, removing from request');
        const { bank_name, ...dataWithoutBankName } = processedData;
        processedData = dataWithoutBankName;
      }

      // Add user_id to the account data
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([processedData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating bank account:', error.message);
      throw error;
    }
  },

  // Update an existing bank account
  async updateBankAccount(accountId, accountData) {
    try {
      // Check if bank_name exists in the schema
      // If not, we'll handle it by not sending that field
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'bank_accounts')
        .eq('column_name', 'bank_name');

      // Prepare the account data
      let processedData = { ...accountData };

      // If bank_name column doesn't exist in the schema, remove it from the data
      if (schemaError || !schemaData || schemaData.length === 0) {
        console.warn('bank_name column not found in schema, removing from request');
        const { bank_name, ...dataWithoutBankName } = processedData;
        processedData = dataWithoutBankName;
      }

      const { data, error } = await supabase
        .from('bank_accounts')
        .update(processedData)
        .eq('id', accountId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error(`Error updating bank account with ID ${accountId}:`, error.message);
      throw error;
    }
  },

  // Delete a bank account
  async deleteBankAccount(accountId) {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting bank account with ID ${accountId}:`, error.message);
      throw error;
    }
  },

  // Update account balance
  async updateAccountBalance(accountId, newBalance) {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', accountId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error(`Error updating balance for account with ID ${accountId}:`, error.message);
      throw error;
    }
  },

  /**
   * Get bank account balance history
   * @param {string} accountId - Bank account ID
   * @param {string} period - Time period ('month', '3months', '6months', 'year', 'all')
   * @returns {Promise<Array>} Balance history data
   */
  async getBankAccountBalanceHistory(accountId, period = 'month') {
    try {
      let startDate;
      const now = new Date();

      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      } else if (period === '3months') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      } else if (period === '6months') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      } else {
        // 'all' - get all history
        startDate = new Date(2000, 0, 1); // Far in the past
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountId)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .order('transaction_date', { ascending: true });

      if (error) throw error;

      // Get the current balance
      const { data: account } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', accountId)
        .single();

      const currentBalance = account?.balance || 0;

      // Calculate balance history
      const balanceHistory = [];
      let runningBalance = currentBalance;

      // Sort transactions by date (newest first)
      const sortedTransactions = [...data].sort((a, b) =>
        new Date(b.transaction_date) - new Date(a.transaction_date)
      );

      // Work backwards from current balance
      for (const transaction of sortedTransactions) {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === 'expense') {
          runningBalance += amount; // Add back expenses
        } else {
          runningBalance -= amount; // Subtract income
        }

        balanceHistory.unshift({
          date: transaction.transaction_date,
          balance: runningBalance,
          transaction_id: transaction.id
        });
      }

      // Add current balance as the last point
      balanceHistory.push({
        date: new Date().toISOString().split('T')[0],
        balance: currentBalance,
        transaction_id: null
      });

      return balanceHistory;
    } catch (error) {
      console.error(`Error fetching balance history for account ${accountId}:`, error.message);
      throw error;
    }
  }
};
