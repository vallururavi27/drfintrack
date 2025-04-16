import React, { useState } from 'react';
import { 
  PlusIcon, 
  LinkIcon,
  BanknotesIcon,
  CurrencyRupeeIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Sample bank data
const banksList = [
  { id: 1, name: 'HDFC Bank', logo: '/bank-logos/hdfc.png', isPopular: true },
  { id: 2, name: 'ICICI Bank', logo: '/bank-logos/icici.png', isPopular: true },
  { id: 3, name: 'State Bank of India', logo: '/bank-logos/sbi.png', isPopular: true },
  { id: 4, name: 'Axis Bank', logo: '/bank-logos/axis.png', isPopular: true },
  { id: 5, name: 'Kotak Mahindra Bank', logo: '/bank-logos/kotak.png', isPopular: false },
  { id: 6, name: 'Punjab National Bank', logo: '/bank-logos/pnb.png', isPopular: false },
  { id: 7, name: 'Bank of Baroda', logo: '/bank-logos/bob.png', isPopular: false },
  { id: 8, name: 'Yes Bank', logo: '/bank-logos/yes.png', isPopular: false },
  { id: 9, name: 'IndusInd Bank', logo: '/bank-logos/indusind.png', isPopular: false },
  { id: 10, name: 'IDFC First Bank', logo: '/bank-logos/idfc.png', isPopular: false },
];

// Sample UPI apps
const upiApps = [
  { id: 1, name: 'Google Pay', logo: '/upi-logos/gpay.png' },
  { id: 2, name: 'PhonePe', logo: '/upi-logos/phonepe.png' },
  { id: 3, name: 'Paytm', logo: '/upi-logos/paytm.png' },
  { id: 4, name: 'Amazon Pay', logo: '/upi-logos/amazonpay.png' },
  { id: 5, name: 'BHIM', logo: '/upi-logos/bhim.png' },
];

// Sample connected accounts
const connectedAccounts = [
  { 
    id: 1, 
    bankName: 'HDFC Bank', 
    accountNumber: 'XXXX1234', 
    accountType: 'Savings',
    balance: 45000,
    lastSync: '2023-07-15T10:30:00',
    logo: '/bank-logos/hdfc.png'
  },
  { 
    id: 2, 
    bankName: 'ICICI Bank', 
    accountNumber: 'XXXX5678', 
    accountType: 'Salary Account',
    balance: 28500,
    lastSync: '2023-07-15T09:45:00',
    logo: '/bank-logos/icici.png'
  },
  { 
    id: 3, 
    bankName: 'Google Pay (UPI)', 
    accountNumber: 'XXXX9876@okicici', 
    accountType: 'UPI',
    balance: null,
    lastSync: '2023-07-15T11:20:00',
    logo: '/upi-logos/gpay.png'
  },
];

export default function BankIntegration() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('banks');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  
  // Filter banks based on search term
  const filteredBanks = banksList.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Popular banks
  const popularBanks = banksList.filter(bank => bank.isPopular);
  
  // Handle bank selection
  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setShowConnectModal(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bank & UPI Integration</h1>
      </div>
      
      {/* Connected Accounts */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Connected Accounts</h2>
          <Button className="flex items-center" onClick={() => setShowConnectModal(true)}>
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Account
          </Button>
        </div>
        
        {connectedAccounts.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 p-2 dark:bg-primary-900">
              <LinkIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No accounts connected</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Connect your bank accounts and UPI to track your transactions automatically.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowConnectModal(true)}>
                <PlusIcon className="mr-2 h-5 w-5" />
                Add Account
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connectedAccounts.map((account) => (
              <div 
                key={account.id} 
                className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                      <img 
                        src={account.logo || '/bank-logos/default.png'} 
                        alt={account.bankName} 
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{account.bankName}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{account.accountType}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                    <ArrowPathIcon className="h-5 w-5" />
                    <span className="sr-only">Sync</span>
                  </button>
                </div>
                
                <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Account Number</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{account.accountNumber}</div>
                  </div>
                  
                  {account.balance !== null && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Balance</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">₹{account.balance.toLocaleString()}</div>
                    </div>
                  )}
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Last Synced</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(account.lastSync).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" className="px-3 py-1 text-xs">
                    View Transactions
                  </Button>
                  <Button variant="outline" className="px-3 py-1 text-xs">
                    Settings
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* Connect New Account */}
      <Card>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Connect New Account</h2>
        
        <div className="mb-4 flex space-x-1 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'banks'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('banks')}
          >
            Banks
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'upi'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('upi')}
          >
            UPI
          </button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="input pl-10 w-full"
              placeholder={activeTab === 'banks' ? "Search banks..." : "Search UPI apps..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {activeTab === 'banks' ? (
          <>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Popular Banks</h3>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {popularBanks.map((bank) => (
                <button
                  key={bank.id}
                  className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm transition-all hover:border-primary-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  onClick={() => handleBankSelect(bank)}
                >
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={bank.logo || '/bank-logos/default.png'} 
                      alt={bank.name} 
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{bank.name}</div>
                </button>
              ))}
            </div>
            
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">All Banks</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {filteredBanks.map((bank) => (
                <button
                  key={bank.id}
                  className="flex items-center rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-primary-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  onClick={() => handleBankSelect(bank)}
                >
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={bank.logo || '/bank-logos/default.png'} 
                      alt={bank.name} 
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="ml-3 text-sm font-medium text-gray-900 dark:text-white">{bank.name}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {upiApps.map((app) => (
              <button
                key={app.id}
                className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm transition-all hover:border-primary-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                onClick={() => handleBankSelect(app)}
              >
                <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <img 
                    src={app.logo || '/upi-logos/default.png'} 
                    alt={app.name} 
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{app.name}</div>
              </button>
            ))}
          </div>
        )}
      </Card>
      
      {/* Security Information */}
      <Card>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Information</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Bank-level Security</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your data is protected with 256-bit encryption, the same security that banks use.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <QrCodeIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Read-only Access</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                We can only view your transactions. We cannot move money or make changes to your accounts.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <DevicePhoneMobileIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-factor Authentication</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Additional security with two-factor authentication for all sensitive operations.
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Connect Bank Modal */}
      {showConnectModal && selectedBank && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-90"></div>
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Connect {selectedBank.name}
                  </h3>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-400"
                    onClick={() => setShowConnectModal(false)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-center">
                    <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                      <img 
                        src={selectedBank.logo || '/bank-logos/default.png'} 
                        alt={selectedBank.name} 
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                  
                  <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    You'll be redirected to {selectedBank.name}'s secure login page to authorize access to your account information.
                  </p>
                  
                  <form className="mt-6 space-y-4">
                    {activeTab === 'banks' ? (
                      <>
                        <div>
                          <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Account Number
                          </label>
                          <input
                            type="text"
                            id="account-number"
                            className="input mt-1 w-full"
                            placeholder="Enter your account number"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="account-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Account Type
                          </label>
                          <select
                            id="account-type"
                            className="input mt-1 w-full"
                          >
                            <option value="savings">Savings Account</option>
                            <option value="current">Current Account</option>
                            <option value="salary">Salary Account</option>
                            <option value="fixed-deposit">Fixed Deposit</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label htmlFor="upi-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          UPI ID
                        </label>
                        <input
                          type="text"
                          id="upi-id"
                          className="input mt-1 w-full"
                          placeholder="yourname@upi"
                        />
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <div className="flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="terms" className="text-gray-500 dark:text-gray-400">
                            I agree to the <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">terms and conditions</a> and authorize read-only access to my account information.
                          </label>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowConnectModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Connect Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
