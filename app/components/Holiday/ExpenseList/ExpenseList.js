import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

function ExpenseList({ isDarkMode, expenses, onEdit, onDelete }) {
  const getCategoryColor = (category) => {
    const colors = {
      Food: 'bg-green-500/20 text-green-500',
      Transportation: 'bg-blue-500/20 text-blue-500',
      Accommodation: 'bg-purple-500/20 text-purple-500',
      Activities: 'bg-yellow-500/20 text-yellow-500',
      Shopping: 'bg-pink-500/20 text-pink-500',
      Other: 'bg-gray-500/20 text-gray-500'
    };
    
    // Case-insensitive lookup
    const category_lowercase = (category || '').toLowerCase();
    for (const [key, value] of Object.entries(colors)) {
      if (key.toLowerCase() === category_lowercase) {
        return value;
      }
    }
    
    return colors.Other;
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
                    {expense.description}
                  </h3>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    {formatDate(expense.date)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                    {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                  </span>
                  <span className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    ${parseFloat(expense.amount).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => onEdit(expense)}
                  className={`p-1.5 rounded-full hover:bg-gray-200/10 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => onDelete(expense._id)}
                  className={`p-1.5 rounded-full hover:bg-red-500/10 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpenseList; 