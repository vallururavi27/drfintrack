import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initializeTheme } from './utils/themeUtils'
import { SearchProvider } from './contexts/SearchContext'
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext'
import { initializeDefaultData } from './services/dataService'
import { auth } from './services/firebaseClient'
import { onAuthStateChanged } from 'firebase/auth'

// Layout
import Layout from './components/layout/Layout'

// Pages
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import UpiTransactions from './pages/UpiTransactions'
import Budget from './pages/Budget'
import Analytics from './pages/Analytics'
import Investments from './pages/Investments'
import SettingsNew from './pages/SettingsNew'
import Banking from './pages/Banking'
import BankAccounts from './pages/BankAccounts'
import Expenses from './pages/Expenses'
import Income from './pages/Income'
import Reports from './pages/Reports'
import SearchResults from './pages/SearchResults'
// Firebase Auth Components
import Login from './pages/FirebaseLogin'
import ForgotPassword from './pages/FirebaseForgotPassword'

// Legacy Auth Components (for reference)
// import OriginalLogin from './pages/Login' // Commented out to avoid unused import warning
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import SecuritySettings from './pages/SecuritySettings'
import ApiKeys from './pages/ApiKeys'
import AuthTest from './pages/AuthTest'
import FirebaseAuthTest from './pages/FirebaseAuthTest'

// Create a client
const queryClient = new QueryClient()

// Protected route component
const ProtectedRoute = ({ children }) => {
  // Using Firebase auth instead of token
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated with Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme and default data on app load
  useEffect(() => {
    // Initialize theme and data
    console.log('Initializing app...');

    // Clean up any test/demo data that might be in localStorage
    localStorage.removeItem('allowDemoUser');

    initializeTheme();
    initializeDefaultData();
  }, []);

  // Check for authentication changes using Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);

      if (user) {
        // Store user info in localStorage for compatibility with existing code
        user.getIdToken().then(token => {
          localStorage.setItem('token', token);
          localStorage.setItem('email', user.email);
          localStorage.setItem('name', user.displayName || user.email);
        });
      } else {
        // Clear localStorage when user is not authenticated
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('name');
      }
    });

    return () => unsubscribe();
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading application...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/auth-test" element={<AuthTest />} />
            <Route path="/firebase-auth-test" element={<FirebaseAuthTest />} />

            {/* Protected routes */}
            <Route element={
              <ProtectedRoute>
                <SearchProvider>
                  <Layout />
                </SearchProvider>
              </ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/banking" element={<Banking />} />
              <Route path="/banking/accounts" element={<BankAccounts />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/upi" element={<UpiTransactions />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/income" element={<Income />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/settings" element={<SettingsNew />} />
              <Route path="/settings/security" element={<SecuritySettings />} />
              <Route path="/settings/api-keys" element={<ApiKeys />} />
              <Route path="/search" element={<SearchResults />} />
            </Route>

            {/* Redirect to dashboard if already authenticated, otherwise to login */}
            <Route path="*" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
          </Routes>
        </Router>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  )
}

export default App
