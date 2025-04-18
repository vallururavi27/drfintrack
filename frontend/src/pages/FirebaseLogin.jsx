import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import { signIn, resetPassword } from '../services/firebaseAuth';
import { auth } from '../services/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailUnverified, setIsEmailUnverified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const navigate = useNavigate();

  // Check Firebase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Testing Firebase connection...');
        
        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log('User already logged in, redirecting to dashboard');
            navigate('/');
          } else {
            console.log('No user logged in');
            setConnectionStatus('connected');
          }
        }, (error) => {
          console.error('Firebase auth error:', error);
          setConnectionStatus('error');
          setError('Unable to connect to authentication service. Please try again later.');
        });
        
        // Clean up the listener
        return () => unsubscribe();
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
      console.log('Attempting to login with Firebase:', { email });

      // Validate inputs
      if (!email || !password) {
        setError('Please enter both email and password');
        setIsLoading(false);
        return;
      }

      // Attempt to login via Firebase
      const { user, error } = await signIn(email, password);

      if (error) {
        console.error('Login error details:', error);
        
        // Handle specific Firebase error codes
        if (error.includes('auth/email-not-verified') || 
            (user && !user.emailVerified)) {
          setError('Please verify your email before logging in. Check your inbox for a verification link.');
          setIsEmailUnverified(true);
        } else if (error.includes('auth/user-not-found') || 
                  error.includes('auth/wrong-password')) {
          setIsEmailUnverified(false);
          setError('Invalid email or password');
        } else {
          setIsEmailUnverified(false);
          setError(error);
        }
        
        setIsLoading(false);
        return;
      }

      if (!user) {
        console.error('Invalid response from Firebase Auth');
        setError('Login failed: Invalid response from server');
        setIsLoading(false);
        return;
      }

      // Store user session
      localStorage.setItem('token', await user.getIdToken());
      localStorage.setItem('email', user.email);
      localStorage.setItem('name', user.displayName || user.email);

      console.log('Login successful, redirecting to dashboard');
      setIsLoading(false);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendingEmail(true);
      // Get current user
      const user = auth.currentUser;
      
      if (user) {
        await user.sendEmailVerification();
        setError('Verification email resent. Please check your inbox.');
      } else {
        // Try to sign in first to get the user
        const { user: signedInUser, error } = await signIn(email, password);
        
        if (error) {
          throw new Error(error);
        }
        
        if (signedInUser) {
          await signedInUser.sendEmailVerification();
          setError('Verification email resent. Please check your inbox.');
        } else {
          throw new Error('Could not send verification email. Please try again.');
        }
      }
    } catch (err) {
      setError(`Failed to resend verification email: ${err.message}`);
    } finally {
      setResendingEmail(false);
    }
  };

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
                        onClick={handleResendVerification}
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
