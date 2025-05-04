'use client';

import { FaCalendarAlt, FaPlusCircle, FaEdit, FaTrashAlt, FaDollarSign, FaPlane, FaMapMarkerAlt, FaHeart, FaUsers, FaInfoCircle, FaEyeSlash, FaClipboardCheck, FaExclamationTriangle, FaWallet, FaEye, FaUser } from 'react-icons/fa';
import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import React from 'react';
import { presetIcons, PRESET_HOLIDAY_TAGS, CATEGORY_COLOR_CLASSES } from '../../lib/constants';
import { getCurrencySymbol, formatDate, getBackgroundColorStyle } from '../../lib/utils';
import { getTagClasses } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import countryList from 'country-list';

/**
 * HolidayCard Component
 * 
 * Displays a summary card for a single holiday, including image/icon, 
 * title, dates, status, budget/expense summary, and action buttons.
 * 
 * @param {object} holiday - The holiday data object.
 * @param {boolean} isDarkMode - Whether dark mode is enabled.
 * @param {function} [onEdit] - Callback for edit action.
 * @param {function} [onDelete] - Callback for delete action.
 * @param {function} [onAddExpense] - Callback for add expense action.
 * @param {function} onClick - Callback for clicking the card.
 * @param {function} [onLike] - Callback for like action.
 * @param {function} [onUnlike] - Callback for unlike action.
 * @param {boolean} [isExploreCard=false] - True if the card is displayed on the Explore page.
 */
