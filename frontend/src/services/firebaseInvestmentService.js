import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "./firebaseClient";

export const firebaseInvestmentService = {
  // Get all investments
  async getInvestments() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "investments"),
        where("user_id", "==", user.uid),
        orderBy("name", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const investments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        start_date: doc.data().start_date?.toDate().toISOString().split('T')[0] || null
      }));
      
      return investments;
    } catch (error) {
      console.error('Error fetching investments:', error);
      throw error;
    }
  },

  // Get investment categories
  async getInvestmentCategories() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "investment_categories"),
        where("user_id", "==", user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If no custom categories exist, create default ones
      if (categories.length === 0) {
        const defaultCategories = [
          { name: 'Large Cap', color: '#3b82f6' },
          { name: 'Mid Cap', color: '#10b981' },
          { name: 'Small Cap', color: '#f59e0b' },
          { name: 'Debt', color: '#6366f1' },
          { name: 'Gold', color: '#f97316' },
          { name: 'Real Estate', color: '#8b5cf6' },
          { name: 'Fixed Income', color: '#ec4899' },
          { name: 'International', color: '#14b8a6' }
        ];
        
        const createdCategories = [];
        
        for (const category of defaultCategories) {
          const newCategory = {
            ...category,
            user_id: user.uid,
            created_at: serverTimestamp()
          };
          
          const docRef = await addDoc(collection(db, "investment_categories"), newCategory);
          createdCategories.push({
            id: docRef.id,
            ...newCategory,
            created_at: new Date()
          });
        }
        
        return createdCategories;
      }
      
      return categories;
    } catch (error) {
      console.error('Error fetching investment categories:', error);
      throw error;
    }
  },

  // Get investment stats
  async getInvestmentStats() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get all investments
      const investments = await this.getInvestments();
      
      // Get all categories
      const categories = await this.getInvestmentCategories();
      
      // Calculate stats
      let totalInvested = 0;
      let totalCurrentValue = 0;
      
      const byType = {};
      const byCategory = {};
      
      // Process each investment
      for (const investment of investments) {
        const initialValue = parseFloat(investment.initial_value) || 0;
        const currentValue = parseFloat(investment.current_value) || 0;
        
        totalInvested += initialValue;
        totalCurrentValue += currentValue;
        
        // Group by investment type
        const type = investment.investment_type || 'Other';
        if (!byType[type]) {
          byType[type] = {
            initialValue: 0,
            currentValue: 0,
            gain: 0,
            gainPercentage: 0
          };
        }
        
        byType[type].initialValue += initialValue;
        byType[type].currentValue += currentValue;
        byType[type].gain = byType[type].currentValue - byType[type].initialValue;
        byType[type].gainPercentage = byType[type].initialValue > 0 
          ? (byType[type].gain / byType[type].initialValue) * 100 
          : 0;
        
        // Group by category
        const categoryId = investment.category_id;
        if (categoryId) {
          const category = categories.find(c => c.id === categoryId);
          const categoryName = category ? category.name : 'Uncategorized';
          const categoryColor = category ? category.color : '#808080';
          
          if (!byCategory[categoryName]) {
            byCategory[categoryName] = {
              initialValue: 0,
              currentValue: 0,
              gain: 0,
              gainPercentage: 0,
              color: categoryColor
            };
          }
          
          byCategory[categoryName].initialValue += initialValue;
          byCategory[categoryName].currentValue += currentValue;
          byCategory[categoryName].gain = byCategory[categoryName].currentValue - byCategory[categoryName].initialValue;
          byCategory[categoryName].gainPercentage = byCategory[categoryName].initialValue > 0 
            ? (byCategory[categoryName].gain / byCategory[categoryName].initialValue) * 100 
            : 0;
        }
      }
      
      // Calculate overall stats
      const totalGain = totalCurrentValue - totalInvested;
      const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
      
      return {
        totalInvested,
        totalCurrentValue,
        totalGain,
        gainPercentage,
        byType,
        byCategory
      };
    } catch (error) {
      console.error('Error calculating investment stats:', error);
      throw error;
    }
  },

  // Create a new investment
  async createInvestment(investmentData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Format data
      const formattedData = {
        ...investmentData,
        user_id: user.uid,
        initial_value: parseFloat(investmentData.initial_value) || 0,
        current_value: parseFloat(investmentData.current_value) || 0,
        current_units: parseFloat(investmentData.current_units) || 0,
        start_date: investmentData.start_date ? Timestamp.fromDate(new Date(investmentData.start_date)) : null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "investments"), formattedData);
      
      return {
        id: docRef.id,
        ...formattedData,
        start_date: formattedData.start_date?.toDate().toISOString().split('T')[0] || null
      };
    } catch (error) {
      console.error('Error creating investment:', error);
      throw error;
    }
  },

  // Update an investment
  async updateInvestment(id, investmentData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the investment to verify ownership
      const investmentRef = doc(db, "investments", id);
      const investmentSnap = await getDoc(investmentRef);
      
      if (!investmentSnap.exists()) {
        throw new Error('Investment not found');
      }
      
      const investmentDoc = investmentSnap.data();
      
      // Verify ownership
      if (investmentDoc.user_id !== user.uid) {
        throw new Error('You do not have permission to update this investment');
      }

      // Format data
      const formattedData = {
        ...investmentData,
        initial_value: parseFloat(investmentData.initial_value) || 0,
        current_value: parseFloat(investmentData.current_value) || 0,
        current_units: parseFloat(investmentData.current_units) || 0,
        start_date: investmentData.start_date ? Timestamp.fromDate(new Date(investmentData.start_date)) : null,
        updated_at: serverTimestamp()
      };
      
      await updateDoc(investmentRef, formattedData);
      
      return {
        id,
        ...formattedData,
        start_date: formattedData.start_date?.toDate().toISOString().split('T')[0] || null
      };
    } catch (error) {
      console.error('Error updating investment:', error);
      throw error;
    }
  },

  // Delete an investment
  async deleteInvestment(id) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the investment to verify ownership
      const investmentRef = doc(db, "investments", id);
      const investmentSnap = await getDoc(investmentRef);
      
      if (!investmentSnap.exists()) {
        throw new Error('Investment not found');
      }
      
      const investmentDoc = investmentSnap.data();
      
      // Verify ownership
      if (investmentDoc.user_id !== user.uid) {
        throw new Error('You do not have permission to delete this investment');
      }

      // Delete the investment
      await deleteDoc(investmentRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting investment:', error);
      throw error;
    }
  },

  // Create a new investment category
  async createInvestmentCategory(categoryData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const formattedData = {
        ...categoryData,
        user_id: user.uid,
        created_at: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "investment_categories"), formattedData);
      
      return {
        id: docRef.id,
        ...formattedData
      };
    } catch (error) {
      console.error('Error creating investment category:', error);
      throw error;
    }
  },

  // Update an investment category
  async updateInvestmentCategory(id, categoryData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the category to verify ownership
      const categoryRef = doc(db, "investment_categories", id);
      const categorySnap = await getDoc(categoryRef);
      
      if (!categorySnap.exists()) {
        throw new Error('Category not found');
      }
      
      const categoryDoc = categorySnap.data();
      
      // Verify ownership
      if (categoryDoc.user_id !== user.uid) {
        throw new Error('You do not have permission to update this category');
      }

      const formattedData = {
        ...categoryData,
        updated_at: serverTimestamp()
      };
      
      await updateDoc(categoryRef, formattedData);
      
      return {
        id,
        ...formattedData
      };
    } catch (error) {
      console.error('Error updating investment category:', error);
      throw error;
    }
  },

  // Delete an investment category
  async deleteInvestmentCategory(id) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the category to verify ownership
      const categoryRef = doc(db, "investment_categories", id);
      const categorySnap = await getDoc(categoryRef);
      
      if (!categorySnap.exists()) {
        throw new Error('Category not found');
      }
      
      const categoryDoc = categorySnap.data();
      
      // Verify ownership
      if (categoryDoc.user_id !== user.uid) {
        throw new Error('You do not have permission to delete this category');
      }

      // Check if any investments are using this category
      const investmentsQuery = query(
        collection(db, "investments"),
        where("user_id", "==", user.uid),
        where("category_id", "==", id)
      );
      
      const investmentsSnap = await getDocs(investmentsQuery);
      
      if (!investmentsSnap.empty) {
        throw new Error('Cannot delete category that is in use by investments');
      }

      // Delete the category
      await deleteDoc(categoryRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting investment category:', error);
      throw error;
    }
  }
};
