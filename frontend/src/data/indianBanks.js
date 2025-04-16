/**
 * List of major Indian banks with their names and IFSC code prefixes
 */
export const indianBanks = [
  {
    name: 'State Bank of India',
    shortName: 'SBI',
    ifscPrefix: 'SBIN',
    icon: 'bank',
    color: '#2d4b9b'
  },
  {
    name: 'HDFC Bank',
    shortName: 'HDFC',
    ifscPrefix: 'HDFC',
    icon: 'bank',
    color: '#004c8f'
  },
  {
    name: 'ICICI Bank',
    shortName: 'ICICI',
    ifscPrefix: 'ICIC',
    icon: 'bank',
    color: '#f58220'
  },
  {
    name: 'Axis Bank',
    shortName: 'AXIS',
    ifscPrefix: 'UTIB',
    icon: 'bank',
    color: '#97144d'
  },
  {
    name: 'Kotak Mahindra Bank',
    shortName: 'KOTAK',
    ifscPrefix: 'KKBK',
    icon: 'bank',
    color: '#e41b23'
  },
  {
    name: 'Bank of Baroda',
    shortName: 'BOB',
    ifscPrefix: 'BARB',
    icon: 'bank',
    color: '#f7931e'
  },
  {
    name: 'Punjab National Bank',
    shortName: 'PNB',
    ifscPrefix: 'PUNB',
    icon: 'bank',
    color: '#24a0ed'
  },
  {
    name: 'Canara Bank',
    shortName: 'CANARA',
    ifscPrefix: 'CNRB',
    icon: 'bank',
    color: '#00a0df'
  },
  {
    name: 'Union Bank of India',
    shortName: 'UBI',
    ifscPrefix: 'UBIN',
    icon: 'bank',
    color: '#1e4ca0'
  },
  {
    name: 'IndusInd Bank',
    shortName: 'INDUSIND',
    ifscPrefix: 'INDB',
    icon: 'bank',
    color: '#1d1d1b'
  },
  {
    name: 'Yes Bank',
    shortName: 'YES',
    ifscPrefix: 'YESB',
    icon: 'bank',
    color: '#0060aa'
  },
  {
    name: 'IDBI Bank',
    shortName: 'IDBI',
    ifscPrefix: 'IBKL',
    icon: 'bank',
    color: '#eb232a'
  },
  {
    name: 'Indian Bank',
    shortName: 'INDIAN',
    ifscPrefix: 'IDIB',
    icon: 'bank',
    color: '#00a650'
  },
  {
    name: 'Central Bank of India',
    shortName: 'CBI',
    ifscPrefix: 'CBIN',
    icon: 'bank',
    color: '#d71921'
  },
  {
    name: 'Bank of India',
    shortName: 'BOI',
    ifscPrefix: 'BKID',
    icon: 'bank',
    color: '#ff7e00'
  },
  {
    name: 'Bank of Maharashtra',
    shortName: 'BOM',
    ifscPrefix: 'MAHB',
    icon: 'bank',
    color: '#800000'
  },
  {
    name: 'UCO Bank',
    shortName: 'UCO',
    ifscPrefix: 'UCBA',
    icon: 'bank',
    color: '#003f87'
  },
  {
    name: 'Indian Overseas Bank',
    shortName: 'IOB',
    ifscPrefix: 'IOBA',
    icon: 'bank',
    color: '#0033a0'
  },
  {
    name: 'Punjab & Sind Bank',
    shortName: 'PSB',
    ifscPrefix: 'PSIB',
    icon: 'bank',
    color: '#1e3f66'
  },
  {
    name: 'Federal Bank',
    shortName: 'FEDERAL',
    ifscPrefix: 'FDRL',
    icon: 'bank',
    color: '#0066b3'
  },
  {
    name: 'South Indian Bank',
    shortName: 'SIB',
    ifscPrefix: 'SIBL',
    icon: 'bank',
    color: '#0066b3'
  },
  {
    name: 'RBL Bank',
    shortName: 'RBL',
    ifscPrefix: 'RATN',
    icon: 'bank',
    color: '#e31837'
  },
  {
    name: 'Karur Vysya Bank',
    shortName: 'KVB',
    ifscPrefix: 'KVBL',
    icon: 'bank',
    color: '#1d4289'
  },
  {
    name: 'Bandhan Bank',
    shortName: 'BANDHAN',
    ifscPrefix: 'BDBL',
    icon: 'bank',
    color: '#f57f20'
  },
  {
    name: 'IDFC First Bank',
    shortName: 'IDFC',
    ifscPrefix: 'IDFB',
    icon: 'bank',
    color: '#5a2d81'
  }
];

/**
 * Function to validate IFSC code format
 * @param {string} ifsc - IFSC code to validate
 * @returns {boolean} - Whether the IFSC code is valid
 */
export const validateIFSC = (ifsc) => {
  // IFSC code format: 4 characters (bank code) + 0 + 6 characters (branch code)
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
};

/**
 * Function to get bank details from IFSC code
 * @param {string} ifsc - IFSC code
 * @returns {object|null} - Bank details or null if not found
 */
export const getBankFromIFSC = (ifsc) => {
  if (!ifsc || ifsc.length < 4) return null;
  
  const bankCode = ifsc.substring(0, 4);
  return indianBanks.find(bank => bank.ifscPrefix === bankCode) || null;
};

/**
 * Function to validate account number format
 * @param {string} accountNumber - Account number to validate
 * @returns {boolean} - Whether the account number is valid
 */
export const validateAccountNumber = (accountNumber) => {
  // Most Indian bank account numbers are between 9 and 18 digits
  const accountRegex = /^[0-9]{9,18}$/;
  return accountRegex.test(accountNumber);
};
