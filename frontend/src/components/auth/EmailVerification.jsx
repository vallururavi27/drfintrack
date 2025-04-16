import React, { useState } from 'react';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Card from '../ui/Card';
import api from '../../services/api';

export default function EmailVerification({ onVerificationSent }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResendVerification = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/auth/resend-verification');
      setMessage(response.data.message || 'Verification email sent successfully');
      if (onVerificationSent) {
        onVerificationSent();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900">
          <EnvelopeIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Verify Your Email</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please check your email inbox for a verification link. If you didn't receive an email, you can request a new one.
        </p>
      </div>

      {message && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded-md flex items-start">
          <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-200">{message}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="mt-5">
        <Button
          onClick={handleResendVerification}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Sending...' : 'Resend Verification Email'}
        </Button>
      </div>
    </Card>
  );
}
