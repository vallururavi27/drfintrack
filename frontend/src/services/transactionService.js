import { supabase } from './supabaseClient';

export const transactionService = {
  // Get all transactions
  async getTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          bank_accounts(id, account_name, bank_name),
          categories(id, name, type, icon_name, color)
        `)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
      throw error;
    }
  },

  // Get transactions by date range
  async getTransactionsByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          bank_accounts(id, account_name, bank_name),
          categories(id, name, type, icon_name, color)
        `)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions by date range:', error.message);
      throw error;
    }
  },

  // Get transactions by category
  async getTransactionsByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          bank_accounts(id, account_name, bank_name),
          categories(id, name, type, icon_name, color)
        `)
        .eq('category_id', categoryId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions by category:', error.message);
      throw error;
    }
  },

  // Get transactions by account
  async getTransactionsByAccount(accountId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          bank_accounts(id, account_name, bank_name),
          categories(id, name, type, icon_name, color)
        `)
        .eq('account_id', accountId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions by account:', error.message);
      throw error;
    }
  },

  // Get transactions by type (expense/income)
  async getTransactionsByType(type) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          bank_accounts(id, account_name, bank_name),
          categories(id, name, type, icon_name, color)
        `)
        .eq('type', type)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions by type:', error.message);
      throw error;
    }
  },

  // Add a new transaction
  async addTransaction(transactionData) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: userData.user.id,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      // The account balance will be updated automatically by the database trigger
      return data[0];
    } catch (error) {
      console.error('Error adding transaction:', error.message);
      throw error;
    }
  },

  // Update a transaction
  async updateTransaction(id, transactionData) {
    try {
      // Update the transaction
      const { data, error } = await supabase
        .from('transactions')
        .update({
          ...transactionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      // The account balance will be updated automatically by the database trigger
      return data[0];
    } catch (error) {
      console.error('Error updating transaction:', error.message);
      throw error;
    }
  },

  // Delete a transaction
  async deleteTransaction(id) {
    try {
      // Delete the transaction
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // The account balance will be updated automatically by the database trigger
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error.message);
      throw error;
    }
  },

  // Get transaction statistics
  async getTransactionStats(period = 'month') {
    try {
      let startDate;
      const now = new Date();

      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      } else if (period === '6months') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      } else if (period === 'all') {
        startDate = new Date(2000, 0, 1); // Far in the past to get all transactions
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          type,
          category_id,
          categories(name, type, color)
        `)
        .gte('transaction_date', startDate.toISOString().split('T')[0]);

      if (error) throw error;

      const stats = {
        totalIncome: 0,
        totalExpenses: 0,
        categories: {},
        byMonth: {}
      };

      data.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        const categoryName = transaction.categories?.name || 'Uncategorized';
        const categoryColor = transaction.categories?.color || '#808080';

        // Calculate income/expense totals
        if (transaction.type === 'income') {
          stats.totalIncome += amount;
        } else {
          stats.totalExpenses += amount;

          // Track category totals
          if (!stats.categories[categoryName]) {
            stats.categories[categoryName] = {
              total: 0,
              color: categoryColor
            };
          }
          stats.categories[categoryName].total += amount;
        }

        // Track monthly data
        const transactionDate = new Date(transaction.transaction_date);
        const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;

        if (!stats.byMonth[monthKey]) {
          stats.byMonth[monthKey] = {
            income: 0,
            expenses: 0,
            month: transactionDate.toLocaleString('default', { month: 'short' }),
            year: transactionDate.getFullYear()
          };
        }

        if (transaction.type === 'income') {
          stats.byMonth[monthKey].income += amount;
        } else {
          stats.byMonth[monthKey].expenses += amount;
        }
      });

      // Convert byMonth to array and sort by date
      stats.monthlyData = Object.entries(stats.byMonth)
        .map(([key, data]) => ({
          ...data,
          key
        }))
        .sort((a, b) => a.key.localeCompare(b.key));

      return stats;
    } catch (error) {
      console.error('Error getting transaction stats:', error.message);
      throw error;
    }
  }
};
