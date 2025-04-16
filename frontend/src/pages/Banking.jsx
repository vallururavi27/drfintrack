import React, { useState } from 'react';
import {
  BuildingLibraryIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ExportButton from '../components/ui/ExportButton';

export default function Banking() {
  // Bank accounts data
  const [accounts, setAccounts] = useState([]);

  // State for add/edit account modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Checking',
    balance: 0
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    });
  };

  // Open modal for adding new account
  const handleAddAccount = () => {
    setCurrentAccount(null);
    setFormData({
      name: '',
      type: 'Checking',
      balance: 0
    });
    setIsModalOpen(true);
  };

  // Open modal for editing account
  const handleEditAccount = (account) => {
    setCurrentAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (currentAccount) {
      // Update existing account
      setAccounts(accounts.map(acc =>
        acc.id === currentAccount.id
          ? { ...acc, ...formData, lastUpdated: new Date().toISOString().split('T')[0] }
          : acc
      ));
    } else {
      // Add new account
      const newAccount = {
        id: Date.now(),
        ...formData,
        currency: '₹',
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setAccounts([...accounts, newAccount]);
    }

    setIsModalOpen(false);
  };

  // Handle account deletion
  const handleDeleteAccount = (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-3">
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

      {/* Summary Card */}
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
                  {totalBalance >= 0 ? '₹' + totalBalance.toLocaleString() : '-₹' + Math.abs(totalBalance).toLocaleString()}
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
                  {accounts.filter(acc => acc.type !== 'Credit Card').length}
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
                  {accounts.filter(acc => acc.type === 'Credit Card').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Accounts List */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-md font-medium text-gray-900 dark:text-white">Your Accounts</h2>
          <div className="flex items-center space-x-2">
            <ExportButton
              data={accounts}
              type="bankAccounts"
              title="Export"
              options={{ fileName: 'bank_accounts_list' }}
            />
            <button className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center">
              <ArrowPathIcon className="h-3 w-3 mr-1" />
              Refresh
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
                  Type
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Last Updated
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
                          <BuildingLibraryIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="ml-2">
                          <div className="text-xs font-medium text-gray-900 dark:text-white">{account.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        account.type === 'Credit Card'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {account.lastUpdated}
                    </td>
                    <td className={`px-4 py-2 whitespace-nowrap text-xs font-medium text-right ${
                      account.balance >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {account.balance >= 0
                        ? account.currency + account.balance.toLocaleString()
                        : '-' + account.currency + Math.abs(account.balance).toLocaleString()}
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
                  <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
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
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Account Type
                          </label>
                          <select
                            name="type"
                            id="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full"
                          >
                            <option value="Checking">Checking</option>
                            <option value="Savings">Savings</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Investment">Investment</option>
                            <option value="Loan">Loan</option>
                          </select>
                        </div>
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
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {currentAccount ? 'Save Changes' : 'Add Account'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline mt-3 w-full sm:mt-0 sm:w-auto"
                    onClick={() => setIsModalOpen(false)}
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
