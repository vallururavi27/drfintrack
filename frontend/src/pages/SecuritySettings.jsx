import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, LockClosedIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TwoFactorSetup from '../components/auth/TwoFactorSetup';
import api from '../services/api';

export default function SecuritySettings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showDisableTwoFactor, setShowDisableTwoFactor] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [loginHistory, setLoginHistory] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // For demo purposes, we'll use mock data
      const mockUser = {
        name: 'Dr. Ravi',
        email: 'demo@example.com',
        isEmailVerified: true,
        twoFactorEnabled: false,
        lastLogin: {
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.1',
          device: 'Desktop - Chrome',
          location: 'Mumbai, India'
        }
      };
      
      setUser(mockUser);
      
      // Mock login history
      setLoginHistory([
        {
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.1',
          device: 'Desktop - Chrome',
          location: 'Mumbai, India',
          successful: true
        },
        {
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          ipAddress: '192.168.1.1',
          device: 'Mobile - Safari',
          location: 'Mumbai, India',
          successful: true
        },
        {
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          ipAddress: '45.123.45.67',
          device: 'Unknown',
          location: 'New Delhi, India',
          successful: false
        }
      ]);
      
      // In a real app, you would fetch from API
      // const response = await api.get('/auth/me');
      // setUser(response.data.user);
      // const historyResponse = await api.get('/auth/login-history');
      // setLoginHistory(historyResponse.data.history);
    } catch (err) {
      setError('Failed to load user data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSetupComplete = () => {
    setShowTwoFactorSetup(false);
    setUser(prev => ({ ...prev, twoFactorEnabled: true }));
  };

  const handleDisableTwoFactor = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, you would call the API
      // await api.post('/auth/2fa/disable', { token: verificationCode, password });
      
      // For demo purposes
      if (verificationCode === '123456' && password === 'password') {
        setUser(prev => ({ ...prev, twoFactorEnabled: false }));
        setShowDisableTwoFactor(false);
        setVerificationCode('');
        setPassword('');
      } else {
        setError('Invalid verification code or password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
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
                {user?.isEmailVerified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Verified
                  </span>
                ) : (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mr-3">
                      Not Verified
                    </span>
                    <Button size="sm" variant="outline">
                      Resend Verification Email
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
                {user?.twoFactorEnabled ? (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mr-3">
                      Enabled
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline" 
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
                    {loginHistory.map((login, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(login.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {login.device}
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
