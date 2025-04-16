import React, { useState, useEffect } from 'react';
import { 
  CalculatorIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Tax slabs for new regime (FY 2023-24)
const newRegimeSlabs = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 600000, rate: 5 },
  { min: 600000, max: 900000, rate: 10 },
  { min: 900000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 }
];

// Tax slabs for old regime (FY 2023-24)
const oldRegimeSlabs = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 }
];

// Deductions and exemptions for old regime
const deductions = [
  { id: 'standard', name: 'Standard Deduction', maxAmount: 50000, defaultAmount: 50000, section: '16(ia)' },
  { id: '80c', name: 'Section 80C (PF, PPF, ELSS, etc.)', maxAmount: 150000, defaultAmount: 0, section: '80C' },
  { id: '80d', name: 'Section 80D (Medical Insurance)', maxAmount: 25000, defaultAmount: 0, section: '80D' },
  { id: 'hra', name: 'House Rent Allowance (HRA)', maxAmount: null, defaultAmount: 0, section: '10(13A)' },
  { id: 'home_loan', name: 'Home Loan Interest', maxAmount: 200000, defaultAmount: 0, section: '24(b)' },
  { id: 'nps', name: 'NPS Contribution', maxAmount: 50000, defaultAmount: 0, section: '80CCD(1B)' },
  { id: '80tta', name: 'Interest from Savings Account', maxAmount: 10000, defaultAmount: 0, section: '80TTA' },
  { id: 'others', name: 'Other Deductions', maxAmount: null, defaultAmount: 0, section: 'Various' }
];

