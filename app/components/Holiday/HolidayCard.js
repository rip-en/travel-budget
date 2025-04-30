import React from 'react';
import { Calendar, Edit2, DollarSign, Plane, PlusCircle } from 'lucide-react';

const HolidayCard = ({ holiday, isDarkMode, onEdit, onDelete, onAddExpense }) => {
  const getStatus = (holiday) => {
    const today = new Date();
    const startDate = new Date(holiday.startDate);
    const endDate = new Date(holiday.endDate);

    if (today >= startDate && today <= endDate) {
      return 'ongoing';
    } else if (today > endDate) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  const getDaysRemaining = (date) => {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const status = getStatus(holiday);
  
  const getTotalExpenses = (expenses) => {
    return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  };

  const getBudgetProgress = (holiday) => {
    if (!holiday.budget) return 0;
    return Math.min((getTotalExpenses(holiday.expenses) / holiday.budget) * 100, 100);
  };

  return (
    <div 
      className={`relative rounded-xl overflow-hidden ${
        isDarkMode 
          ? 'bg-gray-900/40 hover:bg-gray-900/60 border-gray-800' 
          : 'bg-white/80 hover:bg-white border-gray-200'
      } border backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group`}
    >
      {holiday.image ? (
        <div className="h-40 sm:h-48 relative">
          <img 
            src={holiday.image} 
            alt={holiday.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      ) : (
        <div className={`h-40 sm:h-48 relative flex items-center justify-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <Plane className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} size={60} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
      )}
      
      {status && (
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${
            status === 'ongoing' ? 'bg-green-500/90 text-white' :
            status === 'upcoming' ? (isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800') :
            'bg-gray-500/80 text-white'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      )}
      
      <div className="p-5">
        <h3 className={`text-lg font-semibold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} line-clamp-1`}>
          {holiday.name}
        </h3>
        
        <div className={`flex items-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Calendar size={14} className="mr-1.5" />
          <p className="text-sm tracking-tight">
            {new Date(holiday.startDate).toLocaleDateString()} - {new Date(holiday.endDate).toLocaleDateString()}
          </p>
        </div>
        
        <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium tracking-tight`}>
          {holiday.destination}
        </p>
        
        {holiday.budget && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Budget</span>
              <div className="flex items-center">
                <DollarSign size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  ${holiday.budget}
                </span>
              </div>
            </div>
            
            <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full ${
                  getBudgetProgress(holiday) > 80 ? 'bg-red-500' :
                  getBudgetProgress(holiday) > 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                } rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${getBudgetProgress(holiday)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between mt-1.5">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ${getTotalExpenses(holiday.expenses).toFixed(2)} spent
              </span>
              <span className={`text-xs font-medium ${
                getBudgetProgress(holiday) > 80 ? 'text-red-500' :
                getBudgetProgress(holiday) > 50 ? 'text-yellow-500' :
                'text-green-500'
              }`}>
                {Math.round(getBudgetProgress(holiday))}%
              </span>
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200/50 flex gap-2 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className={`p-2 rounded-full ${
              isDarkMode 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            } transition-colors`}
          >
            <Edit2 size={16} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddExpense();
            }}
            className={`p-2 rounded-full ${
              isDarkMode 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-green-400' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-green-600'
            } transition-colors`}
          >
            <PlusCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HolidayCard; 