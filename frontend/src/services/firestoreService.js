import { 
  collection, doc, getDoc, getDocs, 
  addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit 
} from "firebase/firestore";
import { db } from "./firebaseClient";

// User profile operations
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: docSnap.data(), error: null };
    } else {
      return { data: null, error: "User profile not found" };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { data: null, error: error.message };
  }
};

// Bank account operations
export const getBankAccounts = async (userId) => {
  try {
    const q = query(
      collection(db, "bank_accounts"), 
      where("user_id", "==", userId),
      orderBy("created_at", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const accounts = [];
    
    querySnapshot.forEach((doc) => {
      accounts.push({ id: doc.id, ...doc.data() });
    });
    
    return { data: accounts, error: null };
  } catch (error) {
    console.error("Error getting bank accounts:", error);
    return { data: [], error: error.message };
  }
};

export const addBankAccount = async (accountData) => {
  try {
    const docRef = await addDoc(collection(db, "bank_accounts"), {
      ...accountData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    return { 
      data: { id: docRef.id, ...accountData }, 
      error: null 
    };
  } catch (error) {
    console.error("Error adding bank account:", error);
    return { data: null, error: error.message };
  }
};

// Transaction operations
export const getTransactions = async (userId, filters = {}) => {
  try {
    let q = query(
      collection(db, "transactions"),
      where("user_id", "==", userId)
    );
    
    // Apply filters if provided
    if (filters.accountId) {
      q = query(q, where("account_id", "==", filters.accountId));
    }
    
    if (filters.startDate && filters.endDate) {
      q = query(
        q, 
        where("transaction_date", ">=", filters.startDate),
        where("transaction_date", "<=", filters.endDate)
      );
    }
    
    // Apply sorting
    q = query(q, orderBy("transaction_date", "desc"));
    
    // Apply limit if provided
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const transactions = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    
    return { data: transactions, error: null };
  } catch (error) {
    console.error("Error getting transactions:", error);
    return { data: [], error: error.message };
  }
};