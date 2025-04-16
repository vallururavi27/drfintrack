import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { setThemeMode, getThemeMode, isDarkMode, THEME_MODES } from '../utils/themeUtils';
import {
  MoonIcon,
  SunIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  CloudArrowUpIcon,
  PencilIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  UserIcon,
  PaperAirplaneIcon,
  CreditCardIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function SettingsNew() {
  // Theme settings
  const [currentThemeMode, setCurrentThemeMode] = useState(getThemeMode());
  const [darkModeActive, setDarkModeActive] = useState(isDarkMode());

  // Profile settings
  const [name, setName] = useState('Dr. Ravi');
  const [spouseName, setSpouseName] = useState('Mrs. Ravi');
  const [profileImage, setProfileImage] = useState('/profile_ravi.jpg');
  const [currency, setCurrency] = useState('INR');

  // Sync settings
  const [googleConnected, setGoogleConnected] = useState(false);
  const [microsoftConnected, setMicrosoftConnected] = useState(false);
  const [autoSync, setAutoSync] = useState('off');
  const [lastSync, setLastSync] = useState('Never');

  // Handle theme mode change
  const handleThemeModeChange = (mode) => {
    setCurrentThemeMode(mode);
    setThemeMode(mode);
    setDarkModeActive(isDarkMode());
  };

  // Update state when theme changes
  useEffect(() => {
    const updateThemeState = () => {
      setCurrentThemeMode(getThemeMode());
      setDarkModeActive(isDarkMode());
    };

    // Check for system preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateThemeState);

      return () => mediaQuery.removeEventListener('change', updateThemeState);
    }
  }, []);

  // Handle data export
  const handleExportData = () => {
    // Create a data object with all the user data
    const userData = {
      profile: {
        name,
        spouseName,
        profileImage,
        currency
      },
      settings: {
        isDarkMode,
        autoSync
      }
    };

    // Convert to JSON and create a blob
    const jsonData = JSON.stringify(userData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drFinTrack_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Data exported successfully!');
  };

  // Handle data import
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);

            // Update state with imported data
            if (data.profile) {
              if (data.profile.name) setName(data.profile.name);
              if (data.profile.spouseName) setSpouseName(data.profile.spouseName);
              if (data.profile.profileImage) setProfileImage(data.profile.profileImage);
              if (data.profile.currency) setCurrency(data.profile.currency);
            }

            if (data.settings) {
              if (data.settings.isDarkMode !== undefined) setIsDarkMode(data.settings.isDarkMode);
              if (data.settings.autoSync) setAutoSync(data.settings.autoSync);
            }

            alert('Data imported successfully!');
          } catch (error) {
            alert('Error importing data: ' + error.message);
          }
        };
        reader.readAsText(file);
      }
    };

    input.click();
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, this would call an API to delete the account
      alert('Account deleted successfully!');
      // Redirect to login page or clear local storage
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  // Handle profile image change
  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle local backup
  const handleLocalBackup = () => {
    handleExportData();
  };

  // Handle email backup
  const handleEmailBackup = (email) => {
    alert(`Backup would be sent to ${email} in a real application.`);
  };

  // Handle cloud connection
  const handleCloudConnect = (service) => {
    if (service === 'google') {
      setGoogleConnected(!googleConnected);
      alert(`${googleConnected ? 'Disconnected from' : 'Connected to'} Google Drive`);
    } else if (service === 'microsoft') {
      setMicrosoftConnected(!microsoftConnected);
      alert(`${microsoftConnected ? 'Disconnected from' : 'Connected to'} Microsoft OneDrive`);
    }
  };

  // Handle sync now
  const handleSyncNow = () => {
    setLastSync(new Date().toLocaleString());
    alert('Sync completed successfully!');
  };

  // Handle export reports
  const handleExportReports = (type) => {
    alert(`${type} report would be exported in a real application.`);
  };

  return (
    <div className="p-2">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Settings</h2>

      {/* Security Settings Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow border border-gray-200 dark:border-gray-700 mb-2">
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Security Settings</h3>
          </div>
          <Link
            to="/settings/security"
            className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Manage
          </Link>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Protect your account with email verification and two-factor authentication.
          </p>
          <Link
            to="/settings/security"
            className="inline-flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 rounded text-xs text-white"
          >
            <ShieldCheckIcon className="h-3 w-3 mr-1" />
            Security Settings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex items-center border-b border-gray-200 dark:border-gray-700">
            <MoonIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme Settings</h3>
          </div>

          <div className="p-2">
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Mode</p>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SunIcon className="h-4 w-4 mr-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Light Mode</span>
                  </div>
                  <ToggleSwitch
                    id="light-mode-toggle"
                    checked={currentThemeMode === THEME_MODES.LIGHT}
                    onChange={() => handleThemeModeChange(THEME_MODES.LIGHT)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MoonIcon className="h-4 w-4 mr-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Dark Mode</span>
                  </div>
                  <ToggleSwitch
                    id="dark-mode-toggle"
                    checked={currentThemeMode === THEME_MODES.DARK}
                    onChange={() => handleThemeModeChange(THEME_MODES.DARK)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ComputerDesktopIcon className="h-4 w-4 mr-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">System Mode</span>
                  </div>
                  <ToggleSwitch
                    id="system-mode-toggle"
                    checked={currentThemeMode === THEME_MODES.SYSTEM}
                    onChange={() => handleThemeModeChange(THEME_MODES.SYSTEM)}
                  />
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current appearance: {darkModeActive ? 'Dark' : 'Light'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex items-center border-b border-gray-200 dark:border-gray-700">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Backup & Restore</h3>
          </div>

          <div className="p-2">
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Local Backup</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Save your data locally for safekeeping</p>
              <div className="flex space-x-2">
                <button
                  onClick={handleLocalBackup}
                  className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                  Download
                </button>
                <button
                  onClick={handleImportData}
                  className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <ArrowUpTrayIcon className="h-3 w-3 mr-1" />
                  Restore
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Email Backup</p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex-grow focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                />
                <button
                  onClick={() => handleEmailBackup(document.querySelector('input[type="email"]').value)}
                  className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <PaperAirplaneIcon className="h-3 w-3 mr-1" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex items-center border-b border-gray-200 dark:border-gray-700">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Management</h3>
          </div>

          <div className="p-2">
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Import/Export</p>
              <div className="flex space-x-2">
                <button
                  onClick={handleExportData}
                  className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                  Export
                </button>
                <button
                  onClick={handleImportData}
                  className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <ArrowUpTrayIcon className="h-3 w-3 mr-1" />
                  Import
                </button>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Export Reports</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleExportReports('all')}
                  className="flex items-center w-full px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <DocumentTextIcon className="h-3 w-3 mr-1" />
                  All Data
                </button>
                <button
                  onClick={() => handleExportReports('transactions')}
                  className="flex items-center w-full px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <CreditCardIcon className="h-3 w-3 mr-1" />
                  Transactions
                </button>
                <button
                  onClick={() => handleExportReports('budget')}
                  className="flex items-center w-full px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <ChartBarIcon className="h-3 w-3 mr-1" />
                  Budget
                </button>
                <button
                  onClick={() => handleExportReports('bills')}
                  className="flex items-center w-full px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <DocumentTextIcon className="h-3 w-3 mr-1" />
                  Bills
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-red-500 mb-2">Danger Zone</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Warning: The following action cannot be undone. Make sure to backup your data first.</p>
              <button
                onClick={handleDeleteAccount}
                className="flex items-center px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-xs text-white"
              >
                <TrashIcon className="h-3 w-3 mr-1" />
                Delete All Data
              </button>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex items-center border-b border-gray-200 dark:border-gray-700">
            <UserIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Settings</h3>
          </div>

          <div className="p-2">
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Your Name</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              />
            </div>

            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Spouse Name</p>
              <input
                type="text"
                value={spouseName}
                onChange={(e) => setSpouseName(e.target.value)}
                className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              />
            </div>

            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</p>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Picture</p>
              <div className="flex items-center">
                <div className="relative h-12 w-12 overflow-hidden rounded-full mr-3">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                  <label
                    htmlFor="profile-image"
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100"
                  >
                    <PencilIcon className="h-4 w-4 text-white" />
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </div>
                <button
                  className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <PencilIcon className="h-3 w-3 mr-1" />
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Sync */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex items-center border-b border-gray-200 dark:border-gray-700">
            <CloudArrowUpIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Cloud Sync</h3>
          </div>

          <div className="p-2">
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Google Drive</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {googleConnected ? 'Connected' : 'Not connected'}
                </p>
                <button
                  onClick={() => handleCloudConnect('google')}
                  className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <CloudArrowUpIcon className="h-3 w-3 mr-1" />
                  {googleConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Microsoft OneDrive</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {microsoftConnected ? 'Connected' : 'Not connected'}
                </p>
                <button
                  onClick={() => handleCloudConnect('microsoft')}
                  className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <CloudArrowUpIcon className="h-3 w-3 mr-1" />
                  {microsoftConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Sync Options</p>
              <div className="mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Auto Sync</p>
                <select
                  value={autoSync}
                  onChange={(e) => setAutoSync(e.target.value)}
                  className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                >
                  <option value="off">Off</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSyncNow}
                  className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <CloudArrowUpIcon className="h-3 w-3 mr-1" />
                  Sync Now
                </button>
                <button
                  onClick={handleLocalBackup}
                  className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                  Download
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last sync: {lastSync}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
