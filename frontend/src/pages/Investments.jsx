import React, { useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyRupeeIcon,
  ChartPieIcon,
  BuildingLibraryIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ExportButton from '../components/ui/ExportButton';
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

// Empty investment data
const investmentData = [];

// Calculate portfolio summary
const totalInvestment = investmentData.length > 0 ? investmentData.reduce((sum, investment) => sum + (investment.purchasePrice * investment.quantity), 0) : 0;
const currentValue = investmentData.length > 0 ? investmentData.reduce((sum, investment) => sum + investment.value, 0) : 0;
const totalReturn = currentValue - totalInvestment;
const totalReturnPercentage = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

// Asset allocation data
const assetAllocationData = [];

// Category allocation data
const categoryAllocationData = [];

// Performance history data
const performanceData = [];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function Investments() {
  const [selectedType, setSelectedType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter investments based on type
  const filteredInvestments = selectedType === 'all'
    ? investmentData
    : investmentData.filter(investment => investment.type === selectedType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Portfolio</h1>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <ExportButton
            data={investmentData}
            type="investments"
            title="Export Portfolio"
            options={{ fileName: 'investment_portfolio' }}
          />
          <Button className="flex items-center" onClick={() => setShowAddModal(true)}>
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Investment
          </Button>
        </div>
      </div>

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
                  Add New Investment
                </h3>
                <form className="mt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Investment Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="input mt-1 w-full"
                        placeholder="e.g., HDFC Bank"
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </label>
                      <select
                        id="type"
                        className="input mt-1 w-full"
                      >
                        <option value="Stocks">Stocks</option>
                        <option value="Mutual Fund">Mutual Fund</option>
                        <option value="Fixed Deposit">Fixed Deposit</option>
                        <option value="ETF">ETF</option>
                        <option value="PPF">PPF</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category
                      </label>
                      <input
                        type="text"
                        id="category"
                        className="input mt-1 w-full"
                        placeholder="e.g., Banking, IT, Equity"
                      />
                    </div>

                    <div>
                      <label htmlFor="purchase-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        id="purchase-date"
                        className="input mt-1 w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="purchase-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Purchase Price (₹)
                      </label>
                      <input
                        type="number"
                        id="purchase-price"
                        className="input mt-1 w-full"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quantity
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        className="input mt-1 w-full"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label htmlFor="current-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Price (₹)
                      </label>
                      <input
                        type="number"
                        id="current-price"
                        className="input mt-1 w-full"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Add Investment
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
