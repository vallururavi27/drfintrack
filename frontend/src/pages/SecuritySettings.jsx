import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheckIcon, LockClosedIcon, EnvelopeIcon, DevicePhoneMobileIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TwoFactorSetup from '../components/auth/TwoFactorSetup';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';

export default function SecuritySettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showDisableTwoFactor, setShowDisableTwoFactor] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Get current user and profile
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return {
        ...user,
        ...profile,
        isEmailVerified: user.email_confirmed_at !== null
      };
    }
  });

  // Get login history
  const {
    data: loginHistory = [],
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['loginHistory'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userData
  });

  // Get 2FA factors
  const {
    data: twoFactorData,
    isLoading: isLoadingTwoFactor,
    refetch: refetchTwoFactor
  } = useQuery({
    queryKey: ['twoFactorStatus'],
    queryFn: async () => {
      const factors = await authService.getTwoFactorFactors();
      return {
        enabled: factors.some(f => f.factor_type === 'totp' && f.status === 'verified'),
        factors
      };
    },
    enabled: !!userData
  });

  // Disable 2FA mutation
  const disableTwoFactorMutation = useMutation({
    mutationFn: async ({ verificationCode, password }) => {
      // First verify the current password
      await authService.signIn(userData.email, password);

      // Then verify the 2FA code
      const totpFactor = twoFactorData.factors.find(f => f.factor_type === 'totp');
      if (!totpFactor) throw new Error('No 2FA factor found');

      const verifyResult = await authService.verifyTwoFactorAuth(totpFactor.id, verificationCode);
      if (!verifyResult.isValid) throw new Error('Invalid verification code');

      // Finally disable 2FA
      return authService.disableTwoFactorAuth(totpFactor.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setShowDisableTwoFactor(false);
      setVerificationCode('');
      setPassword('');
      setError('');
    },
    onError: (error) => {
      setError(error.message || 'Failed to disable two-factor authentication');
    }
  });

  // Resend verification email mutation
  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      return supabase.auth.resend({
        type: 'signup',
        email: userData.email
      });
    },
    onSuccess: () => {
      alert('Verification email sent. Please check your inbox.');
    },
    onError: (error) => {
      setError(error.message || 'Failed to resend verification email');
    }
  });

  const handleTwoFactorSetupComplete = () => {
    setShowTwoFactorSetup(false);
    refetchTwoFactor();
    refetchUser();
  };

  const handleDisableTwoFactor = async (e) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    disableTwoFactorMutation.mutate({ verificationCode, password });
  };

  const isLoading = isLoadingUser || isLoadingHistory || isLoadingTwoFactor || disableTwoFactorMutation.isPending || resendVerificationMutation.isPending;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoadingUser && !userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center text-red-700 dark:text-red-400 p-4">
            <span>Error loading user data: {userError.message}</span>
            <Button onClick={refetchUser} size="sm" className="ml-auto">
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h1>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900 p-4">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Email Verification */}
        <Card>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <EnvelopeIcon className="h-6 w-6 text-primary-500" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Verification</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Verify your email address to secure your account and receive important notifications.
              </p>
              <div className="mt-3">
                {userData?.isEmailVerified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Verified
                  </span>
                ) : (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mr-3">
                      Not Verified
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resendVerificationMutation.mutate()}
                      disabled={resendVerificationMutation.isPending}
                    >
                      {resendVerificationMutation.isPending ? 'Sending...' : 'Resend Verification Email'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <DevicePhoneMobileIcon className="h-6 w-6 text-primary-500" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add an extra layer of security to your account by requiring a verification code in addition to your password.
              </p>
              <div className="mt-3">
                {isLoadingTwoFactor ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                  </div>
                ) : twoFactorData?.enabled ? (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mr-3">
                      Enabled
                    </span>
                    <Button
                      size="sm"
                      variant="danger-outline"
                      onClick={() => setShowDisableTwoFactor(true)}
                    >
                      Disable
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 mr-3">
                      Disabled
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setShowTwoFactorSetup(true)}
                    >
                      Enable
                    </Button>
                  </div>
                )}
              </div>

              {showTwoFactorSetup && (
                <div className="mt-6">
                  <TwoFactorSetup onSetupComplete={handleTwoFactorSetupComplete} />
                </div>
              )}

              {showDisableTwoFactor && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Disable Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    To disable two-factor authentication, please enter your password and a verification code from your authenticator app.
                  </p>
                  <form onSubmit={handleDisableTwoFactor} className="space-y-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input mt-1 w-full"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="input mt-1 w-full"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowDisableTwoFactor(false);
                          setVerificationCode('');
                          setPassword('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading || !password || verificationCode.length !== 6}
                      >
                        {isLoading ? 'Disabling...' : 'Disable 2FA'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Password Security */}
        <Card>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <LockClosedIcon className="h-6 w-6 text-primary-500" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Password</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ensure your account is using a strong, unique password.
              </p>
              <div className="mt-3">
                <Button size="sm" variant="outline">
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Login History */}
        <Card>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-6 w-6 text-primary-500" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Login History</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Review recent login activity for your account.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Device
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {isLoadingHistory ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500 mr-2"></div>
                            <span>Loading login history...</span>
                          </div>
                        </td>
                      </tr>
                    ) : loginHistory.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No login history available
                        </td>
                      </tr>
                    ) : loginHistory.map((login, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(login.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {login.user_agent || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {login.location || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {login.successful ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Successful
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
