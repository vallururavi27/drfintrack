import { supabase } from './supabaseClient';

export const investmentService = {
  // Get all investments
  async getInvestments() {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },
  
  // Get investments by type
  async getInvestmentsByType(type) {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('investment_type', type)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },
  
  // Get investments by category
  async getInvestmentsByCategory(category) {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('category', category)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },
  
  // Add a new investment
  async addInvestment(investmentData) {
    const user = supabase.auth.user();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('investments')
      .insert([{
        ...investmentData,
        user_id: user.id
      }]);
    
    if (error) throw error;
    return data[0];
  },
  
  // Update an investment
  async updateInvestment(id, investmentData) {
    const { data, error } = await supabase
      .from('investments')
      .update(investmentData)
      .match({ id });
    
    if (error) throw error;
    return data[0];
  },
  
  // Delete an investment
  async deleteInvestment(id) {
    const { error } = await supabase
      .from('investments')
      .delete()
      .match({ id });
    
    if (error) throw error;
  },
  
  // Get investment statistics
  async getInvestmentStats() {
    const { data, error } = await supabase
      .from('investments')
      .select('amount, current_value, investment_type, category');
    
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
      const amount = parseFloat(investment.amount);
      const currentValue = parseFloat(investment.current_value || investment.amount);
      
      stats.totalInvested += amount;
      stats.totalCurrentValue += currentValue;
      
      // Track by type
      if (!stats.byType[investment.investment_type]) {
        stats.byType[investment.investment_type] = {
          invested: 0,
          currentValue: 0
        };
      }
      stats.byType[investment.investment_type].invested += amount;
      stats.byType[investment.investment_type].currentValue += currentValue;
      
      // Track by category
      if (!stats.byCategory[investment.category]) {
        stats.byCategory[investment.category] = {
          invested: 0,
          currentValue: 0
        };
      }
      stats.byCategory[investment.category].invested += amount;
      stats.byCategory[investment.category].currentValue += currentValue;
    });
    
    stats.totalGain = stats.totalCurrentValue - stats.totalInvested;
    stats.gainPercentage = stats.totalInvested > 0 ? 
      (stats.totalGain / stats.totalInvested) * 100 : 0;
    
    return stats;
  }
};
