import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const TestSupabase = () => {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Check if we can get the user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          setError(`User error: ${userError.message}`);
          return;
        }
        
        setUser(userData.user);
        
        if (!userData.user) {
          setStatus('Not logged in. Please log in to test the connection.');
          return;
        }
        
        // Test 2: Try a simple query
        const { data, error } = await supabase
          .from('bank_accounts')
          .select('id, name')
          .limit(1);
        
        if (error) {
          setError(`Query error: ${error.message}`);
          return;
        }
        
        setStatus(`Connection successful! Found ${data.length} bank accounts.`);
      } catch (err) {
        setError(`Unexpected error: ${err.message}`);
      }
    };
    
    testConnection();
  }, []);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Status:</h2>
        <p className={error ? 'text-red-600' : 'text-green-600'}>
          {error ? error : status}
        </p>
      </div>
      
      {user && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">User Info:</h2>
          <p>ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <p>Last Sign In: {new Date(user.last_sign_in_at).toLocaleString()}</p>
        </div>
      )}
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">API Key Info:</h2>
        <p>URL: {supabase.supabaseUrl}</p>
        <p>Key (first 10 chars): {supabase.supabaseKey?.substring(0, 10)}...</p>
      </div>
      
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Test
      </button>
    </div>
  );
};

export default TestSupabase;
