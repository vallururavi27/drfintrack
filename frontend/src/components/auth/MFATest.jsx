import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { authService } from '../../services/authService';

export default function MFATest() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const [method, setMethod] = useState('direct'); // 'direct' or 'service'

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setAuthStatus({
          isAuthenticated: !!data?.user,
          user: data?.user
        });
      } catch (err) {
        console.error('Error checking auth status:', err);
        setAuthStatus({
          isAuthenticated: false,
          error: err.message
        });
      }
    };

    checkAuth();
  }, []);

  const testMFA = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`Testing MFA enrollment using ${method} method...`);

      // Check if user is authenticated
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error getting user:', userError);
        setError('Authentication error: ' + userError.message);
        return;
      }

      if (!userData?.user) {
        console.error('No user found');
        setError('User not authenticated');
        return;
      }

      console.log('User authenticated:', userData.user);

      if (method === 'direct') {
        // Try to enroll MFA directly
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp'
        });

        console.log('MFA enrollment response:', { data, error });

        if (error) {
          console.error('MFA enrollment error:', error);
          setError('MFA enrollment failed: ' + error.message);
          return;
        }

        if (!data || !data.totp) {
          setError('Invalid response from server - missing TOTP data');
          return;
        }

        setResult({
          id: data.id,
          secret: data.totp.secret,
          qrCode: data.totp.qr_code
        });
      } else {
        // Try to enroll MFA using authService
        const result = await authService.setupTwoFactorAuth();
        console.log('MFA enrollment via authService response:', result);

        if (!result || !result.id) {
          setError('Invalid response from authService');
          return;
        }

        setResult({
          id: result.id,
          secret: result.secret,
          qrCode: result.qr
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Unexpected error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">MFA Test Component</h2>

        {/* Authentication Status */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-left">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Authentication Status</h3>
          {!authStatus ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Checking authentication status...</p>
          ) : authStatus.isAuthenticated ? (
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ Authenticated as {authStatus.user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                User ID: {authStatus.user.id}
              </p>
            </div>
          ) : (
            <p className="text-sm text-red-600 dark:text-red-400">
              ✗ Not authenticated: {authStatus.error || 'Please log in'}
            </p>
          )}
        </div>

        {/* Method Selection */}
        <div className="mb-4">
          <div className="flex justify-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="method"
                value="direct"
                checked={method === 'direct'}
                onChange={() => setMethod('direct')}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Direct API</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="method"
                value="service"
                checked={method === 'service'}
                onChange={() => setMethod('service')}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auth Service</span>
            </label>
          </div>
        </div>

        <Button
          onClick={testMFA}
          disabled={isLoading || !authStatus?.isAuthenticated}
          className="w-full mb-4"
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></span>
              Testing...
            </>
          ) : (
            `Test MFA Enrollment (${method === 'direct' ? 'Direct API' : 'Auth Service'})`
          )}
        </Button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Success!</h3>

            <div className="bg-white p-4 rounded-md mx-auto w-48 h-48 flex items-center justify-center mb-4">
              {result.qrCode ? (
                <img src={result.qrCode} alt="QR Code" className="w-full h-full" />
              ) : (
                <div className="text-gray-400">No QR code</div>
              )}
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md text-sm font-mono text-gray-800 dark:text-gray-200">
              {result.secret}
            </div>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Factor ID: {result.id}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
