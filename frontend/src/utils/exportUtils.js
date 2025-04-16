// Import libraries for export functionality
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Use FileSaver's saveAs function
const { saveAs } = FileSaver;

/**
 * Export data to Excel (XLSX) format
 * @param {Array} data - The data to export
 * @param {String} fileName - The name of the file to save
 * @param {String} sheetName - The name of the sheet in the Excel file
 */
export const exportToExcel = (data, fileName, sheetName = 'Sheet1') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Save the file
    saveAs(blob, `${fileName}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

/**
 * Export data to PDF format
 * @param {Array} data - The data to export
 * @param {String} fileName - The name of the file to save
 * @param {String} title - The title to display at the top of the PDF
 * @param {Array} columns - The column definitions for the table
 */
export const exportToPDF = (data, fileName, title, columns) => {
  try {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Add table
    doc.autoTable({
      head: [columns.map(col => col.header)],
      body: data.map(item => columns.map(col => item[col.key])),
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Save the file
    doc.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

/**
 * Format data for export based on data type
 * @param {String} type - The type of data (transactions, expenses, income, etc.)
 * @param {Array} data - The raw data to format
 * @param {Object} options - Additional options for formatting
 * @returns {Array} - Formatted data ready for export
 */
export const formatDataForExport = (type, data, options = {}) => {
  switch (type) {
    case 'transactions':
      return data.map(item => ({
        Date: item.date,
        Description: item.name,
        Category: item.category,
        Type: item.type,
        Account: item.account,
        Amount: `₹${typeof item.amount === 'string' ? item.amount.replace('₹', '') : item.amount}`,
        Notes: item.description || ''
      }));

    case 'expenses':
      return data.map(item => ({
        Date: item.date,
        Description: item.description,
        Category: item.category,
        Amount: `₹${item.amount.toLocaleString()}`,
        PaymentMethod: item.paymentMethod
      }));

    case 'income':
      return data.map(item => ({
        Date: item.date,
        Description: item.description,
        Category: item.category,
        Amount: `₹${item.amount.toLocaleString()}`,
        Source: item.source
      }));

    case 'investments':
      return data.map(item => ({
        Name: item.name,
        Type: item.type,
        Category: item.category,
        PurchaseDate: item.purchaseDate,
        PurchasePrice: `₹${item.purchasePrice.toLocaleString()}`,
        CurrentPrice: `₹${item.currentPrice.toLocaleString()}`,
        Quantity: item.quantity,
        CurrentValue: `₹${item.value.toLocaleString()}`,
        Return: `₹${item.returnAmount.toLocaleString()} (${item.returnPercentage.toFixed(2)}%)`
      }));

    case 'bankAccounts':
      return data.map(item => ({
        Name: item.name,
        Type: item.type,
        Balance: `₹${Math.abs(item.balance).toLocaleString()}`,
        Status: item.balance >= 0 ? 'Credit' : 'Debit',
        LastUpdated: item.lastUpdated
      }));

    case 'reports':
      // Handle different report types
      const { reportType } = options;

      if (reportType === 'income-expense') {
        return data.map(item => ({
          Period: item.name || item.month,
          Income: `₹${item.income.toLocaleString()}`,
          Expenses: `₹${item.expenses.toLocaleString()}`,
          Savings: `₹${(item.income - item.expenses).toLocaleString()}`,
          SavingsRate: `${(((item.income - item.expenses) / item.income) * 100).toFixed(2)}%`
        }));
      }

      if (reportType === 'category-breakdown') {
        return data.map(item => ({
          Category: item.name,
          Amount: `₹${item.value.toLocaleString()}`,
          Percentage: `${item.percentage || (item.value / options.total * 100).toFixed(2)}%`
        }));
      }

      // Default case for reports
      return data;

    default:
      // Return data as is if no specific formatting is defined
      return data;
  }
};

/**
 * Get column definitions for PDF export based on data type
 * @param {String} type - The type of data
 * @returns {Array} - Column definitions
 */
export const getColumnsForPDF = (type) => {
  switch (type) {
    case 'transactions':
      return [
        { header: 'Date', key: 'Date' },
        { header: 'Description', key: 'Description' },
        { header: 'Category', key: 'Category' },
        { header: 'Type', key: 'Type' },
        { header: 'Account', key: 'Account' },
        { header: 'Amount', key: 'Amount' }
      ];

    case 'expenses':
      return [
        { header: 'Date', key: 'Date' },
        { header: 'Description', key: 'Description' },
        { header: 'Category', key: 'Category' },
        { header: 'Amount', key: 'Amount' },
        { header: 'Payment Method', key: 'PaymentMethod' }
      ];

    case 'income':
      return [
        { header: 'Date', key: 'Date' },
        { header: 'Description', key: 'Description' },
        { header: 'Category', key: 'Category' },
        { header: 'Amount', key: 'Amount' },
        { header: 'Source', key: 'Source' }
      ];

    case 'investments':
      return [
        { header: 'Name', key: 'Name' },
        { header: 'Type', key: 'Type' },
        { header: 'Category', key: 'Category' },
        { header: 'Purchase Date', key: 'PurchaseDate' },
        { header: 'Current Value', key: 'CurrentValue' },
        { header: 'Return', key: 'Return' }
      ];

    case 'bankAccounts':
      return [
        { header: 'Name', key: 'Name' },
        { header: 'Type', key: 'Type' },
        { header: 'Balance', key: 'Balance' },
        { header: 'Status', key: 'Status' },
        { header: 'Last Updated', key: 'LastUpdated' }
      ];

    case 'reports':
      return [
        { header: 'Period', key: 'Period' },
        { header: 'Income', key: 'Income' },
        { header: 'Expenses', key: 'Expenses' },
        { header: 'Savings', key: 'Savings' },
        { header: 'Savings Rate', key: 'SavingsRate' }
      ];

    default:
      // Return empty array if no specific columns are defined
      return [];
  }
};

/**
 * Filter data based on time period
 * @param {Array} data - The data to filter
 * @param {String} period - The time period (month, 6months, year, all)
 * @param {String} dateField - The field containing the date
 * @returns {Array} - Filtered data
 */
export const filterDataByPeriod = (data, period, dateField = 'date') => {
  if (!data || data.length === 0 || period === 'all') {
    return data;
  }

  const today = new Date();
  let startDate;

  switch (period) {
    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case '6months':
      startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
      break;
    case 'year':
      startDate = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      return data;
  }

  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= startDate && itemDate <= today;
  });
};

/**
 * Generate a filename with date
 * @param {String} baseName - The base name for the file
 * @param {String} period - The time period (optional)
 * @returns {String} - Formatted filename
 */
export const generateFileName = (baseName, period = '') => {
  const date = new Date();
  const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

  if (period && period !== 'all') {
    return `${baseName}_${period}_${dateStr}`;
  }

  return `${baseName}_${dateStr}`;
};
