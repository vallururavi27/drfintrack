import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
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
        return;
      }

      // Check if 2FA is required (you would need to implement this check)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('two_factor_enabled')
        .eq('id', data.user.id)
        .single();

      if (profileData?.two_factor_enabled) {
        setRequires2FA(true);
        setTempCredentials({ email, password });
      } else {
        // Store user session
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('email', data.user.email);
        localStorage.setItem('name', data.user.user_metadata?.name || data.user.email);
        setIsLoading(false);
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
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
          <img src="/profile_ravi.jpg" alt="Dr. Ravi" className="h-20 w-20 rounded-full" />
        </div>
        <h1 className="text-center text-3xl font-bold text-primary-600 dark:text-primary-400 mt-4">dr<span className="text-secondary-600 dark:text-secondary-400">FinTrack</span></h1>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
            create a new account
          </Link>
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <span className="sr-only">Sign in with Google</span>
                  <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                  </svg>
                </Button>
              </div>

              <div>
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <span className="sr-only">Sign in with Facebook</span>
                  <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
