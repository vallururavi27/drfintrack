import React, { useState, useEffect } from 'react';
import { testSupabaseConnection } from '../../utils/testSupabaseConnection';
import Button from '../ui/Button';

export default function ConnectionTest() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    try {
      const testResults = await testSupabaseConnection();
      setResults(testResults);
      console.log('Test results:', testResults);
    } catch (error) {
      console.error('Error running test:', error);
      setResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Run the test automatically when the component mounts
    runTest();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Supabase Connection Test</h2>
        <Button
          size="sm"
          onClick={runTest}
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Run Test Again'}
        </Button>
      </div>

      {results ? (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Connection</p>
              <div className="flex items-center mt-1">
                <span className={`h-3 w-3 rounded-full mr-2 ${results.connection ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {results.connection ? 'Connected' : 'Failed'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Authentication</p>
              <div className="flex items-center mt-1">
                <span className={`h-3 w-3 rounded-full mr-2 ${results.auth ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {results.auth ? 'Authenticated' : 'Not Authenticated'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Database Access</p>
              <div className="flex items-center mt-1">
                <span className={`h-3 w-3 rounded-full mr-2 ${results.database ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {results.database ? 'Success' : 'Failed'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Accounts Table</p>
              <div className="flex items-center mt-1">
                <span className={`h-3 w-3 rounded-full mr-2 ${results.bankAccounts ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {results.bankAccounts ? 'Success' : 'Failed'}
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
          <span className="ml-2 text-gray-600 dark:text-gray-300">Testing connection...</span>
        </div>
      ) : null}
    </div>
  );
}
