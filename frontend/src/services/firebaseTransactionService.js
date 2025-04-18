import { 
  collection, doc, getDoc, getDocs, 
  addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, Timestamp, serverTimestamp, limit
} from "firebase/firestore";
import { auth, db } from "./firebaseClient";
import { bankAccountService } from "./firebaseBankAccountService";

export const transactionService = {
  // Get all transactions
  async getTransactions() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        orderBy("transaction_date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      // Get all transactions
      for (const doc of querySnapshot.docs) {
        const transaction = { id: doc.id, ...doc.data() };
        
        // Get bank account details
        if (transaction.account_id) {
          try {
            const accountDoc = await getDoc(doc(db, "bank_accounts", transaction.account_id));
            if (accountDoc.exists()) {
              transaction.bank_accounts = {
                id: accountDoc.id,
                name: accountDoc.data().name,
                bank_name: accountDoc.data().bank_name
              };
            }
          } catch (err) {
            console.error(`Error fetching bank account for transaction ${doc.id}:`, err);
          }
        }
        
        // Get category details
        if (transaction.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", transaction.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              transaction.categories = {
                id: categoryDoc.id,
                name: categoryData.name,
                type: categoryData.type,
                icon_name: categoryData.icon_name,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for transaction ${doc.id}:`, err);
          }
        }
        
        transactions.push(transaction);
      }
      
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
      throw error;
    }
  },

  // Get transactions by date range
  async getTransactionsByDateRange(startDate, endDate) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const startTimestamp = Timestamp.fromDate(new Date(startDate));
      const endTimestamp = Timestamp.fromDate(new Date(endDate));

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("transaction_date", ">=", startTimestamp),
        where("transaction_date", "<=", endTimestamp),
        orderBy("transaction_date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      // Process transactions with related data
      for (const doc of querySnapshot.docs) {
        const transaction = { id: doc.id, ...doc.data() };
        
        // Get bank account details
        if (transaction.account_id) {
          try {
            const accountDoc = await getDoc(doc(db, "bank_accounts", transaction.account_id));
            if (accountDoc.exists()) {
              transaction.bank_accounts = {
                id: accountDoc.id,
                name: accountDoc.data().name,
                bank_name: accountDoc.data().bank_name
              };
            }
          } catch (err) {
            console.error(`Error fetching bank account for transaction ${doc.id}:`, err);
          }
        }
        
        // Get category details
        if (transaction.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", transaction.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              transaction.categories = {
                id: categoryDoc.id,
                name: categoryData.name,
                type: categoryData.type,
                icon_name: categoryData.icon_name,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for transaction ${doc.id}:`, err);
          }
        }
        
        transactions.push(transaction);
      }
      
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions by date range:', error.message);
      throw error;
    }
  },

  // Get transactions by category
  async getTransactionsByCategory(categoryId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("category_id", "==", categoryId),
        orderBy("transaction_date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      // Process transactions with related data
      for (const doc of querySnapshot.docs) {
        const transaction = { id: doc.id, ...doc.data() };
        
        // Get bank account details
        if (transaction.account_id) {
          try {
            const accountDoc = await getDoc(doc(db, "bank_accounts", transaction.account_id));
            if (accountDoc.exists()) {
              transaction.bank_accounts = {
                id: accountDoc.id,
                name: accountDoc.data().name,
                bank_name: accountDoc.data().bank_name
              };
            }
          } catch (err) {
            console.error(`Error fetching bank account for transaction ${doc.id}:`, err);
          }
        }
        
        // Get category details
        if (transaction.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", transaction.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              transaction.categories = {
                id: categoryDoc.id,
                name: categoryData.name,
                type: categoryData.type,
                icon_name: categoryData.icon_name,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for transaction ${doc.id}:`, err);
          }
        }
        
        transactions.push(transaction);
      }
      
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions by category:', error.message);
      throw error;
    }
  },

  // Get transactions by account
  async getTransactionsByAccount(accountId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("account_id", "==", accountId),
        orderBy("transaction_date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      // Process transactions with related data
      for (const doc of querySnapshot.docs) {
        const transaction = { id: doc.id, ...doc.data() };
        
        // Get bank account details
        if (transaction.account_id) {
          try {
            const accountDoc = await getDoc(doc(db, "bank_accounts", transaction.account_id));
            if (accountDoc.exists()) {
              transaction.bank_accounts = {
                id: accountDoc.id,
                name: accountDoc.data().name,
                bank_name: accountDoc.data().bank_name
              };
            }
          } catch (err) {
            console.error(`Error fetching bank account for transaction ${doc.id}:`, err);
          }
        }
        
        // Get category details
        if (transaction.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", transaction.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              transaction.categories = {
                id: categoryDoc.id,
                name: categoryData.name,
                type: categoryData.type,
                icon_name: categoryData.icon_name,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for transaction ${doc.id}:`, err);
          }
        }
        
        transactions.push(transaction);
      }
      
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions by account:', error.message);
      throw error;
    }
  },

  // Get transactions by type (expense/income)
  async getTransactionsByType(type) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("type", "==", type),
        orderBy("transaction_date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      // Process transactions with related data
      for (const doc of querySnapshot.docs) {
        const transaction = { id: doc.id, ...doc.data() };
        
        // Get bank account details
        if (transaction.account_id) {
          try {
            const accountDoc = await getDoc(doc(db, "bank_accounts", transaction.account_id));
            if (accountDoc.exists()) {
              transaction.bank_accounts = {
                id: accountDoc.id,
                name: accountDoc.data().name,
                bank_name: accountDoc.data().bank_name
              };
            }
          } catch (err) {
            console.error(`Error fetching bank account for transaction ${doc.id}:`, err);
          }
        }
        
        // Get category details
        if (transaction.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", transaction.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              transaction.categories = {
                id: categoryDoc.id,
                name: categoryData.name,
                type: categoryData.type,
                icon_name: categoryData.icon_name,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for transaction ${doc.id}:`, err);
          }
        }
        
        transactions.push(transaction);
      }
      
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions by type:', error.message);
      throw error;
    }
  },

  // Add a new transaction
  async addTransaction(transactionData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Format transaction date if it's a string
      let formattedData = { ...transactionData };
      if (typeof formattedData.transaction_date === 'string') {
        formattedData.transaction_date = Timestamp.fromDate(new Date(formattedData.transaction_date));
      }

      // Add user_id and timestamps
      const newTransaction = {
        ...formattedData,
        user_id: user.uid,
        created_at: serverTimestamp()
      };

      // Add the transaction
      const docRef = await addDoc(collection(db, "transactions"), newTransaction);
      
      // Update bank account balance
      if (newTransaction.account_id) {
        try {
          // Get current account
          const account = await bankAccountService.getBankAccountById(newTransaction.account_id);
          
          // Calculate new balance
          let newBalance = parseFloat(account.balance || 0);
          
          if (newTransaction.type === 'income') {
            newBalance += parseFloat(newTransaction.amount);
          } else if (newTransaction.type === 'expense') {
            newBalance -= parseFloat(newTransaction.amount);
          }
          
          // Update account balance
          await bankAccountService.updateAccountBalance(newTransaction.account_id, newBalance);
        } catch (err) {
          console.error('Error updating account balance:', err);
        }
      }
      
      // Get the newly created transaction with related data
      const transaction = { id: docRef.id, ...newTransaction };
      
      // Get bank account details
      if (transaction.account_id) {
        try {
          const accountDoc = await getDoc(doc(db, "bank_accounts", transaction.account_id));
          if (accountDoc.exists()) {
            transaction.bank_accounts = {
              id: accountDoc.id,
              name: accountDoc.data().name,
              bank_name: accountDoc.data().bank_name
            };
          }
        } catch (err) {
          console.error(`Error fetching bank account for transaction ${docRef.id}:`, err);
        }
      }
      
      // Get category details
      if (transaction.category_id) {
        try {
          const categoryDoc = await getDoc(doc(db, "categories", transaction.category_id));
          if (categoryDoc.exists()) {
            const categoryData = categoryDoc.data();
            transaction.categories = {
              id: categoryDoc.id,
              name: categoryData.name,
              type: categoryData.type,
              icon_name: categoryData.icon_name,
              color: categoryData.color
            };
          }
        } catch (err) {
          console.error(`Error fetching category for transaction ${docRef.id}:`, err);
        }
      }
      
      return transaction;
    } catch (error) {
      console.error('Error adding transaction:', error.message);
      throw error;
    }
  },

  // Update a transaction
  async updateTransaction(id, transactionData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the original transaction
      const docRef = doc(db, "transactions", id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Transaction with ID ${id} not found`);
      }
      
      const originalTransaction = docSnap.data();
      
      // Verify ownership
      if (originalTransaction.user_id !== user.uid) {
        throw new Error('You do not have permission to update this transaction');
      }

      // Format transaction date if it's a string
      let formattedData = { ...transactionData };
      if (typeof formattedData.transaction_date === 'string') {
        formattedData.transaction_date = Timestamp.fromDate(new Date(formattedData.transaction_date));
      }

      // Update the transaction
      const updatedTransaction = {
        ...formattedData,
        updated_at: serverTimestamp()
      };
      
      // Remove id if it exists in the data
      if ('id' in updatedTransaction) {
        delete updatedTransaction.id;
      }
      
      await updateDoc(docRef, updatedTransaction);
      
      // Update bank account balance if amount, type, or account changed
      if (originalTransaction.account_id) {
        try {
          const originalAmount = parseFloat(originalTransaction.amount);
          const originalType = originalTransaction.type;
          const originalAccountId = originalTransaction.account_id;
          
          const newAmount = parseFloat(updatedTransaction.amount);
          const newType = updatedTransaction.type;
          const newAccountId = updatedTransaction.account_id;
          
          // If any relevant field changed, update the account balance
          if (originalAmount !== newAmount || originalType !== newType || originalAccountId !== newAccountId) {
            // Revert the effect of the original transaction
            const originalAccount = await bankAccountService.getBankAccountById(originalAccountId);
            let originalBalance = parseFloat(originalAccount.balance || 0);
            
            if (originalType === 'income') {
              originalBalance -= originalAmount;
            } else if (originalType === 'expense') {
              originalBalance += originalAmount;
            }
            
            await bankAccountService.updateAccountBalance(originalAccountId, originalBalance);
            
            // Apply the effect of the new transaction
            if (newAccountId) {
              const newAccount = await bankAccountService.getBankAccountById(newAccountId);
              let newBalance = parseFloat(newAccount.balance || 0);
              
              if (newType === 'income') {
                newBalance += newAmount;
              } else if (newType === 'expense') {
                newBalance -= newAmount;
              }
              
              await bankAccountService.updateAccountBalance(newAccountId, newBalance);
            }
          }
        } catch (err) {
          console.error('Error updating account balance:', err);
        }
      }
      
      // Get the updated transaction with related data
      const transaction = { id, ...updatedTransaction };
      
      // Get bank account details
      if (transaction.account_id) {
        try {
          const accountDoc = await getDoc(doc(db, "bank_accounts", transaction.account_id));
          if (accountDoc.exists()) {
            transaction.bank_accounts = {
              id: accountDoc.id,
              name: accountDoc.data().name,
              bank_name: accountDoc.data().bank_name
            };
          }
        } catch (err) {
          console.error(`Error fetching bank account for transaction ${id}:`, err);
        }
      }
      
      // Get category details
      if (transaction.category_id) {
        try {
          const categoryDoc = await getDoc(doc(db, "categories", transaction.category_id));
          if (categoryDoc.exists()) {
            const categoryData = categoryDoc.data();
            transaction.categories = {
              id: categoryDoc.id,
              name: categoryData.name,
              type: categoryData.type,
              icon_name: categoryData.icon_name,
              color: categoryData.color
            };
          }
        } catch (err) {
          console.error(`Error fetching category for transaction ${id}:`, err);
        }
      }
      
      return transaction;
    } catch (error) {
      console.error('Error updating transaction:', error.message);
      throw error;
    }
  },

  // Delete a transaction
  async deleteTransaction(id) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the transaction to verify ownership and update account balance
      const docRef = doc(db, "transactions", id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Transaction with ID ${id} not found`);
      }
      
      const transaction = docSnap.data();
      
      // Verify ownership
      if (transaction.user_id !== user.uid) {
        throw new Error('You do not have permission to delete this transaction');
      }

      // Update bank account balance
      if (transaction.account_id) {
        try {
          // Get current account
          const account = await bankAccountService.getBankAccountById(transaction.account_id);
          
          // Calculate new balance
          let newBalance = parseFloat(account.balance || 0);
          
          if (transaction.type === 'income') {
            newBalance -= parseFloat(transaction.amount);
          } else if (transaction.type === 'expense') {
            newBalance += parseFloat(transaction.amount);
          }
          
          // Update account balance
          await bankAccountService.updateAccountBalance(transaction.account_id, newBalance);
        } catch (err) {
          console.error('Error updating account balance:', err);
        }
      }

      // Delete the transaction
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error.message);
      throw error;
    }
  },

  // Get transaction statistics
  async getTransactionStats(period = 'month') {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

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

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("transaction_date", ">=", Timestamp.fromDate(startDate))
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      // Get all transactions with category data
      for (const doc of querySnapshot.docs) {
        const transaction = { id: doc.id, ...doc.data() };
        
        // Get category details
        if (transaction.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", transaction.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              transaction.categories = {
                name: categoryData.name,
                type: categoryData.type,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for transaction ${doc.id}:`, err);
          }
        }
        
        transactions.push(transaction);
      }

      const stats = {
        totalIncome: 0,
        totalExpenses: 0,
        categories: {},
        byMonth: {}
      };

      transactions.forEach(transaction => {
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
        const transactionDate = transaction.transaction_date instanceof Timestamp ? 
          transaction.transaction_date.toDate() : new Date(transaction.transaction_date);
        
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
