import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const UPI_APPS = {
  gpay: {
    name: 'Google Pay',
    icon: '💳',
    packageName: 'com.google.android.apps.nbu.paisa.user',
    appLink: 'https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user'
  },
  phonepe: {
    name: 'PhonePe',
    icon: '💸',
    packageName: 'com.phonepe.app',
    appLink: 'https://play.google.com/store/apps/details?id=com.phonepe.app'
  },
  paytm: {
    name: 'Paytm',
    icon: '💰',
    packageName: 'net.one97.paytm',
    appLink: 'https://play.google.com/store/apps/details?id=net.one97.paytm'
  },
  bhim: {
    name: 'BHIM UPI',
    icon: '🇮🇳',
    packageName: 'in.org.npci.upiapp',
    appLink: 'https://play.google.com/store/apps/details?id=in.org.npci.upiapp'
  },
  amazonpay: {
    name: 'Amazon Pay',
    icon: '🛒',
    packageName: 'in.amazon.mShop.android.shopping',
    appLink: 'https://play.google.com/store/apps/details?id=in.amazon.mShop.android.shopping'
  },
  other: {
    name: 'Other UPI App',
    icon: '📱',
    packageName: '',
    appLink: ''
  }
};

const UpiPayment = ({ upiId, upiApp = 'gpay', amount = 0, description = '', name = '' }) => {
  const [paymentAmount, setPaymentAmount] = useState(amount > 0 ? amount.toString() : '');
  const [paymentNote, setPaymentNote] = useState(description);
  const [showQR, setShowQR] = useState(false);
  
  // Generate UPI payment URL
  const generateUpiUrl = () => {
    if (!upiId) return '';
    
    const params = new URLSearchParams();
    params.append('pa', upiId);
    params.append('pn', name);
    
    if (paymentAmount && !isNaN(parseFloat(paymentAmount))) {
      params.append('am', paymentAmount);
    }
    
    if (paymentNote) {
      params.append('tn', paymentNote);
    }
    
    params.append('cu', 'INR');
    
    return `upi://pay?${params.toString()}`;
  };
  
  // Generate intent URL for specific app
  const generateAppIntent = () => {
    const upiUrl = generateUpiUrl();
    if (!upiUrl) return '';
    
    const app = UPI_APPS[upiApp] || UPI_APPS.other;
    
    if (app.packageName) {
      return `intent:${upiUrl}#Intent;package=${app.packageName};scheme=upi;end`;
    }
    
    return upiUrl;
  };
  
  const handlePayment = () => {
    const upiUrl = generateUpiUrl();
    if (!upiUrl) {
      alert('Please enter a valid UPI ID');
      return;
    }
    
    // On mobile, try to open the UPI app
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = generateAppIntent();
    } else {
      // On desktop, show QR code
      setShowQR(true);
    }
  };
  
  if (!upiId) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-md">
        No UPI ID linked to this account. Please link a UPI ID first.
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        UPI Payment
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            UPI ID
          </label>
          <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            {upiId} ({UPI_APPS[upiApp]?.name || 'UPI App'})
          </div>
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount (₹)
          </label>
          <input
            type="number"
            id="amount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="1"
            step="0.01"
          />
        </div>
        
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Note
          </label>
          <input
            type="text"
            id="note"
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            placeholder="Payment note"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        {showQR && (
          <div className="flex flex-col items-center mt-4 p-4 bg-white rounded-lg">
            <QRCodeSVG value={generateUpiUrl()} size={200} />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Scan this QR code with any UPI app to pay
            </p>
          </div>
        )}
        
        <div className="flex justify-center mt-4">
          <button
            onClick={handlePayment}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showQR ? 'Update QR Code' : 'Pay Now'}
          </button>
          
          {showQR && (
            <button
              onClick={() => setShowQR(false)}
              className="ml-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Hide QR
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpiPayment;
