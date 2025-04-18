import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/firebaseDashboardService';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanknotesIcon,
  CreditCardIcon,
  WalletIcon,
  ArrowTrendingUpIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// Default colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: dashboardService.getDashboardData,
    refetchOnWindowFocus: false
  });

  // Process dashboard data when it's available
  useEffect(() => {
    if (dashboardData) {
      // Set bank accounts
      setBankAccounts(dashboardData.bankAccounts || []);

      // Set recent transactions
      setRecentTransactions(dashboardData.recentTransactions || []);

      // Set monthly data for charts
      setMonthlyData(dashboardData.monthlyData || []);

      // Set expense data for pie chart
      setExpenseData(dashboardData.expenseCategoriesData || []);

      // Format stats
      const formattedStats = [
        {
          name: 'Total Balance',
          value: `₹${dashboardData.totalBalance.toLocaleString()}`,
          change: '0%',
          changeType: 'neutral',
          icon: WalletIcon,
          iconBg: 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300',
        },
        {
          name: 'Monthly Income',
          value: `₹${dashboardData.currentMonthIncome.toLocaleString()}`,
          change: `${Math.abs(dashboardData.incomeChange).toFixed(1)}%`,
          changeType: dashboardData.incomeChange > 0 ? 'increase' : dashboardData.incomeChange < 0 ? 'decrease' : 'neutral',
          icon: ArrowUpIcon,
          iconBg: 'bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-300',
        },
        {
          name: 'Monthly Expenses',
          value: `₹${dashboardData.currentMonthExpenses.toLocaleString()}`,
          change: `${Math.abs(dashboardData.expenseChange).toFixed(1)}%`,
          changeType: dashboardData.expenseChange > 0 ? 'increase' : dashboardData.expenseChange < 0 ? 'decrease' : 'neutral',
          icon: ArrowDownIcon,
          iconBg: 'bg-danger-100 text-danger-600 dark:bg-danger-900 dark:text-danger-300',
        },
        {
          name: 'Investments',
          value: `₹${dashboardData.totalInvestments.toLocaleString()}`,
          change: '0%',
          changeType: 'neutral',
          icon: ArrowTrendingUpIcon,
          iconBg: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-300',
        },
      ];

      setStats(formattedStats);
    }
  }, [dashboardData]);

  const handleAddTransaction = () => {
    navigate('/transactions', { state: { openTransactionModal: true } });
  };
  return (
    <div className="space-y-3">
      {/* Overview section */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-md font-medium text-gray-900 dark:text-white">Financial overview</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Your financial summary</p>
        </div>
        <div>
          <button
            className="btn btn-primary text-sm py-1 px-3"
            onClick={handleAddTransaction}
          >
            Add Transaction
          </button>
        </div>
      </div>

      {/* Main financial summary cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border-l-4 border-l-primary-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="qb-section-title">Profit and Loss</h3>
            <span className="text-xs text-gray-500">Last month</span>
          </div>
          <div className="flex items-baseline">
            <p className="qb-value">₹0</p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Income</span>
              <span className="text-xs font-medium">₹0</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Expenses</span>
              <span className="text-xs font-medium">₹0</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-teal-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-secondary-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="qb-section-title">Expenses</h3>
            <span className="text-xs text-gray-500">Last month</span>
          </div>
          <div className="flex items-baseline">
            <p className="qb-value">₹0</p>
          </div>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                <span>Salaries</span>
              </div>
              <p className="font-medium">₹0</p>
            </div>
            <div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Rent</span>
              </div>
              <p className="font-medium">₹0</p>
            </div>
            <div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span>Utilities</span>
              </div>
              <p className="font-medium">₹0</p>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-600">
          <div className="flex justify-between items-center mb-2">
            <h3 className="qb-section-title">Bank accounts</h3>
            <span className="text-xs text-gray-500">See all</span>
          </div>

          <div className="space-y-4 mt-2">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading accounts...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-sm text-red-500 dark:text-red-400">Error loading accounts</p>
              </div>
            ) : bankAccounts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">No bank accounts found</p>
                <button
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 mt-2"
                  onClick={() => navigate('/banking/accounts')}
                >
                  Add an account
                </button>
              </div>
            ) : (
              bankAccounts.slice(0, 3).map(account => (
                <div key={account.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center">
                    <BuildingLibraryIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium dark:text-white">{account.bank_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{account.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium dark:text-white">₹{parseFloat(account.balance || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                  </div>
                </div>
              ))
            )}
            {!isLoading && !error && bankAccounts.length > 0 && (
              <button
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 w-full text-center mt-2"
                onClick={() => navigate('/banking/accounts')}
              >
                View all accounts
              </button>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="col-span-1">
          <div className="flex justify-between items-center mb-3">
            <h3 className="qb-section-title">Income</h3>
            <span className="text-xs text-gray-500">Last 180 days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#00af91" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-2 text-sm">
            <div>
              <p className="font-medium">₹0</p>
              <p className="text-xs text-gray-500">PENDING BILLS</p>
            </div>
            <div>
              <p className="font-medium">₹0</p>
              <p className="text-xs text-gray-500">OVERDUE BILLS</p>
            </div>
            <div>
              <p className="font-medium">₹0</p>
              <p className="text-xs text-gray-500">PAID THIS MONTH</p>
            </div>
          </div>
        </Card>

        <Card className="col-span-1">
          <div className="flex justify-between items-center mb-3">
            <h3 className="qb-section-title">Income Trends</h3>
            <span className="text-xs text-gray-500">This quarter</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#0077C5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm">
              <p className="font-medium">₹0</p>
              <p className="text-xs text-gray-500">TOTAL INCOME</p>
            </div>
            <div>
              <button className="btn btn-outline text-xs py-1 px-2" onClick={() => navigate('/income')}>View Income</button>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="qb-section-title">Recent Transactions</h3>
          <button
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
            onClick={() => navigate('/transactions')}
          >
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transaction
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 whitespace-nowrap" colSpan="4">
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">Loading transactions...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 whitespace-nowrap" colSpan="4">
                    <div className="text-center text-xs text-red-500 dark:text-red-400">Error loading transactions</div>
                  </td>
                </tr>
              ) : recentTransactions.length === 0 ? (
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 whitespace-nowrap" colSpan="4">
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">No transactions yet</div>
                  </td>
                </tr>
              ) : (
                recentTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.bank_accounts?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.categories?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.transaction_date && transaction.transaction_date.toDate ?
                          transaction.transaction_date.toDate().toLocaleDateString() :
                          new Date(transaction.transaction_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
