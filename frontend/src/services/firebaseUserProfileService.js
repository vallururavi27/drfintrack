import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  deleteUser 
} from "firebase/auth";
import { auth, db, storage } from "./firebaseClient";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const firebaseUserProfileService = {
  // Get user profile
  async getUserProfile() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const profileRef = doc(db, "user_profiles", user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        return {
          id: profileSnap.id,
          ...profileSnap.data()
        };
      } else {
        // Create a default profile if none exists
        const defaultProfile = {
          user_id: user.uid,
          display_name: user.displayName || user.email.split('@')[0],
          email: user.email,
          avatar_url: user.photoURL || '',
          spouse_name: '',
          currency: 'INR',
          theme: 'system',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };
        
        await setDoc(profileRef, defaultProfile);
        
        return {
          id: user.uid,
          ...defaultProfile
        };
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(profileData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const profileRef = doc(db, "user_profiles", user.uid);
      
      // Update profile in Firestore
      const updatedData = {
        ...profileData,
        updated_at: serverTimestamp()
      };
      
      await updateDoc(profileRef, updatedData);
      
      // Update display name in Firebase Auth if provided
      if (profileData.display_name) {
        await updateProfile(user, {
          displayName: profileData.display_name
        });
      }
      
      // Update photo URL in Firebase Auth if provided
      if (profileData.avatar_url) {
        await updateProfile(user, {
          photoURL: profileData.avatar_url
        });
      }
      
      return {
        id: user.uid,
        ...updatedData
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Upload profile image
  async uploadProfileImage(file) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Create a storage reference
      const storageRef = ref(storage, `profile_images/${user.uid}/${file.name}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile with new avatar URL
      await this.updateUserProfile({ avatar_url: downloadURL });
      
      // Update Firebase Auth profile
      await updateProfile(user, {
        photoURL: downloadURL
      });
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  // Update user email
  async updateUserEmail(newEmail, password) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Re-authenticate user before changing email
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Update email in Firebase Auth
      await updateEmail(user, newEmail);
      
      // Update email in Firestore profile
      const profileRef = doc(db, "user_profiles", user.uid);
      await updateDoc(profileRef, {
        email: newEmail,
        updated_at: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user email:', error);
      throw error;
    }
  },

  // Update user password
  async updateUserPassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password in Firebase Auth
      await updatePassword(user, newPassword);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user password:', error);
      throw error;
    }
  },

  // Delete user account
  async deleteUserAccount(password) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Re-authenticate user before deleting account
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Delete user from Firebase Auth
      await deleteUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  },

  // Get user theme preference
  async getUserTheme() {
    try {
      const user = auth.currentUser;
      if (!user) return 'system'; // Default to system theme if not logged in

      const profileRef = doc(db, "user_profiles", user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        return profileSnap.data().theme || 'system';
      } else {
        return 'system';
      }
    } catch (error) {
      console.error('Error fetching user theme:', error);
      return 'system';
    }
  },

  // Update user theme preference
  async updateUserTheme(theme) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const profileRef = doc(db, "user_profiles", user.uid);
      await updateDoc(profileRef, {
        theme,
        updated_at: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user theme:', error);
      throw error;
    }
  },

  // Export user data
  async exportUserData() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get user profile
      const profileRef = doc(db, "user_profiles", user.uid);
      const profileSnap = await getDoc(profileRef);
      
      let userData = {
        profile: profileSnap.exists() ? profileSnap.data() : {},
        auth: {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        }
      };
      
      return userData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }
};
