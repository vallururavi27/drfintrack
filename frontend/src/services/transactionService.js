import { supabase } from './supabaseClient';

export const transactionService = {
  // Get all transactions
  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        bank_accounts(name)
      `)
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  // Get transactions by date range
  async getTransactionsByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        bank_accounts(name)
      `)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  // Get transactions by category
  async getTransactionsByCategory(category) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        bank_accounts(name)
      `)
      .eq('category', category)
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  // Get transactions by type (expense/income)
  async getTransactionsByType(type) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        bank_accounts(name)
      `)
      .eq('transaction_type', type)
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  // Add a new transaction
  async addTransaction(transactionData) {
    const user = supabase.auth.user();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transactionData,
        user_id: user.id
      }]);
    
    if (error) throw error;
    
    // Update account balance
    if (transactionData.account_id) {
      const { data: account } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', transactionData.account_id)
        .single();
      
      const newBalance = parseFloat(account.balance) + 
        (transactionData.transaction_type === 'income' ? 
          parseFloat(transactionData.amount) : 
          -parseFloat(transactionData.amount));
      
      await supabase
        .from('bank_accounts')
        .update({ balance: newBalance })
        .eq('id', transactionData.account_id);
    }
    
    return data[0];
  },
  
  // Update a transaction
  async updateTransaction(id, transactionData) {
    // First get the original transaction to calculate balance adjustment
    const { data: originalTransaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    // Update the transaction
    const { data, error } = await supabase
      .from('transactions')
      .update(transactionData)
      .match({ id });
    
    if (error) throw error;
    
    // Update account balance if amount or type changed
    if (originalTransaction.account_id && 
        (originalTransaction.amount !== transactionData.amount || 
         originalTransaction.transaction_type !== transactionData.transaction_type)) {
      
      // Remove the effect of the original transaction
      let balanceAdjustment = 0;
      
      if (originalTransaction.transaction_type === 'income') {
        balanceAdjustment -= parseFloat(originalTransaction.amount);
      } else {
        balanceAdjustment += parseFloat(originalTransaction.amount);
      }
      
      // Add the effect of the new transaction
      if (transactionData.transaction_type === 'income') {
        balanceAdjustment += parseFloat(transactionData.amount);
      } else {
        balanceAdjustment -= parseFloat(transactionData.amount);
      }
      
      // Update the account balance
      const { data: account } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', originalTransaction.account_id)
        .single();
      
      const newBalance = parseFloat(account.balance) + balanceAdjustment;
      
      await supabase
        .from('bank_accounts')
        .update({ balance: newBalance })
        .eq('id', originalTransaction.account_id);
    }
    
    return data[0];
  },
  
  // Delete a transaction
  async deleteTransaction(id) {
    // First get the transaction to adjust the account balance
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    // Delete the transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .match({ id });
    
    if (error) throw error;
    
    // Update account balance
    if (transaction.account_id) {
      const { data: account } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', transaction.account_id)
        .single();
      
      const balanceAdjustment = transaction.transaction_type === 'income' ? 
        -parseFloat(transaction.amount) : 
        parseFloat(transaction.amount);
      
      const newBalance = parseFloat(account.balance) + balanceAdjustment;
      
      await supabase
        .from('bank_accounts')
        .update({ balance: newBalance })
        .eq('id', transaction.account_id);
    }
  },
  
  // Get transaction statistics
  async getTransactionStats(period = 'month') {
    let startDate;
    const now = new Date();
    
    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (period === '6months') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, transaction_type, category')
      .gte('transaction_date', startDate.toISOString().split('T')[0]);
    
    if (error) throw error;
    
    const stats = {
      totalIncome: 0,
      totalExpenses: 0,
      categories: {}
    };
    
    data.forEach(transaction => {
      if (transaction.transaction_type === 'income') {
        stats.totalIncome += parseFloat(transaction.amount);
      } else {
        stats.totalExpenses += parseFloat(transaction.amount);
        
        // Track category totals
        if (!stats.categories[transaction.category]) {
          stats.categories[transaction.category] = 0;
        }
        stats.categories[transaction.category] += parseFloat(transaction.amount);
      }
    });
    
    return stats;
  }
};
