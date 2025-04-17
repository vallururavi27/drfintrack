import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bankAccountService } from '../../services/bankAccountService';
import { indianBanks, validateIFSC, validateAccountNumber } from '../../data/indianBanks';

const AddBankAccountForm = ({ onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  
  // Initialize formData state with all required fields
  const [formData, setFormData] = useState({
    name: '',
    account_number: '',
    bank_name: '',
    ifsc_code: '',
    account_type: 'Savings',
    balance: 0,
    is_active: true,
    color: '#3b82f6',
    icon_name: 'bank'
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Create bank account mutation
  const createMutation = useMutation({
    mutationFn: bankAccountService.createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Error adding bank account:', error);
      alert(`Error adding bank account: ${error.message}`);
    }
  });
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Auto-detect bank from IFSC code
    if (name === 'ifsc_code' && value.length >= 4) {
      const bankCode = value.substring(0, 4);
      const bank = indianBanks.find(b => b.ifscPrefix === bankCode);
      if (bank) {
        setFormData(prev => ({
          ...prev,
          bank_name: bank.name,
          color: bank.color,
          icon_name: bank.icon
        }));
      }
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Account name is required';
    }
    
    if (!formData.account_number.trim()) {
      errors.account_number = 'Account number is required';
    } else if (!validateAccountNumber(formData.account_number)) {
      errors.account_number = 'Invalid account number format';
    }
    
    if (!formData.bank_name.trim()) {
      errors.bank_name = 'Bank name is required';
    }
    
    if (formData.ifsc_code && !validateIFSC(formData.ifsc_code)) {
      errors.ifsc_code = 'Invalid IFSC code format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed with errors:', formErrors);
      return;
    }
    
    try {
      // Add new account
      console.log('Adding new account with data:', {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      createMutation.mutate({
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in form submission:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Add New Bank Account
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            {formErrors.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.name}</p>
            )}
          </div>
          
          {/* Bank Name */}
          <div>
            <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bank Name
            </label>
            <select
              id="bank_name"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Select a bank</option>
              {indianBanks.map(bank => (
                <option key={bank.ifscPrefix} value={bank.name}>{bank.name}</option>
              ))}
            </select>
            {formErrors.bank_name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.bank_name}</p>
            )}
          </div>
          
          {/* Account Number */}
          <div>
            <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Number
            </label>
            <input
              type="text"
              id="account_number"
              name="account_number"
              value={formData.account_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            {formErrors.account_number && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.account_number}</p>
            )}
          </div>
          
          {/* IFSC Code */}
          <div>
            <label htmlFor="ifsc_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              IFSC Code
            </label>
            <input
              type="text"
              id="ifsc_code"
              name="ifsc_code"
              value={formData.ifsc_code}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {formErrors.ifsc_code && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.ifsc_code}</p>
            )}
          </div>
          
          {/* Account Type */}
          <div>
            <label htmlFor="account_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Type
            </label>
            <select
              id="account_type"
              name="account_type"
              value={formData.account_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
              <option value="Salary">Salary</option>
              <option value="Fixed Deposit">Fixed Deposit</option>
              <option value="Recurring Deposit">Recurring Deposit</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>
          
          {/* Balance */}
          <div>
            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Balance
            </label>
            <input
              type="number"
              id="balance"
              name="balance"
              value={formData.balance}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
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
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full inline-block"></span>
                Adding...
              </>
            ) : (
              'Add Account'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBankAccountForm;
