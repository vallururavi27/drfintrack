import React, { useState, useEffect } from 'react';
import { QrCodeIcon, ShieldCheckIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { authService } from '../../services/authService';
import { supabase } from '../../services/supabaseClient';

export default function TwoFactorSetup({ onSetupComplete }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState('');
  const [factorId, setFactorId] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // Generate backup codes
  const generateBackupCodes = () => {
    const codes = [];
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < 10; i++) {
      let code = '';
      for (let j = 0; j < 10; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Format as XXXXX-XXXXX
      codes.push(code.substring(0, 5) + '-' + code.substring(5, 10));
    }

    return codes;
  };

  useEffect(() => {
    // Check if the button is visible and log it
    console.log('TwoFactorSetup component mounted');

    // Test Supabase connection
    const testSupabase = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.auth.getSession();
        console.log('Supabase session test:', { data, error });
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
      }
    };

    testSupabase();
  }, []);

  const handleSetup = async () => {
    console.log('Setup button clicked');
    setIsLoading(true);
    setError('');

    try {
      console.log('Starting 2FA setup...');

      // Generate backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);
      console.log('Generated backup codes');

      // Check if user is authenticated
      try {
        const { data, error } = await supabase.auth.getUser();
        console.log('Current user response:', { data, error });

        if (error) {
          console.error('Error getting user:', error);
          throw error;
        }

        if (!data?.user) {
          console.error('No user found in response');
          throw new Error('User not authenticated');
        }

        console.log('Current user:', data.user);
      } catch (userError) {
        console.error('Error checking authentication:', userError);
        throw new Error('Failed to verify authentication: ' + userError.message);
      }

      // Set up 2FA with Supabase
      console.log('Calling setupTwoFactorAuth...');
      try {
        // Try direct Supabase MFA API call first to test if it's working
        console.log('Testing direct Supabase MFA API call...');
        try {
          const { data: directData, error: directError } = await supabase.auth.mfa.enroll({
            factorType: 'totp'
          });
          console.log('Direct MFA API call result:', { data: directData, error: directError });

          if (directError) {
            console.error('Direct MFA API call error:', directError);
          } else if (directData) {
            console.log('Direct MFA API call successful');
            // Use the direct result
            setSecret(directData.totp.secret);
            setQrCode(directData.totp.qr_code);
            setFactorId(directData.id);
            setStep(2);
            console.log('2FA setup successful using direct API call, moved to step 2');
            return; // Exit early since we succeeded
          }
        } catch (directCallError) {
          console.error('Error in direct MFA API call:', directCallError);
        }

        // Fall back to using authService if direct call fails
        console.log('Falling back to authService.setupTwoFactorAuth()...');
        const result = await authService.setupTwoFactorAuth();
        console.log('Setup 2FA result from authService:', result);

        if (!result || !result.id) {
          throw new Error('Failed to setup 2FA: Invalid response from server');
        }

        setSecret(result.secret);
        setQrCode(result.qr);
        setFactorId(result.id);
        setStep(2);
        console.log('2FA setup successful, moved to step 2');
      } catch (setupError) {
        console.error('Error in setupTwoFactorAuth:', setupError);
        throw setupError;
      }
    } catch (err) {
      console.error('2FA setup error:', err);

      // Create a detailed error message
      let errorMessage = 'Failed to setup 2FA';

      if (err.message) {
        errorMessage += ': ' + err.message;
      }

      if (err.stack) {
        console.error('Error stack:', err.stack);
      }

      // Check if it's a network error
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error: Please check your internet connection';
      }

      // Check if it's a CORS error
      if (err.name === 'TypeError' && err.message.includes('CORS')) {
        errorMessage = 'CORS error: The server blocked the request';
      }

      // Check if it's a permission error
      if (err.message && err.message.includes('permission')) {
        errorMessage = 'Permission error: You do not have permission to perform this action';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Starting 2FA verification...');

      if (!verificationCode || verificationCode.length !== 6) {
        throw new Error('Please enter a valid 6-digit code');
      }

      console.log('Verifying code for factor ID:', factorId);
      // Verify the code with Supabase
      const result = await authService.verifyTwoFactorAuth(factorId, verificationCode);
      console.log('Verification result:', result);

      if (!result || !result.isValid) {
        throw new Error('Invalid verification code');
      }

      // Save backup codes to user profile
      console.log('Getting current user...');
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');

      console.log('Saving backup codes to profile...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: true,
          backup_codes: backupCodes
        })
        .eq('id', userData.user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log('2FA verification successful, moving to step 3');
      setStep(3);
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err.message || 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleComplete = () => {
    if (onSetupComplete) {
      onSetupComplete();
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900">
          <ShieldCheckIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h2>

        {step === 1 && (
          <div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Enhance your account security by enabling two-factor authentication.
            </p>
            <div className="mt-5">
              <Button
                onClick={() => {
                  console.log('Button clicked directly');
                  handleSetup();
                }}
                disabled={isLoading}
                className="w-full"
                type="button"
              >
                {isLoading ? 'Setting up...' : 'Set up 2FA'}
              </Button>
              <div className="mt-2">
                <button
                  onClick={() => {
                    console.log('Plain button clicked');
                    handleSetup();
                  }}
                  disabled={isLoading}
                  className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  type="button"
                >
                  Try alternate setup
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Scan this QR code with your authenticator app or enter the code manually.
            </p>

            <div className="bg-white p-4 rounded-md mx-auto w-48 h-48 flex items-center justify-center">
              {qrCode ? (
                <img src={qrCode} alt="QR Code" className="w-full h-full" />
              ) : (
                <QrCodeIcon className="h-12 w-12 text-gray-300" />
              )}
            </div>

            <div className="mt-4 flex items-center justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md text-sm font-mono text-gray-800 dark:text-gray-200 flex-1">
                {secret}
              </div>
              <button
                onClick={handleCopySecret}
                className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Copy to clipboard"
              >
                {copied ? (
                  <CheckIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <ClipboardDocumentIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <form onSubmit={handleVerify} className="mt-6">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="input mt-1 w-full"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 rounded-md">
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="mt-5">
                <Button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Two-factor authentication has been enabled successfully. Save these backup codes in a secure place.
            </p>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-left">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Backup Codes</h3>
                <button
                  onClick={handleCopyBackupCodes}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Copy to clipboard"
                >
                  {copiedBackup ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-xs text-gray-800 dark:text-gray-200">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-sm text-yellow-600 dark:text-yellow-400">
              Important: Each backup code can only be used once. Store them securely.
            </p>

            <div className="mt-5">
              <Button
                onClick={handleComplete}
                className="w-full"
              >
                Complete Setup
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
