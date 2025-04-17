import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BuildingLibraryIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ExportButton from '../components/ui/ExportButton';
import ConnectionTest from '../components/debug/ConnectionTest';
import { bankAccountService } from '../services/bankAccountService';
import { indianBanks, validateIFSC, validateAccountNumber } from '../data/indianBanks';

export default function Banking() {
  const queryClient = useQueryClient();

  // State for add/edit account modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    account_number: '',
    bank_name: '',
    ifsc_code: '',
    account_type: 'Savings',
    balance: 0,
    is_active: true,
    color: '#3b82f6',
    icon_name: 'bank'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch bank accounts using React Query
  const { data: accounts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: bankAccountService.getBankAccounts
  });

  // Create bank account mutation
  const createMutation = useMutation({
    mutationFn: bankAccountService.createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      setIsModalOpen(false);
      alert('Bank account added successfully!');
    },
    onError: (error) => {
      console.error('Error adding bank account:', error);
      alert(`Error adding bank account: ${error.message}`);
    }
  });

  // Update bank account mutation
  const updateMutation = useMutation({
    mutationFn: (data) => bankAccountService.updateBankAccount(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      setIsModalOpen(false);
    }
  });

  // Delete bank account mutation
  const deleteMutation = useMutation({
    mutationFn: bankAccountService.deleteBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    }
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    });

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }

    // Auto-detect bank from IFSC code
    if (name === 'ifsc_code' && value.length >= 4) {
      const bankCode = value.substring(0, 4);
      const bank = indianBanks.find(b => b.ifscPrefix === bankCode);
      if (bank) {
        setFormData(prev => ({
          ...prev,
          bank_name: bank.name,
          color: bank.color,
          icon_name: bank.icon
        }));
      }
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Account name is required';
    }

    if (!formData.account_number.trim()) {
      errors.account_number = 'Account number is required';
    } else if (!validateAccountNumber(formData.account_number)) {
      errors.account_number = 'Invalid account number format';
    }

    if (!formData.bank_name.trim()) {
      errors.bank_name = 'Bank name is required';
    }

    if (formData.ifsc_code && !validateIFSC(formData.ifsc_code)) {
      errors.ifsc_code = 'Invalid IFSC code format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open modal for adding new account
  const handleAddAccount = () => {
    setCurrentAccount(null);
    setFormData({
      name: '',
      account_number: '',
      bank_name: '',
      ifsc_code: '',
      account_type: 'Savings',
      balance: 0,
      is_active: true,
      color: '#3b82f6',
      icon_name: 'bank'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing account
  const handleEditAccount = (account) => {
    setCurrentAccount(account);
    setFormData({
      name: account.name,
      account_number: account.account_number,
      bank_name: account.bank_name || '',
      ifsc_code: account.ifsc_code || '',
      account_type: account.account_type,
      balance: account.balance,
      is_active: account.is_active,
      color: account.color || '#3b82f6',
      icon_name: account.icon_name || 'bank'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    if (!validateForm()) {
      console.log('Form validation failed with errors:', formErrors);
      return;
    }

    try {
      if (currentAccount) {
        // Update existing account
        console.log('Updating existing account:', currentAccount.id);
        updateMutation.mutate({
          ...formData,
          id: currentAccount.id,
          updated_at: new Date().toISOString()
        });
      } else {
        // Add new account
        console.log('Adding new account with data:', {
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        createMutation.mutate({
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = (id) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);

  return (
    <div className="space-y-3">
      {/* Supabase Connection Test */}
      <ConnectionTest />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-md font-medium text-gray-900 dark:text-white">Banking</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Manage your bank accounts and credit cards</p>
        </div>
        <div className="mt-2 sm:mt-0 flex space-x-2">
          <ExportButton
            data={accounts}
            type="bankAccounts"
            title="Export"
            options={{ fileName: 'bank_accounts' }}
          />
          <Button onClick={handleAddAccount} size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading accounts...</span>
          </div>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <XCircleIcon className="h-5 w-5 mr-2" />
            <span>Error loading accounts: {error.message}</span>
            <Button onClick={handleRefresh} size="sm" className="ml-auto">
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Summary Card */}
      {!isLoading && !error && (
        <Card>
          <h2 className="text-md font-medium text-gray-900 dark:text-white mb-3">Account Summary</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="rounded-full bg-primary-100 p-2 dark:bg-primary-900">
                  <BuildingLibraryIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Balance</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {totalBalance >= 0 ? '₹' + totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-₹' + Math.abs(totalBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="rounded-full bg-success-100 p-2 dark:bg-success-900">
                  <BanknotesIcon className="h-5 w-5 text-success-600 dark:text-success-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Bank Accounts</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {accounts.filter(acc => acc.account_type !== 'Credit Card').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="rounded-full bg-danger-100 p-2 dark:bg-danger-900">
                  <CreditCardIcon className="h-5 w-5 text-danger-600 dark:text-danger-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Credit Cards</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {accounts.filter(acc => acc.account_type === 'Credit Card').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Accounts List */}
      {!isLoading && !error && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <h2 className="text-md font-medium text-gray-900 dark:text-white">Your Accounts</h2>
              <Link
                to="/banking/accounts"
                className="ml-2 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
              >
                View All <ChevronRightIcon className="h-3 w-3 ml-1" />
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <ExportButton
                data={accounts}
                type="bankAccounts"
                title="Export"
                options={{ fileName: 'bank_accounts_list' }}
              />
              <button
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <ArrowPathIcon className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Account
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Bank
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Account Number
                  </th>
                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Balance
                  </th>
                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {accounts.length > 0 ? (
                  accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div
                              className="h-6 w-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: account.color || '#3b82f6' }}
                            >
                              <BuildingLibraryIcon className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="ml-2">
                            <div className="text-xs font-medium text-gray-900 dark:text-white">{account.name}</div>
                            <div className="text-xs text-gray-500">{account.is_active ? 'Active' : 'Inactive'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {account.bank_name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          account.account_type === 'Credit Card'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {account.account_type}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {account.account_number.replace(/\d(?=\d{4})/g, "*")}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-xs font-medium text-right ${
                        parseFloat(account.balance) >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {parseFloat(account.balance) >= 0
                          ? '₹' + parseFloat(account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                          : '-₹' + Math.abs(parseFloat(account.balance)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-xs font-medium">
                        <button
                          onClick={() => handleEditAccount(account)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-2"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <BuildingLibraryIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <p>No bank accounts added yet</p>
                        <p className="text-xs mt-1">Click the "Add Account" button to add your first account</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        {currentAccount ? 'Edit Account' : 'Add New Account'}
                      </h3>
                      <div className="mt-4 space-y-4">
                        {/* Bank Selection */}
                        <div>
                          <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bank Name
                          </label>
                          <select
                            name="bank_name"
                            id="bank_name"
                            value={formData.bank_name}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full"
                            required
                          >
                            <option value="">Select a bank</option>
                            {indianBanks.map(bank => (
                              <option key={bank.ifscPrefix} value={bank.name}>{bank.name}</option>
                            ))}
                          </select>
                          {formErrors.bank_name && (
                            <p className="mt-1 text-xs text-red-600">{formErrors.bank_name}</p>
                          )}
                        </div>

                        {/* Account Name */}
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Account Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full"
                            placeholder="e.g., Salary Account"
                            required
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                          )}
                        </div>

                        {/* Account Type */}
                        <div>
                          <label htmlFor="account_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Account Type
                          </label>
                          <select
                            name="account_type"
                            id="account_type"
                            value={formData.account_type}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full"
                            required
                          >
                            <option value="Savings">Savings</option>
                            <option value="Current">Current</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Fixed Deposit">Fixed Deposit</option>
                            <option value="Recurring Deposit">Recurring Deposit</option>
                            <option value="Loan">Loan</option>
                          </select>
                        </div>

                        {/* Account Number */}
                        <div>
                          <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Account Number
                          </label>
                          <input
                            type="text"
                            name="account_number"
                            id="account_number"
                            value={formData.account_number}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full"
                            placeholder="Enter your account number"
                            required
                          />
                          {formErrors.account_number && (
                            <p className="mt-1 text-xs text-red-600">{formErrors.account_number}</p>
                          )}
                        </div>

                        {/* IFSC Code */}
                        <div>
                          <label htmlFor="ifsc_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            IFSC Code
                          </label>
                          <input
                            type="text"
                            name="ifsc_code"
                            id="ifsc_code"
                            value={formData.ifsc_code}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full uppercase"
                            placeholder="e.g., SBIN0001234"
                          />
                          {formErrors.ifsc_code && (
                            <p className="mt-1 text-xs text-red-600">{formErrors.ifsc_code}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">Format: 4 letters + 0 + 6 alphanumeric characters</p>
                        </div>

                        {/* Current Balance */}
                        <div>
                          <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Current Balance
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
                            </div>
                            <input
                              type="number"
                              name="balance"
                              id="balance"
                              value={formData.balance}
                              onChange={handleInputChange}
                              className="input pl-7 block w-full"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Active Account
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary w-full sm:w-auto sm:ml-3"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                        {currentAccount ? 'Saving...' : 'Adding...'}
                      </>
                    ) : (
                      currentAccount ? 'Save Changes' : 'Add Account'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline mt-3 w-full sm:mt-0 sm:w-auto"
                    onClick={() => setIsModalOpen(false)}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
