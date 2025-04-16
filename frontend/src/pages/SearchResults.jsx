import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ArrowLeftIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useSearch } from '../contexts/SearchContext';

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    performSearch,
    handleSearch
  } = useSearch();

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    dateFrom: '',
    dateTo: ''
  });

  // Available filter options (would come from API in real app)
  const typeOptions = ['transaction', 'expense', 'income', 'account', 'budget', 'investment'];
  const categoryOptions = ['Food', 'Shopping', 'Utilities', 'Salary', 'Transportation', 'Entertainment', 'Freelance', 'Housing', 'Healthcare', 'Education', 'Investments', 'Savings', 'Personal'];

  // Extract search query from URL and perform search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query, filters);
    }
  }, [location.search, setSearchQuery, performSearch]);

  // Apply filters
  const applyFilters = () => {
    performSearch(searchQuery, filters);
    // Optionally close the filter panel after applying
    // setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: '',
      category: '',
      dateFrom: '',
      dateTo: ''
    });
    performSearch(searchQuery, {});
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle new search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery, filters);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-2 rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-md font-medium text-gray-900 dark:text-white">Search Results</h2>
        </div>
      </div>

      <Card>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center">
              <div className="relative flex-grow">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                </div>
                <input
                  className="block w-full rounded-l-md border border-gray-300 bg-white px-3 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Search transactions, expenses, investments..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="rounded-l-none">
                Search
              </Button>
            </form>

            <button
              type="button"
              className="ml-2 flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="mr-1 h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filter Results</h3>
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {/* Type filter */}
                <div>
                  <label htmlFor="type-filter" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <select
                    id="type-filter"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <option value="">All Types</option>
                    {typeOptions.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category filter */}
                <div>
                  <label htmlFor="category-filter" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    id="category-filter"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Date range filters */}
                <div>
                  <label htmlFor="date-from" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    From Date
                  </label>
                  <input
                    type="date"
                    id="date-from"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="date-to" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    To Date
                  </label>
                  <input
                    type="date"
                    id="date-to"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={applyFilters} className="text-sm py-1">
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {isSearching ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : searchResults && searchResults.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Found {searchResults.length} results for "{searchQuery}"
              {(filters.type || filters.category || filters.dateFrom || filters.dateTo) && (
                <span className="ml-1">
                  with filters:
                  {filters.type && <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    Type: {filters.type}
                    <button onClick={() => handleFilterChange('type', '')} className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>}
                  {filters.category && <span className="ml-1 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    Category: {filters.category}
                    <button onClick={() => handleFilterChange('category', '')} className="ml-1 text-green-500 hover:text-green-700 dark:text-green-300 dark:hover:text-green-100">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>}
                  {(filters.dateFrom || filters.dateTo) && <span className="ml-1 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                    Date: {filters.dateFrom && filters.dateTo ? `${filters.dateFrom} to ${filters.dateTo}` : filters.dateFrom || filters.dateTo}
                    <button onClick={() => {
                      handleFilterChange('dateFrom', '');
                      handleFilterChange('dateTo', '');
                    }} className="ml-1 text-purple-500 hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-100">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>}
                </span>
              )}
            </p>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => {
                    // Navigate based on result type
                    if (result.type === 'transaction') {
                      navigate('/transactions');
                    } else if (result.type === 'expense') {
                      navigate('/expenses');
                    } else if (result.type === 'income') {
                      navigate('/income');
                    }
                  }}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{result.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{result.description}</p>
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          result.type === 'income'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : result.type === 'expense'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{result.category}</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{result.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        result.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : result.type === 'expense'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-900 dark:text-white'
                      }`}>
                        {result.type === 'income' ? '+' : result.type === 'expense' ? '-' : ''}{result.amount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No results found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              We couldn't find anything matching "{searchQuery}". Try different keywords or filters.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
