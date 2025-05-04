'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Edit2, Trash2, Heart, Filter, ListFilter, RotateCw, Grid, LayoutGrid } from 'lucide-react';
import { 
  FaUmbrellaBeach, FaMountain, FaPlane, FaMapMarkerAlt, FaTree, FaCompass, 
  FaCalendarAlt, FaPlusCircle, FaDollarSign, FaShareAlt, FaMoon, FaSun, 
  FaPlus, FaCheckCircle, FaTimesCircle, FaTimes
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { HolidayCard, ExpenseForm, HolidayForm } from './index';
import HolidayDetailView from './HolidayDetailView';
import { useHolidays } from '../../hooks/useHolidays';
import HolidayCardSkeleton from './HolidayCardSkeleton';
import toast from 'react-hot-toast';

// Define sort options
const sortOptions = [
  { value: 'startDate_asc', label: 'Start Date (Oldest)' },
  { value: 'startDate_desc', label: 'Start Date (Newest)' },
  { value: 'title_asc', label: 'Title (A-Z)' },
  { value: 'title_desc', label: 'Title (Z-A)' },
  { value: 'budget_desc', label: 'Budget (High-Low)' },
  { value: 'budget_asc', label: 'Budget (Low-High)' },
];

// Define status filter options
const statusFilters = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
];

/**
 * MainContent Component for Holidays Page
 * 
 * This component is the primary view for managing holidays.
 * It fetches holiday data using the useHolidays hook, displays holiday cards,
 * and handles opening modals for adding/editing holidays and expenses, 
 * as well as showing a detailed view of a selected holiday.
 */
