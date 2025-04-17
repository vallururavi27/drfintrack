import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initializeTheme } from './utils/themeUtils'
import { SearchProvider } from './contexts/SearchContext'
import { AuthProvider } from './contexts/AuthContext'
import { initializeDefaultData } from './services/dataService'

// Layout
import Layout from './components/layout/Layout'

// Pages
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
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
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import SecuritySettings from './pages/SecuritySettings'
import AuthTest from './pages/AuthTest'

// Create a client
const queryClient = new QueryClient()

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))

  // Initialize theme and default data on app load
  useEffect(() => {
    // Always clear demo user information from localStorage
    console.log('Checking for demo user information...');

    // Save the theme mode before clearing localStorage
    const themeMode = localStorage.getItem('themeMode');

    // Check if demo user exists
    const hasDemo = localStorage.getItem('email') === 'demo@example.com' ||
                   localStorage.getItem('name') === 'Demo User' ||
                   localStorage.getItem('username') === 'demo';

    // Check if demo user is allowed (special flag set during login)
    const allowDemoUser = localStorage.getItem('allowDemoUser') === 'true';

    if (hasDemo && !allowDemoUser) {
      console.log('Found unauthorized demo user information, clearing localStorage...');
      // Clear all localStorage items
      localStorage.clear();

      // Restore theme mode
      if (themeMode) {
        localStorage.setItem('themeMode', themeMode);
      }
    } else if (!hasDemo) {
      // Just to be safe, remove any potential demo user keys if not a demo user
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      localStorage.removeItem('username');
      localStorage.removeItem('token');
    } else {
      console.log('Demo user is authorized, allowing login');
    }

    initializeTheme();
    initializeDefaultData();
  }, []);

  // Check for authentication changes
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth-test" element={<AuthTest />} />

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
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/income" element={<Income />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/settings" element={<SettingsNew />} />
            <Route path="/settings/security" element={<SecuritySettings />} />
            <Route path="/search" element={<SearchResults />} />
          </Route>

          {/* Redirect to dashboard if already authenticated, otherwise to login */}
          <Route path="*" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
