import { 
  collection, doc, getDoc, getDocs, 
  addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, Timestamp, serverTimestamp
} from "firebase/firestore";
import { auth, db } from "./firebaseClient";

export const incomeService = {
  // Get all income transactions
  async getIncomes() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("type", "==", "income"),
        orderBy("transaction_date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const incomes = [];
      
      // Process incomes with related data
      for (const doc of querySnapshot.docs) {
        const income = { id: doc.id, ...doc.data() };
        
        // Get bank account details
        if (income.account_id) {
          try {
            const accountDoc = await getDoc(doc(db, "bank_accounts", income.account_id));
            if (accountDoc.exists()) {
              income.bank_accounts = {
                id: accountDoc.id,
                name: accountDoc.data().name,
                bank_name: accountDoc.data().bank_name
              };
            }
          } catch (err) {
            console.error(`Error fetching bank account for income ${doc.id}:`, err);
          }
        }
        
        // Get category details
        if (income.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", income.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              income.categories = {
                id: categoryDoc.id,
                name: categoryData.name,
                type: categoryData.type,
                icon_name: categoryData.icon_name,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for income ${doc.id}:`, err);
          }
        }
        
        incomes.push(income);
      }
      
      return incomes;
    } catch (error) {
      console.error('Error fetching incomes:', error.message);
      throw error;
    }
  },

  // Get incomes by date range
  async getIncomesByDateRange(startDate, endDate) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const startTimestamp = Timestamp.fromDate(new Date(startDate));
      const endTimestamp = Timestamp.fromDate(new Date(endDate));

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("type", "==", "income"),
        where("transaction_date", ">=", startTimestamp),
        where("transaction_date", "<=", endTimestamp),
        orderBy("transaction_date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const incomes = [];
      
      // Process incomes with related data
      for (const doc of querySnapshot.docs) {
        const income = { id: doc.id, ...doc.data() };
        
        // Get bank account details
        if (income.account_id) {
          try {
            const accountDoc = await getDoc(doc(db, "bank_accounts", income.account_id));
            if (accountDoc.exists()) {
              income.bank_accounts = {
                id: accountDoc.id,
                name: accountDoc.data().name,
                bank_name: accountDoc.data().bank_name
              };
            }
          } catch (err) {
            console.error(`Error fetching bank account for income ${doc.id}:`, err);
          }
        }
        
        // Get category details
        if (income.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", income.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              income.categories = {
                id: categoryDoc.id,
                name: categoryData.name,
                type: categoryData.type,
                icon_name: categoryData.icon_name,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for income ${doc.id}:`, err);
          }
        }
        
        incomes.push(income);
      }
      
      return incomes;
    } catch (error) {
      console.error('Error fetching incomes by date range:', error.message);
      throw error;
    }
  },

  // Get incomes by category
  async getIncomesByCategory(categoryId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("type", "==", "income"),
        where("category_id", "==", categoryId),
        orderBy("transaction_date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const incomes = [];
      
      // Process incomes with related data
      for (const doc of querySnapshot.docs) {
        const income = { id: doc.id, ...doc.data() };
        
        // Get bank account details
        if (income.account_id) {
          try {
            const accountDoc = await getDoc(doc(db, "bank_accounts", income.account_id));
            if (accountDoc.exists()) {
              income.bank_accounts = {
                id: accountDoc.id,
                name: accountDoc.data().name,
                bank_name: accountDoc.data().bank_name
              };
            }
          } catch (err) {
            console.error(`Error fetching bank account for income ${doc.id}:`, err);
          }
        }
        
        // Get category details
        if (income.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", income.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              income.categories = {
                id: categoryDoc.id,
                name: categoryData.name,
                type: categoryData.type,
                icon_name: categoryData.icon_name,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for income ${doc.id}:`, err);
          }
        }
        
        incomes.push(income);
      }
      
      return incomes;
    } catch (error) {
      console.error('Error fetching incomes by category:', error.message);
      throw error;
    }
  },

  // Add a new income
  async addIncome(incomeData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Format transaction date if it's a string
      let formattedData = { ...incomeData };
      if (typeof formattedData.transaction_date === 'string') {
        formattedData.transaction_date = Timestamp.fromDate(new Date(formattedData.transaction_date));
      }

      // Add user_id, type, and timestamps
      const newIncome = {
        ...formattedData,
        user_id: user.uid,
        type: 'income',
        created_at: serverTimestamp()
      };

      // Add the income
      const docRef = await addDoc(collection(db, "transactions"), newIncome);
      
      // Update bank account balance
      if (newIncome.account_id) {
        try {
          // Get current account
          const accountRef = doc(db, "bank_accounts", newIncome.account_id);
          const accountSnap = await getDoc(accountRef);
          
          if (accountSnap.exists()) {
            const account = accountSnap.data();
            
            // Calculate new balance
            let newBalance = parseFloat(account.balance || 0);
            newBalance += parseFloat(newIncome.amount);
            
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
      
      // Get the newly created income with related data
      const income = { id: docRef.id, ...newIncome };
      
      // Get bank account details
      if (income.account_id) {
        try {
          const accountDoc = await getDoc(doc(db, "bank_accounts", income.account_id));
          if (accountDoc.exists()) {
            income.bank_accounts = {
              id: accountDoc.id,
              name: accountDoc.data().name,
              bank_name: accountDoc.data().bank_name
            };
          }
        } catch (err) {
          console.error(`Error fetching bank account for income ${docRef.id}:`, err);
        }
      }
      
      // Get category details
      if (income.category_id) {
        try {
          const categoryDoc = await getDoc(doc(db, "categories", income.category_id));
          if (categoryDoc.exists()) {
            const categoryData = categoryDoc.data();
            income.categories = {
              id: categoryDoc.id,
              name: categoryData.name,
              type: categoryData.type,
              icon_name: categoryData.icon_name,
              color: categoryData.color
            };
          }
        } catch (err) {
          console.error(`Error fetching category for income ${docRef.id}:`, err);
        }
      }
      
      return income;
    } catch (error) {
      console.error('Error adding income:', error.message);
      throw error;
    }
  },

  // Update an income
  async updateIncome(id, incomeData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the original income
      const docRef = doc(db, "transactions", id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Income with ID ${id} not found`);
      }
      
      const originalIncome = docSnap.data();
      
      // Verify ownership
      if (originalIncome.user_id !== user.uid) {
        throw new Error('You do not have permission to update this income');
      }

      // Format transaction date if it's a string
      let formattedData = { ...incomeData };
      if (typeof formattedData.transaction_date === 'string') {
        formattedData.transaction_date = Timestamp.fromDate(new Date(formattedData.transaction_date));
      }

      // Update the income
      const updatedIncome = {
        ...formattedData,
        updated_at: serverTimestamp()
      };
      
      // Remove id if it exists in the data
      if ('id' in updatedIncome) {
        delete updatedIncome.id;
      }
      
      await updateDoc(docRef, updatedIncome);
      
      // Update bank account balance if amount or account changed
      if (originalIncome.account_id) {
        try {
          const originalAmount = parseFloat(originalIncome.amount);
          const originalAccountId = originalIncome.account_id;
          
          const newAmount = parseFloat(updatedIncome.amount);
          const newAccountId = updatedIncome.account_id;
          
          // If any relevant field changed, update the account balance
          if (originalAmount !== newAmount || originalAccountId !== newAccountId) {
            // Revert the effect of the original income
            const originalAccountRef = doc(db, "bank_accounts", originalAccountId);
            const originalAccountSnap = await getDoc(originalAccountRef);
            
            if (originalAccountSnap.exists()) {
              const originalAccount = originalAccountSnap.data();
              let originalBalance = parseFloat(originalAccount.balance || 0);
              
              // Subtract the original income amount
              originalBalance -= originalAmount;
              
              await updateDoc(originalAccountRef, {
                balance: originalBalance,
                updated_at: serverTimestamp()
              });
            }
            
            // Apply the effect of the new income
            if (newAccountId) {
              const newAccountRef = doc(db, "bank_accounts", newAccountId);
              const newAccountSnap = await getDoc(newAccountRef);
              
              if (newAccountSnap.exists()) {
                const newAccount = newAccountSnap.data();
                let newBalance = parseFloat(newAccount.balance || 0);
                
                // Add the new income amount
                newBalance += newAmount;
                
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
      
      // Get the updated income with related data
      const income = { id, ...updatedIncome };
      
      // Get bank account details
      if (income.account_id) {
        try {
          const accountDoc = await getDoc(doc(db, "bank_accounts", income.account_id));
          if (accountDoc.exists()) {
            income.bank_accounts = {
              id: accountDoc.id,
              name: accountDoc.data().name,
              bank_name: accountDoc.data().bank_name
            };
          }
        } catch (err) {
          console.error(`Error fetching bank account for income ${id}:`, err);
        }
      }
      
      // Get category details
      if (income.category_id) {
        try {
          const categoryDoc = await getDoc(doc(db, "categories", income.category_id));
          if (categoryDoc.exists()) {
            const categoryData = categoryDoc.data();
            income.categories = {
              id: categoryDoc.id,
              name: categoryData.name,
              type: categoryData.type,
              icon_name: categoryData.icon_name,
              color: categoryData.color
            };
          }
        } catch (err) {
          console.error(`Error fetching category for income ${id}:`, err);
        }
      }
      
      return income;
    } catch (error) {
      console.error('Error updating income:', error.message);
      throw error;
    }
  },

  // Delete an income
  async deleteIncome(id) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the income to verify ownership and update account balance
      const docRef = doc(db, "transactions", id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Income with ID ${id} not found`);
      }
      
      const income = docSnap.data();
      
      // Verify ownership
      if (income.user_id !== user.uid) {
        throw new Error('You do not have permission to delete this income');
      }

      // Update bank account balance
      if (income.account_id) {
        try {
          // Get current account
          const accountRef = doc(db, "bank_accounts", income.account_id);
          const accountSnap = await getDoc(accountRef);
          
          if (accountSnap.exists()) {
            const account = accountSnap.data();
            
            // Calculate new balance
            let newBalance = parseFloat(account.balance || 0);
            newBalance -= parseFloat(income.amount);
            
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

      // Delete the income
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting income:', error.message);
      throw error;
    }
  },

  // Get income statistics
  async getIncomeStats(period = 'month') {
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
        startDate = new Date(2000, 0, 1); // Far in the past to get all incomes
      }

      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("type", "==", "income"),
        where("transaction_date", ">=", Timestamp.fromDate(startDate))
      );
      
      const querySnapshot = await getDocs(q);
      const incomes = [];
      
      // Get all incomes with category data
      for (const doc of querySnapshot.docs) {
        const income = { id: doc.id, ...doc.data() };
        
        // Get category details
        if (income.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", income.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              income.categories = {
                name: categoryData.name,
                type: categoryData.type,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for income ${doc.id}:`, err);
          }
        }
        
        incomes.push(income);
      }

      const stats = {
        totalIncome: 0,
        categories: {},
        byMonth: {}
      };

      incomes.forEach(income => {
        const amount = parseFloat(income.amount);
        const categoryName = income.categories?.name || 'Uncategorized';
        const categoryColor = income.categories?.color || '#808080';

        // Calculate total income
        stats.totalIncome += amount;

        // Track category totals
        if (!stats.categories[categoryName]) {
          stats.categories[categoryName] = {
            total: 0,
            color: categoryColor
          };
        }
        stats.categories[categoryName].total += amount;

        // Track monthly data
        const incomeDate = income.transaction_date instanceof Timestamp ? 
          income.transaction_date.toDate() : new Date(income.transaction_date);
        
        const monthKey = `${incomeDate.getFullYear()}-${String(incomeDate.getMonth() + 1).padStart(2, '0')}`;

        if (!stats.byMonth[monthKey]) {
          stats.byMonth[monthKey] = {
            total: 0,
            month: incomeDate.toLocaleString('default', { month: 'short' }),
            year: incomeDate.getFullYear()
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
      console.error('Error getting income stats:', error.message);
      throw error;
    }
  }
};
