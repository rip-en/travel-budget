'use client';

import { 
  FaUmbrellaBeach, FaMountain, FaPlane, FaMapMarkerAlt, FaTree, FaCompass, 
  FaCalendarAlt, FaPlusCircle, FaEdit, FaTrashAlt, FaDollarSign 
} from 'react-icons/fa';
import { useState } from 'react';
import Image from 'next/image';
import React from 'react';

// Define preset icons/images - MUST match those in HolidayForm
const presetIcons = [
  { icon: FaUmbrellaBeach, name: 'Beach', color: 'bg-blue-500' },
  { icon: FaMountain, name: 'Mountains', color: 'bg-green-600' },
  { icon: FaPlane, name: 'Plane', color: 'bg-cyan-600' },
  { icon: FaMapMarkerAlt, name: 'Location', color: 'bg-red-500' },
  { icon: FaTree, name: 'Tropical', color: 'bg-amber-600' },
  { icon: FaCompass, name: 'Adventure', color: 'bg-purple-600' },
];

// Currency symbols mapping
const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'Fr',
  CNY: '¥',
  TRY: '₺'
};

export default function HolidayCard({ holiday, isDarkMode, onEdit, onDelete, onAddExpense, onClick }) {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get currency symbol
  const getCurrencySymbol = (currencyCode = 'USD') => {
    return currencySymbols[currencyCode] || '$';
  };

  // Format currency amount
  const formatCurrency = (amount, currencyCode = 'USD') => {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Calculate total expenses
  const getTotalExpenses = () => {
    if (!holiday.expenses || holiday.expenses.length === 0) return 0;
    return holiday.expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  };

  // Calculate budget progress percentage
  const getProgressPercentage = () => {
    const total = getTotalExpenses();
    const budgetAmount = holiday.budget?.amount || 0;
    return budgetAmount > 0 ? Math.min((total / budgetAmount) * 100, 100) : 0;
  };

  // Get status based on dates
  const getStatus = () => {
    const today = new Date();
    const startDate = new Date(holiday.startDate);
    const endDate = new Date(holiday.endDate);

    if (today >= startDate && today <= endDate) {
      return { 
        label: 'Active',
        type: 'active',
        color: 'bg-cyan-500 text-cyan-100'
      };
    } else if (today > endDate) {
      return { 
        label: 'Completed',
        type: 'completed',
        color: 'bg-gray-500 text-gray-100'
      };
    } else {
      // Calculate days remaining
      const diffTime = startDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) {
        return { 
          label: `In ${diffDays} day${diffDays === 1 ? '' : 's'}`,
          type: 'upcoming',
          color: 'bg-amber-500 text-amber-100'
        };
      } else {
        return { 
          label: `In ${diffDays} days`,
          type: 'upcoming',
          color: 'bg-green-500 text-green-100'
        };
      }
    }
  };

  // Prevent event propagation
  const handleActionClick = (e, callback) => {
    e.stopPropagation();
    callback();
  };

  const status = getStatus();
  const progressPercentage = getProgressPercentage();
  const totalExpenses = getTotalExpenses();

  // Holiday title/name handling
  const title = holiday.title || holiday.name || 'Unnamed Holiday';

  // Get background color based on destination
  const getBackgroundColor = () => {
    // Generate a stable color based on the destination name
    const hash = holiday.destination?.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0) || 0;
    
    const h = Math.abs(hash) % 360;
    return `hsla(${h}, 70%, 60%, 0.7)`;
  };

  // Render budget/expense information based on holiday status
  const renderBudgetInfo = () => {
    const status = getStatus();
    const hasExpenses = holiday.expenses && holiday.expenses.length > 0;
    const totalExpenses = getTotalExpenses();
    const budgetCurrency = holiday.budget?.currency || 'USD';
    const budgetAmount = holiday.budget?.amount || 0;
    
    if (status.type === 'active') {
      // For active holidays, show budget progress
      return (
        <>
          <div className="flex justify-between items-center text-sm mb-1">
            <div className="flex items-center">
              <FaDollarSign size={14} className="mr-1" />
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {formatCurrency(budgetAmount, budgetCurrency)}
              </span>
            </div>
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatCurrency(totalExpenses, budgetCurrency)} spent
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                progressPercentage < 75 
                  ? 'bg-cyan-500 shadow-sm shadow-cyan-500/20' 
                  : progressPercentage < 100 
                    ? 'bg-yellow-500 shadow-sm shadow-yellow-500/20' 
                    : 'bg-red-500 shadow-sm shadow-red-500/20'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {holiday.expenses?.length || 0} expenses
            </span>
            <span className={`text-xs font-medium ${
              progressPercentage < 75 ? 'text-cyan-500' : 
              progressPercentage < 100 ? 'text-yellow-500' : 
              'text-red-500'
            }`}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </>
      );
    } else if (status.type === 'completed') {
      // For completed holidays, show total spent
      return (
        <>
          <div className="flex justify-between items-center text-sm mb-2">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Total spent:
            </span>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(totalExpenses, budgetCurrency)}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
              {holiday.expenses?.length || 0} expenses
            </span>
            <span className={`${
              totalExpenses > budgetAmount ? 'text-red-500' : 'text-green-500'
            }`}>
              {totalExpenses > budgetAmount 
                ? `${formatCurrency(totalExpenses - budgetAmount, budgetCurrency)} over budget` 
                : `${formatCurrency(budgetAmount - totalExpenses, budgetCurrency)} under budget`}
            </span>
          </div>
        </>
      );
    } else {
      // For upcoming holidays
      if (hasExpenses) {
        // If there are already expenses, show them
        return (
          <>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Pre-paid expenses:
              </span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(totalExpenses, budgetCurrency)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                {holiday.expenses?.length || 0} expenses
              </span>
              <span className="text-cyan-500">
                Budget: {formatCurrency(budgetAmount, budgetCurrency)}
              </span>
            </div>
          </>
        );
      } else {
        // If no expenses, just show budget
        return (
          <>
            <div className="flex items-center text-sm mb-2">
              <FaDollarSign size={14} className="mr-1" />
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Budget: {formatCurrency(budgetAmount, budgetCurrency)}
              </span>
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              No expenses yet
            </div>
          </>
        );
      }
    }
  };

  // Render the appropriate image/icon based on holiday's image data
  const renderHeaderImage = () => {
    // If there is image data and it's an upload
    if (holiday.imageType === 'upload' && holiday.imageData) {
      return (
        <div className="w-full h-40 relative overflow-hidden">
          <img 
            src={holiday.imageData} 
            alt={holiday.destination || 'Holiday'} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        </div>
      );
    } 
    // If using a preset icon
    else if (holiday.imageType === 'preset' && typeof holiday.imagePreset === 'number') {
      // Render the appropriate icon based on preset index
      let IconComponent = FaPlane; // Default
      let bgColor = 'bg-cyan-600'; // Default
      
      switch (holiday.imagePreset) {
        case 0:
          IconComponent = FaUmbrellaBeach;
          bgColor = 'bg-blue-500';
          break;
        case 1:
          IconComponent = FaMountain;
          bgColor = 'bg-green-600';
          break;
        case 2:
          IconComponent = FaPlane;
          bgColor = 'bg-cyan-600';
          break;
        case 3:
          IconComponent = FaMapMarkerAlt;
          bgColor = 'bg-red-500';
          break;
        case 4:
          IconComponent = FaTree;
          bgColor = 'bg-amber-600';
          break;
        case 5:
          IconComponent = FaCompass;
          bgColor = 'bg-purple-600';
          break;
      }
      
      return (
        <div className={`w-full h-40 relative overflow-hidden ${bgColor}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <IconComponent size={60} className="text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      );
    } 
    // Default fallback - generated color background with plane icon
    else {
      return (
        <div 
          className="w-full h-40 relative overflow-hidden"
          style={{ backgroundColor: getBackgroundColor() }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <FaPlane className="text-white/40" size={60} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        </div>
      );
    }
  };

  return (
    <div 
      className={`relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
        isDarkMode 
          ? 'bg-black/95 border border-gray-800 hover:border-gray-700' 
          : 'bg-white/95 border border-gray-200 hover:border-gray-300'
      } shadow-lg hover:shadow-xl backdrop-blur-md hover:scale-[1.01] group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onClick}
    >
      {/* Decorative Header */}
      {renderHeaderImage()}

      {/* Status indicator */}
      <div className="absolute top-3 right-3 flex items-center z-10">
        <span className={`text-xs mr-2 px-2 py-0.5 rounded-full ${status.textColor} ${status.bgColor}`}>
          {status.label}
        </span>
        <div className={`w-3 h-3 rounded-full ${status.color} shadow-sm`}></div>
      </div>
      
      <div className="p-5">
        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <FaMapMarkerAlt size={14} className="mr-1" />
          <span>{holiday.destination}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <FaCalendarAlt size={14} className="mr-1" />
          <span>{formatDate(holiday.startDate)} - {formatDate(holiday.endDate)}</span>
        </div>
        
        <div className="mb-4">
          {renderBudgetInfo()}
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Click for details
          </span>
          
          <div className={`transition-opacity duration-300 ${showActions ? 'opacity-100' : 'opacity-0'} flex gap-2`}>
            <button 
              onClick={(e) => handleActionClick(e, onEdit)}
              className={`p-1.5 rounded-full transition-colors duration-200 ${
                isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-cyan-400' : 'hover:bg-gray-100 text-gray-500 hover:text-cyan-500'
              }`}
              aria-label="Edit holiday"
            >
              <FaEdit size={16} />
            </button>
            
            <button 
              onClick={(e) => handleActionClick(e, onDelete)}
              className={`p-1.5 rounded-full transition-colors duration-200 ${
                isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'
              }`}
              aria-label="Delete holiday"
            >
              <FaTrashAlt size={16} />
            </button>
            
            <button 
              onClick={(e) => handleActionClick(e, onAddExpense)}
              className={`p-1.5 rounded-full transition-colors duration-200 ${
                isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-green-400' : 'hover:bg-gray-100 text-gray-500 hover:text-green-500'
              }`}
              aria-label="Add expense"
            >
              <FaPlusCircle size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 