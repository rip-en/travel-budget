'use client';

import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { 
  FaUmbrellaBeach, FaMountain, FaPlane, FaMapMarkerAlt, FaTree, FaCompass, 
  FaCalendarAlt, FaPlusCircle, FaDollarSign, FaShareAlt, FaMoon, FaSun, 
  FaPlus, FaCheckCircle, FaTimesCircle, FaTimes
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { HolidayCard, ExpenseForm, HolidayForm } from './index';
import { useHolidays } from '../../hooks/useHolidays';
import ExpenseList from './ExpenseList';
import ExpenseSummary from './ExpenseSummary';
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

// HolidayDetailView Component
const HolidayDetailView = ({ holiday, isDarkMode, onClose, onAddExpense, onEditExpense, onDeleteExpense }) => {
  if (!holiday) return null;
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Get status
  const getStatus = () => {
    const today = new Date();
    const startDate = new Date(holiday.startDate);
    const endDate = new Date(holiday.endDate);

    if (today >= startDate && today <= endDate) {
      return { 
        label: 'Active',
        type: 'active'
      };
    } else if (today > endDate) {
      return { 
        label: 'Completed',
        type: 'completed'
      };
    } else {
      return { 
        label: 'Upcoming',
        type: 'upcoming'
      };
    }
  };

  // Get background color based on destination
  const getBackgroundColor = () => {
    // Generate a stable color based on the destination name
    const hash = holiday.destination?.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0) || 0;
    
    const h = Math.abs(hash) % 360;
    return `hsla(${h}, 70%, 60%, 1)`;
  };
  
  // Calculate total expense
  const totalExpenses = holiday.expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
  
  // Calculate progress percentage
  const progressPercentage = holiday.budget?.amount > 0 
    ? Math.min((totalExpenses / holiday.budget.amount) * 100, 100) 
    : 0;
    
  const status = getStatus();

  // Render appropriate image/icon based on holiday's image data
  const renderHeaderImage = () => {
    // If there is image data and it's an upload
    if (holiday.imageType === 'upload' && holiday.imageData) {
      return (
        <div className="relative flex items-center justify-center bg-gray-900 h-full overflow-hidden">
          {/* Blurred background version of the image to fill empty space */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${holiday.imageData})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(12px)',
              transform: 'scale(1.1)',
              opacity: 0.6
            }}
          ></div>
          
          {/* Dark overlay on blurred background */}
          <div className="absolute inset-0 bg-black/50 z-0"></div>
          
          {/* Actual image with maintained aspect ratio */}
          <div className="relative z-10 max-h-full max-w-full flex items-center justify-center p-4">
            <img 
              src={holiday.imageData} 
              alt={holiday.destination || 'Holiday'} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg" 
            />
          </div>
          
          {/* Holiday info overlay */}
          <div className="absolute bottom-0 left-0 p-4 text-white z-20">
            <h2 className="text-xl font-bold mb-1">{holiday.title}</h2>
            <div className="flex items-center gap-1">
              <FaMapMarkerAlt size={14} />
              <span>{holiday.destination}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-300">
              <FaCalendarAlt size={12} />
              <span>{formatDate(holiday.startDate)} - {formatDate(holiday.endDate)}</span>
            </div>
          </div>
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
        <div className={`relative h-full ${bgColor} flex items-center justify-center`}>
          <IconComponent size={120} className="text-white/60" />
          
          {/* Holiday info overlay */}
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h2 className="text-xl font-bold mb-1">{holiday.title}</h2>
            <div className="flex items-center gap-1">
              <FaMapMarkerAlt size={14} />
              <span>{holiday.destination}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-300">
              <FaCalendarAlt size={12} />
              <span>{formatDate(holiday.startDate)} - {formatDate(holiday.endDate)}</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
        </div>
      );
    } 
    // Default fallback - generated color background with plane icon
    else {
      return (
        <div 
          className="relative h-full flex items-center justify-center" 
          style={{ backgroundColor: getBackgroundColor() }}
        >
          <FaPlane className="text-white/40" size={120} />
          
          {/* Holiday info overlay */}
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h2 className="text-xl font-bold mb-1">{holiday.title}</h2>
            <div className="flex items-center gap-1">
              <FaMapMarkerAlt size={14} />
              <span>{holiday.destination}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-300">
              <FaCalendarAlt size={12} />
              <span>{formatDate(holiday.startDate)} - {formatDate(holiday.endDate)}</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
        </div>
      );
    }
  };

  // Render budget summary
  const renderBudgetSummary = () => {
    // Get budget values from the structured budget object
    const budgetAmount = holiday.budget?.amount || 0;
    const budgetCurrency = holiday.budget?.currency || 'USD';
    
    // Get currency symbol
    const getCurrencySymbol = (code) => {
      const symbols = {
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
      return symbols[code] || '$';
    };
    
    const currencySymbol = getCurrencySymbol(budgetCurrency);
    
    return (
      <div className="mb-4 flex items-center gap-3">
        <div className={`rounded-full w-16 h-16 flex items-center justify-center ${
          progressPercentage < 75 ? 'bg-cyan-500/10' : 
          progressPercentage < 100 ? 'bg-amber-500/10' : 
          'bg-red-500/10'
        }`}>
          <div className="relative w-14 h-14">
            {/* Progress Circle */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                className="text-gray-200 dark:text-gray-700 stroke-current" 
                strokeWidth="10" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
              />
              <circle 
                className={`${
                  progressPercentage < 75 ? 'text-cyan-500' : 
                  progressPercentage < 100 ? 'text-amber-500' : 
                  'text-red-500'
                } stroke-current`} 
                strokeWidth="10" 
                strokeLinecap="round" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
                style={{
                  strokeDasharray: 251.2,
                  strokeDashoffset: 251.2 - (251.2 * progressPercentage) / 100
                }}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-semibold ${
                progressPercentage < 75 ? 'text-cyan-600 dark:text-cyan-400' : 
                progressPercentage < 100 ? 'text-amber-600 dark:text-amber-400' : 
                'text-red-600 dark:text-red-400'
              }`}>{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-baseline">
            <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {currencySymbol}{totalExpenses.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm ml-1">/ {currencySymbol}{budgetAmount.toLocaleString()}</span>
          </div>
          
          <div className="text-sm text-gray-500">
            {(budgetAmount - totalExpenses) >= 0 
              ? <span className="text-green-500">{currencySymbol}{(budgetAmount - totalExpenses).toLocaleString()} remaining</span>
              : <span className="text-red-500">{currencySymbol}{Math.abs(budgetAmount - totalExpenses).toLocaleString()} over budget</span>
            }
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div 
        className={`relative w-full max-w-5xl rounded-xl ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        } shadow-2xl flex flex-col`}
        style={{ height: '80vh' }}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full ${
            isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
        >
          <FaTimes size={20} />
        </button>
        
        {/* Content */}
        <div className="flex flex-col md:flex-row h-full">
          {/* Left column - Image */}
          <div className="w-full md:w-2/5 h-2/5 md:h-full">
            {renderHeaderImage()}
          </div>
          
          {/* Right column - Expenses */}
          <div className={`w-full md:w-3/5 p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col h-3/5 md:h-full`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Expenses
                </h2>
                {/* Status badge */}
                <div className="flex items-center mt-1">
                  <span className={`text-xs mr-2 px-2 py-0.5 rounded-full ${
                    status.type === 'active' ? 'bg-green-500/10 text-green-500' :
                    status.type === 'completed' ? 'bg-gray-500/10 text-gray-500' :
                    'bg-cyan-500/10 text-cyan-500'
                  }`}>
                    {status.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(holiday.startDate)} - {formatDate(holiday.endDate)}
                  </span>
                </div>
              </div>
              <button 
                onClick={onAddExpense}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <FaPlusCircle size={16} />
                <span>Add Expense</span>
              </button>
            </div>
            
            {/* Budget summary */}
            {renderBudgetSummary()}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
              {/* Expenses Summary */}
              <div className="order-2 lg:order-1 overflow-y-auto bg-opacity-50">
                <ExpenseSummary 
                  isDarkMode={isDarkMode}
                  expenses={holiday.expenses || []}
                />
              </div>
              
              {/* Expense List */}
              <div className="order-1 lg:order-2 overflow-y-auto custom-scrollbar bg-opacity-50">
                <ExpenseList 
                  isDarkMode={isDarkMode}
                  expenses={holiday.expenses || []}
                  onEdit={onEditExpense}
                  onDelete={onDeleteExpense}
                />
              </div>
            </div>
            
            {/* Notes Section */}
            {holiday.notes && (
              <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notes</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-wrap line-clamp-2`}>{holiday.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MainContent() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { 
    holidays, 
    loading, 
    error, 
    createHoliday, 
    updateHoliday, 
    deleteHoliday, 
    addExpense 
  } = useHolidays();
  
  const [showNewHolidayForm, setShowNewHolidayForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(null);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: {
      amount: '',
      currency: 'USD'
    },
    notes: '',
    imageType: null,
    imageData: null,
    imagePreset: null
  });
  const [editHoliday, setEditHoliday] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: {
      amount: '',
      currency: 'USD'
    },
    notes: '',
    imageType: null,
    imageData: null,
    imagePreset: null
  });
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
  });
  const [detailedHoliday, setDetailedHoliday] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  const handleCreateHoliday = async () => {
    try {
      await createHoliday(formData);
      setFormData({
        title: '',
        destination: '',
        startDate: '',
        endDate: '',
        budget: {
          amount: '',
          currency: 'USD'
        },
        notes: '',
        imageType: null,
        imageData: null,
        imagePreset: null
      });
      setShowNewHolidayForm(false);
    } catch (error) {
      console.error('Error creating holiday:', error);
    }
  };

  const getHolidayStatus = (holiday) => {
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

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleAddExpense = (holidayId) => {
    setDetailedHoliday(null);
    setShowExpenseForm(holidayId);
  };

  const handleSaveExpense = async (finalExpenseData) => {
    if (showExpenseForm) {
      try {
        // Ensure title is set from description
        const expenseToSave = {
          ...finalExpenseData,
          title: finalExpenseData.description
        };
        
        console.log('Saving expense:', expenseToSave);
        await addExpense(showExpenseForm, expenseToSave);
        
        setNewExpense({
          description: '',
          amount: 0,
          category: 'Food',
          date: new Date().toISOString().split('T')[0],
        });
        setShowExpenseForm(null);
      } catch (error) {
        console.error('Error adding expense:', error);
      }
    }
  };

  const openDetailedView = (holiday) => {
    setDetailedHoliday(holiday);
  };

  const getTotalExpenses = (expenses) => {
    return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  };

  const getProgressPercentage = (holiday) => {
    const total = getTotalExpenses(holiday.expenses || []);
    return holiday.budget?.amount > 0 ? Math.min((total / holiday.budget.amount) * 100, 100) : 0;
  };

  const renderHolidayCard = (holiday) => {
    return (
      <div 
        key={holiday._id} 
        className="cursor-pointer"
      >
        <HolidayCard
          holiday={holiday}
          isDarkMode={isDarkMode}
          onEdit={() => handleEditHoliday(holiday)}
          onDelete={() => handleDeleteHoliday(holiday._id)}
          onAddExpense={() => handleAddExpense(holiday._id)}
          onClick={() => openDetailedView(holiday)}
        />
      </div>
    );
  };

  const renderHolidaySection = (title, filteredHolidays) => {
    if (filteredHolidays.length === 0) return null;
    
    return (
      <div className="mb-12">
        <h2 className={`text-xl font-semibold mb-6 tracking-tight ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHolidays.map((holiday) => renderHolidayCard(holiday))}
        </div>
      </div>
    );
  };

  const handleEditHoliday = (holiday) => {
    setEditingHoliday(holiday._id);
    setEditHoliday({
      title: holiday.title,
      destination: holiday.destination,
      startDate: holiday.startDate ? new Date(holiday.startDate).toISOString().split('T')[0] : '',
      endDate: holiday.endDate ? new Date(holiday.endDate).toISOString().split('T')[0] : '',
      budget: {
        amount: holiday.budget?.amount || '',
        currency: holiday.budget?.currency || 'USD'
      },
      notes: holiday.notes,
      imageType: holiday.imageType,
      imageData: holiday.imageData,
      imagePreset: holiday.imagePreset
    });
  };

  const handleUpdateHoliday = async () => {
    if (editingHoliday) {
      try {
        // Ensure budget is properly formatted as an object
        const holidayDataToUpdate = {
          ...editHoliday,
          budget: {
            amount: Number(editHoliday.budget?.amount) || 0,
            currency: editHoliday.budget?.currency || 'USD'
          }
        };
        
        console.log('Updating holiday with data:', JSON.stringify(holidayDataToUpdate, null, 2));
        await updateHoliday(editingHoliday, holidayDataToUpdate);
        setEditingHoliday(null);
      } catch (error) {
        console.error('Error updating holiday:', error);
      }
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    try {
      await deleteHoliday(holidayId);
    } catch (error) {
      console.error('Error deleting holiday:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">Error loading holidays: {error}</p>
        <button 
          className="px-4 py-2 bg-red-500 text-white rounded-lg"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-8">
        <button
          onClick={() => setShowNewHolidayForm(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-black text-white'} hover:scale-105 transition-all duration-300 text-sm font-medium`}
        >
          <FaPlusCircle size={18} />
          <span className="hidden sm:inline">New Holiday</span>
        </button>
      </div>

      {/* Modal Overlays */}
      {(showNewHolidayForm || showExpenseForm || editingHoliday) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" />
      )}

      {/* Holiday Sections */}
      {renderHolidaySection(
        "Ongoing Holidays", 
        holidays.filter(h => getHolidayStatus(h) === 'ongoing')
      )}
      {renderHolidaySection(
        "Upcoming Holidays", 
        holidays.filter(h => getHolidayStatus(h) === 'upcoming')
      )}
      {renderHolidaySection(
        "Past Holidays", 
        holidays.filter(h => getHolidayStatus(h) === 'completed')
      )}

      {/* Empty State */}
      {holidays.length === 0 && (
        <div className={`py-20 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <FaPlane size={60} className="mx-auto mb-6 opacity-50" />
          <h3 className="text-xl font-semibold mb-3">No holidays yet</h3>
          <p className="max-w-md mx-auto mb-8 text-[15px] leading-relaxed">Create your first holiday to start budgeting for your travels</p>
          <button
            onClick={() => setShowNewHolidayForm(true)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-black text-white'} hover:scale-105 transition-all duration-300`}
          >
            <FaPlusCircle size={18} />
            <span>Create Holiday</span>
          </button>
        </div>
      )}

      {/* Forms */}
      {showNewHolidayForm && (
        <HolidayForm 
          onClose={() => setShowNewHolidayForm(false)}
          onSubmit={handleCreateHoliday}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {showExpenseForm && (
        <ExpenseForm 
          onClose={() => setShowExpenseForm(null)}
          onSubmit={handleSaveExpense}
          expenseData={newExpense}
          setExpenseData={setNewExpense}
        />
      )}

      {editingHoliday && (
        <HolidayForm 
          onClose={() => setEditingHoliday(null)}
          onSubmit={handleUpdateHoliday}
          formData={editHoliday}
          setFormData={setEditHoliday}
        />
      )}

      {/* Holiday Detail View */}
      {detailedHoliday && (
        <HolidayDetailView 
          holiday={detailedHoliday}
          isDarkMode={isDarkMode}
          onClose={() => setDetailedHoliday(null)}
          onAddExpense={() => handleAddExpense(detailedHoliday._id)}
          onEditExpense={(expense) => {
            // Add edit expense logic
            console.log('Edit expense', expense);
          }}
          onDeleteExpense={(expenseId) => {
            // Add delete expense logic
            console.log('Delete expense', expenseId);
          }}
        />
      )}
    </>
  );
}