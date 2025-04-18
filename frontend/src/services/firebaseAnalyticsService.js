import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp,
  getDoc,
  doc
} from "firebase/firestore";
import { auth, db } from "./firebaseClient";

export const analyticsService = {
  // Get income vs expenses data for a specific time range
  async getIncomeVsExpensesData(timeRange = '6m') {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Calculate date range based on timeRange
      const { startDate, endDate } = getDateRange(timeRange);

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

      // Group transactions by month
      const monthlyData = groupTransactionsByMonth(transactions);

      return monthlyData;
    } catch (error) {
      console.error('Error fetching income vs expenses data:', error);
      throw error;
    }
  },

  // Get expense breakdown by category
  async getExpenseBreakdown(timeRange = '6m') {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Calculate date range based on timeRange
      const { startDate, endDate } = getDateRange(timeRange);

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
            const categoryDoc = await getDoc(doc(db, "categories", expense.category_id));
            
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
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

      // Convert to array for pie chart
      const result = Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value,
        percentage: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0
      }));

      return result.sort((a, b) => b.value - a.value);
    } catch (error) {
      console.error('Error fetching expense breakdown:', error);
      throw error;
    }
  },

  // Get savings rate data
  async getSavingsRateData(timeRange = '6m') {
    try {
      // Reuse the income vs expenses data
      const monthlyData = await this.getIncomeVsExpensesData(timeRange);
      
      // Calculate savings rate for each month
      const savingsRateData = monthlyData.map(month => ({
        month: month.month,
        rate: month.income > 0 ? Math.round((month.savings / month.income) * 100) : 0
      }));

      return savingsRateData;
    } catch (error) {
      console.error('Error fetching savings rate data:', error);
      throw error;
    }
  },

  // Get net worth data
  async getNetWorthData(timeRange = '6m') {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Calculate date range based on timeRange
      const { startDate, endDate } = getDateRange(timeRange);

      // Get all bank accounts
      const bankAccountsQuery = query(
        collection(db, "bank_accounts"),
        where("user_id", "==", user.uid)
      );

      const bankAccountsSnapshot = await getDocs(bankAccountsQuery);
      const bankAccounts = bankAccountsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get all transactions within the date range
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("transaction_date", ">=", Timestamp.fromDate(startDate)),
        where("transaction_date", "<=", Timestamp.fromDate(endDate)),
        orderBy("transaction_date", "asc")
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          transaction_date: data.transaction_date.toDate()
        };
      });

      // Calculate monthly net worth data
      const netWorthData = calculateMonthlyNetWorth(bankAccounts, transactions, startDate, endDate);

      return netWorthData;
    } catch (error) {
      console.error('Error fetching net worth data:', error);
      throw error;
    }
  }
};

// Helper function to calculate date range based on timeRange
function getDateRange(timeRange) {
  const now = new Date();
  let startDate, endDate;

  switch (timeRange) {
    case '1m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case '3m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case '6m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case '1y':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'all':
      startDate = new Date(2000, 0, 1); // Far in the past
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  return { startDate, endDate };
}

// Helper function to group transactions by month
function groupTransactionsByMonth(transactions) {
  const monthlyData = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  transactions.forEach(transaction => {
    const date = transaction.transaction_date;
    const amount = parseFloat(transaction.amount || 0);
    const type = transaction.type;
    
    // Format: "Jan 2023"
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthName = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthName,
        income: 0,
        expenses: 0,
        savings: 0
      };
    }
    
    if (type === 'income') {
      monthlyData[monthKey].income += amount;
    } else if (type === 'expense') {
      monthlyData[monthKey].expenses += amount;
    }
    
    // Calculate savings
    monthlyData[monthKey].savings = monthlyData[monthKey].income - monthlyData[monthKey].expenses;
  });

  // Convert to array and sort by date
  return Object.values(monthlyData).sort((a, b) => {
    const [aMonth, aYear] = a.month.split(' ');
    const [bMonth, bYear] = b.month.split(' ');
    
    if (aYear !== bYear) {
      return aYear - bYear;
    }
    
    return monthNames.indexOf(aMonth) - monthNames.indexOf(bMonth);
  });
}

// Helper function to calculate monthly net worth
function calculateMonthlyNetWorth(bankAccounts, transactions, startDate, endDate) {
  const monthlyData = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate initial assets (sum of all bank account balances)
  const initialAssets = bankAccounts.reduce((sum, account) => sum + parseFloat(account.balance || 0), 0);
  
  // Generate monthly data points
  let currentDate = new Date(startDate);
  let currentAssets = initialAssets;
  let currentLiabilities = 0;
  
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = `${monthNames[month]} ${year}`;
    
    // Filter transactions for this month
    const monthTransactions = transactions.filter(t => {
      const tDate = t.transaction_date;
      return tDate.getFullYear() === year && tDate.getMonth() === month;
    });
    
    // Calculate month's income and expenses
    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    // Update assets and liabilities
    currentAssets += monthIncome;
    currentAssets -= monthExpenses;
    
    // Calculate net worth
    const netWorth = currentAssets - currentLiabilities;
    
    // Add data point
    monthlyData.push({
      month: monthName,
      assets: currentAssets,
      liabilities: currentLiabilities,
      netWorth: netWorth
    });
    
    // Move to next month
    currentDate = new Date(year, month + 1, 1);
  }
  
  return monthlyData;
}
