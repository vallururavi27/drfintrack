import { supabase } from './supabaseClient';

export const upiTransactionService = {
  /**
   * Get all UPI transactions for the current user
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of transactions to return
   * @param {number} options.offset - Number of transactions to skip
   * @param {string} options.sortBy - Field to sort by
   * @param {boolean} options.ascending - Sort in ascending order
   * @returns {Promise<Array>} UPI transactions
   */
  async getUpiTransactions(options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        sortBy = 'transaction_date',
        ascending = false,
        accountId = null,
        startDate = null,
        endDate = null,
        transactionType = null
      } = options;

      let query = supabase
        .from('upi_transactions')
        .select(`
          *,
          bank_accounts(id, name, bank_name, account_type),
          categories(id, name, color, icon_name)
        `)
        .order(sortBy, { ascending })
        .range(offset, offset + limit - 1);

      // Apply filters if provided
      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }

      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      if (transactionType) {
        query = query.eq('transaction_type', transactionType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching UPI transactions:', error.message);
      throw error;
    }
  },

  /**
   * Get a single UPI transaction by ID
   * @param {string} id - UPI transaction ID
   * @returns {Promise<Object>} UPI transaction
   */
  async getUpiTransactionById(id) {
    try {
      const { data, error } = await supabase
        .from('upi_transactions')
        .select(`
          *,
          bank_accounts(id, name, bank_name, account_type),
          categories(id, name, color, icon_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching UPI transaction with ID ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Add a new UPI transaction
   * @param {Object} transactionData - UPI transaction data
   * @returns {Promise<Object>} Created UPI transaction
   */
  async addUpiTransaction(transactionData) {
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');

      // Add user_id to the transaction data
      const { data, error } = await supabase
        .from('upi_transactions')
        .insert([{
          ...transactionData,
          user_id: userData.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error adding UPI transaction:', error.message);
      throw error;
    }
  },

  /**
   * Update a UPI transaction
   * @param {string} id - UPI transaction ID
   * @param {Object} transactionData - Updated UPI transaction data
   * @returns {Promise<Object>} Updated UPI transaction
   */
  async updateUpiTransaction(id, transactionData) {
    try {
      const { data, error } = await supabase
        .from('upi_transactions')
        .update({
          ...transactionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error(`Error updating UPI transaction with ID ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Delete a UPI transaction
   * @param {string} id - UPI transaction ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteUpiTransaction(id) {
    try {
      const { error } = await supabase
        .from('upi_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting UPI transaction with ID ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Import UPI transactions from CSV
   * @param {File} file - CSV file
   * @param {Object} mappings - Column mappings
   * @param {string} accountId - Bank account ID
   * @returns {Promise<Array>} Imported transactions
   */
  async importUpiTransactionsFromCsv(file, mappings, accountId) {
    try {
      // This is a placeholder for the actual implementation
      // In a real implementation, you would:
      // 1. Parse the CSV file
      // 2. Map the columns according to the provided mappings
      // 3. Create UPI transaction objects
      // 4. Insert them into the database

      // For now, we'll just return a mock success
      return { success: true, count: 0 };
    } catch (error) {
      console.error('Error importing UPI transactions from CSV:', error.message);
      throw error;
    }
  },

  /**
   * Get UPI transaction statistics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} UPI transaction statistics
   */
  async getUpiTransactionStats(options = {}) {
    try {
      const {
        startDate = null,
        endDate = null,
        accountId = null
      } = options;

      // Build the query
      let query = supabase.rpc('get_upi_transaction_stats', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_account_id: accountId
      });

      const { data, error } = await query;

      if (error) throw error;
      return data || {
        total_sent: 0,
        total_received: 0,
        transaction_count: 0,
        average_transaction: 0
      };
    } catch (error) {
      console.error('Error fetching UPI transaction statistics:', error.message);
      throw error;
    }
  }
};

export default upiTransactionService;
