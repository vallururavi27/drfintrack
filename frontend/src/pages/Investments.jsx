import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyRupeeIcon,
  ChartPieIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  ArrowPathIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ExportButton from '../components/ui/ExportButton';
import { firebaseInvestmentService } from '../services/firebaseInvestmentService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'];

export default function Investments() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('1y');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentInvestment, setCurrentInvestment] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    investment_type: 'Stocks',
    category_id: '',
    initial_value: 0,
    current_value: 0,
    current_units: 0,
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
    color: '#3b82f6'
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch investments
  const {
    data: investments = [],
    isLoading: isLoadingInvestments,
    error: investmentsError,
    refetch: refetchInvestments
  } = useQuery({
    queryKey: ['investments'],
    queryFn: firebaseInvestmentService.getInvestments
  });

  // Fetch investment categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['investmentCategories'],
    queryFn: firebaseInvestmentService.getInvestmentCategories
  });

  // Fetch investment stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['investmentStats'],
    queryFn: firebaseInvestmentService.getInvestmentStats
  });

  // Create investment mutation
  const createMutation = useMutation({
    mutationFn: firebaseInvestmentService.createInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investmentStats'] });
      setShowAddModal(false);
    }
  });

  // Update investment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => firebaseInvestmentService.updateInvestment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investmentStats'] });
      setShowAddModal(false);
      setCurrentInvestment(null);
    }
  });

  // Delete investment mutation
  const deleteMutation = useMutation({
    mutationFn: firebaseInvestmentService.deleteInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investmentStats'] });
    }
  });

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchInvestments(), refetchStats()]);
    setIsRefreshing(false);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.investment_type) errors.investment_type = 'Type is required';
    if (!formData.category_id) errors.category_id = 'Category is required';
    if (!formData.initial_value || parseFloat(formData.initial_value) <= 0) errors.initial_value = 'Valid initial value is required';
    if (!formData.start_date) errors.start_date = 'Start date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (currentInvestment) {
      updateMutation.mutate({
        id: currentInvestment.id,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Handle delete investment
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this investment? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  // Prepare data for charts
  const assetAllocationData = [];
  const categoryAllocationData = [];
  const performanceData = [];

  // Calculate portfolio summary
  const totalInvestment = stats ? stats.totalInvested : 0;
  const currentValue = stats ? stats.totalCurrentValue : 0;
  const totalReturn = stats ? stats.totalGain : 0;
  const totalReturnPercentage = stats ? stats.gainPercentage : 0;

  // Prepare asset allocation data
  if (stats && stats.byType) {
    Object.entries(stats.byType).forEach(([type, data]) => {
      assetAllocationData.push({
        name: type,
        value: data.currentValue
      });
    });
  }

  // Prepare category allocation data
  if (stats && stats.byCategory) {
    Object.entries(stats.byCategory).forEach(([category, data]) => {
      categoryAllocationData.push({
        name: category,
        value: data.currentValue,
        color: data.color
      });
    });
  }

  // Filter investments based on type
  const filteredInvestments = selectedType === 'all'
    ? investments
    : investments.filter(investment => investment.investment_type === selectedType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Portfolio</h1>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <ExportButton
            data={investments}
            type="investments"
            title="Export Portfolio"
            options={{ fileName: 'investment_portfolio' }}
          />
          <Button className="flex items-center" onClick={() => {
            setCurrentInvestment(null);
            setFormData({
              name: '',
              investment_type: 'Stocks',
              category_id: '',
              initial_value: 0,
              current_value: 0,
              current_units: 0,
              start_date: new Date().toISOString().split('T')[0],
              notes: '',
              color: '#3b82f6'
            });
            setFormErrors({});
            setShowAddModal(true);
          }}>
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Investment
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

      {/* Loading state */}
      {(isLoadingInvestments || isLoadingStats) && (
        <Card>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading investment data...</span>
          </div>
        </Card>
      )}

      {/* Error state */}
      {(investmentsError || statsError) && (
        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <XCircleIcon className="h-5 w-5 mr-2" />
            <span>Error loading investment data: {investmentsError?.message || statsError?.message}</span>
            <Button onClick={handleRefresh} size="sm" className="ml-auto">
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-primary-100 p-3 dark:bg-primary-900">
              <CurrencyRupeeIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Investment</h2>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">₹{totalInvestment.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-secondary-100 p-3 dark:bg-secondary-900">
              <BanknotesIcon className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Current Value</h2>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">₹{currentValue.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <div className={`rounded-full p-3 ${totalReturn >= 0 ? 'bg-success-100 dark:bg-success-900' : 'bg-danger-100 dark:bg-danger-900'}`}>
              {totalReturn >= 0 ? (
                <ArrowTrendingUpIcon className="h-6 w-6 text-success-600 dark:text-success-400" />
              ) : (
                <ArrowTrendingDownIcon className="h-6 w-6 text-danger-600 dark:text-danger-400" />
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Return</h2>
              <p className={`mt-1 text-2xl font-semibold ${totalReturn >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                {totalReturn >= 0 ? '+' : ''}₹{Math.abs(totalReturn).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <div className={`rounded-full p-3 ${totalReturnPercentage >= 0 ? 'bg-success-100 dark:bg-success-900' : 'bg-danger-100 dark:bg-danger-900'}`}>
              <ChartPieIcon className={`h-6 w-6 ${totalReturnPercentage >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`} />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Return %</h2>
              <p className={`mt-1 text-2xl font-semibold ${totalReturnPercentage >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                {totalReturnPercentage >= 0 ? '+' : ''}{totalReturnPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Portfolio Performance Chart */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Portfolio Performance</h2>
          {performanceData.length > 0 && (
            <ExportButton
              data={performanceData}
              type="investments"
              title="Export Performance"
              options={{
                fileName: 'portfolio_performance',
                pdfTitle: 'Portfolio Performance History'
              }}
            />
          )}
        </div>
        {performanceData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="value" name="Portfolio Value" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <ArrowTrendingUpIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No performance data available</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add investments to track your portfolio performance</p>
          </div>
        )}
      </Card>

      {/* Asset Allocation and Category Allocation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Asset Allocation</h2>
            {assetAllocationData.length > 0 && (
              <ExportButton
                data={assetAllocationData}
                type="investments"
                title="Export"
                options={{
                  fileName: 'asset_allocation',
                  pdfTitle: 'Asset Allocation'
                }}
              />
            )}
          </div>
          {assetAllocationData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {assetAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <ChartPieIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No asset allocation data available</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add investments to see your asset allocation</p>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Category Allocation</h2>
            {categoryAllocationData.length > 0 && (
              <ExportButton
                data={categoryAllocationData}
                type="investments"
                title="Export"
                options={{
                  fileName: 'category_allocation',
                  pdfTitle: 'Category Allocation'
                }}
              />
            )}
          </div>
          {categoryAllocationData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryAllocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <ChartPieIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No category allocation data available</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add investments to see your category allocation</p>
            </div>
          )}
        </Card>
      </div>

      {/* Investments List */}
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Investments</h2>
            {filteredInvestments.length > 0 && (
              <ExportButton
                data={filteredInvestments}
                type="investments"
                title="Export"
                options={{
                  fileName: selectedType === 'all' ? 'all_investments' : `${selectedType.toLowerCase()}_investments`,
                  pdfTitle: selectedType === 'all' ? 'All Investments' : `${selectedType} Investments`
                }}
                className="ml-3"
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === 'all' ? 'primary' : 'outline'}
              className="px-3 py-2 text-sm"
              onClick={() => setSelectedType('all')}
            >
              All
            </Button>
            <Button
              variant={selectedType === 'Stocks' ? 'primary' : 'outline'}
              className="px-3 py-2 text-sm"
              onClick={() => setSelectedType('Stocks')}
            >
              Stocks
            </Button>
            <Button
              variant={selectedType === 'Mutual Fund' ? 'primary' : 'outline'}
              className="px-3 py-2 text-sm"
              onClick={() => setSelectedType('Mutual Fund')}
            >
              Mutual Funds
            </Button>
            <Button
              variant={selectedType === 'Fixed Deposit' ? 'primary' : 'outline'}
              className="px-3 py-2 text-sm"
              onClick={() => setSelectedType('Fixed Deposit')}
            >
              Fixed Deposits
            </Button>
            <Button
              variant={selectedType === 'ETF' ? 'primary' : 'outline'}
              className="px-3 py-2 text-sm"
              onClick={() => setSelectedType('ETF')}
            >
              ETFs
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Investment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Purchase Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Purchase Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Current Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Current Value
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Return
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredInvestments.map((investment) => (
                <tr key={investment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{investment.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{investment.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                      {investment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {investment.purchaseDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    ₹{investment.purchasePrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    ₹{investment.currentPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {investment.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                    ₹{investment.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-medium ${
                      investment.returnPercentage >= 0
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-danger-600 dark:text-danger-400'
                    }`}>
                      {investment.returnPercentage >= 0 ? '+' : ''}
                      {investment.returnPercentage.toFixed(2)}%
                    </div>
                    <div className={`text-xs ${
                      investment.returnAmount >= 0
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-danger-600 dark:text-danger-400'
                    }`}>
                      {investment.returnAmount >= 0 ? '+' : ''}
                      ₹{Math.abs(investment.returnAmount).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3">
                      <PencilIcon className="h-5 w-5" />
                      <span className="sr-only">Edit</span>
                    </button>
                    <button className="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300">
                      <TrashIcon className="h-5 w-5" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvestments.length === 0 && (
          <div className="py-12 text-center">
            {selectedType !== 'all' ? (
              <div>
                <p className="text-gray-500 dark:text-gray-400">No investments found matching your filters.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSelectedType('all')}
                >
                  Show All Investments
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <BuildingLibraryIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No investments yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 mb-4">Get started by adding your first investment</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <PlusIcon className="mr-2 h-5 w-5" />
                  Add Investment
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add Investment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-90"></div>
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  {currentInvestment ? 'Edit Investment' : 'Add New Investment'}
                </h3>
                <form className="mt-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Investment Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className={`input mt-1 w-full ${formErrors.name ? 'border-red-500' : ''}`}
                        placeholder="e.g., HDFC Bank"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                      {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="investment_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </label>
                      <select
                        id="investment_type"
                        name="investment_type"
                        className={`input mt-1 w-full ${formErrors.investment_type ? 'border-red-500' : ''}`}
                        value={formData.investment_type}
                        onChange={(e) => setFormData({ ...formData, investment_type: e.target.value })}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Stocks">Stocks</option>
                        <option value="Mutual Fund">Mutual Fund</option>
                        <option value="Fixed Deposit">Fixed Deposit</option>
                        <option value="ETF">ETF</option>
                        <option value="PPF">PPF</option>
                        <option value="Gold">Gold</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Bonds">Bonds</option>
                        <option value="Other">Other</option>
                      </select>
                      {formErrors.investment_type && <p className="mt-1 text-xs text-red-500">{formErrors.investment_type}</p>}
                    </div>

                    <div>
                      <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category
                      </label>
                      <select
                        id="category_id"
                        name="category_id"
                        className={`input mt-1 w-full ${formErrors.category_id ? 'border-red-500' : ''}`}
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      {formErrors.category_id && <p className="mt-1 text-xs text-red-500">{formErrors.category_id}</p>}
                    </div>

                    <div>
                      <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        className={`input mt-1 w-full ${formErrors.start_date ? 'border-red-500' : ''}`}
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                      />
                      {formErrors.start_date && <p className="mt-1 text-xs text-red-500">{formErrors.start_date}</p>}
                    </div>

                    <div>
                      <label htmlFor="initial_value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Initial Value
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                          type="number"
                          id="initial_value"
                          name="initial_value"
                          className={`input pl-7 w-full ${formErrors.initial_value ? 'border-red-500' : ''}`}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          value={formData.initial_value}
                          onChange={(e) => setFormData({ ...formData, initial_value: e.target.value })}
                          required
                        />
                      </div>
                      {formErrors.initial_value && <p className="mt-1 text-xs text-red-500">{formErrors.initial_value}</p>}
                    </div>

                    <div>
                      <label htmlFor="current_value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Value
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                          type="number"
                          id="current_value"
                          name="current_value"
                          className="input pl-7 w-full"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          value={formData.current_value}
                          onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Leave empty to use initial value</p>
                    </div>

                    <div>
                      <label htmlFor="current_units" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Units/Quantity
                      </label>
                      <input
                        type="number"
                        id="current_units"
                        name="current_units"
                        className="input mt-1 w-full"
                        placeholder="0"
                        step="0.01"
                        min="0"
                        value={formData.current_units}
                        onChange={(e) => setFormData({ ...formData, current_units: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Color
                      </label>
                      <input
                        type="color"
                        id="color"
                        name="color"
                        className="input mt-1 w-full h-10"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notes (Optional)
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        className="input mt-1 w-full"
                        rows="2"
                        placeholder="Additional details about this investment"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddModal(false)}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                          {currentInvestment ? 'Saving...' : 'Adding...'}
                        </>
                      ) : (
                        currentInvestment ? 'Save Changes' : 'Add Investment'
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
