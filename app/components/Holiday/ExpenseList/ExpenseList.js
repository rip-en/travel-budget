import React from 'react';
import { Pencil, Trash2, Link, Edit2 } from 'lucide-react';
import { getCurrencySymbol } from '../../../lib/utils';
import { CATEGORY_COLOR_CLASSES } from '../../../lib/constants';

function ExpenseList({ 
  expenses, 
  isDarkMode, 
  onEdit, 
  onDelete, 
  currency,
  isPublicView = false
}) {
  const currencySymbol = getCurrencySymbol(currency);

  const getCategoryColor = (category) => {
    const categoryKey = Object.keys(CATEGORY_COLOR_CLASSES).find(key => key.toLowerCase() === (category || '').toLowerCase());
    return CATEGORY_COLOR_CLASSES[categoryKey] || CATEGORY_COLOR_CLASSES.Default;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {expenses.length === 0 ? (
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No expenses added yet
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense._id}
              className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {expense.title}
                  </h3>
                  {expense.comment && (
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {expense.comment}
                    </p>
                  )}
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    {formatDate(expense.date)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {expense.url && (
                    <a 
                      href={expense.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`p-1 rounded-full ${isDarkMode ? 'text-blue-400 hover:bg-blue-900/50' : 'text-blue-600 hover:bg-blue-100'}`}
                      title={expense.url}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link size={16} />
                    </a>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                    {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                  </span>
                  <span className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {currencySymbol}{parseFloat(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                {!isPublicView && (
                  <div className="flex items-center gap-2 ml-auto pl-4">
                    <button 
                      onClick={() => onEdit(expense)}
                      className={`p-1.5 rounded-full transition-colors duration-200 ${isDarkMode ? 'hover:bg-cyan-600/20 text-gray-400 hover:text-cyan-300' : 'hover:bg-cyan-100 text-gray-500 hover:text-cyan-600'}`}
                      title="Edit Expense"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDelete(expense._id)}
                      className={`p-1.5 rounded-full transition-colors duration-200 ${isDarkMode ? 'hover:bg-red-600/20 text-gray-400 hover:text-red-400' : 'hover:bg-red-100 text-gray-500 hover:text-red-600'}`}
                      title="Delete Expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpenseList; 