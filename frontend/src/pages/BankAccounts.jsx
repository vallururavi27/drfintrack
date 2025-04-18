import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Import Firebase bank account service instead of Supabase
import { bankAccountService } from '../services/firebaseBankAccountService';
import { PlusIcon, PencilIcon, TrashIcon, BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import UpiLinkForm from '../components/banking/UpiLinkForm';

// Bank account form component
const BankAccountForm = ({ account, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    account_number: '',
    bank_name: '',
    account_type: 'Savings',
    balance: 0,
    icon_name: 'bank',
    color: '#3b82f6',
    ...account
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {account ? 'Edit Bank Account' : 'Add New Bank Account'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name
            </label>
            <select
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Bank</option>
              <option value="State Bank of India">State Bank of India</option>
              <option value="HDFC Bank">HDFC Bank</option>
              <option value="ICICI Bank">ICICI Bank</option>
              <option value="Axis Bank">Axis Bank</option>
              <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              <option value="Punjab National Bank">Punjab National Bank</option>
              <option value="Bank of Baroda">Bank of Baroda</option>
              <option value="Canara Bank">Canara Bank</option>
              <option value="Union Bank of India">Union Bank of India</option>
              <option value="IndusInd Bank">IndusInd Bank</option>
              <option value="Yes Bank">Yes Bank</option>
              <option value="IDBI Bank">IDBI Bank</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              name="account_number"
              value={formData.account_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
              <option value="Salary">Salary</option>
              <option value="Fixed Deposit">Fixed Deposit</option>
              <option value="Recurring Deposit">Recurring Deposit</option>
              <option value="NRI">NRI</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Balance
            </label>
            <input
              type="number"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {account ? 'Update Account' : 'Add Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Bank account card component
const BankAccountCard = ({ account, onEdit, onDelete, onLinkUpi }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: account.color || '#3b82f6' }}
            >
              <BanknotesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
              <p className="text-sm text-gray-500">{account.bank_name}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onLinkUpi(account)}
              className="text-blue-600 hover:text-blue-800"
              title="Link UPI ID"
            >
              <CreditCardIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onEdit(account)}
              className="p-1 rounded-full hover:bg-gray-100"
              title="Edit account"
            >
              <PencilIcon className="h-5 w-5 text-gray-500" />
            </button>
            <button
              onClick={() => onDelete(account.id)}
              className="p-1 rounded-full hover:bg-gray-100"
              title="Delete account"
            >
              <TrashIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Account Number</span>
            <span className="text-sm font-medium">
              {account.account_number.replace(/(\d{4})/g, '$1 ').trim()}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-500">Type</span>
            <span className="text-sm font-medium">{account.account_type}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-500">Balance</span>
            <span className="text-lg font-bold text-blue-600">
              ₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main bank accounts page component
const BankAccounts = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showUpiForm, setShowUpiForm] = useState(false);
  const [upiAccount, setUpiAccount] = useState(null);
  const queryClient = useQueryClient();

  // Fetch bank accounts
  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: bankAccountService.getBankAccounts
  });

  // Create bank account mutation
  const createMutation = useMutation({
    mutationFn: bankAccountService.createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      setShowForm(false);
    }
  });

  // Update bank account mutation
  const updateMutation = useMutation({
    mutationFn: (data) => bankAccountService.updateBankAccount(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      setShowForm(false);
      setEditingAccount(null);
    }
  });

  // Delete bank account mutation
  const deleteMutation = useMutation({
    mutationFn: bankAccountService.deleteBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    }
  });

  // Handle form submission
  const handleSubmit = (formData) => {
    if (editingAccount) {
      updateMutation.mutate({ ...formData, id: editingAccount.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Handle edit button click
  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = (accountId) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      deleteMutation.mutate(accountId);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  // Handle UPI link button click
  const handleLinkUpi = (account) => {
    setUpiAccount(account);
    setShowUpiForm(true);
  };

  // Handle UPI form success
  const handleUpiSuccess = () => {
    setShowUpiForm(false);
    setUpiAccount(null);
  };

  // Handle UPI form cancel
  const handleUpiCancel = () => {
    setShowUpiForm(false);
    setUpiAccount(null);
  };

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + (parseFloat(account.balance) || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
        <button
          onClick={() => {
            setEditingAccount(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Account
        </button>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Summary</h2>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-sm text-gray-500">Total Accounts</p>
            <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Balance</p>
            <p className="text-2xl font-bold text-blue-600">
              ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Bank Account Form */}
      {showForm && (
        <div className="mb-6">
          <BankAccountForm
            account={editingAccount}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* UPI Link Form */}
      {showUpiForm && upiAccount && (
        <div className="mb-6">
          <UpiLinkForm
            account={upiAccount}
            onSuccess={handleUpiSuccess}
            onCancel={handleUpiCancel}
          />
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading accounts...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <p>Error loading bank accounts. Please try again.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && accounts.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No bank accounts yet</h3>
          <p className="text-gray-500 mb-4">Add your first bank account to start tracking your finances.</p>
          <button
            onClick={() => {
              setEditingAccount(null);
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Account
          </button>
        </div>
      )}

      {/* Account list */}
      {!isLoading && !error && accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => (
            <BankAccountCard
              key={account.id}
              account={account}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onLinkUpi={handleLinkUpi}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BankAccounts;
