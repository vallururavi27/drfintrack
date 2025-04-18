import { 
  collection, doc, getDoc, getDocs, 
  addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, Timestamp, serverTimestamp
} from "firebase/firestore";
import { auth, db } from "./firebaseClient";

export const expenseService = {
  // Get all expenses
  async getExpenses() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("type", "==", "expense"),
        orderBy("transaction_date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const expenses = [];
      
      // Process expenses with related data
      for (const doc of querySnapshot.docs) {
        const expense = { id: doc.id, ...doc.data() };
        
        // Get bank account details
        if (expense.account_id) {
          try {
            const accountDoc = await getDoc(doc(db, "bank_accounts", expense.account_id));
            if (accountDoc.exists()) {
              expense.bank_accounts = {
                id: accountDoc.id,
                name: accountDoc.data().name,
                bank_name: accountDoc.data().bank_name
              };
            }
          } catch (err) {
            console.error(`Error fetching bank account for expense ${doc.id}:`, err);
          }
        }
        
        // Get category details
        if (expense.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", expense.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              expense.categories = {
                id: categoryDoc.id,
                name: categoryData.name,
                type: categoryData.type,
                icon_name: categoryData.icon_name,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for expense ${doc.id}:`, err);
          }
        }
        
        expenses.push(expense);
      }
      
      return expenses;
    } catch (error) {
      console.error('Error fetching expenses:', error.message);
      throw error;
    }
  },

  // Get expenses by date range
  async getExpensesByDateRange(startDate, endDate) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const startTimestamp = Timestamp.fromDate(new Date(startDate));
      const endTimestamp = Timestamp.fromDate(new Date(endDate));

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("type", "==", "expense"),
        where("transaction_date", ">=", startTimestamp),
        where("transaction_date", "<=", endTimestamp),
        orderBy("transaction_date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const expenses = [];
      
      // Process expenses with related data
      for (const doc of querySnapshot.docs) {
        const expense = { id: doc.id, ...doc.data() };
        
        // Get bank account details
        if (expense.account_id) {
          try {
            const accountDoc = await getDoc(doc(db, "bank_accounts", expense.account_id));
            if (accountDoc.exists()) {
              expense.bank_accounts = {
                id: accountDoc.id,
                name: accountDoc.data().name,
                bank_name: accountDoc.data().bank_name
              };
            }
          } catch (err) {
            console.error(`Error fetching bank account for expense ${doc.id}:`, err);
          }
        }
        
        // Get category details
        if (expense.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", expense.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              expense.categories = {
                id: categoryDoc.id,
                name: categoryData.name,
                type: categoryData.type,
                icon_name: categoryData.icon_name,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for expense ${doc.id}:`, err);
          }
        }
        
        expenses.push(expense);
      }
      
      return expenses;
    } catch (error) {
      console.error('Error fetching expenses by date range:', error.message);
      throw error;
    }
  },

  // Get expenses by category
  async getExpensesByCategory(categoryId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("type", "==", "expense"),
        where("category_id", "==", categoryId),
        orderBy("transaction_date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const expenses = [];
      
      // Process expenses with related data
      for (const doc of querySnapshot.docs) {
        const expense = { id: doc.id, ...doc.data() };
        
        // Get bank account details
        if (expense.account_id) {
          try {
            const accountDoc = await getDoc(doc(db, "bank_accounts", expense.account_id));
            if (accountDoc.exists()) {
              expense.bank_accounts = {
                id: accountDoc.id,
                name: accountDoc.data().name,
                bank_name: accountDoc.data().bank_name
              };
            }
          } catch (err) {
            console.error(`Error fetching bank account for expense ${doc.id}:`, err);
          }
        }
        
        // Get category details
        if (expense.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", expense.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              expense.categories = {
                id: categoryDoc.id,
                name: categoryData.name,
                type: categoryData.type,
                icon_name: categoryData.icon_name,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for expense ${doc.id}:`, err);
          }
        }
        
        expenses.push(expense);
      }
      
      return expenses;
    } catch (error) {
      console.error('Error fetching expenses by category:', error.message);
      throw error;
    }
  },

  // Add a new expense
  async addExpense(expenseData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Format transaction date if it's a string
      let formattedData = { ...expenseData };
      if (typeof formattedData.transaction_date === 'string') {
        formattedData.transaction_date = Timestamp.fromDate(new Date(formattedData.transaction_date));
      }

      // Add user_id, type, and timestamps
      const newExpense = {
        ...formattedData,
        user_id: user.uid,
        type: 'expense',
        created_at: serverTimestamp()
      };

      // Add the expense
      const docRef = await addDoc(collection(db, "transactions"), newExpense);
      
      // Update bank account balance
      if (newExpense.account_id) {
        try {
          // Get current account
          const accountRef = doc(db, "bank_accounts", newExpense.account_id);
          const accountSnap = await getDoc(accountRef);
          
          if (accountSnap.exists()) {
            const account = accountSnap.data();
            
            // Calculate new balance
            let newBalance = parseFloat(account.balance || 0);
            newBalance -= parseFloat(newExpense.amount);
            
            // Update account balance
            await updateDoc(accountRef, {
              balance: newBalance,
              updated_at: serverTimestamp()
            });
          }
        } catch (err) {
          console.error('Error updating account balance:', err);
        }
      }
      
      // Get the newly created expense with related data
      const expense = { id: docRef.id, ...newExpense };
      
      // Get bank account details
      if (expense.account_id) {
        try {
          const accountDoc = await getDoc(doc(db, "bank_accounts", expense.account_id));
          if (accountDoc.exists()) {
            expense.bank_accounts = {
              id: accountDoc.id,
              name: accountDoc.data().name,
              bank_name: accountDoc.data().bank_name
            };
          }
        } catch (err) {
          console.error(`Error fetching bank account for expense ${docRef.id}:`, err);
        }
      }
      
      // Get category details
      if (expense.category_id) {
        try {
          const categoryDoc = await getDoc(doc(db, "categories", expense.category_id));
          if (categoryDoc.exists()) {
            const categoryData = categoryDoc.data();
            expense.categories = {
              id: categoryDoc.id,
              name: categoryData.name,
              type: categoryData.type,
              icon_name: categoryData.icon_name,
              color: categoryData.color
            };
          }
        } catch (err) {
          console.error(`Error fetching category for expense ${docRef.id}:`, err);
        }
      }
      
      return expense;
    } catch (error) {
      console.error('Error adding expense:', error.message);
      throw error;
    }
  },

  // Update an expense
  async updateExpense(id, expenseData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the original expense
      const docRef = doc(db, "transactions", id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Expense with ID ${id} not found`);
      }
      
      const originalExpense = docSnap.data();
      
      // Verify ownership
      if (originalExpense.user_id !== user.uid) {
        throw new Error('You do not have permission to update this expense');
      }

      // Format transaction date if it's a string
      let formattedData = { ...expenseData };
      if (typeof formattedData.transaction_date === 'string') {
        formattedData.transaction_date = Timestamp.fromDate(new Date(formattedData.transaction_date));
      }

      // Update the expense
      const updatedExpense = {
        ...formattedData,
        updated_at: serverTimestamp()
      };
      
      // Remove id if it exists in the data
      if ('id' in updatedExpense) {
        delete updatedExpense.id;
      }
      
      await updateDoc(docRef, updatedExpense);
      
      // Update bank account balance if amount or account changed
      if (originalExpense.account_id) {
        try {
          const originalAmount = parseFloat(originalExpense.amount);
          const originalAccountId = originalExpense.account_id;
          
          const newAmount = parseFloat(updatedExpense.amount);
          const newAccountId = updatedExpense.account_id;
          
          // If any relevant field changed, update the account balance
          if (originalAmount !== newAmount || originalAccountId !== newAccountId) {
            // Revert the effect of the original expense
            const originalAccountRef = doc(db, "bank_accounts", originalAccountId);
            const originalAccountSnap = await getDoc(originalAccountRef);
            
            if (originalAccountSnap.exists()) {
              const originalAccount = originalAccountSnap.data();
              let originalBalance = parseFloat(originalAccount.balance || 0);
              
              // Add back the expense amount
              originalBalance += originalAmount;
              
              await updateDoc(originalAccountRef, {
                balance: originalBalance,
                updated_at: serverTimestamp()
              });
            }
            
            // Apply the effect of the new expense
            if (newAccountId) {
              const newAccountRef = doc(db, "bank_accounts", newAccountId);
              const newAccountSnap = await getDoc(newAccountRef);
              
              if (newAccountSnap.exists()) {
                const newAccount = newAccountSnap.data();
                let newBalance = parseFloat(newAccount.balance || 0);
                
                // Subtract the new expense amount
                newBalance -= newAmount;
                
                await updateDoc(newAccountRef, {
                  balance: newBalance,
                  updated_at: serverTimestamp()
                });
              }
            }
          }
        } catch (err) {
          console.error('Error updating account balance:', err);
        }
      }
      
      // Get the updated expense with related data
      const expense = { id, ...updatedExpense };
      
      // Get bank account details
      if (expense.account_id) {
        try {
          const accountDoc = await getDoc(doc(db, "bank_accounts", expense.account_id));
          if (accountDoc.exists()) {
            expense.bank_accounts = {
              id: accountDoc.id,
              name: accountDoc.data().name,
              bank_name: accountDoc.data().bank_name
            };
          }
        } catch (err) {
          console.error(`Error fetching bank account for expense ${id}:`, err);
        }
      }
      
      // Get category details
      if (expense.category_id) {
        try {
          const categoryDoc = await getDoc(doc(db, "categories", expense.category_id));
          if (categoryDoc.exists()) {
            const categoryData = categoryDoc.data();
            expense.categories = {
              id: categoryDoc.id,
              name: categoryData.name,
              type: categoryData.type,
              icon_name: categoryData.icon_name,
              color: categoryData.color
            };
          }
        } catch (err) {
          console.error(`Error fetching category for expense ${id}:`, err);
        }
      }
      
      return expense;
    } catch (error) {
      console.error('Error updating expense:', error.message);
      throw error;
    }
  },

  // Delete an expense
  async deleteExpense(id) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the expense to verify ownership and update account balance
      const docRef = doc(db, "transactions", id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Expense with ID ${id} not found`);
      }
      
      const expense = docSnap.data();
      
      // Verify ownership
      if (expense.user_id !== user.uid) {
        throw new Error('You do not have permission to delete this expense');
      }

      // Update bank account balance
      if (expense.account_id) {
        try {
          // Get current account
          const accountRef = doc(db, "bank_accounts", expense.account_id);
          const accountSnap = await getDoc(accountRef);
          
          if (accountSnap.exists()) {
            const account = accountSnap.data();
            
            // Calculate new balance
            let newBalance = parseFloat(account.balance || 0);
            newBalance += parseFloat(expense.amount);
            
            // Update account balance
            await updateDoc(accountRef, {
              balance: newBalance,
              updated_at: serverTimestamp()
            });
          }
        } catch (err) {
          console.error('Error updating account balance:', err);
        }
      }

      // Delete the expense
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error.message);
      throw error;
    }
  },

  // Get expense statistics
  async getExpenseStats(period = 'month') {
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
        startDate = new Date(2000, 0, 1); // Far in the past to get all expenses
      }

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("type", "==", "expense"),
        where("transaction_date", ">=", Timestamp.fromDate(startDate))
      );
      
      const querySnapshot = await getDocs(q);
      const expenses = [];
      
      // Get all expenses with category data
      for (const doc of querySnapshot.docs) {
        const expense = { id: doc.id, ...doc.data() };
        
        // Get category details
        if (expense.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", expense.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              expense.categories = {
                name: categoryData.name,
                type: categoryData.type,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for expense ${doc.id}:`, err);
          }
        }
        
        expenses.push(expense);
      }

      const stats = {
        totalExpenses: 0,
        categories: {},
        byMonth: {}
      };

      expenses.forEach(expense => {
        const amount = parseFloat(expense.amount);
        const categoryName = expense.categories?.name || 'Uncategorized';
        const categoryColor = expense.categories?.color || '#808080';

        // Calculate total expenses
        stats.totalExpenses += amount;

        // Track category totals
        if (!stats.categories[categoryName]) {
          stats.categories[categoryName] = {
            total: 0,
            color: categoryColor
          };
        }
        stats.categories[categoryName].total += amount;

        // Track monthly data
        const expenseDate = expense.transaction_date instanceof Timestamp ? 
          expense.transaction_date.toDate() : new Date(expense.transaction_date);
        
        const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;

        if (!stats.byMonth[monthKey]) {
          stats.byMonth[monthKey] = {
            total: 0,
            month: expenseDate.toLocaleString('default', { month: 'short' }),
            year: expenseDate.getFullYear()
          };
        }

        stats.byMonth[monthKey].total += amount;
      });

      // Convert byMonth to array and sort by date
      stats.monthlyData = Object.entries(stats.byMonth)
        .map(([key, data]) => ({
          ...data,
          key
        }))
        .sort((a, b) => a.key.localeCompare(b.key));

      // Convert categories to array and sort by total
      stats.categoryData = Object.entries(stats.categories)
        .map(([name, data]) => ({
          name,
          ...data
        }))
        .sort((a, b) => b.total - a.total);

      return stats;
    } catch (error) {
      console.error('Error getting expense stats:', error.message);
      throw error;
    }
  }
};
