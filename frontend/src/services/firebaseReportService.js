import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp 
} from "firebase/firestore";
import { auth, db } from "./firebaseClient";

export const reportService = {
  // Get income vs expense data for a specific time period
  async getIncomeVsExpenseData(timeFrame = 'monthly', customRange = null) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Calculate date range based on timeFrame
      const { startDate, endDate, groupByFormat } = getDateRangeAndFormat(timeFrame, customRange);

      // Get all transactions within the date range
      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("transaction_date", ">=", Timestamp.fromDate(startDate)),
        where("transaction_date", "<=", Timestamp.fromDate(endDate)),
        orderBy("transaction_date", "asc")
      );

      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          transaction_date: data.transaction_date.toDate()
        };
      });

      // Group transactions by period (month, quarter, year)
      const groupedData = groupTransactionsByPeriod(transactions, groupByFormat);

      return groupedData;
    } catch (error) {
      console.error('Error fetching income vs expense data:', error);
      throw error;
    }
  },

  // Get expense breakdown data
  async getExpenseBreakdown(timeFrame = 'monthly', customRange = null) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Calculate date range based on timeFrame
      const { startDate, endDate } = getDateRangeAndFormat(timeFrame, customRange);

      // Get all expense transactions within the date range
      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("type", "==", "expense"),
        where("transaction_date", ">=", Timestamp.fromDate(startDate)),
        where("transaction_date", "<=", Timestamp.fromDate(endDate))
      );

      const querySnapshot = await getDocs(q);
      const expenses = [];
      
      // Process expenses with category data
      for (const doc of querySnapshot.docs) {
        const expense = { id: doc.id, ...doc.data() };
        
        // Get category details if available
        if (expense.category_id) {
          try {
            const categoryDoc = await getDocs(
              query(
                collection(db, "categories"),
                where("id", "==", expense.category_id)
              )
            );
            
            if (!categoryDoc.empty) {
              const categoryData = categoryDoc.docs[0].data();
              expense.category_name = categoryData.name;
            } else {
              expense.category_name = "Uncategorized";
            }
          } catch (err) {
            console.error(`Error fetching category for expense ${doc.id}:`, err);
            expense.category_name = "Uncategorized";
          }
        } else {
          expense.category_name = "Uncategorized";
        }
        
        expenses.push(expense);
      }

      // Group expenses by category
      const categoryTotals = {};
      let totalExpenses = 0;

      expenses.forEach(expense => {
        const amount = parseFloat(expense.amount || 0);
        totalExpenses += amount;
        
        const categoryName = expense.category_name || expense.categories?.name || "Uncategorized";
        
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = 0;
        }
        
        categoryTotals[categoryName] += amount;
      });

      // Convert to percentage-based array for pie chart
      const result = Object.entries(categoryTotals).map(([name, amount]) => ({
        name,
        value: totalExpenses > 0 ? parseFloat(((amount / totalExpenses) * 100).toFixed(1)) : 0,
        amount
      }));

      return result.sort((a, b) => b.value - a.value);
    } catch (error) {
      console.error('Error fetching expense breakdown:', error);
      throw error;
    }
  },

  // Get income breakdown data
  async getIncomeBreakdown(timeFrame = 'monthly', customRange = null) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Calculate date range based on timeFrame
      const { startDate, endDate } = getDateRangeAndFormat(timeFrame, customRange);

      // Get all income transactions within the date range
      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("type", "==", "income"),
        where("transaction_date", ">=", Timestamp.fromDate(startDate)),
        where("transaction_date", "<=", Timestamp.fromDate(endDate))
      );

      const querySnapshot = await getDocs(q);
      const incomes = [];
      
      // Process incomes with category data
      for (const doc of querySnapshot.docs) {
        const income = { id: doc.id, ...doc.data() };
        
        // Get category details if available
        if (income.category_id) {
          try {
            const categoryDoc = await getDocs(
              query(
                collection(db, "categories"),
                where("id", "==", income.category_id)
              )
            );
            
            if (!categoryDoc.empty) {
              const categoryData = categoryDoc.docs[0].data();
              income.category_name = categoryData.name;
            } else {
              income.category_name = "Uncategorized";
            }
          } catch (err) {
            console.error(`Error fetching category for income ${doc.id}:`, err);
            income.category_name = "Uncategorized";
          }
        } else {
          income.category_name = "Uncategorized";
        }
        
        incomes.push(income);
      }

      // Group incomes by category
      const categoryTotals = {};
      let totalIncome = 0;

      incomes.forEach(income => {
        const amount = parseFloat(income.amount || 0);
        totalIncome += amount;
        
        const categoryName = income.category_name || income.categories?.name || "Uncategorized";
        
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = 0;
        }
        
        categoryTotals[categoryName] += amount;
      });

      // Convert to percentage-based array for pie chart
      const result = Object.entries(categoryTotals).map(([name, amount]) => ({
        name,
        value: totalIncome > 0 ? parseFloat(((amount / totalIncome) * 100).toFixed(1)) : 0,
        amount
      }));

      return result.sort((a, b) => b.value - a.value);
    } catch (error) {
      console.error('Error fetching income breakdown:', error);
      throw error;
    }
  },

  // Get savings trend data
  async getSavingsTrend(timeFrame = 'monthly', customRange = null) {
    try {
      // Reuse the income vs expense data
      const incomeVsExpenseData = await this.getIncomeVsExpenseData(timeFrame, customRange);
      
      // Calculate savings for each period
      const savingsData = incomeVsExpenseData.map(period => ({
        name: period.name,
        savings: period.income - period.expenses
      }));

      return savingsData;
    } catch (error) {
      console.error('Error fetching savings trend:', error);
      throw error;
    }
  },

  // Generate a tax report
  async getTaxReport(year) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const startDate = new Date(year, 0, 1); // January 1st of the specified year
      const endDate = new Date(year, 11, 31); // December 31st of the specified year

      // Get all transactions within the year
      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("transaction_date", ">=", Timestamp.fromDate(startDate)),
        where("transaction_date", "<=", Timestamp.fromDate(endDate))
      );

      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          transaction_date: data.transaction_date.toDate()
        };
      });

      // Separate income and expenses
      const incomes = transactions.filter(t => t.type === 'income');
      const expenses = transactions.filter(t => t.type === 'expense');

      // Calculate totals
      const totalIncome = incomes.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      // Group by categories
      const incomeByCategory = groupByCategory(incomes);
      const expensesByCategory = groupByCategory(expenses);

      return {
        year,
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        incomeByCategory,
        expensesByCategory
      };
    } catch (error) {
      console.error('Error generating tax report:', error);
      throw error;
    }
  },

  // Generate a budget analysis report
  async getBudgetAnalysis(timeFrame = 'monthly', customRange = null) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Calculate date range based on timeFrame
      const { startDate, endDate } = getDateRangeAndFormat(timeFrame, customRange);

      // Get all expense transactions within the date range
      const expenseQuery = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("type", "==", "expense"),
        where("transaction_date", ">=", Timestamp.fromDate(startDate)),
        where("transaction_date", "<=", Timestamp.fromDate(endDate))
      );

      // Get all budget entries
      const budgetQuery = query(
        collection(db, "budgets"),
        where("user_id", "==", user.uid)
      );

      const [expenseSnapshot, budgetSnapshot] = await Promise.all([
        getDocs(expenseQuery),
        getDocs(budgetQuery)
      ]);

      const expenses = expenseSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          transaction_date: data.transaction_date.toDate()
        };
      });

      const budgets = budgetSnapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        };
      });

      // Group expenses by category
      const expensesByCategory = {};
      expenses.forEach(expense => {
        const categoryId = expense.category_id;
        if (!categoryId) return;

        if (!expensesByCategory[categoryId]) {
          expensesByCategory[categoryId] = 0;
        }
        expensesByCategory[categoryId] += parseFloat(expense.amount || 0);
      });

      // Compare with budget
      const analysis = [];
      for (const budget of budgets) {
        const categoryId = budget.category_id;
        const budgetAmount = parseFloat(budget.amount || 0);
        const actualAmount = expensesByCategory[categoryId] || 0;
        const difference = budgetAmount - actualAmount;
        const percentUsed = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0;

        analysis.push({
          category_id: categoryId,
          category_name: budget.category_name || 'Unknown',
          budget_amount: budgetAmount,
          actual_amount: actualAmount,
          difference,
          percent_used: parseFloat(percentUsed.toFixed(1)),
          status: percentUsed > 100 ? 'over' : percentUsed >= 80 ? 'warning' : 'good'
        });
      }

      return analysis;
    } catch (error) {
      console.error('Error generating budget analysis:', error);
      throw error;
    }
  }
};

