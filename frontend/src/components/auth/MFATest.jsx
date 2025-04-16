import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function MFATest() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testMFA = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing MFA enrollment...');
      
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
      
      // Try to enroll MFA
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });
      
      console.log('MFA enrollment response:', { data, error });
      
      if (error) {
        console.error('MFA enrollment error:', error);
        setError('MFA enrollment failed: ' + error.message);
        return;
      }
      
      setResult({
        id: data.id,
        secret: data.totp.secret,
        qrCode: data.totp.qr_code
      });
      
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
        
        <Button
          onClick={testMFA}
          disabled={isLoading}
          className="w-full mb-4"
        >
          {isLoading ? 'Testing...' : 'Test MFA Enrollment'}
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
