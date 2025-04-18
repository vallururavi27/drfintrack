import { 
  collection, doc, getDoc, getDocs, 
  addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, Timestamp, serverTimestamp
} from "firebase/firestore";
import { auth, db } from "./firebaseClient";

export const bankAccountService = {
  // Get all bank accounts for the current user
  async getBankAccounts() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "bank_accounts"),
        where("user_id", "==", user.uid),
        orderBy("name", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const accounts = [];
      
      querySnapshot.forEach((doc) => {
        accounts.push({ id: doc.id, ...doc.data() });
      });
      
      return accounts;
    } catch (error) {
      console.error('Error fetching bank accounts:', error.message);
      throw error;
    }
  },

  // Get a single bank account by ID
  async getBankAccountById(accountId) {
    try {
      const docRef = doc(db, "bank_accounts", accountId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Bank account with ID ${accountId} not found`);
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error(`Error fetching bank account with ID ${accountId}:`, error.message);
      throw error;
    }
  },

  // Create a new bank account
  async createBankAccount(accountData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Add user_id and timestamps to the account data
      const newAccount = {
        ...accountData,
        user_id: user.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      // Insert the data
      const docRef = await addDoc(collection(db, "bank_accounts"), newAccount);
      
      // Get the newly created document
      const docSnap = await getDoc(docRef);
      
      return { id: docRef.id, ...docSnap.data() };
    } catch (error) {
      console.error('Error creating bank account:', error.message);
      throw error;
    }
  },

  // Update an existing bank account
  async updateBankAccount(accountId, accountData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the account to verify ownership
      const docRef = doc(db, "bank_accounts", accountId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Bank account with ID ${accountId} not found`);
      }
      
      const account = docSnap.data();
      
      // Verify ownership
      if (account.user_id !== user.uid) {
        throw new Error('You do not have permission to update this account');
      }

      // Update the account
      const updatedAccount = {
        ...accountData,
        updated_at: serverTimestamp()
      };
      
      // Remove id if it exists in the data
      if ('id' in updatedAccount) {
        delete updatedAccount.id;
      }
      
      await updateDoc(docRef, updatedAccount);
      
      // Get the updated document
      const updatedDocSnap = await getDoc(docRef);
      
      return { id: accountId, ...updatedDocSnap.data() };
    } catch (error) {
      console.error(`Error updating bank account with ID ${accountId}:`, error.message);
      throw error;
    }
  },

  // Delete a bank account
  async deleteBankAccount(accountId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the account to verify ownership
      const docRef = doc(db, "bank_accounts", accountId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Bank account with ID ${accountId} not found`);
      }
      
      const account = docSnap.data();
      
      // Verify ownership
      if (account.user_id !== user.uid) {
        throw new Error('You do not have permission to delete this account');
      }

      // Delete the account
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error(`Error deleting bank account with ID ${accountId}:`, error.message);
      throw error;
    }
  },

  // Update account balance
  async updateAccountBalance(accountId, newBalance) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the account to verify ownership
      const docRef = doc(db, "bank_accounts", accountId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Bank account with ID ${accountId} not found`);
      }
      
      const account = docSnap.data();
      
      // Verify ownership
      if (account.user_id !== user.uid) {
        throw new Error('You do not have permission to update this account');
      }

      // Update the balance
      await updateDoc(docRef, {
        balance: newBalance,
        updated_at: serverTimestamp()
      });
      
      // Get the updated document
      const updatedDocSnap = await getDoc(docRef);
      
      return { id: accountId, ...updatedDocSnap.data() };
    } catch (error) {
      console.error(`Error updating balance for account with ID ${accountId}:`, error.message);
      throw error;
    }
  },

  /**
   * Link UPI ID to bank account
   * @param {string} accountId - Bank account ID
   * @param {Object} upiData - UPI data object with upi_id, upi_app, and upi_linked properties
   * @returns {Promise<Object>} Updated bank account
   */
  async linkUpiToAccount(accountId, upiData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the account to verify ownership
      const docRef = doc(db, "bank_accounts", accountId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Bank account with ID ${accountId} not found`);
      }
      
      const account = docSnap.data();
      
      // Verify ownership
      if (account.user_id !== user.uid) {
        throw new Error('You do not have permission to update this account');
      }

      // Update the UPI data
      await updateDoc(docRef, {
        upi_id: upiData.upi_id,
        upi_app: upiData.upi_app,
        upi_linked: upiData.upi_linked,
        updated_at: serverTimestamp()
      });
      
      // Get the updated document
      const updatedDocSnap = await getDoc(docRef);
      
      return { id: accountId, ...updatedDocSnap.data() };
    } catch (error) {
      console.error(`Error linking UPI to account with ID ${accountId}:`, error.message);
      throw error;
    }
  },

  /**
   * Get bank accounts with UPI enabled
   * @returns {Promise<Array>} Bank accounts with UPI enabled
   */
  async getUpiEnabledAccounts() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "bank_accounts"),
        where("user_id", "==", user.uid),
        where("upi_linked", "==", true),
        orderBy("name", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const accounts = [];
      
      querySnapshot.forEach((doc) => {
        accounts.push({ id: doc.id, ...doc.data() });
      });
      
      return accounts;
    } catch (error) {
      console.error('Error fetching UPI-enabled accounts:', error.message);
      throw error;
    }
  },

  /**
   * Get bank account balance history
   * @param {string} accountId - Bank account ID
   * @param {string} period - Time period ('month', '3months', '6months', 'year', 'all')
   * @returns {Promise<Array>} Balance history data
   */
  async getBankAccountBalanceHistory(accountId, period = 'month') {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Calculate start date based on period
      let startDate;
      const now = new Date();
      
      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      } else if (period === '3months') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      } else if (period === '6months') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      } else {
        // 'all' - get all history
        startDate = new Date(2000, 0, 1); // Far in the past
      }

      // Get transactions for this account
      const q = query(
        collection(db, "transactions"),
        where("account_id", "==", accountId),
        where("transaction_date", ">=", Timestamp.fromDate(startDate)),
        orderBy("transaction_date", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });

      // Get the current balance
      const accountDoc = await this.getBankAccountById(accountId);
      const currentBalance = accountDoc?.balance || 0;

      // Calculate balance history
      const balanceHistory = [];
      let runningBalance = currentBalance;

      // Sort transactions by date (newest first)
      const sortedTransactions = [...transactions].sort((a, b) => {
        const dateA = a.transaction_date instanceof Timestamp ? 
          a.transaction_date.toDate() : new Date(a.transaction_date);
        const dateB = b.transaction_date instanceof Timestamp ? 
          b.transaction_date.toDate() : new Date(b.transaction_date);
        return dateB - dateA;
      });

      // Work backwards from current balance
      for (const transaction of sortedTransactions) {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === 'expense') {
          runningBalance += amount; // Add back expenses
        } else {
          runningBalance -= amount; // Subtract income
        }

        const transactionDate = transaction.transaction_date instanceof Timestamp ? 
          transaction.transaction_date.toDate().toISOString().split('T')[0] : 
          transaction.transaction_date;

        balanceHistory.unshift({
          date: transactionDate,
          balance: runningBalance,
          transaction_id: transaction.id
        });
      }

      // Add current balance as the last point
      balanceHistory.push({
        date: new Date().toISOString().split('T')[0],
        balance: currentBalance,
        transaction_id: null
      });

      return balanceHistory;
    } catch (error) {
      console.error(`Error fetching balance history for account ${accountId}:`, error.message);
      throw error;
    }
  }
};
