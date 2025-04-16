import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { supabase } from '../services/supabaseClient';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setIsLoading(false);
        setError('Invalid verification link. No token provided.');
        return;
      }

      try {
        // Verify the token with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type || 'signup',
        });

        if (error) {
          throw error;
        }

        setIsVerified(true);
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.message || 'Failed to verify email');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, type]);

  const handleResendVerification = async (e) => {
    e.preventDefault();

    if (!email) {
      setResendMessage('Please enter your email address.');
      return;
    }

    try {
      setResendingEmail(true);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      setResendMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendMessage(`Failed to resend verification email: ${error.message}`);
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        {isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your email...</p>
          </div>
        ) : isVerified ? (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Email Verified Successfully</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your email has been verified. You can now access all features of the application.
            </p>
            <div className="mt-5">
              <Button onClick={() => navigate('/login')} className="w-full">
                Continue to Login
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
              <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Verification Failed</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {error || 'There was a problem verifying your email. The link may have expired or is invalid.'}
            </p>

            {!showResendForm ? (
              <div className="mt-5 space-y-3">
                <Button
                  onClick={() => setShowResendForm(true)}
                  variant="secondary"
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Return to Login
                </Button>
              </div>
            ) : (
              <div className="mt-5">
                <form onSubmit={handleResendVerification} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input pl-10 w-full"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {resendMessage && (
                    <div className="rounded-md bg-blue-50 dark:bg-blue-900 p-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300">{resendMessage}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={resendingEmail}
                    >
                      {resendingEmail ? 'Sending...' : 'Send'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowResendForm(false);
                        setResendMessage('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
