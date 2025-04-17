import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { upiTransactionService } from '../../services/upiTransactionService';
import { bankAccountService } from '../../services/bankAccountService';
import { DocumentArrowUpIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import Papa from 'papaparse';

const UpiTransactionImport = ({ onSuccess, onCancel }) => {
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [mappings, setMappings] = useState({
    date: '',
    amount: '',
    description: '',
    type: '',
    upiId: '',
    counterpartyUpiId: '',
    counterpartyName: '',
    referenceId: ''
  });
  const [selectedAccount, setSelectedAccount] = useState('');
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Preview, 4: Success

  // Fetch bank accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: bankAccountService.getBankAccounts
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (data) => upiTransactionService.importUpiTransactionsFromCsv(
      data.file,
      data.mappings,
      data.accountId
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upiTransactions'] });
      setStep(4);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      setError(`Import failed: ${error.message}`);
    }
  });

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');

    // Parse CSV to get headers
    Papa.parse(selectedFile, {
      header: true,
      preview: 1,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setHeaders(Object.keys(results.data[0]));
          
          // Preview first 5 rows
          Papa.parse(selectedFile, {
            header: true,
            preview: 5,
            complete: (previewResults) => {
              setPreview(previewResults.data);
            }
          });
          
          setStep(2);
        } else {
          setError('Could not parse CSV file. Please check the format.');
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  // Handle mapping change
  const handleMappingChange = (field, value) => {
    setMappings({
      ...mappings,
      [field]: value
    });
  };

  // Handle account selection
  const handleAccountChange = (e) => {
    setSelectedAccount(e.target.value);
  };

  // Proceed to preview
  const handleProceedToPreview = () => {
    // Validate required mappings
    if (!mappings.date || !mappings.amount) {
      setError('Date and Amount mappings are required');
      return;
    }

    if (!selectedAccount) {
      setError('Please select a bank account');
      return;
    }

    setStep(3);
  };

  // Handle import
  const handleImport = () => {
    if (!file || !selectedAccount) {
      setError('Please select a file and bank account');
      return;
    }

    importMutation.mutate({
      file,
      mappings,
      accountId: selectedAccount
    });
  };

  // Render step 1: File upload
  const renderUploadStep = () => (
    <div className="text-center py-6">
      <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Upload UPI Transaction CSV
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Upload a CSV file containing your UPI transactions
      </p>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current.click()}
        className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Select CSV File
      </button>
      
      {file && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DocumentArrowUpIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setHeaders([]);
                setPreview([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Render step 2: Map columns
  const renderMappingStep = () => (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Map CSV Columns
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Select Bank Account
        </label>
        <select
          value={selectedAccount}
          onChange={handleAccountChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select Account</option>
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.name} - {account.bank_name} ({account.account_type})
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Column *
            </label>
            <select
              value={mappings.date}
              onChange={(e) => handleMappingChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Column</option>
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount Column *
            </label>
            <select
              value={mappings.amount}
              onChange={(e) => handleMappingChange('amount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Column</option>
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description Column
            </label>
            <select
              value={mappings.description}
              onChange={(e) => handleMappingChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Column</option>
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction Type Column
            </label>
            <select
              value={mappings.type}
              onChange={(e) => handleMappingChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Column</option>
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              UPI ID Column
            </label>
            <select
              value={mappings.upiId}
              onChange={(e) => handleMappingChange('upiId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Column</option>
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Counterparty UPI ID Column
            </label>
            <select
              value={mappings.counterpartyUpiId}
              onChange={(e) => handleMappingChange('counterpartyUpiId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Column</option>
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Counterparty Name Column
            </label>
            <select
              value={mappings.counterpartyName}
              onChange={(e) => handleMappingChange('counterpartyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Column</option>
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reference ID Column
            </label>
            <select
              value={mappings.referenceId}
              onChange={(e) => handleMappingChange('referenceId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Column</option>
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        * Required fields
      </p>
    </div>
  );

  // Render step 3: Preview
  const renderPreviewStep = () => (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Preview Transactions
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Date
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Amount
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Description
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {preview.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  {mappings.date ? row[mappings.date] : 'N/A'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  {mappings.amount ? row[mappings.amount] : 'N/A'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  {mappings.description ? row[mappings.description] : 'N/A'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  {mappings.type ? row[mappings.type] : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Showing preview of first {preview.length} transactions. Total rows in file: {file ? file.size : 0} bytes.
      </p>
    </div>
  );

  // Render step 4: Success
  const renderSuccessStep = () => (
    <div className="text-center py-6">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
        <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">
        Import Successful
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Your UPI transactions have been successfully imported.
      </p>
      <div className="mt-5">
        <button
          onClick={onSuccess}
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          View Transactions
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      {/* Step indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex flex-col items-center">
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                step >= stepNum 
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {stepNum}
              </div>
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {stepNum === 1 ? 'Upload' : 
                 stepNum === 2 ? 'Map' : 
                 stepNum === 3 ? 'Preview' : 'Import'}
              </div>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-between">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className={`h-1 w-1/4 ${
                step >= stepNum 
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      {/* Step content */}
      {step === 1 && renderUploadStep()}
      {step === 2 && renderMappingStep()}
      {step === 3 && renderPreviewStep()}
      {step === 4 && renderSuccessStep()}

      {/* Navigation buttons */}
      {step < 4 && (
        <div className="mt-6 flex justify-end space-x-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Back
            </button>
          )}
          
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          
          {step === 1 && file && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Next
            </button>
          )}
          
          {step === 2 && (
            <button
              type="button"
              onClick={handleProceedToPreview}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!mappings.date || !mappings.amount || !selectedAccount}
            >
              Next
            </button>
          )}
          
          {step === 3 && (
            <button
              type="button"
              onClick={handleImport}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full inline-block"></span>
                  Importing...
                </>
              ) : (
                'Import Transactions'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UpiTransactionImport;
