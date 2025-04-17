import React, { useState, useEffect } from 'react';
import { testSupabaseConnection, testLogin, createTestUser } from '../utils/authTest';
import Button from '../components/ui/Button';

export default function AuthTest() {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const results = await testSupabaseConnection();
        setConnectionStatus(results.connection ? 'connected' : 'error');
        setConnectionDetails(results);
      } catch (err) {
        console.error('Error checking connection:', err);
        setConnectionStatus('error');
        setConnectionDetails({ error: err.message });
      }
    };

    checkConnection();
  }, []);

  const handleTestLogin = async () => {
    if (!email || !password) {
      setTestResults({ error: 'Please enter both email and password' });
      return;
    }

    setIsLoading(true);
    try {
      const results = await testLogin(email, password);
      setTestResults(results);
    } catch (err) {
      setTestResults({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!email || !password || !name) {
      setTestResults({ error: 'Please enter email, password, and name' });
      return;
    }

    setIsLoading(true);
    try {
      const results = await createTestUser(email, password, name);
      setTestResults(results);
    } catch (err) {
      setTestResults({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Supabase Authentication Test
        </h1>

        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Connection Status
          </h2>
          
          <div className="mb-4">
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${
                connectionStatus === 'checking' ? 'bg-yellow-500' :
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-700 dark:text-gray-300">
                {connectionStatus === 'checking' ? 'Checking connection...' :
                 connectionStatus === 'connected' ? 'Connected to Supabase' : 'Connection error'}
              </span>
            </div>
          </div>

          {connectionDetails && (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-200">
                {JSON.stringify(connectionDetails, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Test Login */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Login
          </h2>
          
          <div className="space-y-4 mb-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name (for registration)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Your Name"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button
              onClick={handleTestLogin}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Testing...' : 'Test Login'}
            </Button>
            
            <Button
              onClick={handleCreateUser}
              disabled={isLoading}
              variant="secondary"
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Test User'}
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test Results
            </h2>
            
            <div className={`p-4 rounded mb-4 ${
              testResults.error ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'
            }`}>
              <p className={`text-sm ${
                testResults.error ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'
              }`}>
                {testResults.error ? testResults.error : 'Test completed successfully'}
              </p>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-200">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
