import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  UserCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TwoFactorSetup from '../components/auth/TwoFactorSetup';
import { authService } from '../services/authService';
import { supabase } from '../services/supabaseClient';

export default function Profile() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar_url: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get user profile
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return { ...user, ...data };
    }
  });

  // Get 2FA status
  const {
    data: twoFactorStatus,
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
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await authService.updateProfile(data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(`Failed to update profile: ${error.message}`);
    }
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      // First verify the current password
      await authService.signIn(profile.email, currentPassword);
      // Then update the password
      return authService.updatePassword(newPassword);
    },
    onSuccess: () => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccessMessage('Password updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(`Failed to update password: ${error.message}`);
    }
  });

  // Disable 2FA mutation
  const disableTwoFactorMutation = useMutation({
    mutationFn: async (factorId) => {
      return authService.disableTwoFactorAuth(factorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] });
      setSuccessMessage('Two-factor authentication disabled');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(`Failed to disable two-factor authentication: ${error.message}`);
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.user_metadata?.name || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      name: formData.name,
      avatar_url: formData.avatar_url
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    updatePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const handleTwoFactorSetupComplete = () => {
    setShowTwoFactorSetup(false);
    refetchTwoFactor();
    setSuccessMessage('Two-factor authentication enabled successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDisableTwoFactor = () => {
    if (!twoFactorStatus?.factors?.length) return;
    
    const totpFactor = twoFactorStatus.factors.find(f => f.factor_type === 'totp');
    if (!totpFactor) return;
    
    if (window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      disableTwoFactorMutation.mutate(totpFactor.id);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <XCircleIcon className="h-5 w-5 mr-2" />
            <span>Error loading profile: {profileError.message}</span>
            <Button onClick={refetchProfile} size="sm" className="ml-auto">
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showTwoFactorSetup) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <TwoFactorSetup 
          onSetupComplete={handleTwoFactorSetupComplete} 
          onCancel={() => setShowTwoFactorSetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h1>

      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <Card>
            <nav className="space-y-1">
              <button
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'general'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab('general')}
              >
                <UserCircleIcon className="mr-3 h-5 w-5" />
                General
              </button>
              <button
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'security'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <LockClosedIcon className="mr-3 h-5 w-5" />
                Security
              </button>
            </nav>
          </Card>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <Card>
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update your account profile information and email address.
                </p>

                <div className="mt-6">
                  {isEditing ? (
                    <form onSubmit={handleProfileSubmit}>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              className="input w-full"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-4">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email address
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              className="input pl-10 w-full"
                              value={formData.email}
                              disabled
                            />
                          </div>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            To change your email, please contact support.
                          </p>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Profile Picture
                          </label>
                          <div className="mt-1 flex items-center">
                            <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                              {formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                              ) : (
                                <UserCircleIcon className="h-full w-full text-gray-300 dark:text-gray-600" />
                              )}
                            </span>
                            <button
                              type="button"
                              className="ml-5 bg-white dark:bg-gray-800 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: profile.user_metadata?.name || '',
                              email: profile.email || '',
                              avatar_url: profile.avatar_url || ''
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <UserCircleIcon className="h-full w-full text-gray-300 dark:text-gray-600" />
                          )}
                        </span>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{profile.user_metadata?.name || 'User'}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={() => setIsEditing(true)}>
                          Edit Profile
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Section */}
              <Card>
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Update Password</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Ensure your account is using a strong password for security.
                  </p>

                  <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Password
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="current-password"
                          className="input pl-10 w-full"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        New Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          id="new-password"
                          className="input w-full"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                          minLength={8}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Minimum 8 characters
                      </p>
                    </div>

                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          id="confirm-password"
                          className="input w-full"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updatePasswordMutation.isPending}
                      >
                        {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>

              {/* Two-Factor Authentication Section */}
              <Card>
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add additional security to your account using two-factor authentication.
                  </p>

                  <div className="mt-6">
                    {isLoadingTwoFactor ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-3"></div>
                        <span className="text-gray-600 dark:text-gray-400">Loading two-factor status...</span>
                      </div>
                    ) : twoFactorStatus?.enabled ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-8 w-8 text-green-500 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-factor authentication is enabled</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Your account is protected with an authenticator app.
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="danger-outline"
                          onClick={handleDisableTwoFactor}
                          disabled={disableTwoFactorMutation.isPending}
                        >
                          {disableTwoFactorMutation.isPending ? 'Disabling...' : 'Disable'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ShieldExclamationIcon className="h-8 w-8 text-yellow-500 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-factor authentication is not enabled</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Add an extra layer of security to your account.
                            </p>
                          </div>
                        </div>
                        <Button onClick={() => setShowTwoFactorSetup(true)}>
                          Enable
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
