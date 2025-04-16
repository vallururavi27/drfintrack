import { supabase } from './supabaseClient';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const reportService = {
  // Get monthly income and expenses
  async getMonthlyIncomeExpenses(startDate = null, endDate = null) {
    try {
      const { data, error } = await supabase.rpc('get_monthly_income_expenses', {
        p_start_date: startDate,
        p_end_date: endDate
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching monthly income and expenses:', error.message);
      throw error;
    }
  },

  // Get category-wise expenses
  async getCategoryExpenses(startDate = null, endDate = null) {
    try {
      const { data, error } = await supabase.rpc('get_category_expenses', {
        p_start_date: startDate,
        p_end_date: endDate
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching category expenses:', error.message);
      throw error;
    }
  },

  // Get investment performance
  async getInvestmentPerformance() {
    try {
      const { data, error } = await supabase.rpc('get_investment_performance');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching investment performance:', error.message);
      throw error;
    }
  },

  // Get account balances
  async getAccountBalances() {
    try {
      const { data, error } = await supabase.rpc('get_account_balances');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching account balances:', error.message);
      throw error;
    }
  },

  // Get saved reports
  async getSavedReports() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching saved reports:', error.message);
      throw error;
    }
  },

  // Save a report
  async saveReport(reportData) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([reportData])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error saving report:', error.message);
      throw error;
    }
  },

  // Delete a saved report
  async deleteReport(reportId) {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting report with ID ${reportId}:`, error.message);
      throw error;
    }
  },

  // Export data to Excel
  exportToExcel(data, fileName = 'report') {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error.message);
      throw error;
    }
  },

  // Export data to PDF
  exportToPDF(data, title = 'Report', fileName = 'report') {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      
      // Add date
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Prepare table data
      const tableColumn = Object.keys(data[0]);
      const tableRows = data.map(item => Object.values(item));
      
      // Add table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineColor: [200, 200, 200]
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });
      
      // Save PDF
      doc.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error.message);
      throw error;
    }
  },

  // Generate a custom report based on parameters
  async generateCustomReport(reportType, parameters) {
    try {
      let data = [];
      
      switch (reportType) {
        case 'monthly_income_expenses':
          data = await this.getMonthlyIncomeExpenses(
            parameters.startDate,
            parameters.endDate
          );
          break;
        
        case 'category_expenses':
          data = await this.getCategoryExpenses(
            parameters.startDate,
            parameters.endDate
          );
          break;
        
        case 'investment_performance':
          data = await this.getInvestmentPerformance();
          break;
        
        case 'account_balances':
          data = await this.getAccountBalances();
          break;
        
        case 'transactions':
          // Fetch transactions with filters
          const { data: transactions, error } = await supabase
            .from('transactions')
            .select(`
              *,
              bank_accounts(id, account_name, bank_name),
              categories(id, name, type, icon_name, color)
            `)
            .order('transaction_date', { ascending: false });
          
          if (error) throw error;
          data = transactions || [];
          break;
        
        default:
          throw new Error(`Unsupported report type: ${reportType}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error generating custom report:', error.message);
      throw error;
    }
  }
};
