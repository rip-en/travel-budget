'use client';

import React, { useState, useEffect } from 'react';
import { FaPlane, FaMapMarkerAlt, FaCalendarAlt, FaPlusCircle, FaTimes, FaInfoCircle, FaListUl, FaListAlt, FaComments, FaEdit, FaTrashAlt, FaHeart, FaUserCircle } from 'react-icons/fa';
import ExpenseList from './ExpenseList';
import ExpenseSummary from './ExpenseSummary';
import { presetIcons, PRESET_HOLIDAY_TAGS, getTagClasses } from '../../lib/constants';
import { getCurrencySymbol, formatDate, getBackgroundColorStyle, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

/**
 * HolidayDetailView Component
 * 
 * Displays a detailed modal/overlay view for a single holiday,
 * including header image/icon, budget summary, expenses list, and summary.
 */
export default function HolidayDetailView({ 
  holiday: initialHoliday,
  isOpen,
  isDarkMode, 
  onClose, 
  onAddExpense, 
  onEditExpense, 
  onDeleteExpense,
  onEditHoliday, 
  onDeleteHoliday, 
  onLike,
  onUnlike,
  userId,
  isPublicView = false
}) {
  // === DEBUGGING START ===
  console.log("--- HolidayDetailView Render Start ---");
  console.log("Received initialHoliday prop:", JSON.stringify(initialHoliday, null, 2));
  console.log(`Is Open: ${isOpen}`);
  console.log("EXPENSES DEBUG - Directly from initialHoliday:", initialHoliday?.expenses);
  if (initialHoliday?.expenses) {
    console.log("EXPENSES COUNT:", initialHoliday.expenses.length);
    console.log("FIRST 3 EXPENSES:", initialHoliday.expenses.slice(0, 3));
  } else {
    console.warn("NO EXPENSES ARRAY IN INITIAL HOLIDAY!");
  }
  // === DEBUGGING END ===
  
  if (!isOpen || !initialHoliday) {
    console.log("HolidayDetailView: Not rendering (isOpen or initialHoliday is falsy)");
    return null;
  }

  const [activeTab, setActiveTab] = useState(() => {
    // Check if expenses exist and are properly formed
    const hasExpenses = Array.isArray(initialHoliday?.expenses) && initialHoliday.expenses.length > 0;
    console.log("Setting initial activeTab - hasExpenses:", hasExpenses);
    // Default to 'overview' tab, only switch to 'expenses' if specifically requested
    return 'overview';
  });
  
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    console.log("HolidayDetailView useEffect triggered by initialHoliday change");
    console.log("New initialHoliday received:", JSON.stringify(initialHoliday, null, 2));
    
    // Direct reference to initialHoliday instead of setting state
    console.log("DIRECT ACCESS TO initialHoliday.expenses:", initialHoliday?.expenses?.length || 0);
    
    // Log expense information but DO NOT automatically switch tabs
    const hasExpenses = Array.isArray(initialHoliday?.expenses) && initialHoliday.expenses.length > 0;
    console.log("useEffect detected holiday change - hasExpenses:", hasExpenses);
    
    // REMOVED: Auto-switching to expenses tab - let user control which tab they want to see
  }, [initialHoliday]);

  const hasLiked = userId && initialHoliday?.likes?.some(id => id?.toString() === userId?.toString());
  const isOwnHoliday = userId && initialHoliday?.userId?.toString() === userId?.toString();

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const getStatus = () => {
    const today = new Date();
    const startDate = initialHoliday.startDate ? new Date(initialHoliday.startDate) : null;
    const endDate = initialHoliday.endDate ? new Date(initialHoliday.endDate) : null;

    if (!startDate || !endDate) return { label: 'Date Invalid', type: 'invalid' };

    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (today >= startDate && today <= endDate) {
      return { label: 'Active', type: 'active' };
    } else if (today > endDate) {
      return { label: 'Completed', type: 'completed' };
    } else {
      return { label: 'Upcoming', type: 'upcoming' };
    }
  };

  const getBackgroundColor = () => {
    const hash = initialHoliday.destination?.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0) || 0;
    const h = Math.abs(hash) % 360;
    return `hsla(${h}, 60%, ${isDarkMode ? '40%' : '70%'}, 1)`;
  };

  // Make sure expenses is always an array, even if it's undefined or null
  const expenses = Array.isArray(initialHoliday.expenses) ? initialHoliday.expenses : [];
  console.log("Derived expenses from current state:", JSON.stringify(expenses, null, 2));
  console.log("Derived expenses count:", expenses.length);
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const budgetAmount = initialHoliday.budget?.amount || 0;
  const budgetCurrency = initialHoliday.budget?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(budgetCurrency);

  const rawProgressPercentage = budgetAmount > 0 ? (totalExpenses / budgetAmount) * 100 : 0;
  const displayProgressPercentage = Math.min(rawProgressPercentage, 100);

  const status = getStatus();

  const headerStyle = getBackgroundColorStyle(initialHoliday.destination, isDarkMode);

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (!userId) return;
    if (hasLiked) {
      if (onUnlike) onUnlike(initialHoliday._id);
    } else {
      if (onLike) onLike(initialHoliday._id);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !userId || isOwnHoliday || !initialHoliday?.isPublic) return;
    
    setIsSubmittingComment(true);
    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      userId: userId, 
      username: 'You',
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    };

    // We can't update initialHoliday directly since it's a prop, so we'll just update the UI temporarily
    // The real data will be updated on the next fetch
    setNewCommentText('');

    try {
      const response = await fetch(`/api/holidays/${initialHoliday._id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: optimisticComment.text }),
      });

      const savedComment = await response.json();

      if (!response.ok) {
          throw new Error(savedComment.error || 'Failed to add comment');
      }

      // Success - we'll let the parent component know there's new data via a refetch
      toast.success('Comment added');

    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error(`Comment failed: ${error.message}`);
      // If there's an error, the fresh data will be fetched anyway
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleTabChange = (newTab) => {
    console.log(`Tab change requested: ${activeTab} -> ${newTab}`);
    if (newTab !== activeTab) {
      setActiveTab(newTab);
      // Immediately log to verify state update
      console.log(`Tab changed to: ${newTab}`);
    }
  };

  // IMPORTANT: Use the initialHoliday directly rather than copying to state,
  // to prevent data loss with expenses
  const holiday = initialHoliday;

  // Add additional debugging for active tab
  console.log(`Current active tab: ${activeTab}`);
  console.log(`Tabs rendering control:`, {
    showOverview: activeTab === 'overview',
    showExpenses: activeTab === 'expenses',
    showComments: activeTab === 'comments'
  });

  const renderHeaderImage = () => {
    const commonClasses = "relative h-full flex items-center justify-center";
    if (initialHoliday.imageType === 'upload' && initialHoliday.imageData) {
      return (
        <div className={`${commonClasses} bg-gray-900 overflow-hidden`}>
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${initialHoliday.imageData})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              filter: 'blur(12px)', transform: 'scale(1.1)', opacity: 0.6
            }}
          />
          <div className="absolute inset-0 bg-black/50 z-0"></div>
          <div className="relative z-10 max-h-full max-w-full flex items-center justify-center p-4">
            <img 
              src={initialHoliday.imageData} 
              alt={initialHoliday.destination || 'Holiday'} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg" 
              onError={(e) => e.target.style.display='none'}
            />
          </div>
          {renderHeaderInfoOverlay()}
        </div>
      );
    } 
    else if (initialHoliday.imageType === 'preset' && typeof initialHoliday.imagePreset === 'number') {
      // Get the preset from array or fallback to first one
      const preset = presetIcons[initialHoliday.imagePreset] || presetIcons[0];
      const IconComponent = preset.icon;
      
      return (
        <div 
          className={`${commonClasses} ${preset.color}`} 
        >
          <IconComponent size={120} className="text-white/80" />
          {renderHeaderInfoOverlay()}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
        </div>
      );
    } 
    else {
      // Default fallback - a colored background based on destination
      return (
        <div 
          className={`${commonClasses}`}
          style={headerStyle}
        >
          <FaPlane className="text-white/80" size={120} />
          {renderHeaderInfoOverlay()}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
        </div>
      );
    }
  };
  
  const renderHeaderInfoOverlay = () => (
    <div className="absolute bottom-0 left-0 p-4 text-white z-20 w-full">
      <h2 className="text-xl font-bold mb-1 truncate">{initialHoliday.title || 'Untitled Holiday'}</h2>
      {initialHoliday.destination && (
        <div className="flex items-center gap-1 truncate">
          <FaMapMarkerAlt size={14} />
          <span>{initialHoliday.destination}</span>
        </div>
      )}
      {(initialHoliday.startDate || initialHoliday.endDate) && (
        <div className="flex items-center gap-1 mt-1 text-sm text-gray-300 truncate">
          <FaCalendarAlt size={12} />
          <span>{formatDate(initialHoliday.startDate)} - {formatDate(initialHoliday.endDate)}</span>
        </div>
      )}
    </div>
  );

  const renderBudgetSummary = () => {
    const progressColor = rawProgressPercentage < 75 ? 'cyan' : rawProgressPercentage < 100 ? 'amber' : 'red';
    const textColorClass = `text-${progressColor}-${isDarkMode ? 400 : 600}`;
    const ringColorClass = `text-${progressColor}-500`;
    const bgColorClass = `bg-${progressColor}-500/10`;
    const isOverBudget = rawProgressPercentage > 100;

    return (
      <div className="mb-4 flex items-center gap-3">
        <div className={`relative rounded-full w-16 h-16 flex items-center justify-center ${bgColorClass} ${isOverBudget ? 'over-budget-pulse' : ''}`}>
          <div className="relative w-14 h-14">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                className="text-gray-200 dark:text-gray-700 stroke-current" 
                strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" 
              />
              <circle 
                className={`${ringColorClass} stroke-current`} 
                strokeWidth="10" strokeLinecap="round" fill="transparent" 
                r="40" cx="50" cy="50" 
                style={{
                  strokeDasharray: 251.2,
                  strokeDashoffset: 251.2 - (251.2 * displayProgressPercentage) / 100 
                }}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-semibold ${textColorClass}`}>{Math.round(rawProgressPercentage)}%</span>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-baseline">
            <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {currencySymbol}{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-gray-500 text-sm ml-1">
              / {currencySymbol}{budgetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="text-sm">
            {budgetAmount > 0 ? (
              (budgetAmount - totalExpenses) >= 0 
                ? <span className="text-green-500">{currencySymbol}{(budgetAmount - totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining</span>
                : <span className="text-red-500">{currencySymbol}{Math.abs(budgetAmount - totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} over budget</span>
            ) : (
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total spent</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-labelledby="holiday-detail-title"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={onClose}
            aria-hidden="true"
          ></div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative flex flex-col w-full max-w-3xl h-[85vh] max-h-[700px] rounded-xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}
          >
            <div className="relative h-48 flex-shrink-0">
              {renderHeaderImage()}
              <button 
                onClick={onClose} 
                className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${isDarkMode ? 'text-gray-300 bg-black/40 hover:bg-black/70' : 'text-gray-700 bg-white/40 hover:bg-white/70'}`}
                aria-label="Close detail view"
              >
                <FaTimes size={18} />
              </button>

              {onLike && onUnlike && (
                isOwnHoliday ? (
                  <div className={`absolute top-3 left-3 p-1.5 rounded-full ${isDarkMode ? 'text-gray-200 bg-black/40' : 'text-gray-800 bg-white/40'} flex items-center gap-1 text-xs`}
                       title="Likes"
                  >
                    <FaHeart size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                    <span>{initialHoliday.likes?.length || 0}</span>
                  </div>
                ) : (
                  <button 
                    onClick={handleLikeClick} 
                    className={`absolute top-3 left-3 p-1.5 rounded-full transition-colors flex items-center gap-1 text-xs ${isDarkMode ? 'text-gray-200 bg-black/40 hover:bg-black/70' : 'text-gray-800 bg-white/40 hover:bg-white/70'} ${hasLiked ? (isDarkMode ? 'text-pink-400' : 'text-pink-600') : ''}`}
                    aria-label={hasLiked ? 'Unlike this holiday' : 'Like this holiday'}
                    title={hasLiked ? 'Unlike' : 'Like'}
                    disabled={!userId}
                  >
                    <FaHeart size={16} fill={hasLiked ? 'currentColor' : 'none'} />
                    <span>{initialHoliday.likes?.length || 0}</span>
                  </button>
                )
              )}
            </div>
            
            <div className="flex-grow overflow-y-auto p-5">
              <div className="mb-5 border-b border-gray-300 dark:border-gray-700 flex space-x-4">
                {['overview', 'expenses', 'comments'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => {
                      console.log(`Switching to tab: ${tab} from ${activeTab}`);
                      handleTabChange(tab);
                    }}
                    className={`py-2 px-1 capitalize text-sm font-medium transition-colors ${ activeTab === tab 
                      ? 'border-b-2 border-cyan-500 text-cyan-500' 
                      : `border-b-2 border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'}`
                    }`}
                  >
                    {tab}
                    {tab === 'expenses' && expenses.length > 0 && ` (${expenses.length})`}
                    {tab === 'comments' && ` (${holiday.comments?.length || 0})`}
                  </button>
                ))}
              </div>

              <div className="transform translate-z-0"> 
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Display tags if available */}
                    {holiday.tags && holiday.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {holiday.tags.map(tag => {
                          const tagInfo = PRESET_HOLIDAY_TAGS[tag];
                          if (!tagInfo) return null;
                          const { label, icon } = tagInfo;
                          
                          return (
                            <div 
                              key={tag}
                              className={`flex items-center gap-1 text-xs rounded-full px-2 py-0.5 ${getTagClasses(tag, true, isDarkMode)}`}
                            >
                              {React.createElement(icon, { size: 10 })}
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {renderBudgetSummary()}
                    <ExpenseSummary 
                      expenses={expenses} 
                      currencySymbol={currencySymbol} 
                      currency={budgetCurrency}
                      isDarkMode={isDarkMode}
                    />
                    {holiday.notes && (
                      <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                        <h4 className="font-semibold mb-1 text-base">Notes:</h4>
                        <p className={`text-sm whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{holiday.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Expenses Tab */}
                {activeTab === 'expenses' && (
                  <div className="space-y-4">
                    {/* === DEBUGGING START === */}
                    {console.log("--- Rendering Expenses Tab ---")}
                    {console.log("Passing expenses to ExpenseList:", JSON.stringify(expenses, null, 2))}
                    {console.log(`Number of expenses to pass: ${expenses.length}`)}
                    {/* === DEBUGGING END === */}
                    {expenses.length === 0 ? (
                      <div className="text-center py-8">
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No expenses added yet</p>
                        {isOwnHoliday && (
                          <button
                            onClick={() => onAddExpense && onAddExpense(holiday._id)}
                            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-cyan-500 hover:bg-cyan-600 text-white"
                          >
                            <FaPlusCircle size={14} /> Add Your First Expense
                          </button>
                        )}
                      </div>
                    ) : (
                      <ExpenseList 
                        expenses={expenses} 
                        currencySymbol={currencySymbol}
                        currency={budgetCurrency}
                        onEdit={onEditExpense ? (expense) => onEditExpense(expense, holiday._id) : undefined}
                        onDelete={onDeleteExpense ? (expenseId) => onDeleteExpense(expenseId, holiday._id) : undefined}
                        isDarkMode={isDarkMode}
                        isPublicView={!isOwnHoliday || isPublicView}
                      />
                    )}
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base flex items-center gap-2 sr-only">
                      <FaComments /> Comments ({holiday.comments?.length || 0})
                    </h4>
                    {holiday.isPublic && !isOwnHoliday && userId && (
                      <form onSubmit={handleAddComment} className="mb-4 flex gap-2 items-start">
                        <textarea 
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          rows="2"
                          maxLength="500"
                          className={`flex-grow p-2 border rounded-md text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} focus:ring-cyan-500 focus:border-cyan-500 transition-colors`}
                          required
                          disabled={isSubmittingComment}
                        />
                        <button 
                          type="submit" 
                          disabled={!newCommentText.trim() || isSubmittingComment}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-500 hover:bg-cyan-600'} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isSubmittingComment ? 'Posting...' : 'Post'}
                        </button>
                      </form>
                    )}

                    {(holiday.isPublic || isOwnHoliday) && holiday.comments && holiday.comments.length > 0 ? (
                      <div className="space-y-3 max-h-[calc(85vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
                        {holiday.comments.map(comment => (
                          <div key={comment._id || comment.createdAt} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/80'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold flex items-center gap-1.5">
                                <FaUserCircle /> {comment.username || 'User'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No comments yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
             
             {isOwnHoliday && (
               <div className={`flex-shrink-0 p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex justify-between items-center`}>
                 <div> </div>
                 <div className="flex gap-3">
                   <button 
                     onClick={() => onAddExpense && onAddExpense(holiday._id)} 
                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-cyan-500 hover:bg-cyan-600 text-white'}`}
                   >
                     <FaPlusCircle size={14} /> Add Expense
                   </button>
                   <button 
                     onClick={() => onEditHoliday && onEditHoliday(holiday._id)} 
                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDarkMode ? 'bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400' : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'}`}
                   >
                     <FaEdit size={14} /> Edit
                   </button>
                   <button 
                     onClick={() => onDeleteHoliday && onDeleteHoliday(holiday._id)} 
                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDarkMode ? 'bg-red-500/20 hover:bg-red-500/40 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
                   >
                     <FaTrashAlt size={14} /> Delete
                   </button>
                 </div>
               </div>
             )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 