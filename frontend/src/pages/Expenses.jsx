import React, { useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ExportButton from '../components/ui/ExportButton';

export default function Expenses() {
  // Sample expense categories
  const categories = [
    'Food & Dining', 'Shopping', 'Housing', 'Transportation',
    'Entertainment', 'Health & Fitness', 'Travel', 'Education',
    'Personal Care', 'Utilities', 'Insurance', 'Taxes', 'Other'
  ];

  // Expenses data
  const [expenses, setExpenses] = useState([]);

  // State for add/edit expense modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    category: 'Food & Dining',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Credit Card'
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
      category: 'Food & Dining',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Credit Card'
    });
    setIsModalOpen(true);
  };

  // Open modal for editing expense
  const handleEditExpense = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      paymentMethod: expense.paymentMethod
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (currentExpense) {
      // Update existing expense
      setExpenses(expenses.map(exp =>
        exp.id === currentExpense.id
          ? { ...exp, ...formData }
          : exp
      ));
    } else {
      // Add new expense
      const newExpense = {
        id: Date.now(),
        ...formData
      };
      setExpenses([...expenses, newExpense]);
    }

    setIsModalOpen(false);
  };

  // Handle expense deletion
  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(exp => exp.id !== id));
    }
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by category for the chart
  const expensesByCategory = categories.map(category => {
    const amount = expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    return { category, amount };
  }).filter(item => item.amount > 0);

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
            <select className="input text-xs py-1 px-2">
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
              <option>This Year</option>
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
                  {expensesByCategory.length > 0
                    ? expensesByCategory.sort((a, b) => b.amount - a.amount)[0].category
                    : 'None'}
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
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{expense.description}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {expense.date}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {expense.paymentMethod}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-right text-red-600 dark:text-red-400">
                      ₹{expense.amount.toLocaleString()}
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
                            name="category"
                            id="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full text-sm"
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
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
                          <label htmlFor="date" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Date
                          </label>
                          <input
                            type="date"
                            name="date"
                            id="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="input mt-1 block w-full text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="paymentMethod" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Payment Method
                          </label>
                          <select
                            name="paymentMethod"
                            id="paymentMethod"
                            value={formData.paymentMethod}
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
