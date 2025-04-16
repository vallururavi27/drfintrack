import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function TwoFactorVerification({ onVerify, onCancel }) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isUsingBackupCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onVerify(code);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
      setIsLoading(false);
    }
  };

  const toggleCodeType = () => {
    setCode('');
    setIsUsingBackupCode(!isUsingBackupCode);
    setError('');
  };

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900">
          <ShieldCheckIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {isUsingBackupCode 
            ? 'Enter one of your backup codes to continue' 
            : 'Enter the verification code from your authenticator app'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input w-full text-center text-lg tracking-wider"
              placeholder={isUsingBackupCode ? 'XXXX-XXXX-XXXX' : '000000'}
              maxLength={isUsingBackupCode ? 14 : 6}
              pattern={isUsingBackupCode ? '[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}' : '[0-9]{6}'}
              autoComplete="one-time-code"
              required
            />
            {isUsingBackupCode && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Format: XXXX-XXXX-XXXX
              </p>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="mt-5">
            <Button
              type="submit"
              disabled={isLoading || (isUsingBackupCode ? code.length !== 14 : code.length !== 6)}
              className="w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </form>

        <div className="mt-4">
          <button
            type="button"
            onClick={toggleCodeType}
            className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {isUsingBackupCode 
              ? 'Use authenticator app instead' 
              : 'Use a backup code instead'}
          </button>
        </div>

        {onCancel && (
          <div className="mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
