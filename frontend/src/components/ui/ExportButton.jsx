import React, { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import { 
  exportToExcel, 
  exportToPDF, 
  formatDataForExport, 
  getColumnsForPDF, 
  filterDataByPeriod,
  generateFileName
} from '../../utils/exportUtils';

const ExportButton = ({ 
  data, 
  type, 
  title = 'Export', 
  className = '',
  options = {},
  showPeriodSelector = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [period, setPeriod] = useState('all');
  
  const handleExport = (format) => {
    // Filter data by period if needed
    const filteredData = showPeriodSelector 
      ? filterDataByPeriod(data, period, options.dateField || 'date')
      : data;
      
    // Format the data for export
    const formattedData = formatDataForExport(type, filteredData, { ...options, period });
    
    // Generate filename
    const fileName = generateFileName(options.fileName || `${type}_export`, period);
    
    // Export based on format
    if (format === 'xlsx') {
      exportToExcel(formattedData, fileName, options.sheetName || 'Data');
    } else if (format === 'pdf') {
      const columns = options.columns || getColumnsForPDF(type);
      const pdfTitle = options.pdfTitle || `${title} - ${period !== 'all' ? period.toUpperCase() : 'All Time'}`;
      exportToPDF(formattedData, fileName, pdfTitle, columns);
    }
    
    // Close dropdown
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        className={className}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
        {title}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {showPeriodSelector && (
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Period
                </label>
                <select 
                  className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-primary-500"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="month">This Month</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            )}
            
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Format
              </p>
              <div className="space-y-2">
                <button
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => handleExport('xlsx')}
                >
                  <span className="mr-2 text-green-600 dark:text-green-400 font-medium">XLSX</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Excel Spreadsheet</span>
                </button>
                <button
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => handleExport('pdf')}
                >
                  <span className="mr-2 text-red-600 dark:text-red-400 font-medium">PDF</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Portable Document Format</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
