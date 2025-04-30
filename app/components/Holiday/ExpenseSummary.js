import React from 'react';

function ExpenseSummary({ isDarkMode, expenses }) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {});

  const getCategoryColor = (category) => {
    const colors = {
      food: 'bg-green-500/20 text-green-500',
      transportation: 'bg-blue-500/20 text-blue-500',
      accommodation: 'bg-purple-500/20 text-purple-500',
      activities: 'bg-yellow-500/20 text-yellow-500',
      shopping: 'bg-pink-500/20 text-pink-500',
      other: 'bg-gray-500/20 text-gray-500'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        Expense Summary
      </h2>
      
      <div className="mb-6">
        <div className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          ${totalExpenses.toFixed(2)}
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Total Expenses
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(categoryTotals).map(([category, amount]) => (
          <div key={category} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <div className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                ${amount.toFixed(2)}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {((amount / totalExpenses) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExpenseSummary; 