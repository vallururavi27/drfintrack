import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { setThemeMode, getThemeMode, isDarkMode, THEME_MODES } from '../../utils/themeUtils';
import { useSearch } from '../../contexts/SearchContext';
import { Bars3Icon, BellIcon, MagnifyingGlassIcon, UserCircleIcon, SunIcon, MoonIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../services/supabaseClient';

export default function Header({ setIsMobileMenuOpen }) {
  const [darkModeActive, setDarkModeActive] = useState(isDarkMode());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [username, setUsername] = useState('User');
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Use the search context
  const { searchQuery, setSearchQuery, handleSearch } = useSearch();

  // Update state when theme changes
  useEffect(() => {
    const updateThemeState = () => {
      setDarkModeActive(isDarkMode());
    };

    // Check for system preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateThemeState);

      return () => mediaQuery.removeEventListener('change', updateThemeState);
    }
  }, []);

  // Fetch user information
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Try to get user info from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUsername(user.user_metadata?.name || user.email.split('@')[0] || 'User');
        } else {
          // Fall back to localStorage if no authenticated user
          setUsername(localStorage.getItem('username') || localStorage.getItem('name') || 'User');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        // Fall back to localStorage if there's an error
        setUsername(localStorage.getItem('username') || localStorage.getItem('name') || 'User');
      }
    };

    fetchUserInfo();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUsername(session.user.user_metadata?.name || session.user.email.split('@')[0] || 'User');
      } else if (event === 'SIGNED_OUT') {
        setUsername('User');
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuRef]);

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    const currentMode = getThemeMode();
    let newMode;

    if (currentMode === THEME_MODES.LIGHT ||
        (currentMode === THEME_MODES.SYSTEM && !isDarkMode())) {
      newMode = THEME_MODES.DARK;
    } else {
      newMode = THEME_MODES.LIGHT;
    }

    setThemeMode(newMode);
    setDarkModeActive(isDarkMode());
  };
  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow">
      {/* Logo and mobile menu button */}
      <div className="flex items-center px-4">
        <button
          type="button"
          className="text-gray-800 dark:text-white mr-3 lg:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">dr<span className="text-primary-600 dark:text-primary-400">FinTrack</span></h1>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <form
            className="flex items-center"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                // Use the search context to handle the search
                handleSearch(searchQuery);
              }
            }}
          >
            <div className="relative flex-grow">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
              </div>
              <input
                className="block w-full rounded-l-md border border-gray-300 dark:border-0 bg-gray-100 dark:bg-gray-700 py-1.5 pl-10 pr-3 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="Search transactions, expenses..."
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-600 px-3 py-1.5 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Right side icons */}
      <div className="ml-4 flex items-center pr-4">
        {/* Dark/Light mode toggle */}
        <button
          type="button"
          className="rounded-full p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          onClick={handleToggleDarkMode}
        >
          <span className="sr-only">Toggle dark/light mode</span>
          {darkModeActive ? (
            <SunIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-300" aria-hidden="true" />
          ) : (
            <MoonIcon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          className="ml-3 rounded-full p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="relative ml-3">
          <button
            type="button"
            className="flex items-center text-sm text-gray-800 dark:text-white"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="mr-2 hidden md:block">{username}</span>
            <UserCircleIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" aria-hidden="true" />
          </button>

          {showUserMenu && (
            <div
              ref={userMenuRef}
              className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700"
            >
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('username');
                  navigate('/login');
                }}
              >
                <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
