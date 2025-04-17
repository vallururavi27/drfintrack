import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  const navigate = useNavigate();

  // Automatically redirect to login immediately
  useEffect(() => {
    // Redirect immediately to login page
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Page Not Found</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            The page you're looking for doesn't exist or you don't have permission to access it.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Redirecting to login page in a few seconds...
          </p>
          <div className="mt-5">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
