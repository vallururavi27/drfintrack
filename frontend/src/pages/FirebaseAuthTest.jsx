import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { signIn, signUp, logOut, resetPassword } from '../services/firebaseAuth';
import { testFirestoreConnection } from '../services/firebaseClient';
import Button from '../components/ui/Button';

export default function FirebaseAuthTest() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log('Current user:', currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const { user, error } = await signUp(email, password, name);
      
      if (error) {
        setMessage(`Error signing up: ${error}`);
      } else {
        setMessage(`User created successfully! Please check your email to verify your account.`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const { user, error } = await signIn(email, password);
      
      if (error) {
        setMessage(`Error signing in: ${error}`);
      } else {
        setMessage(`Signed in successfully as ${user.email}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await logOut();
      
      if (error) {
        setMessage(`Error signing out: ${error}`);
      } else {
        setMessage('Signed out successfully');
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setMessage(`Error sending reset email: ${error}`);
      } else {
        setMessage(`Password reset email sent to ${email}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const result = await testFirestoreConnection();
      
      if (result) {
        setConnectionStatus('connected');
        setMessage('Firestore connection successful!');
      } else {
        setConnectionStatus('error');
        setMessage('Firestore connection failed');
      }
    } catch (err) {
      setConnectionStatus('error');
      setMessage(`Error testing connection: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Firebase Authentication Test</h1>
          
          <div className="mb-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Current User</h2>
            {user ? (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Email: {user.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Name: {user.displayName || 'Not set'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Email verified: {user.emailVerified ? 'Yes' : 'No'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">UID: {user.uid}</p>
                <Button 
                  className="mt-4" 
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">No user signed in</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Test Firebase Connection</h2>
            <Button 
              onClick={handleTestConnection}
              disabled={isLoading}
              className="w-full"
            >
              Test Firestore Connection
            </Button>
            {connectionStatus === 'connected' && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">Connected to Firestore</p>
            )}
            {connectionStatus === 'error' && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">Failed to connect to Firestore</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sign Up</h2>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  Sign Up
                </Button>
              </form>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sign In</h2>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  Sign In
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Reset Password</h2>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                Send Reset Email
              </Button>
            </form>
          </div>

          {message && (
            <div className={`mt-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200' : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200'}`}>
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
