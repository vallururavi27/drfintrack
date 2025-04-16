import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import api from '../services/api';

// Sample budget data (will be replaced with API data)
const initialBudgets = [
  { id: 1, category: 'Food', amount: 10000, spent: 6500, period: 'monthly' },
  { id: 2, category: 'Housing', amount: 20000, spent: 18000, period: 'monthly' },
  { id: 3, category: 'Transportation', amount: 4000, spent: 3200, period: 'monthly' },
  { id: 4, category: 'Entertainment', amount: 3000, spent: 4200, period: 'monthly' },
  { id: 5, category: 'Utilities', amount: 5000, spent: 4800, period: 'monthly' },
  { id: 6, category: 'Shopping', amount: 6000, spent: 7500, period: 'monthly' },
  { id: 7, category: 'Health', amount: 2000, spent: 1200, period: 'monthly' },
  { id: 8, category: 'Education', amount: 3000, spent: 2800, period: 'monthly' },
];

// Available categories for budgets
const categories = [
  'Food',
  'Housing',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Health',
  'Education',
  'Travel',
  'Personal Care',
  'Gifts & Donations',
  'Investments',
  'Debt Payments',
  'Others'
];

// Budget periods
const periods = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch budgets from API
  useEffect(() => {
    const fetchBudgets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // For demo purposes, we'll use the sample data
        // In a real app, uncomment the API call below
        // const data = await api.budgets.getAll();
        // setBudgets(data);
        setBudgets(initialBudgets);
      } catch (err) {
        console.error('Error fetching budgets:', err);
        setError('Failed to load budgets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  // Calculate total budget and spent
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Filter budgets based on active tab
  const filteredBudgets = activeTab === 'all'
    ? budgets
    : activeTab === 'over'
      ? budgets.filter(budget => budget.spent > budget.amount)
      : budgets.filter(budget => budget.spent <= budget.amount);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };

  // Open modal for creating a new budget
  const handleAddBudget = () => {
    setEditingBudget(null);
    setFormData({
      category: '',
      amount: '',
      period: 'monthly'
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing budget
  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount,
      period: budget.period
    });
    setIsModalOpen(true);
  };

  // Delete a budget
  const handleDeleteBudget = async (id) => {
    if (!confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, uncomment the API call below
      // await api.budgets.delete(id);

      // For demo purposes, we'll update the state directly
      setBudgets(budgets.filter(budget => budget.id !== id));
    } catch (err) {
      console.error('Error deleting budget:', err);
      setError('Failed to delete budget. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit form to create or update a budget
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingBudget) {
        // Update existing budget
        // In a real app, uncomment the API call below
        // const response = await api.budgets.update(editingBudget.id, formData);
        // const updatedBudget = response.budget;

        // For demo purposes, we'll update the state directly
        const updatedBudget = { ...editingBudget, ...formData };
        setBudgets(budgets.map(budget =>
          budget.id === editingBudget.id ? updatedBudget : budget
        ));
      } else {
        // Create new budget
        // In a real app, uncomment the API call below
        // const response = await api.budgets.add(formData);
        // const newBudget = response.budget;

        // For demo purposes, we'll create a new budget directly
        const newBudget = {
          id: Date.now(),
          ...formData,
          spent: 0
        };
        setBudgets([...budgets, newBudget]);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving budget:', err);
      setError('Failed to save budget. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare data for the chart
  const chartData = budgets.map(budget => ({
    name: budget.category,
    budget: budget.amount,
    spent: budget.spent,
    remaining: Math.max(0, budget.amount - budget.spent),
    overspent: Math.max(0, budget.spent - budget.amount)
  }));

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-danger-50 p-4 dark:bg-danger-900">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-danger-400 dark:text-danger-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-danger-800 dark:text-danger-200">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
        <div className="mt-4 sm:mt-0">
          <Button
            className="flex items-center"
            onClick={handleAddBudget}
            disabled={isLoading}
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Budget
          </Button>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Budget</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">₹{totalBudget.toLocaleString()}</p>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">Current period</div>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Spent</h2>
          <p className="mt-2 text-3xl font-bold text-danger-600 dark:text-danger-400">₹{totalSpent.toLocaleString()}</p>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{percentSpent.toFixed(1)}% of budget</div>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Remaining</h2>
          <p className={`mt-2 text-3xl font-bold ${
            totalRemaining >= 0
              ? 'text-success-600 dark:text-success-400'
              : 'text-danger-600 dark:text-danger-400'
          }`}>₹{totalRemaining.toLocaleString()}</p>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {totalRemaining >= 0 ? 'Still available' : 'Over budget'}
          </div>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Budget Health</h2>
          <div className="mt-2">
            <div className="relative h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`absolute left-0 top-0 h-4 rounded-full ${
                  percentSpent <= 75
                    ? 'bg-success-500'
                    : percentSpent <= 90
                      ? 'bg-warning-500'
                      : 'bg-danger-500'
                }`}
                style={{ width: `${Math.min(100, percentSpent)}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {percentSpent <= 75
              ? 'Good'
              : percentSpent <= 90
                ? 'Warning'
                : 'Critical'}
          </div>
        </Card>
      </div>

      {/* Budget Chart */}
      <Card>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget vs. Actual Spending</h2>
        {isLoading && chartData.length === 0 ? (
          <div className="flex h-80 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-500"></div>
            <span className="ml-2">Loading...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-80 items-center justify-center text-gray-500 dark:text-gray-400">
            No budget data available. Create a budget to see the chart.
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="budget" name="Budget" fill="#8884d8" />
                <Bar dataKey="spent" name="Spent" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Budget List */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Budgets</h2>
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'all' ? 'primary' : 'outline'}
              className="text-sm"
              onClick={() => setActiveTab('all')}
            >
              All
            </Button>
            <Button
              variant={activeTab === 'over' ? 'primary' : 'outline'}
              className="text-sm"
              onClick={() => setActiveTab('over')}
            >
              Over Budget
            </Button>
            <Button
              variant={activeTab === 'under' ? 'primary' : 'outline'}
              className="text-sm"
              onClick={() => setActiveTab('under')}
            >
              Under Budget
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-500"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading budgets...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Period
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Budget
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Spent
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Remaining
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredBudgets.map((budget) => {
                    const percentUsed = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                    const remaining = budget.amount - budget.spent;

                    return (
                      <tr key={budget.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{budget.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {periods.find(p => p.value === budget.period)?.label || 'Monthly'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                          ₹{budget.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                          ₹{budget.spent.toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                          remaining >= 0
                            ? 'text-success-600 dark:text-success-400'
                            : 'text-danger-600 dark:text-danger-400'
                        }`}>
                          {remaining >= 0 ? '₹' : '-₹'}{Math.abs(remaining).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                              <div
                                className={`h-2.5 rounded-full ${
                                  percentUsed <= 75
                                    ? 'bg-success-500'
                                    : percentUsed <= 90
                                      ? 'bg-warning-500'
                                      : 'bg-danger-500'
                                }`}
                                style={{ width: `${Math.min(100, percentUsed)}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                              {percentUsed.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                            onClick={() => handleEditBudget(budget)}
                            disabled={isLoading}
                          >
                            <PencilIcon className="h-5 w-5" />
                            <span className="sr-only">Edit</span>
                          </button>
                          <button
                            className="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300"
                            onClick={() => handleDeleteBudget(budget.id)}
                            disabled={isLoading}
                          >
                            <TrashIcon className="h-5 w-5" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredBudgets.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">No budgets found matching your filters.</p>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-90"></div>
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  {editingBudget ? 'Edit Budget' : 'Create New Budget'}
                </h3>
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="input mt-1 w-full"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Budget Amount (₹)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      className="input mt-1 w-full"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="0"
                      step="100"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Budget Period
                    </label>
                    <select
                      id="period"
                      name="period"
                      className="input mt-1 w-full"
                      value={formData.period}
                      onChange={handleInputChange}
                      required
                    >
                      {periods.map((period) => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                          {editingBudget ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingBudget ? 'Update Budget' : 'Create Budget'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
