/**
 * Data Service for handling all data operations including backup and restore
 */

// Storage keys for different data types
const STORAGE_KEYS = {
  BANK_ACCOUNTS: 'bankAccounts',
  TRANSACTIONS: 'transactions',
  INVESTMENTS: 'investments',
  BUDGETS: 'budgets',
  CATEGORIES: 'categories',
  REPORTS: 'reports',
  USER_PROFILE: 'userProfile',
  SETTINGS: 'settings',
  GOALS: 'financialGoals',
  RECURRING_TRANSACTIONS: 'recurringTransactions',
  THEME: 'themeMode',
  CUSTOM_COLORS: 'customColors'
};

/**
 * Get all data from localStorage
 * @returns {Object} All data from localStorage
 */
export const getAllData = () => {
  const data = {};
  
  // Iterate through all storage keys and get data
  Object.keys(STORAGE_KEYS).forEach(key => {
    const storageKey = STORAGE_KEYS[key];
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
      try {
        data[storageKey] = JSON.parse(storedData);
      } catch (error) {
        // If not JSON, store as is
        data[storageKey] = storedData;
      }
    }
  });
  
  // Also get any other localStorage items that might have been added
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!Object.values(STORAGE_KEYS).includes(key)) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key));
      } catch (error) {
        data[key] = localStorage.getItem(key);
      }
    }
  }
  
  return data;
};

/**
 * Create a backup of all data
 * @returns {Object} Backup data object
 */
export const createBackup = () => {
  const data = getAllData();
  
  // Add metadata to the backup
  const backup = {
    metadata: {
      version: '1.0',
      timestamp: new Date().toISOString(),
      description: 'Personal Finance App Backup'
    },
    data: data
  };
  
  return backup;
};

/**
 * Export backup data as a JSON file
 */
export const exportBackup = () => {
  const backup = createBackup();
  const backupString = JSON.stringify(backup, null, 2);
  const blob = new Blob([backupString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create a link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  
  return true;
};

/**
 * Validate backup data
 * @param {Object} backup - Backup data to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateBackup = (backup) => {
  // Check if backup has required structure
  if (!backup || !backup.metadata || !backup.data) {
    return false;
  }
  
  // Check version compatibility
  if (backup.metadata.version !== '1.0') {
    // Could implement version migration logic here
    console.warn('Backup version mismatch. Some features may not work correctly.');
  }
  
  return true;
};

/**
 * Restore data from backup
 * @param {Object} backup - Backup data to restore
 * @returns {boolean} True if successful, false otherwise
 */
export const restoreFromBackup = (backup) => {
  // Validate backup
  if (!validateBackup(backup)) {
    throw new Error('Invalid backup file');
  }
  
  try {
    // Clear existing data
    // localStorage.clear(); // Uncomment to clear all data before restore
    
    // Restore data
    const data = backup.data;
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'object') {
        localStorage.setItem(key, JSON.stringify(data[key]));
      } else {
        localStorage.setItem(key, data[key]);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw error;
  }
};

/**
 * Import backup from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise} Promise that resolves when import is complete
 */
export const importBackup = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        const success = restoreFromBackup(backup);
        resolve(success);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

/**
 * Clear all application data
 * @returns {boolean} True if successful
 */
export const clearAllData = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

/**
 * Initialize default data if not exists
 */
export const initializeDefaultData = () => {
  // Initialize categories if they don't exist
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    const defaultCategories = [
      'Food', 'Shopping', 'Utilities', 'Salary', 'Transportation', 
      'Entertainment', 'Freelance', 'Housing', 'Healthcare', 
      'Education', 'Investments', 'Savings', 'Personal'
    ];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  }
  
  // Initialize bank accounts if they don't exist
  if (!localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS)) {
    const defaultBankAccounts = [
      {
        id: 1,
        name: 'HDFC Bank',
        type: 'Savings',
        balance: 0,
        accountNumber: 'XXXX1234',
        ifsc: 'HDFC0001234'
      },
      {
        id: 2,
        name: 'SBI Bank',
        type: 'Current',
        balance: 0,
        accountNumber: 'XXXX5678',
        ifsc: 'SBIN0005678'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(defaultBankAccounts));
  }
  
  // Initialize transactions if they don't exist
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
  }
  
  // Initialize investments if they don't exist
  if (!localStorage.getItem(STORAGE_KEYS.INVESTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify([]));
  }
  
  // Initialize budgets if they don't exist
  if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
  }
};

// Export storage keys for use in other components
export { STORAGE_KEYS };
