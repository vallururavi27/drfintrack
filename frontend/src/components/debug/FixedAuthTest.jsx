import React, { useState } from 'react';
import { testFixedConnection, createDemoUserFixed, testSignInFixed } from '../../utils/supabaseFixedTest';

export default function FixedAuthTest() {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    try {
      const result = await testFixedConnection();
      setResults(prev => ({ ...prev, connection: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, connection: { success: false, error } }));
    } finally {
      setIsLoading(false);
    }
  };

  const runCreateDemoUser = async () => {
    setIsLoading(true);
    try {
      const result = await createDemoUserFixed();
      setResults(prev => ({ ...prev, createDemoUser: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, createDemoUser: { success: false, error } }));
    } finally {
      setIsLoading(false);
    }
  };

  const runSignInTest = async () => {
    setIsLoading(true);
    try {
      const result = await testSignInFixed();
      setResults(prev => ({ ...prev, signIn: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, signIn: { success: false, error } }));
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    await runConnectionTest();
    await runCreateDemoUser();
    await runSignInTest();
    setIsLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6 border-2 border-green-500">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Fixed Supabase Authentication Test</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        This test uses explicit API key headers to fix the "No API key found in request" error.
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={runConnectionTest}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Connection
        </button>
        
        <button
          onClick={runCreateDemoUser}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Create Demo User
        </button>
        
        <button
          onClick={runSignInTest}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Sign In
        </button>
        
        <button
          onClick={runAllTests}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Run All Tests
        </button>
      </div>
      
      {isLoading && <div className="text-gray-600 dark:text-gray-400 mb-4">Running tests...</div>}
      
      {Object.entries(results).length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Test Results:</h3>
          
          <div className="space-y-4">
            {Object.entries(results).map(([testName, result]) => (
              <div key={testName} className={`p-3 rounded ${result.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <h4 className="font-medium mb-1">{testName}: {result.success ? 'Success' : 'Failed'}</h4>
                
                {result.success ? (
                  <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-40">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                ) : (
                  <div className="text-red-700 dark:text-red-300">
                    <p>Error: {result.error?.message || JSON.stringify(result.error)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
