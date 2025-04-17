import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bankAccountService } from '../../services/bankAccountService';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '💳' },
  { id: 'phonepe', name: 'PhonePe', icon: '💸' },
  { id: 'paytm', name: 'Paytm', icon: '💰' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳' },
  { id: 'amazonpay', name: 'Amazon Pay', icon: '🛒' },
  { id: 'other', name: 'Other UPI App', icon: '📱' }
];

const UpiLinkForm = ({ account, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    upi_id: account?.upi_id || '',
    upi_app: account?.upi_app || 'gpay',
    upi_linked: account?.upi_linked || false
  });
  
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  
  // Update bank account mutation
  const updateMutation = useMutation({
    mutationFn: (data) => bankAccountService.updateBankAccount(account.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Error updating UPI details:', error);
      setError(`Error updating UPI details: ${error.message}`);
    }
  });
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };
  
  const validateUpiId = (upiId) => {
    // Basic UPI ID validation - should contain @ symbol and be in the format username@provider
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(upiId);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate UPI ID
    if (formData.upi_id && !validateUpiId(formData.upi_id)) {
      setError('Invalid UPI ID format. It should be in the format username@provider');
      return;
    }
    
    // Update account with UPI details
    updateMutation.mutate({
      ...account,
      upi_id: formData.upi_id,
      upi_app: formData.upi_app,
      upi_linked: formData.upi_id ? true : false
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Link UPI to {account.name}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {/* UPI ID */}
          <div>
            <label htmlFor="upi_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              UPI ID
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
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter your UPI ID in the format username@provider (e.g., johndoe@okicici)
            </p>
          </div>
          
          {/* UPI App */}
          <div>
            <label htmlFor="upi_app" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              UPI App
            </label>
            <select
              id="upi_app"
              name="upi_app"
              value={formData.upi_app}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {UPI_APPS.map(app => (
                <option key={app.id} value={app.id}>
                  {app.icon} {app.name}
                </option>
              ))}
            </select>
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
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full inline-block"></span>
                Saving...
              </>
            ) : (
              'Save UPI Details'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpiLinkForm;
