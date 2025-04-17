import React, { useState } from 'react';
import { testSupabaseAuth } from '../../utils/testSupabaseAuth';
import Button from '../ui/Button';

export default function AuthTest() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    try {
      const testResults = await testSupabaseAuth();
      setResults(testResults);
      console.log('Auth test results:', testResults);
    } catch (error) {
      console.error('Error running auth test:', error);
      setResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Supabase Authentication Test</h2>
        <Button
          size="sm"
          onClick={runTest}
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Run Test'}
        </Button>
      </div>

      {results ? (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Client Initialized</p>
              <div className="flex items-center mt-1">
                <span className={`h-3 w-3 rounded-full mr-2 ${results.clientInitialized ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {results.clientInitialized ? 'Success' : 'Failed'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sign In Attempted</p>
              <div className="flex items-center mt-1">
                <span className={`h-3 w-3 rounded-full mr-2 ${results.signInAttempted ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {results.signInAttempted ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sign In Successful</p>
              <div className="flex items-center mt-1">
                <span className={`h-3 w-3 rounded-full mr-2 ${results.signInSuccessful ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {results.signInSuccessful ? 'Success' : 'Failed'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User Data</p>
              <div className="flex items-center mt-1">
                <span className={`h-3 w-3 rounded-full mr-2 ${results.userData ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {results.userData ? 'Available' : 'Not Available'}
                </p>
              </div>
            </div>
          </div>

          {results.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg mb-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Error:</p>
              <p className="text-sm text-red-700 dark:text-red-300">{results.error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {showDetails && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Testing authentication...</span>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          Click "Run Test" to check Supabase authentication
        </div>
      )}
    </div>
  );
}
