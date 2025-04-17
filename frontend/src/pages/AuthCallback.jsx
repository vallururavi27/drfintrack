import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Process the OAuth callback
        const user = await authService.handleOAuthCallback();
        
        if (user) {
          // Redirect to dashboard on successful login
          navigate('/');
        } else {
          // If no user was found, redirect to login
          navigate('/login');
        }
      } catch (err) {
        console.error('Error handling OAuth callback:', err);
        setError(err.message || 'Authentication failed');
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">
            {error ? 'Authentication Error' : 'Completing Authentication...'}
          </h2>
          {error ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Please wait while we complete your sign-in process.
            </p>
          )}
          <div className="mt-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
          {error && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Redirecting to login page...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
