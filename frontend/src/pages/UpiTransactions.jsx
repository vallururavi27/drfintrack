import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { upiTransactionService } from '../services/upiTransactionService';
import { bankAccountService } from '../services/bankAccountService';
import UpiTransactionForm from '../components/upi/UpiTransactionForm';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ExportButton from '../components/ui/ExportButton';

const UpiTransactions = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    accountId: '',
    startDate: '',
    endDate: '',
    transactionType: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;

  // Fetch UPI transactions
  const { data: transactionsData = { data: [], total: 0 }, isLoading, error, refetch } = useQuery({
    queryKey: ['upiTransactions', page, filters],
    queryFn: () => upiTransactionService.getUpiTransactions({
      limit: pageSize,
      offset: page * pageSize,
      sortBy: 'transaction_date',
      ascending: false,
      accountId: filters.accountId || null,
      startDate: filters.startDate || null,
      endDate: filters.endDate || null,
      transactionType: filters.transactionType || null
    })
  });

  // Fetch bank accounts for filter
  const { data: accounts = [] } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: bankAccountService.getBankAccounts
  });

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: upiTransactionService.deleteUpiTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upiTransactions'] });
    }
  });

  // Handle adding new transaction
  const handleAddTransaction = () => {
    setCurrentTransaction(null);
    setIsModalOpen(true);
  };

  // Handle editing transaction
  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  // Handle deleting transaction
  const handleDeleteTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  // Handle form submission success
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setCurrentTransaction(null);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(0); // Reset to first page when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      accountId: '',
      startDate: '',
      endDate: '',
      transactionType: ''
    });
    setPage(0);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format amount for display
  const formatAmount = (amount, type) => {
    const formattedAmount = parseFloat(amount).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    });

    return (
      <span className={type === 'sent' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
        {type === 'sent' ? '- ' : '+ '}
        {formattedAmount}
      </span>
    );
  };

  // Calculate total pages
  const totalPages = Math.ceil((transactionsData?.length || 0) / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-md font-medium text-gray-900 dark:text-white">UPI Transactions</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage your UPI payments and receipts
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex space-x-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            size="sm"
            variant="outline"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <ExportButton
            data={transactionsData || []}
            type="upiTransactions"
            title="Export"
            options={{ fileName: 'upi_transactions' }}
          />
          <Button onClick={handleAddTransaction} size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
            >
              <XMarkIcon className="h-3 w-3 mr-1" />
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label htmlFor="accountId" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account
              </label>
              <select
                id="accountId"
                name="accountId"
                value={filters.accountId}
                onChange={handleFilterChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.bank_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="transactionType" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                id="transactionType"
                name="transactionType"
                value={filters.transactionType}
                onChange={handleFilterChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading transactions...</span>
          </div>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <XMarkIcon className="h-5 w-5 mr-2" />
            <span>Error loading transactions: {error.message}</span>
            <Button onClick={() => refetch()} size="sm" className="ml-auto">
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Transactions Table */}
      {!isLoading && !error && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Account
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Counterparty
                  </th>
                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {transactionsData.length > 0 ? (
                  transactionsData.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.transaction_date)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-xs font-medium text-gray-900 dark:text-white">
                            {transaction.bank_accounts?.name || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          {transaction.transaction_type === 'sent' ? (
                            <ArrowUpIcon className="h-3 w-3 text-red-500 mr-1" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3 text-green-500 mr-1" />
                          )}
                          {transaction.description || 'UPI Transaction'}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {transaction.counterparty_name || 'Unknown'}
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {transaction.counterparty_upi_id}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-right">
                        {formatAmount(transaction.amount, transaction.transaction_type)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-xs font-medium">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-2"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
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
                        <DocumentTextIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <p>No UPI transactions found</p>
                        <p className="text-xs mt-1">
                          {Object.values(filters).some(v => v) 
                            ? 'Try changing your filters or' 
                            : ''} add your first UPI transaction
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {transactionsData.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{page * pageSize + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min((page + 1) * pageSize, transactionsData.length)}
                    </span>{' '}
                    of <span className="font-medium">{transactionsData.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {[...Array(totalPages).keys()].map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNum
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-400'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Add/Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <UpiTransactionForm
                transaction={currentTransaction}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpiTransactions;
