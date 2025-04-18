import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  signIn, 
  signUp, 
  logOut, 
  resetPassword, 
  changePassword, 
  resendVerificationEmail 
} from '../services/firebaseAuth';
import { userService } from '../services/firebaseUserService';

const FirebaseAuthContext = createContext();

export function useFirebaseAuth() {
  return useContext(FirebaseAuthContext);
}

export function FirebaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Set up auth state change listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Firebase auth state changed:', currentUser ? 'User logged in' : 'User logged out');
      
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        
        try {
          // Get user profile from Firestore
          const profile = await userService.getUserProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const { user, error } = await signIn(email, password);
      
      if (error) {
        throw new Error(error);
      }
      
      // Log user login
      try {
        await userService.logUserLogin({
          device: navigator.userAgent,
          browser: navigator.userAgent,
          ip_address: 'Unknown' // We don't collect IP addresses for privacy
        });
      } catch (logError) {
        console.error('Error logging user login:', logError);
      }
      
      return { user, error: null };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('FirebaseAuthContext: Logging out user...');
      const { error } = await logOut();
      
      if (error) {
        throw new Error(error);
      }
      
      console.log('FirebaseAuthContext: User logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('FirebaseAuthContext: Logout error:', error);
      throw error;
    }
  };

  const register = async (email, password, metadata) => {
    try {
      setIsLoading(true);
      const { user, error } = await signUp(email, password, metadata?.name || email.split('@')[0]);
      
      if (error) {
        throw new Error(error);
      }
      
      return { user, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async (email) => {
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        throw new Error(error);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const updateUserPassword = async (newPassword) => {
    try {
      const { error } = await changePassword(newPassword);
      
      if (error) {
        throw new Error(error);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const updatedProfile = await userService.updateUserProfile(updates);
      setUserProfile(updatedProfile);
      return { user: updatedProfile, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    try {
      const { error } = await resendVerificationEmail();
      
      if (error) {
        throw new Error(error);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Send verification email error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    sendPasswordReset,
    updateUserPassword,
    updateUserProfile,
    sendVerificationEmail
  };

  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
}
