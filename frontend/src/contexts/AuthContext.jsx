import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const session = await authService.getSession();
        if (session) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' && session) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        } else if (event === 'USER_UPDATED' && session) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.signIn(email, password);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWith2FA = async (email, password, code) => {
    try {
      console.log('Logging in with 2FA...');

      // First authenticate with email/password
      console.log('Authenticating with email/password...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Email/password authentication error:', error);
        throw error;
      }

      console.log('Email/password authentication successful');

      // Get MFA factors
      console.log('Getting MFA factors...');
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        console.error('Error getting MFA factors:', factorsError);
        throw factorsError;
      }

      console.log('MFA factors:', factorsData);

      // Find the TOTP factor
      const totpFactor = factorsData.totp.find(f => f.factor_type === 'totp');
      if (!totpFactor) {
        console.error('No TOTP factor found');
        throw new Error('No TOTP factor found');
      }

      // Create a challenge
      console.log('Creating MFA challenge...');
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id
      });

      if (challengeError) {
        console.error('Error creating MFA challenge:', challengeError);
        throw challengeError;
      }

      console.log('MFA challenge created:', challengeData);

      // Verify the challenge
      console.log('Verifying MFA challenge...');
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: code
      });

      if (verifyError) {
        console.error('MFA verification error:', verifyError);
        throw verifyError;
      }

      console.log('MFA verification successful:', verifyData);

      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error('2FA login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const register = async (email, password, metadata) => {
    try {
      const data = await authService.signUp(email, password, metadata);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const updateUserPassword = async (newPassword) => {
    try {
      const data = await authService.updatePassword(newPassword);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const data = await authService.updateProfile(updates);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    login,
    loginWith2FA,
    logout,
    register,
    resetPassword,
    updateUserPassword,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
