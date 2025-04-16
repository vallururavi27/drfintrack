import React, { createContext, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the context
const SearchContext = createContext();

// Sample data for searching (in a real app, this would come from an API)
const sampleTransactions = [];

const sampleAccounts = [
  {
    id: 1,
    type: 'account',
    name: 'HDFC Bank',
    description: 'Primary checking account',
    balance: '₹0',
    accountNumber: 'XXXX1234'
  },
  {
    id: 2,
    type: 'account',
    name: 'ICICI Bank',
    description: 'Savings account',
    balance: '₹0',
    accountNumber: 'XXXX5678'
  },
  {
    id: 3,
    type: 'account',
    name: 'SBI Bank',
    description: 'Joint account',
    balance: '₹0',
    accountNumber: 'XXXX9012'
  },
  {
    id: 4,
    type: 'account',
    name: 'Axis Bank',
    description: 'Salary account',
    balance: '₹0',
    accountNumber: 'XXXX3456'
  },
  {
    id: 5,
    type: 'account',
    name: 'Kotak Mahindra Bank',
    description: 'Savings account',
    balance: '₹0',
    accountNumber: 'XXXX7890'
  },
  {
    id: 6,
    type: 'account',
    name: 'Punjab National Bank',
    description: 'Fixed deposit account',
    balance: '₹0',
    accountNumber: 'XXXX2345'
  },
  {
    id: 7,
    type: 'account',
    name: 'Bank of Baroda',
    description: 'Current account',
    balance: '₹0',
    accountNumber: 'XXXX6789'
  },
  {
    id: 8,
    type: 'account',
    name: 'Canara Bank',
    description: 'Savings account',
    balance: '₹0',
    accountNumber: 'XXXX4567'
  }
];

const sampleBudgets = [];

const sampleInvestments = [];

// Combine all sample data
const allSampleData = [...sampleTransactions, ...sampleAccounts, ...sampleBudgets, ...sampleInvestments];

// Provider component
export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Function to perform search
  const performSearch = useCallback((query, filters = {}) => {
    setIsSearching(true);
    setSearchQuery(query);

    // Simulate API call with timeout
    setTimeout(() => {
      let results = [...allSampleData];

      // Filter by query
      if (query) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(item =>
          item.name.toLowerCase().includes(lowerQuery) ||
          (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
          (item.category && item.category.toLowerCase().includes(lowerQuery)) ||
          (item.account && item.account.toLowerCase().includes(lowerQuery))
        );
      }

      // Apply type filter if specified
      if (filters.type) {
        results = results.filter(item => item.type === filters.type);
      }

      // Apply category filter if specified
      if (filters.category) {
        results = results.filter(item => item.category === filters.category);
      }

      // Apply date range filter if specified
      if (filters.dateFrom && filters.dateTo) {
        results = results.filter(item => {
          if (!item.date) return false;
          const itemDate = new Date(item.date);
          return itemDate >= new Date(filters.dateFrom) && itemDate <= new Date(filters.dateTo);
        });
      }

      // Sort results by relevance (simple implementation)
      results.sort((a, b) => {
        // Prioritize exact matches in name
        const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase());
        const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase());

        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;

        // Then sort by date if available (most recent first)
        if (a.date && b.date) {
          return new Date(b.date) - new Date(a.date);
        }

        return 0;
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 500); // Simulate network delay
  }, []);

  // Function to handle search submission
  const handleSearch = useCallback((query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      performSearch(query);
    }
  }, [navigate, performSearch]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  // Context value
  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    performSearch,
    handleSearch,
    clearSearch
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

// Custom hook to use the search context
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
