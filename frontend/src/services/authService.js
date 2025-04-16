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
    }

    return data.user;
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser() {
    return supabase.auth.getUser().then(({ data }) => data.user);
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

  // Disable 2FA
  async disable2FA() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        backup_codes: null
      })
      .eq('id', user.id);

    if (error) throw error;
  },

  // Verify email
  async verifyEmail(token) {
    // This is handled automatically by Supabase when the user clicks the email link
    // You can add custom logic here if needed
  }
};