// Helper function to calculate date range and format based on timeFrame
function getDateRangeAndFormat(timeFrame, customRange) {
  const now = new Date();
  let startDate, endDate, groupByFormat;

  switch (timeFrame) {
    case 'monthly':
      // Last 6 months
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
      groupByFormat = 'month';
      break;
    case 'quarterly':
      // Last 4 quarters (1 year)
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      groupByFormat = 'quarter';
      break;
    case 'yearly':
      // Last 5 years
      startDate = new Date(now.getFullYear() - 4, 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      groupByFormat = 'year';
      break;
    case 'custom':
      if (customRange && customRange.start && customRange.end) {
        startDate = new Date(customRange.start);
        endDate = new Date(customRange.end);
        
        // Determine appropriate grouping based on date range
        const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                          endDate.getMonth() - startDate.getMonth();
        
        if (diffMonths <= 12) {
          groupByFormat = 'month';
        } else if (diffMonths <= 60) {
          groupByFormat = 'quarter';
        } else {
          groupByFormat = 'year';
        }
      } else {
        // Default to last 6 months if custom range is invalid
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        groupByFormat = 'month';
      }
      break;
    default:
      // Default to monthly
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      groupByFormat = 'month';
  }

  return { startDate, endDate, groupByFormat };
}

// Helper function to group transactions by period (month, quarter, year)
function groupTransactionsByPeriod(transactions, groupByFormat) {
  const groupedData = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];

  transactions.forEach(transaction => {
    const date = transaction.transaction_date;
    const amount = parseFloat(transaction.amount || 0);
    const type = transaction.type;
    
    let periodKey, periodName;
    
    if (groupByFormat === 'month') {
      // Format: "Jan 2023"
      periodKey = `${date.getFullYear()}-${date.getMonth()}`;
      periodName = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    } else if (groupByFormat === 'quarter') {
      // Format: "Q1 2023"
      const quarter = Math.floor(date.getMonth() / 3);
      periodKey = `${date.getFullYear()}-${quarter}`;
      periodName = `${quarterNames[quarter]} ${date.getFullYear()}`;
    } else {
      // Format: "2023"
      periodKey = `${date.getFullYear()}`;
      periodName = `${date.getFullYear()}`;
    }
    
    if (!groupedData[periodKey]) {
      groupedData[periodKey] = {
        name: periodName,
        income: 0,
        expenses: 0
      };
    }
    
    if (type === 'income') {
      groupedData[periodKey].income += amount;
    } else if (type === 'expense') {
      groupedData[periodKey].expenses += amount;
    }
  });

  // Convert to array and sort by period
  return Object.values(groupedData).sort((a, b) => {
    // Extract year and period for comparison
    const [aName, aYear] = a.name.split(' ').reverse();
    const [bName, bYear] = b.name.split(' ').reverse();
    
    // If years are different, sort by year
    if (aYear !== bYear) {
      return aYear - bYear;
    }
    
    // If years are the same but format is quarters
    if (aName.startsWith('Q') && bName.startsWith('Q')) {
      return aName.substring(1) - bName.substring(1);
    }
    
    // If years are the same and format is months
    const aMonthIndex = monthNames.indexOf(aName);
    const bMonthIndex = monthNames.indexOf(bName);
    return aMonthIndex - bMonthIndex;
  });
}

// Helper function to group transactions by category
function groupByCategory(transactions) {
  const categoryTotals = {};
  
  transactions.forEach(transaction => {
    const amount = parseFloat(transaction.amount || 0);
    const categoryName = transaction.category_name || transaction.categories?.name || "Uncategorized";
    
    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = 0;
    }
    
    categoryTotals[categoryName] += amount;
  });
  
  return Object.entries(categoryTotals).map(([name, amount]) => ({
    name,
    amount
  })).sort((a, b) => b.amount - a.amount);
}
