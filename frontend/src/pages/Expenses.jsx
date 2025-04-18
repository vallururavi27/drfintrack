import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '../services/firebaseExpenseService';
import { categoryService } from '../services/firebaseCategoryService';
import { bankAccountService } from '../services/firebaseBankAccountService';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ReceiptPercentIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ExportButton from '../components/ui/ExportButton';

export default function Expenses() {
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch expenses
  const {
    data: expenses = [],
    isLoading: isLoadingExpenses,
    error: expensesError
  } = useQuery({
    queryKey: ['expenses'],
    queryFn: expenseService.getExpenses
  });

  // Fetch expense stats
  const {
    data: expenseStats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['expenseStats', selectedPeriod],
    queryFn: () => expenseService.getExpenseStats(selectedPeriod)
  });

  // Fetch categories
  const {
    data: categoriesData = [],
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories
  });

  // Fetch bank accounts
  const {
    data: bankAccounts = [],
    isLoading: isLoadingAccounts
  } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: bankAccountService.getBankAccounts
  });

  // Filter expense categories to only show expense categories
  const expenseCategories = categoriesData
    .filter(cat => cat.type === 'expense' || !cat.type)
    .map(cat => cat.name);

  // State for add/edit expense modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    category_id: '',
    amount: 0,
    transaction_date: new Date().toISOString().split('T')[0],
    account_id: '',
    payment_method: 'Credit Card',
    notes: ''
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: expenseService.addExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseStats'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    }
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }) => expenseService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseStats'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    }
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: expenseService.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseStats'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    }
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    });
  };

  // Open modal for adding new expense
  const handleAddExpense = () => {
    setCurrentExpense(null);
    setFormData({
      description: '',
      category_id: categoriesData.length > 0 ? categoriesData[0].id : '',
      amount: 0,
      transaction_date: new Date().toISOString().split('T')[0],
      account_id: bankAccounts.length > 0 ? bankAccounts[0].id : '',
      payment_method: 'Credit Card',
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing expense
  const handleEditExpense = (expense) => {
    setCurrentExpense(expense);

    // Format transaction date for the form
    let formattedDate;
    if (expense.transaction_date && expense.transaction_date.toDate) {
      // Handle Firestore Timestamp
      formattedDate = expense.transaction_date.toDate().toISOString().split('T')[0];
    } else if (typeof expense.transaction_date === 'string') {
      // Handle string date
      formattedDate = expense.transaction_date;
    } else {
      // Default to today
      formattedDate = new Date().toISOString().split('T')[0];
    }

    setFormData({
      description: expense.description || '',
      category_id: expense.category_id || '',
      amount: expense.amount || 0,
      transaction_date: formattedDate,
      account_id: expense.account_id || '',
      payment_method: expense.payment_method || 'Credit Card',
      notes: expense.notes || ''
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (currentExpense) {
        // Update existing expense
        await updateExpenseMutation.mutateAsync({
          id: currentExpense.id,
          data: formData
        });
      } else {
        // Add new expense
        await addExpenseMutation.mutateAsync(formData);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense: ' + error.message);
    }
  };

  // Handle expense deletion
  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpenseMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense: ' + error.message);
      }
    }
  };

  // Calculate total expenses
  const totalExpenses = expenseStats?.totalExpenses || expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

  // Get expenses by category for the chart
  const expensesByCategory = expenseStats?.categoryData || [];

  // Get top expense category
  const topCategory = expensesByCategory.length > 0 ? expensesByCategory[0].name : 'None';

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Track and manage your expenses</p>
        </div>
        <div className="mt-2 sm:mt-0 flex space-x-2">
          <ExportButton
            data={expenses}
            type="expenses"
            title="Export"
            options={{ fileName: 'expenses' }}
            showPeriodSelector={true}
          />
          <Button onClick={handleAddExpense} size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-md font-medium text-gray-900 dark:text-white">Expense Summary</h2>
          <div className="flex space-x-2">
            <select
              className="input text-xs py-1 px-2"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="month">This Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
                <ReceiptPercentIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ₹{totalExpenses.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                <ReceiptPercentIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Average Daily</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ₹{Math.round(totalExpenses / 30).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                <ReceiptPercentIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Top Category</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isLoadingStats ? 'Loading...' : topCategory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Expenses List */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-md font-medium text-gray-900 dark:text-white">Recent Expenses</h2>
          <div className="flex items-center space-x-2">
            <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center">
              <FunnelIcon className="h-3 w-3 mr-1" />
              Filter
            </button>
            <ExportButton
              data={expenses}
              type="expenses"
              title="Export"
              options={{
                fileName: 'expenses_list',
                pdfTitle: 'Expenses List'
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Description
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Category
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Date
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Payment Method
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
              {isLoadingExpenses ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ArrowPathIcon className="h-12 w-12 text-gray-400 mb-3 animate-spin" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">Loading expenses...</p>
                    </div>
                  </td>
                </tr>
              ) : expensesError ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-red-500 dark:text-red-400 text-lg font-medium mb-1">Error loading expenses</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">{expensesError.message}</p>
                    </div>
                  </td>
                </tr>
              ) : expenses.length > 0 ? (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{expense.description}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {expense.categories?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {expense.transaction_date && expense.transaction_date.toDate ?
                        expense.transaction_date.toDate().toLocaleDateString() :
                        new Date(expense.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {expense.payment_method || 'Unknown'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-right text-red-600 dark:text-red-400">
                      ₹{parseFloat(expense.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-xs font-medium">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ReceiptPercentIcon className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">No expenses yet</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Get started by adding your first expense</p>
                      <Button onClick={handleAddExpense} size="sm">
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Expense
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Expense Modal */}
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
                        {currentExpense ? 'Edit Expense' : 'Add New Expense'}
                      </h3>
                      <div className="mt-4 space-y-3">
                        <div>
                          <label htmlFor="description" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Description
                          </label>
                          <input
                            type="text"
                            name="description"
                            id="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="category" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Category
                          </label>
                          <select
                            name="category_id"
                            id="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full text-sm"
                          >
                            {isLoadingCategories ? (
                              <option value="" disabled>Loading categories...</option>
                            ) : (
                              categoriesData
                                .filter(cat => cat.type === 'expense' || !cat.type)
                                .map(category => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))
                            )}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="amount" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Amount
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
                            </div>
                            <input
                              type="number"
                              name="amount"
                              id="amount"
                              value={formData.amount}
                              onChange={handleInputChange}
                              className="input pl-7 block w-full text-sm"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="transaction_date" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Date
                          </label>
                          <input
                            type="date"
                            name="transaction_date"
                            id="transaction_date"
                            value={formData.transaction_date}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="payment_method" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Payment Method
                          </label>
                          <select
                            name="payment_method"
                            id="payment_method"
                            value={formData.payment_method}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full text-sm"
                          >
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="UPI">UPI</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="account_id" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Bank Account
                          </label>
                          <select
                            name="account_id"
                            id="account_id"
                            value={formData.account_id}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full text-sm"
                          >
                            {isLoadingAccounts ? (
                              <option value="" disabled>Loading accounts...</option>
                            ) : bankAccounts.length === 0 ? (
                              <option value="" disabled>No accounts available</option>
                            ) : (
                              bankAccounts.map(account => (
                                <option key={account.id} value={account.id}>
                                  {account.name} ({account.bank_name})
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="notes" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Notes (Optional)
                          </label>
                          <textarea
                            name="notes"
                            id="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full text-sm"
                            rows="2"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary w-full sm:w-auto sm:ml-3 text-sm py-1"
                  >
                    {currentExpense ? 'Save Changes' : 'Add Expense'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline mt-3 w-full sm:mt-0 sm:w-auto text-sm py-1"
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
