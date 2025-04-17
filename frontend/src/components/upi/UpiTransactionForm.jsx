import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { upiTransactionService } from '../../services/upiTransactionService';
import { bankAccountService } from '../../services/bankAccountService';
import { categoryService } from '../../services/categoryService';

const UpiTransactionForm = ({ transaction, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    account_id: '',
    upi_id: '',
    counterparty_upi_id: '',
    counterparty_name: '',
    amount: '',
    transaction_type: 'sent',
    description: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_ref_id: '',
    status: 'completed'
  });
  const [errors, setErrors] = useState({});

  // Fetch bank accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: bankAccountService.getBankAccounts
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories()
  });

  // Initialize form with transaction data if editing
  useEffect(() => {
    if (transaction) {
      const transactionDate = new Date(transaction.transaction_date)
        .toISOString()
        .split('T')[0];

      setFormData({
        account_id: transaction.account_id || '',
        upi_id: transaction.upi_id || '',
        counterparty_upi_id: transaction.counterparty_upi_id || '',
        counterparty_name: transaction.counterparty_name || '',
        amount: transaction.amount.toString() || '',
        transaction_type: transaction.transaction_type || 'sent',
        description: transaction.description || '',
        category_id: transaction.category_id || '',
        transaction_date: transactionDate,
        transaction_ref_id: transaction.transaction_ref_id || '',
        status: transaction.status || 'completed'
      });
    } else {
      // If adding new transaction, try to pre-fill UPI ID from selected account
      if (formData.account_id) {
        const selectedAccount = accounts.find(acc => acc.id === formData.account_id);
        if (selectedAccount?.upi_id) {
          setFormData(prev => ({
            ...prev,
            upi_id: selectedAccount.upi_id
          }));
        }
      }
    }
  }, [transaction, accounts]);

  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: upiTransactionService.addUpiTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upiTransactions'] });
      if (onSuccess) onSuccess();
    }
  });

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: (data) => upiTransactionService.updateUpiTransaction(transaction.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upiTransactions'] });
      if (onSuccess) onSuccess();
    }
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle numeric inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // If account is selected, try to pre-fill UPI ID
    if (name === 'account_id' && value) {
      const selectedAccount = accounts.find(acc => acc.id === value);
      if (selectedAccount?.upi_id) {
        setFormData(prev => ({
          ...prev,
          upi_id: selectedAccount.upi_id
        }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.upi_id) {
      newErrors.upi_id = 'UPI ID is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Date is required';
    }

    if (!formData.transaction_type) {
      newErrors.transaction_type = 'Transaction type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submissionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      transaction_date: new Date(formData.transaction_date).toISOString()
    };

    if (transaction) {
      updateMutation.mutate(submissionData);
    } else {
      createMutation.mutate(submissionData);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {transaction ? 'Edit UPI Transaction' : 'Add UPI Transaction'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bank Account */}
        <div>
          <label htmlFor="account_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bank Account
          </label>
          <select
            id="account_id"
            name="account_id"
            value={formData.account_id}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name} - {account.bank_name} ({account.account_type})
              </option>
            ))}
          </select>
          {errors.account_id && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.account_id}</p>
          )}
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Transaction Type
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="transaction_type"
                value="sent"
                checked={formData.transaction_type === 'sent'}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Sent</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="transaction_type"
                value="received"
                checked={formData.transaction_type === 'received'}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Received</span>
            </label>
          </div>
          {errors.transaction_type && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.transaction_type}</p>
          )}
        </div>

        {/* Amount and Date (side by side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              step="0.01"
              min="0"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.amount}</p>
            )}
          </div>

          <div>
            <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              id="transaction_date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.transaction_date && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.transaction_date}</p>
            )}
          </div>
        </div>

        {/* UPI IDs (side by side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="upi_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your UPI ID
            </label>
            <input
              type="text"
              id="upi_id"
              name="upi_id"
              value={formData.upi_id}
              onChange={handleInputChange}
              placeholder="yourname@upi"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.upi_id && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.upi_id}</p>
            )}
          </div>

          <div>
            <label htmlFor="counterparty_upi_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {formData.transaction_type === 'sent' ? 'Recipient UPI ID' : 'Sender UPI ID'}
            </label>
            <input
              type="text"
              id="counterparty_upi_id"
              name="counterparty_upi_id"
              value={formData.counterparty_upi_id}
              onChange={handleInputChange}
              placeholder="theirname@upi"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Counterparty Name and Category (side by side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="counterparty_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {formData.transaction_type === 'sent' ? 'Recipient Name' : 'Sender Name'}
            </label>
            <input
              type="text"
              id="counterparty_name"
              name="counterparty_name"
              value={formData.counterparty_name}
              onChange={handleInputChange}
              placeholder="Enter name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter transaction description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows="2"
          ></textarea>
        </div>

        {/* Transaction Reference ID */}
        <div>
          <label htmlFor="transaction_ref_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Transaction Reference ID (Optional)
          </label>
          <input
            type="text"
            id="transaction_ref_id"
            name="transaction_ref_id"
            value={formData.transaction_ref_id}
            onChange={handleInputChange}
            placeholder="Enter reference ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full inline-block"></span>
                {transaction ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              transaction ? 'Update Transaction' : 'Add Transaction'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpiTransactionForm;
