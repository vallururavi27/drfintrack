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

  const handleSetup = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Generate backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);

      // Set up 2FA with Supabase
      const { data, error } = await authService.setupTwoFactorAuth();

      if (error) throw error;

      setSecret(data.secret);
      setQrCode(data.qr);
      setFactorId(data.id);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to setup 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!verificationCode || verificationCode.length !== 6) {
        throw new Error('Please enter a valid 6-digit code');
      }

      // Verify the code with Supabase
      const { data, error } = await authService.verifyTwoFactorAuth(factorId, verificationCode);

      if (error) throw error;

      // Save backup codes to user profile
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: true,
          backup_codes: backupCodes
        })
        .eq('id', userData.user.id);

      if (updateError) throw updateError;

      setStep(3);
    } catch (err) {
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
                onClick={handleSetup}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Setting up...' : 'Set up 2FA'}
              </Button>
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
