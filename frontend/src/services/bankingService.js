import { supabase } from './supabaseClient';

export const bankingService = {
  // Get all bank accounts
  async getAccounts() {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },
  
  // Get a single account by ID
  async getAccountById(id) {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Add a new account
  async addAccount(accountData) {
    const user = supabase.auth.user();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert([{
        ...accountData,
        user_id: user.id
      }]);
    
    if (error) throw error;
    return data[0];
  },
  
  // Update an account
  async updateAccount(id, accountData) {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update(accountData)
      .match({ id });
    
    if (error) throw error;
    return data[0];
  },
  
  // Delete an account
  async deleteAccount(id) {
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .match({ id });
    
    if (error) throw error;
  },
  
  // Get account balance
  async getAccountBalance(id) {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('balance')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data.balance;
  },
  
  // Get total balance across all accounts
  async getTotalBalance() {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('balance');
    
    if (error) throw error;
    
    return data.reduce((total, account) => total + parseFloat(account.balance), 0);
  }
};
