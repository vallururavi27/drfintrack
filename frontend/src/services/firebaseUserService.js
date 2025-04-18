import { 
  doc, getDoc, setDoc, updateDoc, serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "./firebaseClient";
import { updateProfile } from "firebase/auth";

export const userService = {
  // Get user profile
  async getUserProfile() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: user.uid, ...docSnap.data() };
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          currency: "INR",
          is_email_verified: user.emailVerified,
          two_factor_enabled: false,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };
        
        await setDoc(docRef, newProfile);
        
        return { id: user.uid, ...newProfile };
      }
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(profileData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = doc(db, "users", user.uid);
      
      // Update the profile
      const updatedProfile = {
        ...profileData,
        updated_at: serverTimestamp()
      };
      
      await updateDoc(docRef, updatedProfile);
      
      // Update display name in Firebase Auth if name is provided
      if (profileData.name) {
        await updateProfile(user, { displayName: profileData.name });
      }
      
      return { id: user.uid, ...updatedProfile };
    } catch (error) {
      console.error('Error updating user profile:', error.message);
      throw error;
    }
  },

  // Update user currency
  async updateUserCurrency(currency) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = doc(db, "users", user.uid);
      
      await updateDoc(docRef, {
        currency,
        updated_at: serverTimestamp()
      });
      
      return { currency };
    } catch (error) {
      console.error('Error updating user currency:', error.message);
      throw error;
    }
  },

  // Update user theme
  async updateUserTheme(theme) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = doc(db, "users", user.uid);
      
      await updateDoc(docRef, {
        theme,
        updated_at: serverTimestamp()
      });
      
      return { theme };
    } catch (error) {
      console.error('Error updating user theme:', error.message);
      throw error;
    }
  },

  // Log user login
  async logUserLogin(deviceInfo) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const loginData = {
        user_id: user.uid,
        email: user.email,
        device: deviceInfo.device || 'Unknown',
        browser: deviceInfo.browser || 'Unknown',
        ip_address: deviceInfo.ip_address || 'Unknown',
        login_time: serverTimestamp()
      };
      
      await setDoc(doc(db, "login_history", `${user.uid}_${Date.now()}`), loginData);
      
      return true;
    } catch (error) {
      console.error('Error logging user login:', error.message);
      // Don't throw error for login logging to prevent blocking the login process
      return false;
    }
  },

  // Get user login history
  async getUserLoginHistory(limit = 10) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, "login_history"),
        where("user_id", "==", user.uid),
        orderBy("login_time", "desc"),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const loginHistory = [];
      
      querySnapshot.forEach((doc) => {
        loginHistory.push({ id: doc.id, ...doc.data() });
      });
      
      return loginHistory;
    } catch (error) {
      console.error('Error fetching user login history:', error.message);
      throw error;
    }
  }
};
