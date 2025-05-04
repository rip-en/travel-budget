import React from 'react';
import ExpenseChart from '../ExpenseChart';
import { getCurrencySymbol } from '../../../lib/utils';
import { CATEGORY_COLOR_CLASSES } from '../../../lib/constants';

function ExpenseSummary({ isDarkMode, expenses, currency }) {
  console.log("ExpenseSummary received expenses:", expenses);
  console.log("ExpenseSummary expense count:", expenses?.length || 0);
  console.log("ExpenseSummary expense types:", expenses?.map(e => typeof e) || []);
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  const currencySymbol = getCurrencySymbol(currency);
  
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {});

  const getCategoryColor = (category) => {
    const categoryKey = Object.keys(CATEGORY_COLOR_CLASSES).find(key => key.toLowerCase() === (category || '').toLowerCase());
    return CATEGORY_COLOR_CLASSES[categoryKey] || CATEGORY_COLOR_CLASSES.Default;
  };

  return (
    <div className={`p-4 sm:p-6 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/60'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        Expense Summary
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
        <div className="flex-shrink-0 w-full sm:w-1/3">
          {expenses.length > 0 ? (
            <ExpenseChart 
              expenses={expenses} 
              currency={currency} 
              isDarkMode={isDarkMode} 
            />
          ) : (
            <div className={`flex items-center justify-center h-full rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No data for chart</p>
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <div className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Total Expenses
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {currencySymbol}{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>By Category</h3>
      <div className="space-y-3">
        {Object.keys(categoryTotals).length > 0 ? (
          Object.entries(categoryTotals).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </div>
              <div className="text-right">
                <div className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {currencySymbol}{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {totalExpenses > 0 && (
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {((amount / totalExpenses) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No expenses recorded.</p>
        )}
      </div>
    </div>
  );
}

export default ExpenseSummary; 