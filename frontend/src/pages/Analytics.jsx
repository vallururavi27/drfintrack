import React, { useState, useEffect } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  ChartBarIcon,
  ChartPieIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProfileSelector from '../components/ui/ProfileSelector';
import {
  BarChart,
  Bar,
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
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Empty data for analytics
const monthlyData = [];

const categoryData = [];

const netWorthData = [];

const savingsRateData = [];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function Analytics() {
  const [selectedProfile, setSelectedProfile] = useState('all');
  const [showShared, setShowShared] = useState(true);
  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 1y, all
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total income, expenses, and savings
  const totalIncome = monthlyData.length > 0 ? monthlyData.reduce((sum, month) => sum + month.income, 0) : 0;
  const totalExpenses = monthlyData.length > 0 ? monthlyData.reduce((sum, month) => sum + month.expenses, 0) : 0;
  const totalSavings = monthlyData.length > 0 ? monthlyData.reduce((sum, month) => sum + month.savings, 0) : 0;
  const averageSavingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;

  // Calculate current net worth
  const currentNetWorth = netWorthData.length > 0 ? netWorthData[netWorthData.length - 1].netWorth : 0;
  const previousNetWorth = netWorthData.length > 1 ? netWorthData[netWorthData.length - 2].netWorth : 0;
  const netWorthChange = previousNetWorth > 0 ? ((currentNetWorth - previousNetWorth) / previousNetWorth) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Analytics</h1>

        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
          <ProfileSelector
            selectedProfile={selectedProfile}
            onProfileChange={setSelectedProfile}
            showShared={showShared}
            onShowSharedChange={setShowShared}
          />

          <div className="flex space-x-1">
            <Button
              variant={timeRange === '1m' ? 'primary' : 'outline'}
              className="px-3 py-2 text-sm"
              onClick={() => setTimeRange('1m')}
            >
              1M
            </Button>
            <Button
              variant={timeRange === '3m' ? 'primary' : 'outline'}
              className="px-3 py-2 text-sm"
              onClick={() => setTimeRange('3m')}
            >
              3M
            </Button>
            <Button
              variant={timeRange === '6m' ? 'primary' : 'outline'}
              className="px-3 py-2 text-sm"
              onClick={() => setTimeRange('6m')}
            >
              6M
            </Button>
            <Button
              variant={timeRange === '1y' ? 'primary' : 'outline'}
              className="px-3 py-2 text-sm"
              onClick={() => setTimeRange('1y')}
            >
              1Y
            </Button>
            <Button
              variant={timeRange === 'all' ? 'primary' : 'outline'}
              className="px-3 py-2 text-sm"
              onClick={() => setTimeRange('all')}
            >
              All
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-primary-100 p-3 dark:bg-primary-900">
              <CurrencyRupeeIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Income</h2>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">₹{totalIncome.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 6 months</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-danger-100 p-3 dark:bg-danger-900">
              <ArrowsRightLeftIcon className="h-6 w-6 text-danger-600 dark:text-danger-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Expenses</h2>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">₹{totalExpenses.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 6 months</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-success-100 p-3 dark:bg-success-900">
              <ArrowTrendingUpIcon className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Net Worth</h2>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">₹{currentNetWorth.toLocaleString()}</p>
              <p className={`text-sm ${netWorthChange >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                {netWorthChange >= 0 ? '+' : ''}{netWorthChange.toFixed(1)}% from last month
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-secondary-100 p-3 dark:bg-secondary-900">
              <ChartBarIcon className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Savings Rate</h2>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{averageSavingsRate}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. over 6 months</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Income vs Expenses Chart */}
      <Card>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Income vs Expenses</h2>
        {monthlyData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#0ea5e9" />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                <Bar dataKey="savings" name="Savings" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <ChartBarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No data available</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add transactions to see your income and expenses analysis</p>
          </div>
        )}
      </Card>

      {/* Expense Breakdown and Savings Rate */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Expense Breakdown</h2>
          {categoryData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {categoryData.map((entry, index) => (
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
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No expense data available</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add expense transactions to see your spending breakdown</p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Savings Rate Trend</h2>
          {savingsRateData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={savingsRateData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis unit="%" domain={[0, 50]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="rate" name="Savings Rate" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <ArrowTrendingUpIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No savings data available</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add income and expense transactions to track your savings rate</p>
            </div>
          )}
        </Card>
      </div>

      {/* Net Worth Trend */}
      <Card>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Net Worth Trend</h2>
        {netWorthData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={netWorthData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="assets" name="Assets" fill="#0ea5e9" stroke="#0ea5e9" fillOpacity={0.3} />
                <Area type="monotone" dataKey="liabilities" name="Liabilities" fill="#ef4444" stroke="#ef4444" fillOpacity={0.3} />
                <Area type="monotone" dataKey="netWorth" name="Net Worth" fill="#22c55e" stroke="#22c55e" fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <ArrowTrendingUpIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No net worth data available</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add assets and liabilities to track your net worth</p>
          </div>
        )}
      </Card>

      {/* Top Spending Categories */}
      <Card>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Spending Categories</h2>
        {categoryData.length > 0 ? (
          <div className="space-y-4">
            {categoryData.slice(0, 5).map((category, index) => (
              <div key={category.name} className="flex items-center">
                <div className="w-32 sm:w-40">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
                </div>
                <div className="flex-1">
                  <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-4 rounded-full"
                      style={{
                        width: `${category.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 w-24 text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">₹{category.value.toLocaleString()}</span>
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">({category.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <ChartPieIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No spending data available</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add expense transactions to see your top spending categories</p>
          </div>
        )}
      </Card>
    </div>
  );
}
