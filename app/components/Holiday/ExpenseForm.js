'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { X, Check, Save, Plus } from 'lucide-react';

export default function ExpenseForm({ onClose, onSubmit, expenseData = {}, setExpenseData, isEditing = false }) {
  const { isDarkMode } = useTheme();
  const [errors, setErrors] = useState({});
  // Create internal state to use when setExpenseData is not provided
  const [internalExpenseData, setInternalExpenseData] = useState(expenseData);
  // Store amount as string for better input control
  const [amountInput, setAmountInput] = useState(String((expenseData?.amount || 0))); 
  
  // Helper function to update expense data, using either the provided setter or internal state
  const updateExpenseData = (updater) => {
    if (typeof setExpenseData === 'function') {
      setExpenseData(updater);
    } else {
      setInternalExpenseData(prev => {
        const updated = typeof updater === 'function' ? updater(prev) : updater;
        return updated;
      });
    }
  };
  
  // Get the current expense data, either from props or internal state
  const currentExpenseData = typeof setExpenseData === 'function' ? expenseData : internalExpenseData;
  
  const categories = [
    { value: 'Food', label: 'Food & Drinks' },
    { value: 'Accommodation', label: 'Accommodation' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Activities', label: 'Activities' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Other', label: 'Other' }
  ];

  // Set today as the default date if not provided - only run once on mount
  useEffect(() => {
    if (!currentExpenseData?.date) {
      const today = new Date().toISOString().split('T')[0];
      updateExpenseData(prev => ({
        ...prev,
        date: today
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  // Update local amount string when expenseData changes (e.g., when editing)
  // Only run this effect when expenseData.amount changes from outside
  useEffect(() => {
    // Only update if the formatted amounts are actually different to avoid loops
    const currentAmount = String(expenseData?.amount || '');
    const displayedAmount = amountInput;
    
    if (currentAmount !== displayedAmount && expenseData?.amount !== undefined) {
      setAmountInput(currentAmount);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseData?.amount]); // Only depend on the external prop, not the derived value

  const validate = () => {
    const newErrors = {};
    const amountValue = parseFloat(amountInput); // Parse amount string for validation
    
    if (!currentExpenseData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Updated amount validation
    if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = 'Amount must be a valid number greater than 0';
    }
    
    if (!currentExpenseData?.date) {
      newErrors.date = 'Date is required';
    } else {
      // Validate date format
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(currentExpenseData.date)) {
        newErrors.date = 'Invalid date format (YYYY-MM-DD)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const finalExpenseData = {
        ...currentExpenseData,
        amount: parseFloat(amountInput) || 0, // Ensure amount is always a valid number
        title: currentExpenseData?.description || 'Expense', // Ensure title always has a fallback
        category: currentExpenseData?.category || 'Other', // Ensure category always has a fallback
        date: currentExpenseData?.date || new Date().toISOString().split('T')[0], // Ensure date is always set
      };
      console.log("Submitting expense data:", finalExpenseData);
      onSubmit(finalExpenseData);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/20 dark:bg-black/40 transition-opacity duration-300 ease-out opacity-0 animate-fade-in">
      <div className={`relative w-full max-w-md p-6 rounded-xl shadow-xl ${isDarkMode ? 'bg-black shadow-lg border border-gray-800' : 'bg-white/95 shadow-lg border border-gray-200'} backdrop-blur-md transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-scale-in`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
        </button>
        
        <h2 className="text-xl font-bold mb-6">{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Description</label>
            <input
              type="text"
              value={currentExpenseData?.description || ''}
              onChange={(e) => updateExpenseData(prev => ({...prev, description: e.target.value}))}
              className={`w-full p-3 border rounded-lg ${
                errors.description ? 'border-red-500' : 
                isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'
              } focus:ring-2 ${errors.description ? 'focus:ring-red-500' : 'focus:ring-cyan-500'} focus:border-transparent`}
              placeholder="Hotel stay"
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>$</span>
              </div>
              <input
                type="text" // Change type to text to allow more flexible input
                inputMode="decimal" // Hint for mobile keyboards
                value={amountInput} // Use the string state value
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and a single decimal point
                  if (/^\d*\.?\d*$/.test(value)) {
                    setAmountInput(value);
                  }
                }}
                onBlur={() => {
                  // Format to 2 decimal places on blur if valid
                  const parsed = parseFloat(amountInput);
                  if (!isNaN(parsed)) {
                    setAmountInput(parsed.toFixed(2));
                  }
                }}
                className={`w-full p-3 pl-8 border rounded-lg ${
                  errors.amount ? 'border-red-500' :
                  isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'
                } focus:ring-2 ${errors.amount ? 'focus:ring-red-500' : 'focus:ring-cyan-500'} focus:border-transparent`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Category</label>
            <select
              value={currentExpenseData?.category || 'Other'}
              onChange={(e) => updateExpenseData(prev => ({...prev, category: e.target.value}))}
              className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">URL (Optional)</label>
            <input
              type="url" // Use type="url" for basic browser validation
              value={currentExpenseData?.url || ''} // Handle potentially undefined value
              onChange={(e) => updateExpenseData(prev => ({...prev, url: e.target.value}))}
              className={`w-full p-3 border rounded-lg ${
                errors.url ? 'border-red-500' : // Add error styling if validation added later
                isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'
              } focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
              placeholder="https://example.com/hotel"
            />
            {/* Add error display if validation is added */}
            {/* {errors.url && <p className="mt-1 text-sm text-red-500">{errors.url}</p>} */}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Comment (Optional)</label>
            <textarea
              value={currentExpenseData?.comment || ''} // Handle potentially undefined value
              onChange={(e) => updateExpenseData(prev => ({...prev, comment: e.target.value}))}
              rows="2" // Keep it relatively small
              className={`w-full p-3 border rounded-lg ${
                isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'
              } focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
              placeholder="e.g., Booking reference, notes about the place..."
            ></textarea>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Date</label>
            <input
              type="date"
              value={currentExpenseData?.date || ''}
              onChange={(e) => updateExpenseData(prev => ({...prev, date: e.target.value}))}
              className={`w-full p-3 border rounded-lg ${
                errors.date ? 'border-red-500' :
                isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'
              } focus:ring-2 ${errors.date ? 'focus:ring-red-500' : 'focus:ring-cyan-500'} focus:border-transparent`}
              max={new Date().toISOString().split('T')[0]} // Can't select future dates
            />
            {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
          </div>
          
          <div className="mt-6 text-right">
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg flex items-center ml-auto ${isDarkMode ? 'bg-cyan-500 hover:bg-cyan-600 shadow-sm shadow-cyan-500/20' : 'bg-cyan-500 hover:bg-cyan-600 shadow-sm shadow-cyan-500/20'} text-white transition-all duration-300 transform hover:translate-x-0.5`}
            >
              {isEditing ? (
                <>Update Expense <Save size={16} className="ml-1" /></>
              ) : (
                <>Add Expense <Plus size={16} className="ml-1" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 