export default function MainContent() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { 
    holidays: allFetchedHolidays,
    loading, 
    error, 
    createHoliday, 
    updateHoliday, 
    deleteHoliday, 
    addExpense,
    deleteExpense,
    updateExpense,
    fetchHolidays
  } = useHolidays();
  
  // State for local holidays to allow optimistic updates
  const [localHolidays, setLocalHolidays] = useState([]);
  
  // Move detailedHoliday state declaration before the useEffect that depends on it
  const [detailedHoliday, setDetailedHoliday] = useState(null); // Holiday object for detail view

  useEffect(() => {
    // This effect updates localHolidays and the open detailedHoliday when the fetched data changes.
    if (allFetchedHolidays) {
      console.log("MainContent useEffect[allFetchedHolidays]: Fetched data updated, setting localHolidays.", allFetchedHolidays.length);
      
      // Make a deep copy of the holidays to avoid reference issues
      const processedHolidays = allFetchedHolidays.map(holiday => {
        // Ensure all critical fields have at least a default value to prevent UI inconsistencies
        return {
          ...holiday,
          title: holiday.title || 'Unnamed Holiday',
          destination: holiday.destination || '',
          budget: holiday.budget || { amount: 0, currency: 'USD' },
          expenses: Array.isArray(holiday.expenses) ? holiday.expenses : [],
          likes: Array.isArray(holiday.likes) ? holiday.likes : [],
          tags: Array.isArray(holiday.tags) ? holiday.tags : [],
          // imagePreset can be null but should be explicitly set
          imagePreset: holiday.imagePreset !== undefined ? holiday.imagePreset : null
        };
      });
      
      setLocalHolidays(processedHolidays);
      
      // If a detailed view is currently open, find its updated version in the new data
      if (detailedHoliday && detailedHoliday._id) {
        const updatedDetailedData = processedHolidays.find(h => h._id === detailedHoliday._id);
        if (updatedDetailedData) {
          console.log(`MainContent useEffect[allFetchedHolidays]: Found updated data for open detailed view (${detailedHoliday._id}). Expenses count: ${updatedDetailedData.expenses?.length || 0}`);
          // Compare if update is actually needed to prevent potential loops
          if (JSON.stringify(updatedDetailedData) !== JSON.stringify(detailedHoliday)) {
             console.log("MainContent useEffect[allFetchedHolidays]: Updating detailedHoliday state.");
             setDetailedHoliday(updatedDetailedData);
          } else {
             console.log("MainContent useEffect[allFetchedHolidays]: Detailed holiday data hasn't changed, skipping update.");
          }
        } else {
          console.warn(`MainContent useEffect[allFetchedHolidays]: Could not find updated data for the open detailed holiday (${detailedHoliday._id}). Closing detail view.`);
          // If the holiday somehow disappeared (e.g., deleted in another tab), close the detail view
          setDetailedHoliday(null);
        }
      }
    }
  }, [allFetchedHolidays]); // ONLY depend on allFetchedHolidays
  
  // --- State for UI Control --- 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('startDate_desc'); // Default sort Newest
  const [filterStatus, setFilterStatus] = useState('all');

  // State for Modals/Forms (remains largely the same)
  const [showNewHolidayForm, setShowNewHolidayForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(null); // Holiday ID for which expense form is shown
  const [editingHoliday, setEditingHoliday] = useState(null); // Holiday ID being edited
  const [editingExpense, setEditingExpense] = useState(null); // Expense ID being edited

  // --- Form Data State (Simplified, using HolidayForm's internal state might be better long term) ---
  const [newHolidayInitialData, setNewHolidayInitialData] = useState(null);
  const [editHolidayInitialData, setEditHolidayInitialData] = useState(null);
  const [newExpenseInitialData, setNewExpenseInitialData] = useState(null);

  // --- Filtering and Sorting Logic --- 
  const filteredAndSortedHolidays = useMemo(() => {
    let holidaysToProcess = [...localHolidays]; // Work with local state

    // 1. Filter by Search Term (Title or Destination)
    if (searchTerm) {
      holidaysToProcess = holidaysToProcess.filter(h => 
        h.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.destination?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filter by Status
    if (filterStatus !== 'all') {
      holidaysToProcess = holidaysToProcess.filter(h => getHolidayStatus(h) === filterStatus);
    }

    // 3. Sort
    const [sortField, sortOrder] = sortBy.split('_');
    holidaysToProcess.sort((a, b) => {
      let valA, valB;
      
      switch (sortField) {
        case 'startDate':
          valA = a.startDate ? new Date(a.startDate) : 0;
          valB = b.startDate ? new Date(b.startDate) : 0;
          break;
        case 'title':
          valA = a.title?.toLowerCase() || '';
          valB = b.title?.toLowerCase() || '';
          break;
        // Add other sort cases if needed (budget, likes etc)
        default:
          return 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return holidaysToProcess;
  }, [localHolidays, searchTerm, filterStatus, sortBy]);

  // --- Split into My Holidays and Liked Holidays ---
  const { myHolidays, likedHolidays } = useMemo(() => {
    if (!user?._id) return { myHolidays: [], likedHolidays: [] }; // Check for user._id specifically
    
    const my = [];
    const liked = [];
    
    filteredAndSortedHolidays.forEach(holiday => {
      // Compare string versions of IDs for robustness
      const holidayUserId = holiday.userId?.toString(); // Ensure userId exists and convert to string
      const currentUserId = user._id.toString();

      if (holidayUserId && holidayUserId === currentUserId) {
        my.push(holiday);
      } else if (holiday.likes?.some(likeId => likeId?.toString() === currentUserId)) { // Check likes array safely
        liked.push(holiday);
      }
    });

    return { myHolidays: my, likedHolidays: liked };

  }, [filteredAndSortedHolidays, user?._id]); // Depend on user._id

  // --- Helper to get status string (consistent with HolidayCard) ---
  const getHolidayStatus = useCallback((holiday) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
      const start = holiday.startDate ? new Date(holiday.startDate) : null;
      const end = holiday.endDate ? new Date(holiday.endDate) : null;
      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return 'invalid';
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      if (today >= start && today <= end) return 'active';
      if (today > end) return 'completed';
      return 'upcoming';
    } catch { return 'invalid'; }
  }, []);

  // --- CRUD Handlers (using useHolidays hook results) ---

  const handleOpenNewHolidayForm = () => {
    setNewHolidayInitialData({}); // Reset form
    setEditingHoliday(null);
    setShowNewHolidayForm(true);
  };

  const handleOpenEditHolidayForm = (holidayId) => {
    // Ensure detailed view is closed before opening the edit form
    if (detailedHoliday) {
      setDetailedHoliday(null);
    }
    
    // Small delay to ensure proper animation and UI readiness
    setTimeout(() => {
      const holidayToEdit = localHolidays.find(h => h._id === holidayId);
      if (holidayToEdit) {
        setEditHolidayInitialData({
          ...holidayToEdit,
          startDate: holidayToEdit.startDate ? new Date(holidayToEdit.startDate).toISOString().split('T')[0] : '',
          endDate: holidayToEdit.endDate ? new Date(holidayToEdit.endDate).toISOString().split('T')[0] : '',
          budget: {
            amount: holidayToEdit.budget?.amount || '',
            currency: holidayToEdit.budget?.currency || 'USD'
          },
        });
        setEditingHoliday(holidayId);
        setShowNewHolidayForm(true); // Reuse the same form modal
      }
    }, 50);
  };

  const handleSaveHoliday = async (holidayData) => {
    const toastId = toast.loading(editingHoliday ? 'Updating holiday...' : 'Creating holiday...');
    try {
      if (editingHoliday) {
        await updateHoliday(editingHoliday, holidayData);
        toast.success('Holiday updated!', { id: toastId });
      } else {
        await createHoliday(holidayData);
        toast.success('Holiday created!', { id: toastId });
      }
      setShowNewHolidayForm(false);
      setEditingHoliday(null);
      // Refetch or rely on hook's potential auto-update
      // setLocalHolidays might be updated by the hook if it returns new data
    } catch (error) {
      console.error('Error saving holiday:', error);
      toast.error(error.message || 'Failed to save holiday.', { id: toastId });
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (window.confirm('Are you sure you want to delete this holiday and all its expenses?')) {
      const toastId = toast.loading('Deleting holiday...');
      try {
        await deleteHoliday(holidayId);
        // Optimistic UI update
        setLocalHolidays(prev => prev.filter(h => h._id !== holidayId));
        if (detailedHoliday?._id === holidayId) setDetailedHoliday(null); // Close detail view if open
        toast.success('Holiday deleted', { id: toastId });
      } catch (error) {
        console.error('Error deleting holiday:', error);
        toast.error(error.message || 'Failed to delete holiday.', { id: toastId });
      }
    }
  };

  // --- Expense Handlers ---
  const handleOpenAddExpenseForm = (holidayId) => {
    setShowExpenseForm(holidayId);
    setEditingExpense(null);
    setNewExpenseInitialData({ date: new Date().toISOString().split('T')[0], category: 'Food' }); // Default values
    setDetailedHoliday(null); // Close detail view if open
  };

  const handleOpenEditExpenseForm = (expense, holidayId) => {
    if (!expense || !expense._id) {
      console.error("Invalid expense object provided to edit form:", expense);
      return;
    }
    
    console.log("Opening edit expense form with data:", expense);
    setShowExpenseForm(holidayId);
    setEditingExpense(expense._id);
    
    // Prepare data for the form
    const formattedExpenseData = { 
      ...expense,
      description: expense.description || expense.title || '', // Make sure description is set (ExpenseForm uses this)
      // Ensure date is formatted correctly for input type="date"
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
    
    console.log("Formatted expense data for form:", formattedExpenseData);
    setNewExpenseInitialData(formattedExpenseData);
    setDetailedHoliday(null);
  };

  const handleSaveExpense = async (expenseData) => {
    if (!showExpenseForm) return;
    const holidayId = showExpenseForm;
    const toastId = toast.loading(editingExpense ? 'Updating expense...' : 'Adding expense...');
    try {
      // Make sure expenseData has all required fields
      const completeExpenseData = {
        ...expenseData,
        description: expenseData.description || expenseData.title || '',
        title: expenseData.title || expenseData.description || '',
        date: expenseData.date || new Date().toISOString().split('T')[0],
        category: expenseData.category || 'Other',
        amount: parseFloat(expenseData.amount || 0),
      };
      
      console.log("Complete expense data being sent to API:", completeExpenseData);
      
      let savedExpense;
      if (editingExpense) {
        console.log(`Updating expense ${editingExpense} for holiday ${holidayId}`);
        savedExpense = await updateExpense(holidayId, editingExpense, completeExpenseData);
        toast.success('Expense updated', { id: toastId });
      } else {
        console.log(`Adding new expense to holiday ${holidayId}`);
        savedExpense = await addExpense(holidayId, completeExpenseData);
        toast.success('Expense added', { id: toastId });
      }
      
      console.log("API returned expense data:", savedExpense);
      
      // Clear form
      setShowExpenseForm(null);
      setEditingExpense(null);
      
      // Wait for the fetchHolidays to complete so we have fresh data
      // This will trigger the useEffect hook to update localHolidays and detailedHoliday if open.
      await fetchHolidays();
      
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error(error.message || 'Failed to save expense.', { id: toastId });
    }
  };
  
  const handleDeleteExpense = async (expenseId, holidayId) => {
     if (window.confirm('Are you sure you want to delete this expense?')) {
         const toastId = toast.loading('Deleting expense...');
         try {
            await deleteExpense(holidayId, expenseId);
            // Optimistic UI update within the local holiday state
            setLocalHolidays(prevHolidays => prevHolidays.map(h => {
                if (h._id === holidayId) {
                    return { ...h, expenses: h.expenses.filter(e => e._id !== expenseId) };
                }
                return h;
            }));
            // If detail view is open, update it too
            if (detailedHoliday?._id === holidayId) {
                setDetailedHoliday(prev => ({ ...prev, expenses: prev.expenses.filter(e => e._id !== expenseId) }));
            }
            toast.success('Expense deleted', { id: toastId });
      } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error(error.message || 'Failed to delete expense.', { id: toastId });
         }
     }
  };

  // --- Like/Unlike Handlers ---
  const handleLike = async (holidayId) => {
    if (!user) return toast.error('Please log in to like holidays');
    if (!holidayId || typeof holidayId !== 'string') {
      console.error('Invalid holiday ID format:', holidayId);
      return;
    }
    
    // Find the holiday to check if it's the user's own
    const holiday = localHolidays.find(h => h._id === holidayId);
    if (!holiday) {
      console.error('Holiday not found:', holidayId);
      return;
    }
    
    // Don't allow liking your own holidays
    if (holiday.userId === user._id) {
      console.log('Cannot like your own holiday');
      return;
    }

    const originalHolidays = [...localHolidays];
    // Optimistic update
    setLocalHolidays(prev => prev.map(h => 
      h._id === holidayId 
        ? { ...h, likes: [...(h.likes || []), user._id] } 
        : h
    ));
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/holidays/${holidayId}/like`, { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to like holiday (${response.status})`);
      }
      // Optional: Refetch or update based on API response if needed
      // toast.success('Liked!'); // Maybe too noisy?
    } catch (error) {
      console.error('Error liking holiday:', error);
      toast.error(`Like failed: ${error.message}`);
      setLocalHolidays(originalHolidays); // Revert optimistic update
    }
  };

  const handleUnlike = async (holidayId) => {
    if (!user) return; // Should not happen if button is shown correctly
    if (!holidayId || typeof holidayId !== 'string') {
      console.error('Invalid holiday ID format:', holidayId);
      return;
    }
    
    const originalHolidays = [...localHolidays];
    // Optimistic update
    setLocalHolidays(prev => prev.map(h => 
      h._id === holidayId 
        ? { ...h, likes: (h.likes || []).filter(id => id !== user._id) }
        : h
    ));
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/holidays/${holidayId}/like`, { method: 'DELETE' }); // Assuming DELETE for unlike
       if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to unlike holiday (${response.status})`);
      }
      // Optional: Refetch or update based on API response
      // toast.success('Unliked'); // Maybe too noisy?
    } catch (error) {
      console.error('Error unliking holiday:', error);
      toast.error(`Unlike failed: ${error.message}`);
      setLocalHolidays(originalHolidays); // Revert optimistic update
    }
  };

  // --- Detail View --- 
  const openDetailedView = useCallback((holiday) => {
    // Check if holiday is just an ID string
    if (typeof holiday === 'string') {
      const holidayId = holiday;
      // Find the holiday by ID
      const foundHoliday = localHolidays.find(h => h._id === holidayId);
      if (!foundHoliday) {
        console.error("Could not find holiday with ID:", holidayId);
        return;
      }
      holiday = foundHoliday;
    } else if (!holiday || typeof holiday !== 'object') {
      console.error("Invalid holiday parameter:", holiday);
      return;
    }

    // Find the latest version from local state in case of optimistic updates
    const currentHoliday = localHolidays.find(h => h._id === holiday._id) || holiday;
    console.log("Opening detailed view with holiday:", currentHoliday);
    console.log("Expenses in this holiday:", currentHoliday.expenses);
    
    // Make sure expenses array exists
    if (!Array.isArray(currentHoliday.expenses)) {
      console.warn("Fixing missing expenses array in holiday:", currentHoliday._id);
      currentHoliday.expenses = [];
    }
    
    setDetailedHoliday(currentHoliday);
  }, [localHolidays]);

  const closeDetailedView = () => {
    setDetailedHoliday(null);
  };

  // --- Render Logic --- 

  // Skeleton Loading state
  if (loading && localHolidays.length === 0) {
    return (
      <div>
        {/* Keep Filters/Add Button visible maybe? Or skeleton them too */} 
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
           {/* Add Skeleton for filters */}
           <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
           <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
           <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
           <div className="h-10 bg-cyan-500 rounded w-36 animate-pulse"></div>
      </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <HolidayCardSkeleton key={index} isDarkMode={isDarkMode} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
            <p className={`text-red-500 text-lg mb-2`}>Error loading holidays: {error.message}</p>
        <button 
                onClick={fetchHolidays} 
                className={`mt-2 px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                <RotateCw size={16} className="inline mr-1"/> Retry
        </button>
      </div>
    );
  }

  // Main Render
  return (
    <div className="space-y-8">
      {/* Filter and Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-5 bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-gray-900/80 dark:to-cyan-950/80 rounded-lg shadow-sm backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input - Redesigned to be more minimal and elegant */}
          <div className="relative group">
            <input 
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`p-2 pl-9 rounded-full w-52 transition-all duration-300 border-0 ${
                isDarkMode 
                  ? 'bg-gray-800/60 text-white placeholder-gray-400 shadow-inner shadow-gray-900/30' 
                  : 'bg-white/80 text-gray-800 placeholder-gray-400 shadow-sm'
              } focus:w-64 focus:outline-none focus:ring-1 focus:ring-cyan-400`}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500/70 group-focus-within:text-cyan-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`appearance-none p-2.5 pr-10 border rounded-lg shadow-sm ${ isDarkMode ? 'bg-gray-800/80 border-gray-700 text-white' : 'bg-white/90 border-gray-200/80 text-gray-800' } focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200`}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Status Filter Dropdown */}
          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`appearance-none p-2.5 pr-10 border rounded-lg shadow-sm ${ isDarkMode ? 'bg-gray-800/80 border-gray-700 text-white' : 'bg-white/90 border-gray-200/80 text-gray-800' } focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200`}
            >
              {statusFilters.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Add Holiday Button */}
        <button
          onClick={handleOpenNewHolidayForm}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all duration-300 ${
            isDarkMode 
            ? 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow-cyan-900/20' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
          } transform hover:translate-y-[-1px] hover:shadow-md`}
        >
          <FaPlusCircle size={16} />
          Add Holiday
        </button>
      </div>

      {/* My Holidays Section */}
      <section>
        <h2 className={`text-xl font-semibold mb-4 pb-2 border-b ${isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-300 text-gray-800'}`}>
          Your Trips ({myHolidays.length})
        </h2>
        {myHolidays.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myHolidays.map(holiday => (
              <HolidayCard 
                key={holiday._id} 
                holiday={holiday} 
                isDarkMode={isDarkMode} 
                onEdit={() => handleOpenEditHolidayForm(holiday._id)}
                onDelete={() => handleDeleteHoliday(holiday._id)}
                onAddExpense={() => handleOpenAddExpenseForm(holiday._id)}
                onClick={openDetailedView} // Updated to pass holiday object
                onLike={handleLike} // Pass like/unlike handlers
                onUnlike={handleUnlike}
              />
            ))}
          </div>
        ) : (
          <p className={`text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>You haven't created any trips yet. <button onClick={handleOpenNewHolidayForm} className="text-cyan-500 hover:underline">Add one now!</button></p>
        )}
      </section>

      {/* Liked Holidays Section */}
      <section>
        <h2 className={`text-xl font-semibold mb-4 pb-2 border-b ${isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-300 text-gray-800'}`}>
           Liked Trips ({likedHolidays.length})
        </h2>
         {likedHolidays.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {likedHolidays.map(holiday => (
              <HolidayCard 
                key={holiday._id} 
                holiday={holiday} 
                isDarkMode={isDarkMode} 
                // No edit/delete/addExpense for liked holidays (unless requirements change)
                // onEdit={undefined}
                // onDelete={undefined}
                // onAddExpense={undefined}
                onClick={openDetailedView} 
                onLike={handleLike}
                onUnlike={handleUnlike}
              />
            ))}
        </div>
        ) : (
          <p className={`text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>You haven't liked any trips yet. Check out the Explore page!</p>
          // TODO: Link to Explore page if it exists
        )}
      </section>

      {/* Modals */} 
      {showNewHolidayForm && (
        <HolidayForm 
          isOpen={showNewHolidayForm} 
          onClose={() => { setShowNewHolidayForm(false); setEditingHoliday(null); }} 
          onSubmit={handleSaveHoliday}
          initialData={editingHoliday ? editHolidayInitialData : newHolidayInitialData}
          isEditing={!!editingHoliday}
          isDarkMode={isDarkMode}
        />
      )}

      {showExpenseForm && (
        <ExpenseForm 
          onClose={() => setShowExpenseForm(null)}
          onSubmit={handleSaveExpense}
          expenseData={newExpenseInitialData}
          isEditing={!!editingExpense}
          isDarkMode={isDarkMode}
        />
      )}
      
      {detailedHoliday && (
        <HolidayDetailView 
          holiday={detailedHoliday}
          isOpen={!!detailedHoliday}
          onClose={closeDetailedView}
          isDarkMode={isDarkMode}
          onEditExpense={handleOpenEditExpenseForm}
          onDeleteExpense={handleDeleteExpense}
          onAddExpense={() => handleOpenAddExpenseForm(detailedHoliday._id)}
          onEditHoliday={() => handleOpenEditHolidayForm(detailedHoliday._id)}
          onDeleteHoliday={() => handleDeleteHoliday(detailedHoliday._id)}
          onLike={handleLike}
          onUnlike={handleUnlike}
          userId={user?._id} // Pass current user ID
        />
      )}
    </div>
  );
}