'use client';

import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { X, Check } from 'lucide-react';

export default function ExpenseForm({ onClose, onSubmit, expenseData, setExpenseData }) {
  const { isDarkMode } = useTheme();
  const [errors, setErrors] = useState({});
  
  const categories = [
    { value: 'Food', label: 'Food & Drinks' },
    { value: 'Accommodation', label: 'Accommodation' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Activities', label: 'Activities' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Other', label: 'Other' }
  ];

  const validate = () => {
    const newErrors = {};
    
    if (!expenseData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!expenseData.amount || expenseData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!expenseData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const finalExpenseData = {
        ...expenseData,
        title: expenseData.description,
      };
      onSubmit(finalExpenseData);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/20 dark:bg-black/40">
      <div className={`relative w-full max-w-md p-6 rounded-xl shadow-xl ${isDarkMode ? 'bg-black shadow-lg border border-gray-800' : 'bg-white/95 shadow-lg border border-gray-200'} backdrop-blur-md`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
        </button>
        
        <h2 className="text-xl font-bold mb-6">Add Expense</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Description</label>
            <input
              type="text"
              value={expenseData.description}
              onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
              className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
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
                type="number"
                value={expenseData.amount}
                onChange={(e) => setExpenseData({...expenseData, amount: Number(e.target.value)})}
                className={`w-full p-3 pl-8 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Category</label>
            <select
              value={expenseData.category}
              onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
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
            <label className="block mb-1 text-sm font-medium">Date</label>
            <input
              type="date"
              value={expenseData.date}
              onChange={(e) => setExpenseData({...expenseData, date: e.target.value})}
              className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
          </div>
          
          <div className="mt-6 text-right">
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg flex items-center ml-auto ${isDarkMode ? 'bg-cyan-500 hover:bg-cyan-600 shadow-sm shadow-cyan-500/20' : 'bg-cyan-500 hover:bg-cyan-600 shadow-sm shadow-cyan-500/20'} text-white transition-all duration-300 transform hover:translate-x-0.5`}
            >
              Add Expense <Check size={16} className="ml-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 