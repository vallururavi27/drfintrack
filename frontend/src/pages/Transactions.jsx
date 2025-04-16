import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  TrashIcon,
  PencilIcon,
  UserIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ExportButton from '../components/ui/ExportButton';
import ProfileSelector from '../components/ui/ProfileSelector';
import api from '../services/api';

// Transactions data
const transactionsData = [];

// Categories for filtering
const categories = [
  'All Categories',
  'Food',
  'Utilities',
  'Housing',
  'Transportation',
  'Entertainment',
  'Income',
  'Shopping',
  'Health',
  'Education',
  'Others',
];

// Accounts for filtering
const accounts = [
  'All Accounts',
  'HDFC Bank',
  'ICICI Bank',
  'SBI Bank',
  'Zerodha',
  'Cash',
];

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedAccount, setSelectedAccount] = useState('All Accounts');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('all');
  const [showShared, setShowShared] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  // Check if we should open the modal (when navigating from dashboard)
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openTransactionModal) {
      setCurrentTransaction(null);
      setFormData({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Food',
        type: 'expense',
        account: 'HDFC Bank',
        description: '',
        profile_id: '',
        is_shared: false
      });
      setIsModalOpen(true);

      // Clear the state so refreshing the page doesn't reopen the modal
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    type: 'expense',
    account: 'HDFC Bank',
    description: '',
    profile_id: '',
    is_shared: false
  });

  // Filter transactions based on search term, category, account, type, profile, and shared status
  const filteredTransactions = transactionsData.filter(transaction => {
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || transaction.category === selectedCategory;
    const matchesAccount = selectedAccount === 'All Accounts' || transaction.account === selectedAccount;
    const matchesType = selectedType === 'all' || transaction.type === selectedType;

    // Profile filtering
    const matchesProfile =
      selectedProfile === 'all' ||
      (transaction.profile_name && transaction.profile_name ===
        (selectedProfile === '1' ? 'Dr. Ravi' : selectedProfile === '2' ? 'Mrs. Ravi' : '')) ||
      (transaction.is_shared && showShared);

    return matchesSearch && matchesCategory && matchesAccount && matchesType && matchesProfile;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <ExportButton
            data={transactionsData}
            type="transactions"
            title="Export"
            options={{ fileName: 'transactions' }}
            showPeriodSelector={true}
          />
          <Button
            className="flex items-center"
            onClick={() => {
              setCurrentTransaction(null);
              setFormData({
                name: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                category: 'Food',
                type: 'expense',
                account: 'HDFC Bank',
                description: '',
                profile_id: '',
                is_shared: false
              });
              setIsModalOpen(true);
            }}
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="input pl-10 w-full"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <ProfileSelector
              selectedProfile={selectedProfile}
              onProfileChange={setSelectedProfile}
              showShared={showShared}
              onShowSharedChange={setShowShared}
            />

            <div className="flex space-x-1">
              <Button
                variant={selectedType === 'all' ? 'primary' : 'outline'}
                className="px-3"
                onClick={() => setSelectedType('all')}
              >
                All
              </Button>
              <Button
                variant={selectedType === 'income' ? 'primary' : 'outline'}
                className="px-3"
                onClick={() => setSelectedType('income')}
              >
                <ArrowUpIcon className="mr-1 h-4 w-4" />
                Income
              </Button>
              <Button
                variant={selectedType === 'expense' ? 'primary' : 'outline'}
                className="px-3"
                onClick={() => setSelectedType('expense')}
              >
                <ArrowDownIcon className="mr-1 h-4 w-4" />
                Expense
              </Button>
            </div>

            <Button
              variant="outline"
              className="px-3"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="sr-only sm:not-sr-only sm:ml-2">Filters</span>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                id="category"
                className="input mt-1 w-full"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Account
              </label>
              <select
                id="account"
                className="input mt-1 w-full"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                {accounts.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Range
              </label>
              <input
                type="month"
                id="date-range"
                className="input mt-1 w-full"
                defaultValue="2023-04"
              />
            </div>
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Transaction
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Account
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Profile
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'income'
                        ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                        : 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200'
                    }`}>
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.account}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {transaction.is_shared ? (
                        <span className="inline-flex items-center rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-medium text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200">
                          <UsersIcon className="mr-1 h-3 w-3" />
                          Shared
                        </span>
                      ) : transaction.profile_name ? (
                        <div className="flex items-center">
                          {transaction.profile_photo ? (
                            <img
                              src={transaction.profile_photo}
                              alt={transaction.profile_name}
                              className="mr-2 h-5 w-5 rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon className="mr-2 h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-900 dark:text-white">{transaction.profile_name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    transaction.type === 'income'
                      ? 'text-success-600 dark:text-success-400'
                      : 'text-danger-600 dark:text-danger-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                      onClick={() => {
                        setCurrentTransaction(transaction);
                        setFormData({
                          name: transaction.name,
                          amount: transaction.amount.replace('₹', '').replace(',', ''),
                          date: transaction.date,
                          category: transaction.category,
                          type: transaction.type,
                          account: transaction.account,
                          description: transaction.description,
                          profile_id: transaction.profile_name === 'Dr. Ravi' ? '1' :
                                      transaction.profile_name === 'Mrs. Ravi' ? '2' : '',
                          is_shared: transaction.is_shared
                        });
                        setIsModalOpen(true);
                      }}
                    >
                      <PencilIcon className="h-5 w-5" />
                      <span className="sr-only">Edit</span>
                    </button>
                    <button
                      className="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this transaction?')) {
                          // In a real app, call API to delete
                          console.log('Delete transaction:', transaction.id);
                        }
                      }}
                    >
                      <TrashIcon className="h-5 w-5" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="py-12 text-center">
            {searchTerm || selectedCategory !== 'All Categories' || selectedAccount !== 'All Accounts' || selectedType !== 'all' ? (
              <div>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="mt-2 text-gray-500 dark:text-gray-400">No transactions found matching your filters.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All Categories');
                    setSelectedAccount('All Accounts');
                    setSelectedType('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-2 text-lg font-medium text-gray-500 dark:text-gray-400">No transactions yet</p>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Get started by adding your first transaction</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setCurrentTransaction(null);
                    setFormData({
                      name: '',
                      amount: '',
                      date: new Date().toISOString().split('T')[0],
                      category: 'Food',
                      type: 'expense',
                      account: 'HDFC Bank',
                      description: '',
                      profile_id: '',
                      is_shared: false
                    });
                    setIsModalOpen(true);
                  }}
                >
                  <PlusIcon className="mr-2 h-5 w-5" />
                  Add Transaction
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{filteredTransactions.length}</span> of{' '}
            <span className="font-medium">{transactionsData.length}</span> transactions
          </div>
          <div className="flex space-x-2">
            {filteredTransactions.length > 0 && (
              <ExportButton
                data={filteredTransactions}
                type="transactions"
                title="Export Results"
                options={{
                  fileName: 'filtered_transactions',
                  pdfTitle: 'Filtered Transactions'
                }}
              />
            )}
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="outline">
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>

            {/* Modal panel */}
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle dark:bg-gray-800">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-800">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      {currentTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h3>
                    <div className="mt-4">
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              className="input mt-1 w-full"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Amount
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                              </div>
                              <input
                                type="text"
                                id="amount"
                                className="input pl-7 w-full"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Type
                            </label>
                            <select
                              id="type"
                              className="input mt-1 w-full"
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                              <option value="expense">Expense</option>
                              <option value="income">Income</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Date
                            </label>
                            <input
                              type="date"
                              id="date"
                              className="input mt-1 w-full"
                              value={formData.date}
                              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Category
                            </label>
                            <select
                              id="category"
                              className="input mt-1 w-full"
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                              {categories.filter(cat => cat !== 'All Categories').map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Account
                            </label>
                            <select
                              id="account"
                              className="input mt-1 w-full"
                              value={formData.account}
                              onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                            >
                              {accounts.filter(acc => acc !== 'All Accounts').map((account) => (
                                <option key={account} value={account}>
                                  {account}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="profile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Profile
                            </label>
                            <select
                              id="profile"
                              className="input mt-1 w-full"
                              value={formData.profile_id}
                              onChange={(e) => {
                                const newProfileId = e.target.value;
                                setFormData({
                                  ...formData,
                                  profile_id: newProfileId,
                                  is_shared: newProfileId === ''
                                });
                              }}
                              disabled={formData.is_shared}
                            >
                              <option value="">Select Profile</option>
                              <option value="1">Dr. Ravi</option>
                              <option value="2">Mrs. Ravi</option>
                            </select>
                          </div>

                          <div className="flex items-center">
                            <input
                              id="is_shared"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                              checked={formData.is_shared}
                              onChange={(e) => {
                                const isShared = e.target.checked;
                                setFormData({
                                  ...formData,
                                  is_shared: isShared,
                                  profile_id: isShared ? '' : formData.profile_id
                                });
                              }}
                            />
                            <label htmlFor="is_shared" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                              Shared transaction
                            </label>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                          </label>
                          <textarea
                            id="description"
                            rows="3"
                            className="input mt-1 w-full"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          ></textarea>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-700">
                <Button
                  className="w-full sm:ml-3 sm:w-auto"
                  onClick={() => {
                    // In a real app, save to API
                    console.log('Save transaction:', formData);
                    setIsModalOpen(false);
                  }}
                >
                  {currentTransaction ? 'Update' : 'Add'}
                </Button>
                <Button
                  variant="outline"
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
