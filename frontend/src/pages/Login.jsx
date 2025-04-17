import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import TwoFactorVerification from '../components/auth/TwoFactorVerification';
import api from '../services/api';
import { supabase } from '../services/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempCredentials, setTempCredentials] = useState(null);
  const [isEmailUnverified, setIsEmailUnverified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const navigate = useNavigate();

  // Check if we're already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If we're already logged in, redirect to home
      window.location.href = '/';
    }
  }, []);

  // Add a fallback login method for demo purposes
  const handleDemoLogin = () => {
    setIsLoading(true);
    setEmail('demo@example.com');
    setPassword('password123');

    // Set a timeout to submit the form after the state updates
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting to login with Supabase:', { email });

      // Attempt to login via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase login response:', { data, error });

      if (error) {
        // Check if the error is due to email not being verified
        if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email before logging in. Check your inbox for a verification link.');
          setIsEmailUnverified(true);
        } else {
          setIsEmailUnverified(false);
          throw error;
        }
        setIsLoading(false);
        return;
      }

      if (!data || !data.user) {
        console.error('Login successful but no user data returned');
        setError('Login failed: No user data returned');
        setIsLoading(false);
        return;
      }

      console.log('User authenticated successfully:', data.user);

      // Check if 2FA is required
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('two_factor_enabled')
          .eq('id', data.user.id)
          .single();

        console.log('Profile data:', { profileData, profileError });

        if (profileError) {
          console.warn('Error fetching profile data:', profileError);
          // Continue with login even if profile fetch fails
        }

        if (profileData?.two_factor_enabled) {
          setRequires2FA(true);
          setTempCredentials({ email, password });
          setIsLoading(false);
          return;
        }
      } catch (profileErr) {
        console.error('Error checking 2FA status:', profileErr);
        // Continue with login even if 2FA check fails
      }

      // Store user session
      try {
        if (data.session && data.session.access_token) {
          localStorage.setItem('token', data.session.access_token);
          localStorage.setItem('email', data.user.email);
          localStorage.setItem('name', data.user.user_metadata?.name || data.user.email);

          // Special handling for demo user
          if (data.user.email === 'demo@example.com') {
            console.log('Demo user detected, setting special flag');
            localStorage.setItem('allowDemoUser', 'true');
          }

          console.log('User session stored successfully');

          // Force a page reload to ensure the app recognizes the new auth state
          window.location.href = '/';
        } else {
          throw new Error('No session data available');
        }
      } catch (storageErr) {
        console.error('Error storing session data:', storageErr);
        setError('Login successful but failed to store session. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  const handle2FAVerify = async (code) => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Verifying 2FA code...');

      // First authenticate with email/password
      console.log('Re-authenticating with email/password...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: tempCredentials.email,
        password: tempCredentials.password,
      });

      if (error) {
        console.error('Authentication error:', error);
        throw error;
      }

      if (!data || !data.user) {
        console.error('Authentication successful but no user data returned');
        throw new Error('Authentication failed: No user data returned');
      }

      console.log('Authentication successful');

      // Get MFA factors
      console.log('Getting MFA factors...');
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        console.error('Error getting MFA factors:', factorsError);
        throw factorsError;
      }

      if (!factorsData) {
        console.error('No MFA factors data returned');
        throw new Error('Failed to retrieve MFA factors');
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

      // Store user session
      try {
        if (data.session && data.session.access_token) {
          localStorage.setItem('token', data.session.access_token);
          localStorage.setItem('email', data.user.email);
          localStorage.setItem('name', data.user.user_metadata?.name || data.user.email);

          // Special handling for demo user
          if (data.user.email === 'demo@example.com') {
            console.log('Demo user detected after 2FA, setting special flag');
            localStorage.setItem('allowDemoUser', 'true');
          }

          console.log('User session stored successfully after 2FA');

          // Force a page reload to ensure the app recognizes the new auth state
          window.location.href = '/';
        } else {
          throw new Error('No session data available after 2FA');
        }
      } catch (storageErr) {
        console.error('Error storing session data after 2FA:', storageErr);
        throw new Error('2FA verification successful but failed to store session');
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err.message || 'Invalid verification code');
      setIsLoading(false);
      setRequires2FA(false); // Go back to login form
      return false;
    }
  };

  const handleCancel2FA = () => {
    setRequires2FA(false);
    setTempCredentials(null);
  };

  if (requires2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <TwoFactorVerification
          onVerify={handle2FAVerify}
          onCancel={handleCancel2FA}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <UserCircleIcon className="h-12 w-12 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-center text-3xl font-bold text-primary-600 dark:text-primary-400 mt-4">dr<span className="text-secondary-600 dark:text-secondary-400">FinTrack</span></h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Sign in to your account</h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
                <div className="flex flex-col">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                  </div>
                  {isEmailUnverified && (
                    <div className="mt-3 ml-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={resendingEmail}
                        onClick={async () => {
                          try {
                            setResendingEmail(true);
                            const { error } = await supabase.auth.resend({
                              type: 'signup',
                              email: email,
                            });
                            if (error) throw error;
                            setError('Verification email resent. Please check your inbox.');
                          } catch (err) {
                            setError(`Failed to resend verification email: ${err.message}`);
                          } finally {
                            setResendingEmail(false);
                          }
                        }}
                      >
                        {resendingEmail ? 'Sending...' : 'Resend verification email'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/register" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Create a new account
            </Link>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Use demo account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