export default function HolidayCard({ 
  holiday, 
  isDarkMode, 
  onEdit, 
  onDelete, 
  onAddExpense, 
  onClick, 
  onLike, 
  onUnlike, 
  isExploreCard = false
}) {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();

  const hasLiked = user && holiday?.likes?.includes(user?._id);

  // Memoize calculations for performance
  const {
    _id,
    title = 'Unnamed Holiday',
    destination = '',
    startDate,
    endDate,
    budget = { amount: 0, currency: 'USD' },
    expenses = [],
    likes = [],
    imageType,
    imageData,
    imagePreset,
    isPublic,
    tags = [],
    userId
  } = holiday || {};

  const isOwnHoliday = user && userId === user?._id;

  const totalExpenses = useMemo(() => expenses.reduce((total, expense) => total + Number(expense?.amount || 0), 0), [expenses]);
  
  const budgetAmount = useMemo(() => Number(budget.amount) || 0, [budget.amount]);
  const budgetCurrency = useMemo(() => budget.currency || 'USD', [budget.currency]);
  
  const progressPercentage = useMemo(() => budgetAmount > 0 ? Math.min((totalExpenses / budgetAmount) * 100, 100) : 0, [totalExpenses, budgetAmount]);

  const getDaysUntilStart = (startDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate) : null;
    if (!start || isNaN(start.getTime())) return null;
    start.setHours(0, 0, 0, 0);
    const diffTime = start - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : null;
    if (!end || isNaN(end.getTime())) return null;
    end.setHours(0, 0, 0, 0);
    const diffTime = end - today;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); 
  };

  const status = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
         const errorTitle = holiday?.title || title || 'holiday'; 
         console.warn(`Invalid dates for ${errorTitle}:`, { startDate, endDate });
         return { label: 'Invalid Dates', type: 'invalid', color: 'bg-red-500 text-red-100' };
      }
      start.setHours(0, 0, 0, 0); 
      end.setHours(0, 0, 0, 0);

      if (today >= start && today <= end) {
        const daysRemaining = getDaysRemaining(endDate);
        return { label: `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`, type: 'active', color: 'bg-cyan-500 text-cyan-100', icon: FaCalendarAlt };
      } else if (today > end) {
        return { label: 'Completed', type: 'completed', color: 'bg-gray-500 text-gray-100', icon: FaClipboardCheck };
      } else {
        const diffDays = getDaysUntilStart(startDate);
        if (diffDays === null) { 
             return { label: 'Invalid Start', type: 'invalid', color: 'bg-red-500 text-red-100' };
        }
        const label = diffDays <= 0 ? 'Starts Today' : `In ${diffDays} day${diffDays === 1 ? '' : 's'}`;
        const color = diffDays <= 7 ? 'bg-amber-500 text-amber-100' : 'bg-green-500 text-green-100';
        return { label, type: 'upcoming', color, icon: FaCalendarAlt };
      }
    } catch (error) {
      const errorTitle = holiday?.title || title || 'holiday'; 
      console.error(`Error calculating status for ${errorTitle}:`, error, { holiday });
      return { label: 'Error', type: 'invalid', color: 'bg-red-500 text-red-100', icon: FaExclamationTriangle };
    }
  }, [startDate, endDate, getDaysRemaining, getDaysUntilStart, holiday?.title, title]);

  const countryCode = useMemo(() => getCountryCode(destination), [destination]);
  const flagEmoji = useMemo(() => getFlagEmoji(countryCode), [countryCode]);
  const headerStyle = useMemo(() => getBackgroundColorStyle(destination, isDarkMode), [destination, isDarkMode]);
  
  // Generate a deterministic preset index and style based on holiday title or destination
  const { fallbackIcon, fallbackColor } = useMemo(() => {
    // If imagePreset is explicitly set, use it
    if (imagePreset !== null && imagePreset !== undefined) {
      return { 
        fallbackIcon: presetIcons[imagePreset] || presetIcons[0],
        fallbackColor: presetIcons[imagePreset]?.color || presetIcons[0].color
      };
    }
    
    // If no imagePreset is specified, generate one based on title or destination
    const seed = title || destination || 'default';
    // Simple hash function to generate a number from a string
    const hash = [...seed].reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    // Use modulo to get an index within the presetIcons array
    const generatedIndex = hash % presetIcons.length;
    return { 
      fallbackIcon: presetIcons[generatedIndex],
      fallbackColor: presetIcons[generatedIndex].color
    };
  }, [imagePreset, title, destination]);

  const handleActionClick = useCallback((e, callback) => {
    e.stopPropagation();
    if (callback) callback(_id);
  }, [_id]);

  const handleLikeClick = useCallback((e) => {
    e.stopPropagation();
    if (!user) return;
    if (hasLiked) {
      if (onUnlike) onUnlike(_id);
    } else {
      if (onLike) onLike(_id);
    }
  }, [hasLiked, onLike, onUnlike, _id, user]);

  const renderHeaderImage = () => {
    const commonClasses = "w-full h-40 object-cover rounded-t-lg";

    if (!imageError && imageType === 'upload' && imageData) {
      return (
        <div className="relative w-full h-40 rounded-t-lg overflow-hidden">
          <Image
            src={imageData}
            alt={`${title} cover image`}
            width={400}
            height={160}
            className={`${commonClasses} z-10`}
            onError={() => setImageError(true)}
            priority={false}
          />
          {/* Subtle background blur of the same image to avoid empty space on load */}
          <div 
            className="absolute inset-0 z-0 opacity-80 blur-md"
            style={{
              backgroundImage: `url(${imageData})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
        </div>
      );
    }

    // Use preset icon with a gradient background
    const FallbackIconComponent = fallbackIcon?.icon || presetIcons[0].icon;
    
    // Generate a gradient based on the destination or preset
    const getGradientClass = () => {
      if (imagePreset === 0) return 'from-blue-500 to-cyan-600'; // Beach
      if (imagePreset === 1) return 'from-green-600 to-emerald-500'; // Mountains
      if (imagePreset === 2) return 'from-cyan-600 to-blue-700'; // Plane
      if (imagePreset === 3) return 'from-red-500 to-rose-600'; // Location
      if (imagePreset === 4) return 'from-amber-600 to-yellow-500'; // Tropical
      if (imagePreset === 5) return 'from-purple-600 to-indigo-700'; // Adventure
      
      // Default fallback based on title or destination
      const seed = (title || destination || 'default').toLowerCase();
      if (seed.includes('beach') || seed.includes('sea') || seed.includes('ocean')) return 'from-blue-500 to-cyan-600';
      if (seed.includes('mountain') || seed.includes('hill') || seed.includes('alps')) return 'from-green-600 to-emerald-500';
      if (seed.includes('city') || seed.includes('urban')) return 'from-gray-600 to-slate-700';
      if (seed.includes('desert') || seed.includes('sand')) return 'from-amber-500 to-yellow-600';
      if (seed.includes('tropical') || seed.includes('island')) return 'from-emerald-500 to-teal-600';
      if (seed.includes('forest') || seed.includes('park')) return 'from-green-500 to-teal-700';
      
      // Use hash of destination for other cases
      const hash = [...(destination || title || '')].reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      
      const gradients = [
        'from-blue-500 to-cyan-600',
        'from-purple-500 to-pink-600',
        'from-green-500 to-emerald-600',
        'from-yellow-400 to-orange-600',
        'from-red-500 to-rose-600',
        'from-blue-500 to-indigo-600',
        'from-gray-600 to-blue-gray-700',
        'from-indigo-500 to-purple-600'
      ];
      
      return gradients[hash % gradients.length];
    };
    
    return (
      <div 
        className={`${commonClasses} flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${getGradientClass()}`}
      >
        <FallbackIconComponent size={64} className="text-white/90 z-10" />
      </div>
    );
  };

  const renderBudgetInfo = () => {
    const spentText = formatCurrency(totalExpenses, budgetCurrency);
    const budgetText = budgetAmount > 0 ? formatCurrency(budgetAmount, budgetCurrency) : 'No budget';
    const expenseCount = expenses.length;

    return (
        <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-sm`}>
            <div className="flex items-center justify-between mb-1">
                <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <FaWallet size={14} /> Spent:
                </span>
                <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {spentText} 
                    <span className={`text-xs opacity-70 ml-1`}>({expenseCount} item{expenseCount !== 1 ? 's' : ''})</span>
                </span>
            </div>

            {budgetAmount > 0 && (
                <>
                    <div className="flex items-center justify-between">
                        <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <FaInfoCircle size={14} /> Budget:
                        </span>
                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {budgetText}
                        </span>
                    </div>
                    
                    {(status.type === 'active' || status.type === 'completed') && (
                         <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-1.5 overflow-hidden mt-2 mb-1" title={`Budget Progress: ${Math.round(progressPercentage)}%`}>
                            <div 
                            className={`h-full rounded-full transition-all duration-500 ease-out ${progressPercentage < 75 ? 'bg-cyan-500' : progressPercentage < 100 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    )}

                    {status.type === 'completed' && (
                         <div className={`flex items-center justify-end gap-1 text-xs mt-1 ${progressPercentage >= 100 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                            {progressPercentage >= 100 ? <FaExclamationTriangle size={12} /> : <FaClipboardCheck size={12} />}
                            <span>{formatCurrency(Math.abs(totalExpenses - budgetAmount), budgetCurrency)} {progressPercentage >= 100 ? 'over' : 'under'} budget</span>
                        </div>
                    )}
                     {status.type === 'active' && progressPercentage >= 100 && (
                        <div className="flex items-center justify-end gap-1 text-xs text-red-500 dark:text-red-400 mt-1">
                            <FaExclamationTriangle size={12} />
                            Over Budget
                        </div>
                    )}
                </>
            )}
            {budgetAmount <= 0 && expenseCount > 0 && (
                 <div className="flex items-center justify-between text-xs mt-1">
                     <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        <FaInfoCircle size={14} /> Pre-paid:
                    </span>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {spentText} logged
                    </span>
                 </div>
            )}

        </div>
    );
};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={() => onClick && onClick(holiday)}
      className={`group relative flex flex-col rounded-lg ${
        isDarkMode 
          ? 'bg-black/60 shadow-xl shadow-black/20 hover:shadow-cyan-950/20 hover:bg-black/70 border border-gray-800/50' 
          : 'bg-white/90 shadow-lg hover:shadow-xl hover:shadow-cyan-100/50 border border-gray-100/80'
      } overflow-hidden backdrop-blur-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1`}
      onMouseEnter={() => setShowActions(isOwnHoliday)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Public/Private Indicator */}
      <div className="absolute top-2 right-2 z-20">
        {!isPublic ? (
          <div className={`rounded-full p-1 backdrop-blur-md ${isDarkMode ? 'bg-black/60' : 'bg-white/60'}`}>
            <FaEyeSlash size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
          </div>
        ) : (
          <div className={`rounded-full p-1 backdrop-blur-md ${isDarkMode ? 'bg-black/60' : 'bg-white/60'}`}>
            <FaEye size={16} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
          </div>
        )}
      </div>

      {/* Render top image/placeholder */}
      {renderHeaderImage()}

      {/* Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 left-2 flex gap-1.5 z-20"
          >
            <button 
              onClick={(e) => handleActionClick(e, onEdit)}
              className="p-2 rounded-full bg-gray-800/90 text-white hover:bg-cyan-600 transition-colors"
              aria-label="Edit holiday"
            >
              <FaEdit size={14} />
            </button>
            <button 
              onClick={(e) => handleActionClick(e, onDelete)}
              className="p-2 rounded-full bg-gray-800/90 text-white hover:bg-red-600 transition-colors"
              aria-label="Delete holiday"
            >
              <FaTrashAlt size={14} />
            </button>
            <button 
              onClick={(e) => handleActionClick(e, onAddExpense)}
              className="p-2 rounded-full bg-gray-800/90 text-white hover:bg-green-600 transition-colors"
              aria-label="Add expense"
            >
              <FaPlusCircle size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main info */}
      <div className="flex flex-col flex-1 p-4 pt-3 gap-1">
        {/* Title and status badge */}
        <div className="flex justify-between items-start">
          <h3 className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          {status && (
            <div className={`flex items-center text-xs px-2 py-0.5 rounded-full font-medium ml-2 whitespace-nowrap ${status.color}`}>
              {status.icon && React.createElement(status.icon, { size: 12, className: "mr-1" })}
              {status.label}
            </div>
          )}
        </div>

        {/* Location */}
        {destination && (
          <div 
            className={`flex items-center gap-1.5 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            <FaMapMarkerAlt size={13} />
            <span className="truncate">{destination}</span>
            {flagEmoji && <span className="text-xs">{flagEmoji}</span>}
          </div>
        )}

        {/* Trip Date Range */}
        {(startDate || endDate) && (
          <div 
            className={`flex items-center gap-1.5 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            title={`${startDate ? formatDate(startDate) : 'No start date'} - ${endDate ? formatDate(endDate) : 'No end date'}`}
          >
            <FaCalendarAlt size={13} />
            <span className="truncate">{formatDate(startDate)} - {formatDate(endDate)}</span>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {tags.map(tag => {
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

        {/* Budget and expense summary */}
        {renderBudgetInfo()}

        {/* Like button or owner indicator */}
        {(isPublic || isExploreCard) && (
          <div 
            className={`flex items-center justify-end gap-1.5 mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {isOwnHoliday ? (
              <span className="flex items-center gap-1">
                <FaUser size={14} />
                <span>Your Holiday</span>
              </span>
            ) : (
              <button 
                onClick={handleLikeClick}
                className={`flex items-center gap-1 ${hasLiked ? 'text-red-500' : isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'} transition-colors`}
                aria-label={hasLiked ? "Unlike this holiday" : "Like this holiday"}
              >
                <FaHeart 
                  size={14} 
                  className={`${hasLiked ? 'fill-current' : ''} transition-all`}
                />
                <span>{likes.length || ''}</span>
              </button>
            )}
            <FaUsers size={14} />
            <span>{userId ? 'Public' : ''}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getCountryCode(destinationName) {
  return destinationName ? countryList.getCode(destinationName) : null;
}

function getFlagEmoji(countryCode) {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    console.warn("Could not create flag emoji for code:", countryCode, error);
    return '';
  }
}

function isEmpty(obj) {
  return obj == null || Object.keys(obj).length === 0;
}

const formatCurrency = (amount, currencyCode = 'USD') => {
    const symbol = getCurrencySymbol(currencyCode);
    const numericAmount = Number(amount) || 0;
    return `${symbol}${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}; 