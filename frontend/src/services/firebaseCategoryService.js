import { 
  collection, doc, getDoc, getDocs, 
  addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp
} from "firebase/firestore";
import { auth, db } from "./firebaseClient";

export const categoryService = {
  // Get all categories
  async getCategories() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Query for user's categories and default categories
      const userCategoriesQuery = query(
        collection(db, "categories"),
        where("user_id", "==", user.uid),
        orderBy("name", "asc")
      );
      
      const defaultCategoriesQuery = query(
        collection(db, "default_categories"),
        orderBy("name", "asc")
      );
      
      // Get user categories
      const userCategoriesSnapshot = await getDocs(userCategoriesQuery);
      const userCategories = [];
      
      userCategoriesSnapshot.forEach((doc) => {
        userCategories.push({ id: doc.id, ...doc.data(), is_default: false });
      });
      
      // Get default categories
      const defaultCategoriesSnapshot = await getDocs(defaultCategoriesQuery);
      const defaultCategories = [];
      
      defaultCategoriesSnapshot.forEach((doc) => {
        defaultCategories.push({ id: doc.id, ...doc.data(), is_default: true });
      });
      
      // Combine categories, but don't include default categories that the user has overridden
      const userCategoryNames = userCategories.map(cat => cat.name.toLowerCase());
      const filteredDefaultCategories = defaultCategories.filter(
        cat => !userCategoryNames.includes(cat.name.toLowerCase())
      );
      
      return [...userCategories, ...filteredDefaultCategories];
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      throw error;
    }
  },

  // Get categories by type (expense/income)
  async getCategoriesByType(type) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Query for user's categories and default categories of the specified type
      const userCategoriesQuery = query(
        collection(db, "categories"),
        where("user_id", "==", user.uid),
        where("type", "==", type),
        orderBy("name", "asc")
      );
      
      const defaultCategoriesQuery = query(
        collection(db, "default_categories"),
        where("type", "==", type),
        orderBy("name", "asc")
      );
      
      // Get user categories
      const userCategoriesSnapshot = await getDocs(userCategoriesQuery);
      const userCategories = [];
      
      userCategoriesSnapshot.forEach((doc) => {
        userCategories.push({ id: doc.id, ...doc.data(), is_default: false });
      });
      
      // Get default categories
      const defaultCategoriesSnapshot = await getDocs(defaultCategoriesQuery);
      const defaultCategories = [];
      
      defaultCategoriesSnapshot.forEach((doc) => {
        defaultCategories.push({ id: doc.id, ...doc.data(), is_default: true });
      });
      
      // Combine categories, but don't include default categories that the user has overridden
      const userCategoryNames = userCategories.map(cat => cat.name.toLowerCase());
      const filteredDefaultCategories = defaultCategories.filter(
        cat => !userCategoryNames.includes(cat.name.toLowerCase())
      );
      
      return [...userCategories, ...filteredDefaultCategories];
    } catch (error) {
      console.error(`Error fetching categories of type ${type}:`, error.message);
      throw error;
    }
  },

  // Get a single category by ID
  async getCategoryById(categoryId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Try to get from user categories first
      const userCategoryRef = doc(db, "categories", categoryId);
      const userCategorySnap = await getDoc(userCategoryRef);
      
      if (userCategorySnap.exists()) {
        const data = userCategorySnap.data();
        
        // Verify ownership
        if (data.user_id === user.uid) {
          return { id: categoryId, ...data, is_default: false };
        }
      }
      
      // If not found or not owned, try default categories
      const defaultCategoryRef = doc(db, "default_categories", categoryId);
      const defaultCategorySnap = await getDoc(defaultCategoryRef);
      
      if (defaultCategorySnap.exists()) {
        return { id: categoryId, ...defaultCategorySnap.data(), is_default: true };
      }
      
      throw new Error(`Category with ID ${categoryId} not found`);
    } catch (error) {
      console.error(`Error fetching category with ID ${categoryId}:`, error.message);
      throw error;
    }
  },

  // Create a new category
  async createCategory(categoryData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Add user_id and timestamps
      const newCategory = {
        ...categoryData,
        user_id: user.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      // Insert the data
      const docRef = await addDoc(collection(db, "categories"), newCategory);
      
      return { id: docRef.id, ...newCategory, is_default: false };
    } catch (error) {
      console.error('Error creating category:', error.message);
      throw error;
    }
  },

  // Update a category
  async updateCategory(categoryId, categoryData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the category to verify ownership
      const docRef = doc(db, "categories", categoryId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Category with ID ${categoryId} not found`);
      }
      
      const category = docSnap.data();
      
      // Verify ownership
      if (category.user_id !== user.uid) {
        throw new Error('You do not have permission to update this category');
      }

      // Update the category
      const updatedCategory = {
        ...categoryData,
        updated_at: serverTimestamp()
      };
      
      // Remove id if it exists in the data
      if ('id' in updatedCategory) {
        delete updatedCategory.id;
      }
      
      await updateDoc(docRef, updatedCategory);
      
      return { id: categoryId, ...updatedCategory, is_default: false };
    } catch (error) {
      console.error(`Error updating category with ID ${categoryId}:`, error.message);
      throw error;
    }
  },

  // Delete a category
  async deleteCategory(categoryId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the category to verify ownership
      const docRef = doc(db, "categories", categoryId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Category with ID ${categoryId} not found`);
      }
      
      const category = docSnap.data();
      
      // Verify ownership
      if (category.user_id !== user.uid) {
        throw new Error('You do not have permission to delete this category');
      }

      // Delete the category
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error(`Error deleting category with ID ${categoryId}:`, error.message);
      throw error;
    }
  },

  // Create default categories for a new user
  async createDefaultCategories() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get default categories
      const defaultCategoriesQuery = query(
        collection(db, "default_categories"),
        orderBy("name", "asc")
      );
      
      const defaultCategoriesSnapshot = await getDocs(defaultCategoriesQuery);
      const defaultCategories = [];
      
      defaultCategoriesSnapshot.forEach((doc) => {
        defaultCategories.push(doc.data());
      });
      
      // Create user categories from defaults
      const batch = [];
      
      for (const category of defaultCategories) {
        const newCategory = {
          name: category.name,
          type: category.type,
          icon_name: category.icon_name,
          color: category.color,
          user_id: user.uid,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };
        
        batch.push(addDoc(collection(db, "categories"), newCategory));
      }
      
      await Promise.all(batch);
      
      return true;
    } catch (error) {
      console.error('Error creating default categories:', error.message);
      throw error;
    }
  }
};
