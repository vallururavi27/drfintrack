import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import TwoFactorVerification from '../components/auth/TwoFactorVerification';
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
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const navigate = useNavigate();

  // Check Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('error');
          setError('Unable to connect to authentication service. Please try again later.');
        } else {
          console.log('Supabase connection successful');
          setConnectionStatus('connected');

          // If user is already logged in, redirect to dashboard
          if (data.session) {
            console.log('User already has an active session, redirecting to dashboard');
            navigate('/');
          }
        }
      } catch (err) {
        console.error('Unexpected error checking connection:', err);
        setConnectionStatus('error');
        setError('Unable to connect to authentication service. Please try again later.');
      }
    };

    checkConnection();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check if connection is available
    if (connectionStatus === 'error') {
      setError('Cannot connect to authentication service. Please check your internet connection and try again.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting to login with Supabase:', { email });

      // Validate inputs
      if (!email || !password) {
        setError('Please enter both email and password');
        setIsLoading(false);
        return;
      }

      // Attempt to login via Supabase
      console.log('Calling Supabase auth.signInWithPassword with:', { email });

      try {
        // Try to login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('Supabase login response:', {
          success: !error,
          hasData: !!data,
          hasUser: data && !!data.user,
          hasSession: data && !!data.session,
          errorMessage: error ? error.message : null
        });

        if (error) {
          console.error('Login error details:', error);
          // Check if the error is due to email not being verified
          if (error.message.includes('Email not confirmed')) {
            setError('Please verify your email before logging in. Check your inbox for a verification link.');
            setIsEmailUnverified(true);
          } else {
            setIsEmailUnverified(false);
            setError(error.message || 'Invalid email or password');
          }
          setIsLoading(false);
          return;
        }

        if (!data || !data.user || !data.session) {
          console.error('Invalid response from Supabase:', data);
          setError('Login failed: Invalid response from server');
          setIsLoading(false);
          return;
        }

        // Check if 2FA is required
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('two_factor_enabled')
            .eq('id', data.user.id)
            .single();

          console.log('Profile data:', { profileData, profileError });

          if (profileError) {
            console.warn('Error fetching profile, proceeding without 2FA:', profileError);
          }

          if (profileData?.two_factor_enabled) {
            setRequires2FA(true);
            setTempCredentials({ email, password });
            setIsLoading(false);
            return;
          }
        } catch (profileErr) {
          console.warn('Error checking 2FA status, proceeding without 2FA:', profileErr);
        }

        // Store user session
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('email', data.user.email);
        localStorage.setItem('name', data.user.user_metadata?.name || data.user.email);

        console.log('Login successful, redirecting to dashboard');
        setIsLoading(false);
        navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handle2FAVerify = async (code) => {
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

      console.log('Authentication successful');

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

      // Store user session
      localStorage.setItem('token', data.session.access_token);
      localStorage.setItem('email', data.user.email);
      localStorage.setItem('name', data.user.user_metadata?.name || data.user.email);

      navigate('/');
    } catch (err) {
      console.error('2FA verification error:', err);
      throw new Error(err.message || 'Invalid verification code');
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
        <h1 className="text-center text-3xl font-bold text-primary-600 dark:text-primary-400 mt-4">dr<span className="text-secondary-600 dark:text-secondary-400">FinTrack</span></h1>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Personal Finance Management
        </p>
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

          {/* Connection status message */}
          {connectionStatus === 'error' && (
            <div className="mt-6 text-center text-sm text-red-600 dark:text-red-400">
              Unable to connect to authentication service. Please check your internet connection and try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
