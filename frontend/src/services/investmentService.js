import { supabase } from './supabaseClient';

export const investmentService = {
  /**
   * Get all investments for the current user
   * @returns {Promise<Array>} Array of investments
   */
  async getInvestments() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          investment_categories(id, name, icon_name, color)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching investments:', error.message);
      throw error;
    }
  },

  /**
   * Get investments by type
   * @param {string} type - Investment type
   * @returns {Promise<Array>} Array of investments
   */
  async getInvestmentsByType(type) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          investment_categories(id, name, icon_name, color)
        `)
        .eq('investment_type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching investments of type ${type}:`, error.message);
      throw error;
    }
  },

  /**
   * Get investments by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Array of investments
   */
  async getInvestmentsByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          investment_categories(id, name, icon_name, color)
        `)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching investments for category ${categoryId}:`, error.message);
      throw error;
    }
  },

  /**
   * Get an investment by ID
   * @param {string} id - Investment ID
   * @returns {Promise<Object>} Investment object
   */
  async getInvestmentById(id) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          investment_categories(id, name, icon_name, color)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching investment with ID ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Create a new investment
   * @param {Object} investmentData - Investment data
   * @returns {Promise<Object>} Created investment
   */
  async createInvestment(investmentData) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('investments')
        .insert([{
          ...investmentData,
          user_id: userData.user.id,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating investment:', error.message);
      throw error;
    }
  },

  /**
   * Update an investment
   * @param {string} id - Investment ID
   * @param {Object} investmentData - Updated investment data
   * @returns {Promise<Object>} Updated investment
   */
  async updateInvestment(id, investmentData) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .update({
          ...investmentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error(`Error updating investment with ID ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Delete an investment
   * @param {string} id - Investment ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteInvestment(id) {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting investment with ID ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Get investment statistics
   * @returns {Promise<Object>} Investment statistics
   */
  async getInvestmentStats() {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          investment_categories(id, name, icon_name, color)
        `);

      if (error) throw error;

      const stats = {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalGain: 0,
        gainPercentage: 0,
        byType: {},
        byCategory: {}
      };

      data.forEach(investment => {
        const initialValue = parseFloat(investment.initial_value || 0);
        const currentValue = parseFloat(investment.current_value || initialValue);

        stats.totalInvested += initialValue;
        stats.totalCurrentValue += currentValue;

        // Track by type
        if (!stats.byType[investment.investment_type]) {
          stats.byType[investment.investment_type] = {
            invested: 0,
            currentValue: 0
          };
        }
        stats.byType[investment.investment_type].invested += initialValue;
        stats.byType[investment.investment_type].currentValue += currentValue;

        // Track by category
        const categoryName = investment.investment_categories?.name || 'Uncategorized';
        if (!stats.byCategory[categoryName]) {
          stats.byCategory[categoryName] = {
            invested: 0,
            currentValue: 0,
            color: investment.investment_categories?.color || '#808080'
          };
        }
        stats.byCategory[categoryName].invested += initialValue;
        stats.byCategory[categoryName].currentValue += currentValue;
      });

      stats.totalGain = stats.totalCurrentValue - stats.totalInvested;
      stats.gainPercentage = stats.totalInvested > 0 ?
        (stats.totalGain / stats.totalInvested) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Error fetching investment statistics:', error.message);
      throw error;
    }
  },

  /**
   * Get investment categories
   * @returns {Promise<Array>} Array of investment categories
   */
  async getInvestmentCategories() {
    try {
      const { data, error } = await supabase
        .from('investment_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching investment categories:', error.message);
      throw error;
    }
  },

  /**
   * Add investment transaction (buy/sell)
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} Created transaction
   */
  async addInvestmentTransaction(transactionData) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('investment_transactions')
        .insert([{
          ...transactionData,
          user_id: userData.user.id,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      // Update investment current value and units
      const { data: investment } = await supabase
        .from('investments')
        .select('current_units, current_value')
        .eq('id', transactionData.investment_id)
        .single();

      if (investment) {
        let newUnits = parseFloat(investment.current_units) || 0;
        let newValue = parseFloat(investment.current_value) || 0;

        if (transactionData.transaction_type === 'buy') {
          newUnits += parseFloat(transactionData.units);
          newValue += parseFloat(transactionData.amount);
        } else if (transactionData.transaction_type === 'sell') {
          newUnits -= parseFloat(transactionData.units);
          newValue -= parseFloat(transactionData.amount);
        }

        await supabase
          .from('investments')
          .update({
            current_units: newUnits,
            current_value: newValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionData.investment_id);
      }

      return data[0];
    } catch (error) {
      console.error('Error adding investment transaction:', error.message);
      throw error;
    }
  },

  /**
   * Get investment transactions
   * @param {string} investmentId - Investment ID
   * @returns {Promise<Array>} Array of investment transactions
   */
  async getInvestmentTransactions(investmentId) {
    try {
      const { data, error } = await supabase
        .from('investment_transactions')
        .select('*')
        .eq('investment_id', investmentId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching transactions for investment ${investmentId}:`, error.message);
      throw error;
    }
  },

  /**
   * Get investment performance
   * @param {string} investmentId - Investment ID
   * @param {string} period - Time period ('1m', '3m', '6m', '1y', 'all')
   * @returns {Promise<Object>} Performance data
   */
  async getInvestmentPerformance(investmentId, period = '1y') {
    try {
      // Get the investment
      const { data: investment } = await supabase
        .from('investments')
        .select('*')
        .eq('id', investmentId)
        .single();

      if (!investment) throw new Error('Investment not found');

      // Get transactions for this investment
      let startDate;
      const now = new Date();

      if (period === '1m') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      } else if (period === '3m') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      } else if (period === '6m') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      } else if (period === '1y') {
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      } else {
        // 'all' - get all history
        startDate = new Date(2000, 0, 1); // Far in the past
      }

      const { data: transactions } = await supabase
        .from('investment_transactions')
        .select('*')
        .eq('investment_id', investmentId)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .order('transaction_date', { ascending: true });

      // Calculate performance metrics
      const initialValue = parseFloat(investment.initial_value) || 0;
      const currentValue = parseFloat(investment.current_value) || 0;
      const totalInvested = transactions
        ? transactions
            .filter(t => t.transaction_type === 'buy')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        : initialValue;
      const totalWithdrawn = transactions
        ? transactions
            .filter(t => t.transaction_type === 'sell')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        : 0;

      const netInvestment = totalInvested - totalWithdrawn;
      const absoluteReturn = currentValue - netInvestment;
      const percentageReturn = netInvestment > 0 ? (absoluteReturn / netInvestment) * 100 : 0;

      // Calculate XIRR (simplified approximation)
      // For a proper XIRR calculation, you would need a more complex algorithm
      const daysHeld = investment.start_date
        ? (new Date() - new Date(investment.start_date)) / (1000 * 60 * 60 * 24)
        : 365; // Default to 1 year if no start date
      const annualizedReturn = daysHeld > 0 && initialValue > 0
        ? (Math.pow((currentValue / initialValue), (365 / daysHeld)) - 1) * 100
        : 0;

      return {
        initialValue,
        currentValue,
        totalInvested,
        totalWithdrawn,
        netInvestment,
        absoluteReturn,
        percentageReturn,
        annualizedReturn,
        transactions: transactions || []
      };
    } catch (error) {
      console.error(`Error calculating performance for investment ${investmentId}:`, error.message);
      throw error;
    }
  }
};
