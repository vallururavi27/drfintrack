import { supabase } from './supabaseClient';

export const authService = {
  // Register a new user
  async register(name, email, password) {
    console.log('authService.register called with:', { name, email });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      console.log('Supabase signUp response:', { data, error });

      if (error) throw error;

      // The profile should be created automatically by the database trigger
      // But we'll wait a moment and then check if it exists
      if (data.user && !error) {
        console.log('User created successfully, waiting for trigger to create profile...');

        // Wait a short time for the trigger to run
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if profile exists
        const { data: profileData, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        console.log('Profile check after waiting:', { profileData, profileCheckError });

        // If profile doesn't exist, create it manually
        if (profileCheckError && !profileData) {
          console.log('Profile not created by trigger, creating manually');

          try {
            // Try with RLS
            const { data: insertData, error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: data.user.id,
                name,
                is_email_verified: false,
                two_factor_enabled: false
              }])
              .select();

            console.log('Manual profile creation result:', { insertData, profileError });

            if (profileError) {
              console.error('Error creating profile with RLS:', profileError);
              throw profileError;
            }
          } catch (profileError) {
            console.error('Failed to create profile:', profileError);
            throw new Error(`Registration successful but profile creation failed: ${profileError.message}`);
          }
        }
      }

      return data.user;
    } catch (error) {
      console.error('Registration error in authService:', error);
      throw error;
    }
  },

  // Login user
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Record login history
    if (data.user) {
      await supabase.from('login_history').insert([{
        user_id: data.user.id,
        ip_address: 'Client IP', // You'll need to get this from a service
        device: navigator.userAgent,
        successful: true
      }]);

      // Store token in localStorage for app-wide authentication
      if (data.session) {
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('email', data.user.email);
        localStorage.setItem('name', data.user.user_metadata?.name || data.user.email);
      }
    }

    return data.user;
  },

  // Sign in (alias for login for compatibility)
  async signIn(email, password) {
    return this.login(email, password);
  },

  // Login with 2FA
  async loginWith2FA(email, password, token) {
    // First authenticate with email/password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Verify 2FA token
    const { data: profile } = await supabase
      .from('profiles')
      .select('two_factor_enabled, two_factor_secret')
      .eq('id', data.user.id)
      .single();

    if (profile?.two_factor_enabled) {
      // Verify token using Edge Function (you'll need to create this)
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-2fa', {
        body: {
          token,
          userId: data.user.id,
          secret: profile.two_factor_secret.base32
        }
      });

      if (verifyError || !verifyData?.isValid) {
        // Sign out the user if 2FA fails
        await supabase.auth.signOut();
        throw new Error('Invalid 2FA code');
      }
    }

    // Record successful login
    await supabase.from('login_history').insert([{
      user_id: data.user.id,
      ip_address: 'Client IP',
      device: navigator.userAgent,
      successful: true
    }]);

    return data.user;
  },

  // Logout user
  async logout() {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear localStorage items related to authentication
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      localStorage.removeItem('username');
      localStorage.removeItem('allowDemoUser');

      console.log('Logout successful, localStorage cleared');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still try to clear localStorage even if Supabase signOut fails
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      localStorage.removeItem('username');
      localStorage.removeItem('allowDemoUser');
      throw error;
    }
  },

  // Get current user
  getCurrentUser() {
    return supabase.auth.getUser().then(({ data }) => data.user);
  },

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  // Get user profile
  async getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // Reset password
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  // Update password
  async updatePassword(password) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  // Setup 2FA
  async setup2FA(secret, backupCodes) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({
        two_factor_enabled: true,
        two_factor_secret: { base32: secret },
        backup_codes: backupCodes
      })
      .eq('id', user.id);

    if (error) throw error;
  },

  // Setup Two Factor Authentication (for Supabase Auth)
  async setupTwoFactorAuth() {
    try {
      console.log('Setting up 2FA with Supabase...');
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Enroll a new factor
      console.log('Enrolling new TOTP factor...');
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });

      console.log('MFA enroll response:', { data, error });

      if (error) {
        console.error('MFA enroll error:', error);
        throw error;
      }

      if (!data || !data.totp) {
        console.error('Invalid MFA enroll response:', data);
        throw new Error('Invalid response from server');
      }

      console.log('MFA factor enrolled successfully');
      return {
        id: data.id,
        secret: data.totp.secret,
        qr: data.totp.qr_code
      };
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw error;
    }
  },

  // Verify Two Factor Authentication
  async verifyTwoFactorAuth(factorId, code) {
    try {
      console.log('Verifying 2FA with Supabase...');
      console.log('Creating challenge for factor ID:', factorId);

      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: factorId
      });

      console.log('MFA challenge response:', { data, error });

      if (error) {
        console.error('MFA challenge error:', error);
        throw error;
      }

      if (!data || !data.id) {
        console.error('Invalid MFA challenge response:', data);
        throw new Error('Invalid challenge response from server');
      }

      const challengeId = data.id;
      console.log('Challenge created with ID:', challengeId);

      console.log('Verifying code for challenge ID:', challengeId);
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeId,
        code: code
      });

      console.log('MFA verify response:', { verifyData, verifyError });

      if (verifyError) {
        console.error('MFA verify error:', verifyError);
        throw verifyError;
      }

      console.log('MFA verification successful');
      return { isValid: true };
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      throw error;
    }
  },

  // Get Two Factor Factors
  async getTwoFactorFactors() {
    try {
      console.log('Getting 2FA factors from Supabase...');
      const { data, error } = await supabase.auth.mfa.listFactors();

      console.log('MFA list factors response:', { data, error });

      if (error) {
        console.error('MFA list factors error:', error);
        throw error;
      }

      if (!data) {
        console.error('Invalid MFA list factors response');
        return [];
      }

      console.log('MFA factors retrieved successfully');
      return data.totp || [];
    } catch (error) {
      console.error('Error getting 2FA factors:', error);
      throw error;
    }
  },

  // Disable 2FA
  async disable2FA() {
    try {
      console.log('Disabling 2FA in profile...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('Updating profile for user:', user.id);
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: null
        })
        .eq('id', user.id);

      console.log('Profile update response:', { error });

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      console.log('Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error disabling 2FA in profile:', error);
      throw error;
    }
  },

  // Disable Two Factor Authentication (for Supabase Auth)
  async disableTwoFactorAuth(factorId) {
    try {
      console.log('Disabling 2FA with Supabase Auth...');
      console.log('Unenrolling factor ID:', factorId);

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: factorId
      });

      console.log('MFA unenroll response:', { error });

      if (error) {
        console.error('MFA unenroll error:', error);
        throw error;
      }

      console.log('MFA factor unenrolled successfully');
      return { success: true };
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  },

  // Verify email
  async verifyEmail(token) {
    // This is handled automatically by Supabase when the user clicks the email link
    // You can add custom logic here if needed
  }
};
