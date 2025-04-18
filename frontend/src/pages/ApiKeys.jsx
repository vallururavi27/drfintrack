import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabaseClient';
import { KeyIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    // Set the webhook URL to the deployed Vercel API endpoint
    setWebhookUrl('https://drfintrack.vercel.app/api/upi-webhook');

    // Fetch existing API keys
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    setIsLoading(true);

    try {
      // Generate a key
      const apiKey = `ft_${uuidv4().replace(/-/g, '')}`;

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      // Save to database
      const { data, error } = await supabase
        .from('api_keys')
        .insert([{
          user_id: userData.user.id,
          name: newKeyName,
          key: apiKey,
          permissions: ['upi_sync'],
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      // Update state
      fetchApiKeys();
      setNewKeyName('');

      // Show the key to the user
      alert(`Your new API key is: ${apiKey}\n\nPlease save this key as it won't be shown again.`);
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('Failed to generate API key');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleApiKeyStatus = async (keyId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: !currentStatus })
        .eq('id', keyId);

      if (error) throw error;

      // Update state
      fetchApiKeys();
    } catch (error) {
      console.error('Error updating API key:', error);
      alert('Failed to update API key');
    }
  };

  const deleteApiKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      // Update state
      fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">API Keys</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage API keys for integrating with external services like UPI transaction sync
        </p>
      </div>

      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">UPI Transaction Webhook</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Use this webhook URL to send UPI transactions from external services:
          </p>
          <div className="flex">
            <input
              type="text"
              value={webhookUrl}
              readOnly
              className="flex-1 px-3 py-2 border rounded-l bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(webhookUrl);
                alert('Webhook URL copied to clipboard');
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-r"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h4 className="font-medium mb-2">How to use with email forwarding:</h4>
          <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>Generate an API key below</li>
            <li>Set up email forwarding for Google Pay transaction emails</li>
            <li>Use a service like Zapier to parse emails and send data to the webhook</li>
            <li>Include your API key in the webhook request</li>
          </ol>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Generate New API Key</h2>
        <div className="flex">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="API Key Name (e.g., UPI Sync)"
            className="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={generateApiKey}
            disabled={isLoading || !newKeyName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Key'}
          </button>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Your API Keys</h2>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : apiKeys.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
            No API keys found. Generate your first key above.
          </p>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium">{key.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Created: {new Date(key.created_at).toLocaleString()}
                        {key.last_used_at && (
                          <> • Last used: {new Date(key.last_used_at).toLocaleString()}</>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {key.is_active ? (
                      <span className="flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded text-xs">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded text-xs">
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Inactive
                      </span>
                    )}
                    <button
                      onClick={() => toggleApiKeyStatus(key.id, key.is_active)}
                      className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {key.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteApiKey(key.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeys;
