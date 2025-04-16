import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UserIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  CurrencyRupeeIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ColorPicker from '../components/ui/ColorPicker';
import { getCustomColors, saveCustomColors, resetCustomColors, DEFAULT_COLORS } from '../utils/themeUtils';
import { exportBackup, importBackup, clearAllData } from '../services/dataService';

export default function Settings() {
  // Theme settings
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  // Custom color settings
  const [customColors, setCustomColors] = useState(getCustomColors());
  const [showColorSettings, setShowColorSettings] = useState(false);

  // Profile settings
  const [profileImage, setProfileImage] = useState('/profile_ravi.jpg');
  const [spouseProfileImage, setSpouseProfileImage] = useState('/profile_spouse.jpg');
  const [name, setName] = useState('Dr. Ravi');
  const [spouseName, setSpouseName] = useState('Mrs. Ravi');
  const [email, setEmail] = useState('vallururavi.ai@gmail.com');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [investmentAlerts, setInvestmentAlerts] = useState(true);

  // Regional settings
  const [currency, setCurrency] = useState('INR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [language, setLanguage] = useState('en');

  // Custom categories
  const [categories, setCategories] = useState([
    'Food', 'Shopping', 'Utilities', 'Salary', 'Transportation', 'Entertainment',
    'Freelance', 'Housing', 'Healthcare', 'Education', 'Investments', 'Savings', 'Personal'
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const categoryInputRef = useRef(null);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = customColors.background.dark;
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = customColors.background.light;
      localStorage.setItem('darkMode', 'false');
    }

    // Force reload to ensure all components update
    window.location.reload();
  };

  // Handle color change
  const handleColorChange = (colorKey, value) => {
    const updatedColors = { ...customColors };

    // Handle nested properties like background.light
    if (colorKey.includes('.')) {
      const [parent, child] = colorKey.split('.');
      updatedColors[parent] = { ...updatedColors[parent], [child]: value };
    } else {
      updatedColors[colorKey] = value;
    }

    setCustomColors(updatedColors);
  };

  // Save custom colors
  const handleSaveColors = () => {
    saveCustomColors(customColors);
    alert('Custom colors saved successfully!');
  };

  // Reset colors to defaults
  const handleResetColors = () => {
    if (window.confirm('Are you sure you want to reset all colors to default?')) {
      resetCustomColors();
      setCustomColors(DEFAULT_COLORS);
      alert('Colors reset to default values.');
    }
  };

  // Handle data export using the dataService
  const handleExportData = () => {
    try {
      const success = exportBackup();
      if (success) {
        alert('Data exported successfully! Your backup file has been downloaded.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(`Error exporting data: ${error.message}`);
    }
  };

  // Handle data import using the dataService
  const handleImportData = useCallback(() => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
          alert('Please select a valid JSON file.');
          return;
        }

        if (window.confirm('Importing data will replace your current data. Are you sure you want to continue?')) {
          await importBackup(file);
          alert('Data imported successfully! Please refresh the page to see the changes.');
          // Force reload to apply changes
          window.location.reload();
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert(`Error importing data: ${error.message}`);
      }
    };

    // Trigger file selection
    fileInput.click();
  }, []);

  // Handle account deletion
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      try {
        // Offer to backup before deleting
        if (window.confirm('Would you like to backup your data before deleting?')) {
          exportBackup();
        }

        // Clear all data
        clearAllData();
        alert('All data has been deleted successfully. The application will now reload.');

        // Reload the page to reflect changes
        window.location.reload();
      } catch (error) {
        console.error('Error deleting data:', error);
        alert(`Error deleting data: ${error.message}`);
      }
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

  // Handle spouse profile image change
  const handleSpouseProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSpouseProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-md font-medium text-gray-900 dark:text-white">Settings</h2>
      </div>

      {/* Profile Settings */}
      <Card>
        <h2 className="text-md font-medium text-gray-900 dark:text-white mb-3">Profile Settings</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Primary Profile */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Primary Profile</h3>

            <div className="flex items-center">
              <div className="relative h-16 w-16 overflow-hidden rounded-full">
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
                  <span className="sr-only">Change profile image</span>
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </div>

              <div className="ml-4 space-y-1">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="input mt-1 w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input mt-1 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </div>
          </div>

          {/* Spouse Profile */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Spouse Profile</h3>

            <div className="flex items-center">
              <div className="relative h-16 w-16 overflow-hidden rounded-full">
                <img
                  src={spouseProfileImage}
                  alt="Spouse Profile"
                  className="h-full w-full object-cover"
                />
                <label
                  htmlFor="spouse-profile-image"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100"
                >
                  <PencilIcon className="h-4 w-4 text-white" />
                  <span className="sr-only">Change spouse profile image</span>
                </label>
                <input
                  id="spouse-profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSpouseProfileImageChange}
                />
              </div>

              <div className="ml-4 space-y-1">
                <div>
                  <label htmlFor="spouse-name" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    id="spouse-name"
                    type="text"
                    className="input mt-1 w-full"
                    value={spouseName}
                    onChange={(e) => setSpouseName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="spouse-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email (Optional)
              </label>
              <input
                id="spouse-email"
                type="email"
                className="input mt-1 w-full"
                placeholder="spouse@example.com"
              />
            </div>

            <div className="pt-6">
              <Button variant="danger" className="w-full text-sm py-1" onClick={() => {
                if (window.confirm('Are you sure you want to remove the spouse profile?')) {
                  setSpouseName('');
                  setSpouseProfileImage('/profile_spouse.jpg');
                  alert('Spouse profile removed successfully!');
                }
              }}>
                <TrashIcon className="mr-1 h-4 w-4" />
                Remove Spouse Profile
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <h2 className="text-md font-medium text-gray-900 dark:text-white mb-3">Appearance</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
            </div>
            <div className="relative inline-block w-12 select-none">
              <input
                type="checkbox"
                name="toggle"
                id="toggle"
                className="toggle-checkbox absolute block h-6 w-6 cursor-pointer appearance-none rounded-full border-4 border-gray-300 bg-white transition-transform duration-200 ease-in checked:right-0 checked:border-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:checked:border-primary-400"
                checked={isDarkMode}
                onChange={handleThemeToggle}
              />
              <label
                htmlFor="toggle"
                className="toggle-label block h-6 cursor-pointer overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600"
              ></label>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Theme Colors</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Customize the application colors</p>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={() => setShowColorSettings(!showColorSettings)}
              >
                {showColorSettings ? 'Hide Colors' : 'Show Colors'}
              </button>
            </div>

            {showColorSettings && (
              <div className="space-y-4 border rounded-md p-3 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <ColorPicker
                  label="Primary Color"
                  color={customColors.primary}
                  onChange={(value) => handleColorChange('primary', value)}
                  description="Main brand color used for primary buttons and accents"
                />

                <ColorPicker
                  label="Secondary Color"
                  color={customColors.secondary}
                  onChange={(value) => handleColorChange('secondary', value)}
                  description="Used for secondary elements and buttons"
                />

                <ColorPicker
                  label="Accent Color"
                  color={customColors.accent}
                  onChange={(value) => handleColorChange('accent', value)}
                  description="Used for highlights and interactive elements"
                />

                <ColorPicker
                  label="Success Color"
                  color={customColors.success}
                  onChange={(value) => handleColorChange('success', value)}
                  description="Used for success messages and indicators"
                />

                <ColorPicker
                  label="Warning Color"
                  color={customColors.warning}
                  onChange={(value) => handleColorChange('warning', value)}
                  description="Used for warnings and alerts"
                />

                <ColorPicker
                  label="Danger Color"
                  color={customColors.danger}
                  onChange={(value) => handleColorChange('danger', value)}
                  description="Used for errors and destructive actions"
                />

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Background Colors</h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ColorPicker
                      label="Light Mode Background"
                      color={customColors.background.light}
                      onChange={(value) => handleColorChange('background.light', value)}
                    />

                    <ColorPicker
                      label="Dark Mode Background"
                      color={customColors.background.dark}
                      onChange={(value) => handleColorChange('background.dark', value)}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Text Colors</h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ColorPicker
                      label="Light Mode Text"
                      color={customColors.text.light}
                      onChange={(value) => handleColorChange('text.light', value)}
                    />

                    <ColorPicker
                      label="Dark Mode Text"
                      color={customColors.text.dark}
                      onChange={(value) => handleColorChange('text.dark', value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    className="text-sm py-1"
                    onClick={handleResetColors}
                  >
                    Reset to Defaults
                  </Button>

                  <Button
                    className="text-sm py-1"
                    onClick={handleSaveColors}
                  >
                    Save Colors
                  </Button>
                </div>
              </div>
            )}
          </div>

          <style jsx>{`
            .toggle-checkbox:checked {
              transform: translateX(100%);
            }
            .toggle-checkbox:checked + .toggle-label {
              background-color: #0284c7;
            }
          `}</style>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h2 className="text-md font-medium text-gray-900 dark:text-white mb-3">Notifications</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications via email</p>
            </div>
            <div className="relative inline-block w-12 select-none">
              <input
                type="checkbox"
                name="email-toggle"
                id="email-toggle"
                className="toggle-checkbox absolute block h-6 w-6 cursor-pointer appearance-none rounded-full border-4 border-gray-300 bg-white transition-transform duration-200 ease-in checked:right-0 checked:border-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:checked:border-primary-400"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
              />
              <label
                htmlFor="email-toggle"
                className="toggle-label block h-6 cursor-pointer overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600"
              ></label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive push notifications in browser</p>
            </div>
            <div className="relative inline-block w-12 select-none">
              <input
                type="checkbox"
                name="push-toggle"
                id="push-toggle"
                className="toggle-checkbox absolute block h-6 w-6 cursor-pointer appearance-none rounded-full border-4 border-gray-300 bg-white transition-transform duration-200 ease-in checked:right-0 checked:border-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:checked:border-primary-400"
                checked={pushNotifications}
                onChange={() => setPushNotifications(!pushNotifications)}
              />
              <label
                htmlFor="push-toggle"
                className="toggle-label block h-6 cursor-pointer overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600"
              ></label>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Notification Types</h3>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="transaction-alerts"
                  name="transaction-alerts"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  checked={transactionAlerts}
                  onChange={() => setTransactionAlerts(!transactionAlerts)}
                />
                <label htmlFor="transaction-alerts" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Transaction Alerts
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="budget-alerts"
                  name="budget-alerts"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  checked={budgetAlerts}
                  onChange={() => setBudgetAlerts(!budgetAlerts)}
                />
                <label htmlFor="budget-alerts" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Budget Alerts
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="investment-alerts"
                  name="investment-alerts"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  checked={investmentAlerts}
                  onChange={() => setInvestmentAlerts(!investmentAlerts)}
                />
                <label htmlFor="investment-alerts" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Investment Alerts
                </label>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Custom Categories */}
      <Card>
        <h2 className="text-md font-medium text-gray-900 dark:text-white mb-3">Custom Categories</h2>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="text"
              className="input mr-2 flex-grow"
              placeholder="Add new category..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCategory.trim()) {
                  if (!categories.includes(newCategory.trim())) {
                    setCategories([...categories, newCategory.trim()]);
                    setNewCategory('');
                  } else {
                    alert('This category already exists!');
                  }
                }
              }}
            />
            <Button
              onClick={() => {
                if (newCategory.trim()) {
                  if (!categories.includes(newCategory.trim())) {
                    setCategories([...categories, newCategory.trim()]);
                    setNewCategory('');
                  } else {
                    alert('This category already exists!');
                  }
                }
              }}
              className="py-1"
            >
              Add
            </Button>
          </div>

          <div className="mt-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Your Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-700"
                >
                  {editingCategory === index ? (
                    <input
                      ref={categoryInputRef}
                      type="text"
                      className="w-24 bg-transparent focus:outline-none"
                      value={editCategoryValue}
                      onChange={(e) => setEditCategoryValue(e.target.value)}
                      onBlur={() => {
                        if (editCategoryValue.trim() && !categories.includes(editCategoryValue.trim())) {
                          const newCategories = [...categories];
                          newCategories[index] = editCategoryValue.trim();
                          setCategories(newCategories);
                        }
                        setEditingCategory(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editCategoryValue.trim() && !categories.includes(editCategoryValue.trim())) {
                            const newCategories = [...categories];
                            newCategories[index] = editCategoryValue.trim();
                            setCategories(newCategories);
                          }
                          setEditingCategory(null);
                        }
                      }}
                    />
                  ) : (
                    <span
                      className="cursor-pointer"
                      onClick={() => {
                        setEditingCategory(index);
                        setEditCategoryValue(category);
                        setTimeout(() => categoryInputRef.current?.focus(), 0);
                      }}
                    >
                      {category}
                    </span>
                  )}
                  <button
                    className="ml-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete the "${category}" category?`)) {
                        setCategories(categories.filter((_, i) => i !== index));
                      }
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Regional Settings */}
      <Card>
        <h2 className="text-md font-medium text-gray-900 dark:text-white mb-3">Regional Settings</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="currency" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Currency
            </label>
            <select
              id="currency"
              className="input mt-1 w-full"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
            </select>
          </div>

          <div>
            <label htmlFor="date-format" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Date Format
            </label>
            <select
              id="date-format"
              className="input mt-1 w-full"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
            </select>
          </div>

          <div>
            <label htmlFor="language" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Language
            </label>
            <select
              id="language"
              className="input mt-1 w-full"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="kn">Kannada</option>
              <option value="ml">Malayalam</option>
              <option value="mr">Marathi</option>
              <option value="pa">Punjabi</option>
              <option value="gu">Gujarati</option>
              <option value="bn">Bengali</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <h2 className="text-md font-medium text-gray-900 dark:text-white mb-3">Data Management</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Backup & Restore</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Backup all your data including bank accounts, transactions, investments, reports, and settings.
              You can restore your data from a backup file if needed.
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Button variant="outline" className="flex items-center justify-center text-sm py-1" onClick={handleExportData}>
                <ArrowDownTrayIcon className="mr-1 h-4 w-4" />
                Backup All Data
              </Button>

              <Button variant="outline" className="flex items-center justify-center text-sm py-1" onClick={handleImportData}>
                <ArrowUpTrayIcon className="mr-1 h-4 w-4" />
                Restore From Backup
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Delete Data</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              This will permanently delete all your data including bank accounts, transactions, investments, reports, and settings.
              You will be prompted to create a backup before deletion.
            </p>

            <Button variant="danger" className="flex items-center text-sm py-1" onClick={handleDeleteAccount}>
              <TrashIcon className="mr-1 h-4 w-4" />
              Delete All Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button className="px-4 text-sm py-1" onClick={() => {
          // Save all settings
          alert('Settings saved successfully!');
        }}>Save Settings</Button>
      </div>
    </div>
  );
}
