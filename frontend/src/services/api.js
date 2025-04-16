import { supabase } from './supabaseClient';
import { authService } from './authService';
import { bankingService } from './bankingService';
import { transactionService } from './transactionService';
import { investmentService } from './investmentService';
import { profileService } from './profileService';

// API service object that wraps Supabase services
const api = {
  // Auth endpoints
  auth: {
    login: async (credentials) => {
      try {
        const { email, password } = credentials;
        const user = await authService.login(email, password);
        return {
          access_token: supabase.auth.session()?.access_token,
          username: user.email,
          user
        };
      } catch (error) {
        throw new Error(error.message || 'Login failed');
      }
    },

    register: async (userData) => {
      try {
        const { name, email, password } = userData;
        const user = await authService.register(name, email, password);
        return {
          success: true,
          message: 'Registration successful. Please verify your email.',
          user
        };
      } catch (error) {
        throw new Error(error.message || 'Registration failed');
      }
    },

    logout: async () => {
      try {
        await authService.logout();
        return { success: true };
      } catch (error) {
        throw new Error(error.message || 'Logout failed');
      }
    },

    getCurrentUser: () => {
      return authService.getCurrentUser();
    },

    getUserProfile: async () => {
      try {
        return await authService.getUserProfile();
      } catch (error) {
        throw new Error(error.message || 'Failed to get user profile');
      }
    }
  },

  // Dashboard endpoints
  dashboard: {
    getData: async () => {
      try {
        // Get account balances
        const accounts = await bankingService.getAccounts();
        const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);

        // Get recent transactions
        const transactions = await transactionService.getTransactions();
        const recentTransactions = transactions.slice(0, 5);

        // Get transaction stats
        const transactionStats = await transactionService.getTransactionStats('month');

        // Get investment stats
        const investmentStats = await investmentService.getInvestmentStats();

        return {
          accounts,
          totalBalance,
          recentTransactions,
          transactionStats,
          investmentStats
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to get dashboard data');
      }
    },
  },

  // Transaction endpoints
  transactions: {
    getAll: async () => {
      try {
        return await transactionService.getTransactions();
      } catch (error) {
        throw new Error(error.message || 'Failed to get transactions');
      }
    },

    add: async (transaction) => {
      try {
        return await transactionService.addTransaction(transaction);
      } catch (error) {
        throw new Error(error.message || 'Failed to add transaction');
      }
    },

    update: async (id, transaction) => {
      try {
        return await transactionService.updateTransaction(id, transaction);
      } catch (error) {
        throw new Error(error.message || 'Failed to update transaction');
      }
    },

    delete: async (id) => {
      try {
        await transactionService.deleteTransaction(id);
        return { success: true };
      } catch (error) {
        throw new Error(error.message || 'Failed to delete transaction');
      }
    },

    getByDateRange: async (startDate, endDate) => {
      try {
        return await transactionService.getTransactionsByDateRange(startDate, endDate);
      } catch (error) {
        throw new Error(error.message || 'Failed to get transactions by date range');
      }
    },

    getByCategory: async (category) => {
      try {
        return await transactionService.getTransactionsByCategory(category);
      } catch (error) {
        throw new Error(error.message || 'Failed to get transactions by category');
      }
    },

    getByType: async (type) => {
      try {
        return await transactionService.getTransactionsByType(type);
      } catch (error) {
        throw new Error(error.message || 'Failed to get transactions by type');
      }
    },

    getStats: async (period) => {
      try {
        return await transactionService.getTransactionStats(period);
      } catch (error) {
        throw new Error(error.message || 'Failed to get transaction statistics');
      }
    }
  },

  // Account endpoints
  accounts: {
    getAll: async () => {
      try {
        return await bankingService.getAccounts();
      } catch (error) {
        throw new Error(error.message || 'Failed to get accounts');
      }
    },

    getById: async (id) => {
      try {
        return await bankingService.getAccountById(id);
      } catch (error) {
        throw new Error(error.message || 'Failed to get account');
      }
    },

    add: async (account) => {
      try {
        return await bankingService.addAccount(account);
      } catch (error) {
        throw new Error(error.message || 'Failed to add account');
      }
    },

    update: async (id, account) => {
      try {
        return await bankingService.updateAccount(id, account);
      } catch (error) {
        throw new Error(error.message || 'Failed to update account');
      }
    },

    delete: async (id) => {
      try {
        await bankingService.deleteAccount(id);
        return { success: true };
      } catch (error) {
        throw new Error(error.message || 'Failed to delete account');
      }
    },

    getTotalBalance: async () => {
      try {
        return await bankingService.getTotalBalance();
      } catch (error) {
        throw new Error(error.message || 'Failed to get total balance');
      }
    }
  },

  // Investment endpoints
  investments: {
    getAll: async () => {
      try {
        return await investmentService.getInvestments();
      } catch (error) {
        throw new Error(error.message || 'Failed to get investments');
      }
    },

    getByType: async (type) => {
      try {
        return await investmentService.getInvestmentsByType(type);
      } catch (error) {
        throw new Error(error.message || 'Failed to get investments by type');
      }
    },

    getByCategory: async (category) => {
      try {
        return await investmentService.getInvestmentsByCategory(category);
      } catch (error) {
        throw new Error(error.message || 'Failed to get investments by category');
      }
    },

    add: async (investment) => {
      try {
        return await investmentService.addInvestment(investment);
      } catch (error) {
        throw new Error(error.message || 'Failed to add investment');
      }
    },

    update: async (id, investment) => {
      try {
        return await investmentService.updateInvestment(id, investment);
      } catch (error) {
        throw new Error(error.message || 'Failed to update investment');
      }
    },

    delete: async (id) => {
      try {
        await investmentService.deleteInvestment(id);
        return { success: true };
      } catch (error) {
        throw new Error(error.message || 'Failed to delete investment');
      }
    },

    getStats: async () => {
      try {
        return await investmentService.getInvestmentStats();
      } catch (error) {
        throw new Error(error.message || 'Failed to get investment statistics');
      }
    }
  },

  // Profile endpoints
  profile: {
    get: async () => {
      try {
        return await profileService.getProfile();
      } catch (error) {
        throw new Error(error.message || 'Failed to get profile');
      }
    },

    update: async (profileData) => {
      try {
        return await profileService.updateProfile(profileData);
      } catch (error) {
        throw new Error(error.message || 'Failed to update profile');
      }
    },

    uploadPicture: async (file) => {
      try {
        return await profileService.uploadProfilePicture(file);
      } catch (error) {
        throw new Error(error.message || 'Failed to upload profile picture');
      }
    },

    getLoginHistory: async () => {
      try {
        return await profileService.getLoginHistory();
      } catch (error) {
        throw new Error(error.message || 'Failed to get login history');
      }
    }
  },

  // Direct access to Supabase client for advanced operations
  post: async (endpoint, data) => {
    try {
      const { data: response, error } = await supabase.functions.invoke(endpoint, {
        body: data
      });

      if (error) throw error;
      return response;
    } catch (error) {
      throw new Error(error.message || `Failed to post to ${endpoint}`);
    }
  },

  get: async (endpoint) => {
    try {
      const { data: response, error } = await supabase.functions.invoke(endpoint);

      if (error) throw error;
      return response;
    } catch (error) {
      throw new Error(error.message || `Failed to get from ${endpoint}`);
    }
  }
};

export default api;
