import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/firebaseReportService';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ExportButton from '../components/ui/ExportButton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export default function Reports() {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // State for report type and time frame
  const [reportType, setReportType] = useState('income-expense');
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [customRange, setCustomRange] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Income vs Expense data query
  const {
    data: monthlyData = [],
    isLoading: isLoadingMonthlyData,
    refetch: refetchMonthlyData
  } = useQuery({
    queryKey: ['reports', 'income-expense', timeFrame, customRange],
    queryFn: () => reportService.getIncomeVsExpenseData(timeFrame, customRange),
    enabled: reportType === 'income-expense' || reportType === 'savings-trend'
  });

  // Expense breakdown query
  const {
    data: expenseCategories = [],
    isLoading: isLoadingExpenseCategories,
    refetch: refetchExpenseCategories
  } = useQuery({
    queryKey: ['reports', 'expense-breakdown', timeFrame, customRange],
    queryFn: () => reportService.getExpenseBreakdown(timeFrame, customRange),
    enabled: reportType === 'expense-breakdown'
  });

  // Income breakdown query
  const {
    data: incomeCategories = [],
    isLoading: isLoadingIncomeCategories,
    refetch: refetchIncomeCategories
  } = useQuery({
    queryKey: ['reports', 'income-breakdown', timeFrame, customRange],
    queryFn: () => reportService.getIncomeBreakdown(timeFrame, customRange),
    enabled: reportType === 'income-breakdown'
  });

  // Savings trend query
  const {
    data: savingsData = [],
    isLoading: isLoadingSavingsData,
    refetch: refetchSavingsData
  } = useQuery({
    queryKey: ['reports', 'savings-trend', timeFrame, customRange],
    queryFn: () => reportService.getSavingsTrend(timeFrame, customRange),
    enabled: reportType === 'savings-trend'
  });

  // Handle generate report button click
  const handleGenerateReport = () => {
    setIsGenerating(true);

    // Refetch the appropriate data based on report type
    if (reportType === 'income-expense') {
      refetchMonthlyData();
    } else if (reportType === 'expense-breakdown') {
      refetchExpenseCategories();
    } else if (reportType === 'income-breakdown') {
      refetchIncomeCategories();
    } else if (reportType === 'savings-trend') {
      refetchSavingsData();
    }

    setIsGenerating(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Analyze your financial data</p>
        </div>
        <div className="mt-2 sm:mt-0 flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <PrinterIcon className="h-4 w-4 mr-1" />
            Print
          </Button>
          <ExportButton
            data={reportType === 'expense-breakdown' ? expenseCategories :
                  reportType === 'income-breakdown' ? incomeCategories :
                  monthlyData}
            type="reports"
            title="Export"
            options={{
              fileName: `report_${reportType}`,
              reportType: reportType,
              timeFrame: timeFrame,
              pdfTitle: `${reportType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Report`
            }}
          />
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div>
              <label htmlFor="report-type" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Report Type
              </label>
              <select
                id="report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input mt-1 text-xs py-1 px-2"
              >
                <option value="income-expense">Income vs Expenses</option>
                <option value="expense-breakdown">Expense Breakdown</option>
                <option value="income-breakdown">Income Breakdown</option>
                <option value="savings-trend">Savings Trend</option>
              </select>
            </div>
            <div>
              <label htmlFor="time-frame" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Time Frame
              </label>
              <select
                id="time-frame"
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="input mt-1 text-xs py-1 px-2"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
            <ExportButton
              data={reportType === 'expense-breakdown' ? expenseCategories :
                    reportType === 'income-breakdown' ? incomeCategories :
                    monthlyData}
              type="reports"
              title="Export"
              options={{
                fileName: `report_${reportType}_${timeFrame}`,
                reportType: reportType,
                timeFrame: timeFrame,
                pdfTitle: `${reportType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Report (${timeFrame})`
              }}
            />
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {reportType === 'income-expense' && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-md font-medium text-gray-900 dark:text-white">Income vs Expenses</h2>
            {monthlyData.length > 0 && (
              <ExportButton
                data={monthlyData}
                type="reports"
                title="Export"
                options={{
                  fileName: 'income_vs_expenses',
                  reportType: 'income-expense',
                  pdfTitle: 'Income vs Expenses Report'
                }}
              />
            )}
          </div>
          {isLoadingMonthlyData ? (
            <div className="py-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">Loading data...</p>
            </div>
          ) : monthlyData.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="income" name="Income" fill="#22c55e" />
                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Income</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ₹{monthlyData.reduce((sum, item) => sum + item.income, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ₹{monthlyData.reduce((sum, item) => sum + item.expenses, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">No data available</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Add income and expense transactions to generate reports</p>
              <Button onClick={handleGenerateReport} size="sm" variant="primary">
                Generate Report
              </Button>
            </div>
          )}
        </Card>
      )}

      {reportType === 'expense-breakdown' && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-md font-medium text-gray-900 dark:text-white">Expense Breakdown</h2>
            {expenseCategories.length > 0 && (
              <ExportButton
                data={expenseCategories}
                type="reports"
                title="Export"
                options={{
                  fileName: 'expense_breakdown',
                  reportType: 'category-breakdown',
                  pdfTitle: 'Expense Breakdown Report'
                }}
              />
            )}
          </div>
          {isLoadingExpenseCategories ? (
            <div className="py-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">Loading data...</p>
            </div>
          ) : expenseCategories.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Top Expense Category</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {expenseCategories[0].name} ({expenseCategories[0].value}%)
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <ChartPieIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">No expense data available</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Add expense transactions to generate reports</p>
              <Button onClick={handleGenerateReport} size="sm" variant="primary">
                Generate Report
              </Button>
            </div>
          )}
        </Card>
      )}

      {reportType === 'income-breakdown' && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-md font-medium text-gray-900 dark:text-white">Income Breakdown</h2>
            {incomeCategories.length > 0 && (
              <ExportButton
                data={incomeCategories}
                type="reports"
                title="Export"
                options={{
                  fileName: 'income_breakdown',
                  reportType: 'category-breakdown',
                  pdfTitle: 'Income Breakdown Report'
                }}
              />
            )}
          </div>
          {isLoadingIncomeCategories ? (
            <div className="py-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">Loading data...</p>
            </div>
          ) : incomeCategories.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {incomeCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Primary Income Source</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {incomeCategories[0].name} ({incomeCategories[0].value}%)
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <ChartPieIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">No income data available</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Add income transactions to generate reports</p>
              <Button onClick={handleGenerateReport} size="sm" variant="primary">
                Generate Report
              </Button>
            </div>
          )}
        </Card>
      )}

      {reportType === 'savings-trend' && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-md font-medium text-gray-900 dark:text-white">Savings Trend</h2>
            {monthlyData.length > 0 && (
              <ExportButton
                data={monthlyData.map(item => ({
                  name: item.name,
                  savings: item.income - item.expenses
                }))}
                type="reports"
                title="Export"
                options={{
                  fileName: 'savings_trend',
                  reportType: 'savings-trend',
                  pdfTitle: 'Savings Trend Report'
                }}
              />
            )}
          </div>
          {isLoadingSavingsData ? (
            <div className="py-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">Loading data...</p>
            </div>
          ) : savingsData.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={savingsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="savings"
                      name="Savings"
                      stroke="#0ea5e9"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Savings</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ₹{savingsData.reduce((sum, item) => sum + item.savings, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Average Monthly Savings</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ₹{Math.round(savingsData.reduce((sum, item) => sum + item.savings, 0) / savingsData.length).toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <ArrowTrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">No savings data available</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Add income and expense transactions to generate savings reports</p>
              <Button onClick={handleGenerateReport} size="sm" variant="primary">
                Generate Report
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Available Reports */}
      <Card>
        <h2 className="text-md font-medium text-gray-900 dark:text-white mb-3">Available Reports</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => setReportType('income-expense')}>
            <ChartBarIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Income vs Expenses</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Compare your income and expenses</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => setReportType('expense-breakdown')}>
            <ChartPieIcon className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Expense Breakdown</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Analyze your spending patterns</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => setReportType('income-breakdown')}>
            <ChartPieIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Income Breakdown</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Analyze your income sources</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => setReportType('savings-trend')}>
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Savings Trend</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Track your savings over time</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <DocumentTextIcon className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Tax Report</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Generate tax-related reports</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <DocumentTextIcon className="h-8 w-8 text-teal-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Budget Analysis</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Compare budget vs actual spending</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
