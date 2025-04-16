import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartPieIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Banking', href: '/banking', icon: BuildingLibraryIcon },
  { name: 'Transactions', href: '/transactions', icon: CreditCardIcon },
  { name: 'Expenses', href: '/expenses', icon: ReceiptPercentIcon },
  { name: 'Income', href: '/income', icon: BanknotesIcon },
  { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartPieIcon },
  { name: 'Investments', href: '/investments', icon: ArrowTrendingUpIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 transition duration-300 ease-in-out lg:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent location={location} />
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex h-full min-h-0 flex-1 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <SidebarContent location={location} />
        </div>
      </div>
    </>
  );
}

function SidebarContent({ location }) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto pt-16 pb-4 text-gray-800 dark:text-white">
      <nav className="mt-5 flex-1 space-y-1 px-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center rounded-md px-3 py-2 text-sm font-medium
                ${isActive
                  ? 'bg-gray-100 text-blue-600 dark:bg-gray-900 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}
              `}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${isActive
                    ? 'text-blue-600 dark:text-white'
                    : 'text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-gray-300'}
                `}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-white">
              <UserIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800 dark:text-white">Demo User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">demo@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