export default function TaxCalculator() {
  // Income inputs
  const [salary, setSalary] = useState(1000000);
  const [otherIncome, setOtherIncome] = useState(0);
  
  // Deduction inputs
  const [deductionAmounts, setDeductionAmounts] = useState(
    deductions.reduce((acc, deduction) => {
      acc[deduction.id] = deduction.defaultAmount;
      return acc;
    }, {})
  );
  
  // Tax regime selection
  const [selectedRegime, setSelectedRegime] = useState('new');
  
  // Calculated values
  const [totalIncome, setTotalIncome] = useState(0);
  const [taxableIncome, setTaxableIncome] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [cessAmount, setCessAmount] = useState(0);
  const [totalTaxLiability, setTotalTaxLiability] = useState(0);
  const [oldRegimeTax, setOldRegimeTax] = useState(0);
  const [newRegimeTax, setNewRegimeTax] = useState(0);
  const [taxSavings, setTaxSavings] = useState(0);
  
  // Handle deduction amount change
  const handleDeductionChange = (id, value) => {
    const numValue = parseFloat(value) || 0;
    const deduction = deductions.find(d => d.id === id);
    
    // Apply max limit if defined
    const limitedValue = deduction.maxAmount !== null 
      ? Math.min(numValue, deduction.maxAmount) 
      : numValue;
    
    setDeductionAmounts({
      ...deductionAmounts,
      [id]: limitedValue
    });
  };
  
  // Calculate tax based on regime and income
  const calculateTax = (income, regime) => {
    const slabs = regime === 'new' ? newRegimeSlabs : oldRegimeSlabs;
    let tax = 0;
    
    for (let i = 0; i < slabs.length; i++) {
      const { min, max, rate } = slabs[i];
      if (income > min) {
        const taxableAmount = Math.min(income - min, max - min);
        tax += (taxableAmount * rate) / 100;
      }
    }
    
    return tax;
  };
  
  // Calculate total tax liability
  useEffect(() => {
    // Calculate total income
    const calculatedTotalIncome = salary + otherIncome;
    setTotalIncome(calculatedTotalIncome);
    
    // Calculate total deductions (only for old regime)
    const calculatedTotalDeductions = selectedRegime === 'old' 
      ? Object.values(deductionAmounts).reduce((sum, amount) => sum + amount, 0)
      : 50000; // Standard deduction is available in new regime as well
    
    setTotalDeductions(calculatedTotalDeductions);
    
    // Calculate taxable income
    const calculatedTaxableIncome = Math.max(0, calculatedTotalIncome - (selectedRegime === 'old' ? calculatedTotalDeductions : 50000));
    setTaxableIncome(calculatedTaxableIncome);
    
    // Calculate tax amount
    const calculatedTaxAmount = calculateTax(calculatedTaxableIncome, selectedRegime);
    setTaxAmount(calculatedTaxAmount);
    
    // Calculate cess (4% of tax amount)
    const calculatedCessAmount = calculatedTaxAmount * 0.04;
    setCessAmount(calculatedCessAmount);
    
    // Calculate total tax liability
    const calculatedTotalTaxLiability = calculatedTaxAmount + calculatedCessAmount;
    setTotalTaxLiability(calculatedTotalTaxLiability);
    
    // Calculate tax for both regimes for comparison
    const oldTaxableIncome = Math.max(0, calculatedTotalIncome - Object.values(deductionAmounts).reduce((sum, amount) => sum + amount, 0));
    const newTaxableIncome = Math.max(0, calculatedTotalIncome - 50000);
    
    const oldTax = calculateTax(oldTaxableIncome, 'old');
    const newTax = calculateTax(newTaxableIncome, 'new');
    
    const oldTotalTax = oldTax + (oldTax * 0.04);
    const newTotalTax = newTax + (newTax * 0.04);
    
    setOldRegimeTax(oldTotalTax);
    setNewRegimeTax(newTotalTax);
    
    // Calculate tax savings
    setTaxSavings(Math.max(oldTotalTax, newTotalTax) - Math.min(oldTotalTax, newTotalTax));
  }, [salary, otherIncome, deductionAmounts, selectedRegime]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Indian Tax Calculator (FY 2023-24)</h1>
      </div>
      
      {/* Tax Regime Selection */}
      <Card>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Select Tax Regime</h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            className={`flex flex-col items-center rounded-lg border p-4 text-center ${
              selectedRegime === 'old'
                ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
            }`}
            onClick={() => setSelectedRegime('old')}
          >
            <DocumentTextIcon className={`h-8 w-8 ${
              selectedRegime === 'old' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
            }`} />
            <h3 className="mt-2 text-base font-medium text-gray-900 dark:text-white">Old Tax Regime</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Higher tax rates but with deductions and exemptions
            </p>
          </button>
          
          <button
            className={`flex flex-col items-center rounded-lg border p-4 text-center ${
              selectedRegime === 'new'
                ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
            }`}
            onClick={() => setSelectedRegime('new')}
          >
            <CalculatorIcon className={`h-8 w-8 ${
              selectedRegime === 'new' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
            }`} />
            <h3 className="mt-2 text-base font-medium text-gray-900 dark:text-white">New Tax Regime</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Lower tax rates but with minimal deductions
            </p>
          </button>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Income Details */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Income Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Annual Salary (₹)
                </label>
                <input
                  type="number"
                  id="salary"
                  className="input mt-1 w-full"
                  value={salary}
                  onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1000"
                />
              </div>
              
              <div>
                <label htmlFor="other-income" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Other Income (₹)
                </label>
                <input
                  type="number"
                  id="other-income"
                  className="input mt-1 w-full"
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1000"
                />
              </div>
            </div>
            
            {selectedRegime === 'old' && (
              <div className="mt-6">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">Deductions & Exemptions</h3>
                
                <div className="space-y-4">
                  {deductions.map((deduction) => (
                    <div key={deduction.id}>
                      <div className="flex items-center justify-between">
                        <label htmlFor={deduction.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {deduction.name}
                          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                            (Section {deduction.section})
                          </span>
                        </label>
                        {deduction.maxAmount && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Max: ₹{deduction.maxAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        id={deduction.id}
                        className="input mt-1 w-full"
                        value={deductionAmounts[deduction.id]}
                        onChange={(e) => handleDeductionChange(deduction.id, e.target.value)}
                        min="0"
                        step="1000"
                        disabled={deduction.id === 'standard'} // Standard deduction is fixed
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
        
        {/* Tax Calculation Summary */}
        <div>
          <Card>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tax Calculation</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Income</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">₹{totalIncome.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Deductions</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">₹{totalDeductions.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Taxable Income</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">₹{taxableIncome.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Income Tax</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">₹{Math.round(taxAmount).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Health & Education Cess (4%)</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">₹{Math.round(cessAmount).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between pt-2">
                <span className="text-base font-medium text-gray-900 dark:text-white">Total Tax Liability</span>
                <span className="text-base font-bold text-gray-900 dark:text-white">₹{Math.round(totalTaxLiability).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Regime Comparison</h3>
              
              <div className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Old Regime Tax</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">₹{Math.round(oldRegimeTax).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">New Regime Tax</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">₹{Math.round(newRegimeTax).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between pt-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Tax Savings with {oldRegimeTax < newRegimeTax ? 'Old' : 'New'} Regime</span>
                  <span className={`text-sm font-medium ${
                    taxSavings > 0 ? 'text-success-600 dark:text-success-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    ₹{Math.round(taxSavings).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className={`rounded-md ${
                  oldRegimeTax < newRegimeTax 
                    ? 'bg-success-50 dark:bg-success-900/20' 
                    : 'bg-primary-50 dark:bg-primary-900/20'
                } p-3`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {oldRegimeTax < newRegimeTax ? (
                        <ArrowTrendingDownIcon className="h-5 w-5 text-success-400" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-5 w-5 text-primary-400" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        oldRegimeTax < newRegimeTax 
                          ? 'text-success-800 dark:text-success-200' 
                          : 'text-primary-800 dark:text-primary-200'
                      }`}>
                        Recommendation
                      </h3>
                      <div className={`mt-2 text-sm ${
                        oldRegimeTax < newRegimeTax 
                          ? 'text-success-700 dark:text-success-300' 
                          : 'text-primary-700 dark:text-primary-300'
                      }`}>
                        <p>
                          Based on your inputs, the {oldRegimeTax < newRegimeTax ? 'Old' : 'New'} Tax Regime is more beneficial for you.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Tax Slabs Information */}
      <Card>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tax Slabs (FY 2023-24)</h2>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">New Tax Regime</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Income Range
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Tax Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {newRegimeSlabs.map((slab, index) => (
                    <tr key={index}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {slab.min === 0 ? 'Up to' : `₹${slab.min.toLocaleString()} to`} {slab.max === Infinity ? 'Above' : `₹${slab.max.toLocaleString()}`}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                        {slab.rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Old Tax Regime</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Income Range
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Tax Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {oldRegimeSlabs.map((slab, index) => (
                    <tr key={index}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {slab.min === 0 ? 'Up to' : `₹${slab.min.toLocaleString()} to`} {slab.max === Infinity ? 'Above' : `₹${slab.max.toLocaleString()}`}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                        {slab.rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="mt-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Important Notes</h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc space-y-1 pl-5">
                  <li>This calculator is for informational purposes only and should not be considered as tax advice.</li>
                  <li>Health and Education Cess of 4% is applicable on the income tax amount.</li>
                  <li>Standard deduction of ₹50,000 is available in both old and new tax regimes.</li>
                  <li>The new tax regime does not allow most deductions and exemptions available under the old regime.</li>
                  <li>Consult a tax professional for personalized tax planning advice.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
