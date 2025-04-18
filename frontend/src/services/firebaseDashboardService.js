import {
  collection, query, where, orderBy, limit, getDocs, getDoc, doc, Timestamp
} from "firebase/firestore";
import { auth, db } from "./firebaseClient";

export const dashboardService = {
  // Get dashboard data
  async getDashboardData() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get current date and first day of month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Convert to Firestore timestamps
      const nowTimestamp = Timestamp.fromDate(now);
      const firstDayOfMonthTimestamp = Timestamp.fromDate(firstDayOfMonth);
      const firstDayOfLastMonthTimestamp = Timestamp.fromDate(firstDayOfLastMonth);
      const lastDayOfLastMonthTimestamp = Timestamp.fromDate(lastDayOfLastMonth);

      // Get bank accounts
      const bankAccountsQuery = query(
        collection(db, "bank_accounts"),
        where("user_id", "==", user.uid),
        orderBy("name", "asc")
      );

      const bankAccountsSnapshot = await getDocs(bankAccountsQuery);
      const bankAccounts = [];
      let totalBalance = 0;

      bankAccountsSnapshot.forEach((doc) => {
        const account = { id: doc.id, ...doc.data() };
        bankAccounts.push(account);
        totalBalance += parseFloat(account.balance || 0);
      });

      // Get recent transactions
      const recentTransactionsQuery = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        orderBy("transaction_date", "desc"),
        limit(5)
      );

      const recentTransactionsSnapshot = await getDocs(recentTransactionsQuery);
      const recentTransactions = [];

      // Process transactions with related data
      for (const doc of recentTransactionsSnapshot.docs) {
        const transaction = { id: doc.id, ...doc.data() };

        // Get bank account details
        if (transaction.account_id) {
          try {
            const accountDoc = await getDoc(doc(db, "bank_accounts", transaction.account_id));
            if (accountDoc.exists()) {
              transaction.bank_accounts = {
                id: accountDoc.id,
                name: accountDoc.data().name,
                bank_name: accountDoc.data().bank_name
              };
            }
          } catch (err) {
            console.error(`Error fetching bank account for transaction ${doc.id}:`, err);
          }
        }

        // Get category details
        if (transaction.category_id) {
          try {
            const categoryDoc = await getDoc(doc(db, "categories", transaction.category_id));
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data();
              transaction.categories = {
                id: categoryDoc.id,
                name: categoryData.name,
                type: categoryData.type,
                icon_name: categoryData.icon_name,
                color: categoryData.color
              };
            }
          } catch (err) {
            console.error(`Error fetching category for transaction ${doc.id}:`, err);
          }
        }

        recentTransactions.push(transaction);
      }

      // Get current month income and expenses
      const currentMonthTransactionsQuery = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("transaction_date", ">=", firstDayOfMonthTimestamp),
        where("transaction_date", "<=", nowTimestamp)
      );

      const currentMonthTransactionsSnapshot = await getDocs(currentMonthTransactionsQuery);
      let currentMonthIncome = 0;
      let currentMonthExpenses = 0;

      currentMonthTransactionsSnapshot.forEach((doc) => {
        const transaction = doc.data();
        const amount = parseFloat(transaction.amount || 0);

        if (transaction.type === 'income') {
          currentMonthIncome += amount;
        } else if (transaction.type === 'expense') {
          currentMonthExpenses += amount;
        }
      });

      // Get last month income and expenses
      const lastMonthTransactionsQuery = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        where("transaction_date", ">=", firstDayOfLastMonthTimestamp),
        where("transaction_date", "<=", lastDayOfLastMonthTimestamp)
      );

      const lastMonthTransactionsSnapshot = await getDocs(lastMonthTransactionsQuery);
      let lastMonthIncome = 0;
      let lastMonthExpenses = 0;

      lastMonthTransactionsSnapshot.forEach((doc) => {
        const transaction = doc.data();
        const amount = parseFloat(transaction.amount || 0);

        if (transaction.type === 'income') {
          lastMonthIncome += amount;
        } else if (transaction.type === 'expense') {
          lastMonthExpenses += amount;
        }
      });

      // Get expense categories for pie chart
      const expenseCategories = {};

      lastMonthTransactionsSnapshot.forEach((doc) => {
        const transaction = doc.data();

        if (transaction.type === 'expense' && transaction.category_id) {
          if (!expenseCategories[transaction.category_id]) {
            expenseCategories[transaction.category_id] = {
              amount: 0,
              name: transaction.category_name || 'Unknown',
              color: '#808080'
            };
          }

          expenseCategories[transaction.category_id].amount += parseFloat(transaction.amount || 0);
        }
      });

      // Get monthly data for charts (last 6 months)
      const monthlyData = [];

      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthStartTimestamp = Timestamp.fromDate(monthStart);
        const monthEndTimestamp = Timestamp.fromDate(monthEnd);

        const monthTransactionsQuery = query(
          collection(db, "transactions"),
          where("user_id", "==", user.uid),
          where("transaction_date", ">=", monthStartTimestamp),
          where("transaction_date", "<=", monthEndTimestamp)
        );

        const monthTransactionsSnapshot = await getDocs(monthTransactionsQuery);
        let monthIncome = 0;
        let monthExpenses = 0;

        monthTransactionsSnapshot.forEach((doc) => {
          const transaction = doc.data();
          const amount = parseFloat(transaction.amount || 0);

          if (transaction.type === 'income') {
            monthIncome += amount;
          } else if (transaction.type === 'expense') {
            monthExpenses += amount;
          }
        });

        monthlyData.push({
          name: monthStart.toLocaleString('default', { month: 'short' }),
          income: monthIncome,
          expenses: monthExpenses
        });
      }

      // Get investments total
      const investmentsQuery = query(
        collection(db, "investments"),
        where("user_id", "==", user.uid)
      );

      const investmentsSnapshot = await getDocs(investmentsQuery);
      let totalInvestments = 0;

      investmentsSnapshot.forEach((doc) => {
        const investment = doc.data();
        totalInvestments += parseFloat(investment.current_value || 0);
      });

      // Calculate income and expense changes
      const incomeChange = lastMonthIncome > 0 ?
        ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;

      const expenseChange = lastMonthExpenses > 0 ?
        ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

      // Format expense categories for pie chart
      const expenseCategoriesData = Object.values(expenseCategories).map(category => ({
        name: category.name,
        value: category.amount,
        color: category.color
      }));

      return {
        bankAccounts,
        totalBalance,
        recentTransactions,
        currentMonthIncome,
        currentMonthExpenses,
        lastMonthIncome,
        lastMonthExpenses,
        incomeChange,
        expenseChange,
        totalInvestments,
        monthlyData,
        expenseCategoriesData
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
      throw error;
    }
  }
};
