import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  TrashIcon,
  PencilIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ExportButton from '../components/ui/ExportButton';
import ProfileSelector from '../components/ui/ProfileSelector';
// Import Firebase services instead of Supabase
import { transactionService } from '../services/firebaseTransactionService';
import { bankAccountService } from '../services/firebaseBankAccountService';
import { categoryService } from '../services/firebaseCategoryService';
import { getCategoryNames } from '../data/transactionCategories';

// Categories for filtering
const categories = getCategoryNames();

// Date range options
const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'month', label: 'This Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export default function Transactions() {
  const queryClient = useQueryClient();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedAccount, setSelectedAccount] = useState('All Accounts');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('month');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('all');
  const [showShared, setShowShared] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    category_id: '',
    type: 'expense',
    account_id: '',
    notes: '',
    is_recurring: false
  });
  const [formErrors, setFormErrors] = useState({});

  // Check if we should open the modal (when navigating from dashboard)
  const location = useLocation();

  // Fetch transactions
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionService.getTransactions
  });

  // Fetch bank accounts for the dropdown
  const {
    data: bankAccounts = [],
    isLoading: isLoadingAccounts
  } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: bankAccountService.getBankAccounts
  });

  // Fetch categories for the dropdown
  const {
    data: categoriesData = [],
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories
  });

  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: transactionService.addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsModalOpen(false);
    }
  });

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => transactionService.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsModalOpen(false);
    }
  });

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: transactionService.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchTransactions();
    setIsRefreshing(false);
  };

  // Effect to open modal from dashboard
  useEffect(() => {
    if (location.state?.openTransactionModal) {
      setCurrentTransaction(null);
      setFormData({
        description: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        category_id: '',
        type: 'expense',
        account_id: '',
        notes: '',
        is_recurring: false
      });
      setIsModalOpen(true);

      // Clear the state so refreshing the page doesn't reopen the modal
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Filter transactions based on search term, category, account, type, date range, etc.
  const filteredTransactions = transactions.filter(transaction => {
    // Search term matching
    const matchesSearch = searchTerm === '' ||
      (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.payee && transaction.payee.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category matching
    const matchesCategory = selectedCategory === 'All Categories' ||
      (transaction.categories && transaction.categories.name === selectedCategory);

    // Account matching
    const matchesAccount = selectedAccount === 'All Accounts' ||
      (transaction.bank_accounts &&
       (transaction.bank_accounts.account_name === selectedAccount ||
        transaction.bank_accounts.bank_name === selectedAccount));

    // Transaction type matching
    const matchesType = selectedType === 'all' || transaction.type === selectedType;

    // Date range matching
    let matchesDateRange = true;
    if (selectedDateRange !== 'all') {
      // Handle Firestore Timestamp or regular date
      const transactionDate = transaction.transaction_date && transaction.transaction_date.toDate ?
        transaction.transaction_date.toDate() : new Date(transaction.transaction_date);
      const today = new Date();
      let startDate;

      if (selectedDateRange === 'custom') {
        startDate = new Date(customDateRange.startDate);
        const endDate = new Date(customDateRange.endDate);
        matchesDateRange = transactionDate >= startDate && transactionDate <= endDate;
      } else if (selectedDateRange === '7days') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        matchesDateRange = transactionDate >= startDate;
      } else if (selectedDateRange === '30days') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        matchesDateRange = transactionDate >= startDate;
      } else if (selectedDateRange === 'month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        matchesDateRange = transactionDate >= startDate;
      } else if (selectedDateRange === '3months') {
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        matchesDateRange = transactionDate >= startDate;
      } else if (selectedDateRange === '6months') {
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 6);
        matchesDateRange = transactionDate >= startDate;
      } else if (selectedDateRange === 'year') {
        startDate = new Date(today.getFullYear(), 0, 1);
        matchesDateRange = transactionDate >= startDate;
      }
    }

    return matchesSearch && matchesCategory && matchesAccount && matchesType && matchesDateRange;
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'Valid amount is required';
    if (!formData.transaction_date) errors.transaction_date = 'Date is required';
    if (!formData.category_id) errors.category_id = 'Category is required';
    if (!formData.account_id) errors.account_id = 'Account is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (currentTransaction) {
      updateMutation.mutate({
        id: currentTransaction.id,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Handle delete transaction
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <ExportButton
            data={filteredTransactions}
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
                description: '',
                amount: '',
                transaction_date: new Date().toISOString().split('T')[0],
                category_id: '',
                type: 'expense',
                account_id: '',
                notes: '',
                is_recurring: false
              });
              setFormErrors({});
              setIsModalOpen(true);
            }}
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoadingTransactions && (
        <Card>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading transactions...</span>
          </div>
        </Card>
      )}

      {/* Error state */}
      {transactionsError && (
        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <XCircleIcon className="h-5 w-5 mr-2" />
            <span>Error loading transactions: {transactionsError.message}</span>
            <Button onClick={handleRefresh} size="sm" className="ml-auto">
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!isLoadingTransactions && !transactionsError && (
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

              <button
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <ArrowPathIcon className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
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
                <option value="All Categories">All Categories</option>
                {isLoadingCategories ? (
                  <option value="" disabled>Loading categories...</option>
                ) : (
                  categoriesData.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))
                )}
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
                <option value="All Accounts">All Accounts</option>
                {isLoadingAccounts ? (
                  <option value="" disabled>Loading accounts...</option>
                ) : (
                  bankAccounts.map((account) => (
                    <option key={account.id} value={account.name}>
                      {account.name} ({account.bank_name})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Range
              </label>
              <select
                id="date-range"
                className="input mt-1 w-full"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedDateRange === 'custom' && (
              <div className="lg:col-span-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className="input mt-1 w-full"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    className="input mt-1 w-full"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                  />
                </div>
              </div>
            )}
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
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</div>
                      {transaction.notes && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.notes}</div>
                      )}
                      {transaction.is_recurring && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                          Recurring
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: transaction.categories?.color ? `${transaction.categories.color}20` : '#e5e7eb',
                          color: transaction.categories?.color || '#374151'
                        }}
                      >
                        {transaction.categories?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {transaction.transaction_date && transaction.transaction_date.toDate ?
                        transaction.transaction_date.toDate().toLocaleDateString() :
                        new Date(transaction.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {transaction.bank_accounts?.name || 'Unknown'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === 'income'
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-danger-600 dark:text-danger-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                        onClick={() => {
                          setCurrentTransaction(transaction);
                          // Format transaction date for the form
                          let formattedDate;
                          if (transaction.transaction_date && transaction.transaction_date.toDate) {
                            // Handle Firestore Timestamp
                            formattedDate = transaction.transaction_date.toDate().toISOString().split('T')[0];
                          } else if (typeof transaction.transaction_date === 'string') {
                            // Handle string date
                            formattedDate = transaction.transaction_date;
                          } else {
                            // Default to today
                            formattedDate = new Date().toISOString().split('T')[0];
                          }

                          setFormData({
                            description: transaction.description,
                            amount: transaction.amount,
                            transaction_date: formattedDate,
                            category_id: transaction.category_id,
                            type: transaction.type,
                            account_id: transaction.account_id,
                            notes: transaction.notes || '',
                            is_recurring: transaction.is_recurring || false
                          });
                          setFormErrors({});
                          setIsModalOpen(true);
                        }}
                      >
                        <PencilIcon className="h-5 w-5" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        className="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {searchTerm || selectedCategory !== 'All Categories' || selectedAccount !== 'All Accounts' || selectedType !== 'all' ?
                          'No transactions found matching your filters.' :
                          'No transactions yet. Add your first transaction to get started.'}
                      </p>
                      {(searchTerm || selectedCategory !== 'All Categories' || selectedAccount !== 'All Accounts' || selectedType !== 'all') && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('All Categories');
                            setSelectedAccount('All Accounts');
                            setSelectedType('all');
                            setSelectedDateRange('month');
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{filteredTransactions.length}</span> of{' '}
            <span className="font-medium">{transactions.length}</span> transactions
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
          </div>
        </div>
      </Card>
      )}

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
                    <div className="mt-4 space-y-4">
                      <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Type
                            </label>
                            <select
                              id="type"
                              name="type"
                              className="input mt-1 w-full"
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                              required
                            >
                              <option value="expense">Expense</option>
                              <option value="income">Income</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="account_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Account
                            </label>
                            <select
                              id="account_id"
                              name="account_id"
                              className="input mt-1 w-full"
                              value={formData.account_id}
                              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                              required
                            >
                              <option value="">Select Account</option>
                              {isLoadingAccounts ? (
                                <option value="" disabled>Loading accounts...</option>
                              ) : (
                                bankAccounts.map((account) => (
                                  <option key={account.id} value={account.id}>
                                    {account.name} ({account.bank_name})
                                  </option>
                                ))
                              )}
                            </select>
                            {formErrors.account_id && (
                              <p className="mt-1 text-xs text-red-600">{formErrors.account_id}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                          </label>
                          <input
                            type="text"
                            id="description"
                            name="description"
                            className="input mt-1 w-full"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="e.g., Grocery shopping at BigBasket"
                            required
                          />
                          {formErrors.description && (
                            <p className="mt-1 text-xs text-red-600">{formErrors.description}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Amount
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                              </div>
                              <input
                                type="number"
                                id="amount"
                                name="amount"
                                className="input pl-7 w-full"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                step="0.01"
                                min="0"
                                required
                              />
                            </div>
                            {formErrors.amount && (
                              <p className="mt-1 text-xs text-red-600">{formErrors.amount}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Date
                            </label>
                            <input
                              type="date"
                              id="transaction_date"
                              name="transaction_date"
                              className="input mt-1 w-full"
                              value={formData.transaction_date}
                              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                              required
                            />
                            {formErrors.transaction_date && (
                              <p className="mt-1 text-xs text-red-600">{formErrors.transaction_date}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                          </label>
                          <select
                            id="category_id"
                            name="category_id"
                            className="input mt-1 w-full"
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            required
                          >
                            <option value="">Select Category</option>
                            {isLoadingCategories ? (
                              <option value="" disabled>Loading categories...</option>
                            ) : (
                              categoriesData
                                .filter(cat => formData.type === 'all' || cat.type === formData.type || !cat.type)
                                .map(category => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))
                            )}
                          </select>
                          {formErrors.category_id && (
                            <p className="mt-1 text-xs text-red-600">{formErrors.category_id}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notes (Optional)
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            rows="2"
                            className="input mt-1 w-full"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional details about this transaction"
                          ></textarea>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="is_recurring"
                            name="is_recurring"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                            checked={formData.is_recurring}
                            onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                          />
                          <label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            This is a recurring transaction
                          </label>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-700">
                <button
                  type="submit"
                  className="btn btn-primary w-full sm:ml-3 sm:w-auto"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  form="transaction-form"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                      {currentTransaction ? 'Saving...' : 'Adding...'}
                    </>
                  ) : (
                    currentTransaction ? 'Save Changes' : 'Add Transaction'
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
