"use client";

import { useState } from 'react';
import { usePublicHolidays } from '../../hooks/usePublicHolidays'; // Adjust path if necessary
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { AppLayout, HolidayCard, HolidayCardSkeleton, HolidayDetailView } from '../../components'; // Adjust path if necessary
import { FaSearch, FaGlobeEurope } from 'react-icons/fa';
import { PRESET_HOLIDAY_TAGS, getTagClasses } from '../../lib/constants'; // Import tag constants

export default function ExplorePage() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth(); // Get user for checking likes
  const { 
    publicHolidays, 
    setPublicHolidays, // Need setter for optimistic updates
    loading, 
    error, 
    options, 
    updateOptions,
    refetch: refetchPublicHolidays // Get refetch function from hook
  } = usePublicHolidays(); // Use the new hook
  
  // State for selected holiday detail view
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  
  // Local state for controlled input
  const [searchTerm, setSearchTerm] = useState(options.searchTerm);
  // Local state for selected filter tags
  const [selectedTags, setSelectedTags] = useState(options.tags || []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Trigger search on pressing Enter or after a delay (debounce can be added later)
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      updateOptions({ searchTerm: searchTerm });
    }
  };

  const handleSearchButtonClick = () => {
      updateOptions({ searchTerm: searchTerm });
  };

  // Handle tag filter toggle
  const handleTagFilterToggle = (tagKey) => {
    const newSelectedTags = selectedTags.includes(tagKey)
      ? selectedTags.filter(t => t !== tagKey) // Remove tag
      : [...selectedTags, tagKey]; // Add tag
    
    setSelectedTags(newSelectedTags);
    updateOptions({ tags: newSelectedTags }); // Update hook options
  };

  // --- Like/Unlike Handlers ---
  const handleLike = async (holidayId) => {
    if (!user) return; // Or prompt login
    
    // Optimistic UI Update
    setPublicHolidays(prev => prev.map(h => 
      h._id === holidayId 
        ? { ...h, likes: [...(h.likes || []), user._id], likeCount: (h.likeCount || 0) + 1 }
        : h
    ));

    try {
      const response = await fetch(`/api/holidays/${holidayId}/like`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to like');
      }
      // Optional: Refetch to confirm, or rely on optimistic update
      // await refetchPublicHolidays(); 
    } catch (err) {
      console.error("Error liking holiday:", err);
      // Revert optimistic update on error
      setPublicHolidays(prev => prev.map(h => 
        h._id === holidayId 
          ? { ...h, likes: (h.likes || []).filter(id => id !== user._id), likeCount: Math.max(0, (h.likeCount || 0) - 1) }
          : h
      ));
    }
  };

  const handleUnlike = async (holidayId) => {
    if (!user) return;

    // Optimistic UI Update
    setPublicHolidays(prev => prev.map(h => 
      h._id === holidayId 
        ? { ...h, likes: (h.likes || []).filter(id => id !== user._id), likeCount: Math.max(0, (h.likeCount || 0) - 1) }
        : h
    ));

    try {
      const response = await fetch(`/api/holidays/${holidayId}/like`, { method: 'DELETE' });
       if (!response.ok) {
        throw new Error('Failed to unlike');
      }
      // Optional: Refetch
      // await refetchPublicHolidays();
    } catch (err) {
       console.error("Error unliking holiday:", err);
       // Revert optimistic update
       setPublicHolidays(prev => prev.map(h => 
          h._id === holidayId 
            ? { ...h, likes: [...(h.likes || []), user._id], likeCount: (h.likeCount || 0) + 1 }
            : h
       ));
    }
  };
  // ------------------------

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        {/* Page Header */}
        <div className="text-center mb-12">
          <FaGlobeEurope size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Explore Public Holidays</h1>
          <p className={`mt-3 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Discover travel plans shared by other users.</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search destinations or titles..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchSubmit}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border text-base ${isDarkMode ? 'bg-gray-800 border-gray-700 placeholder-gray-500' : 'bg-white border-gray-300'}`}
            />
            <FaSearch 
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} 
              size={18} 
            />
            {/* Simple search button for now */}
            {/* <button 
              onClick={handleSearchButtonClick}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-md text-sm ${isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
            >
              Search
            </button> */} 
          </div>
          {/* --- Tag Filters --- */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {Object.entries(PRESET_HOLIDAY_TAGS).map(([key, { label, icon: Icon }]) => {
              const isSelected = selectedTags.includes(key);
              return (
                <button 
                  key={key} 
                  type="button" 
                  onClick={() => handleTagFilterToggle(key)} 
                  className={getTagClasses(key, isSelected, isDarkMode)}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          {/* ------------------- */}
        </div>

        {/* Content Area */}
        <div>
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <HolidayCardSkeleton key={`skeleton-${i}`} isDarkMode={isDarkMode} />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">Error loading public holidays: {error}</p>
              {/* Add retry button maybe? */}
            </div>
          )}

          {!loading && !error && publicHolidays.length === 0 && (
            <div className={`py-16 px-6 text-center rounded-2xl border-2 border-dashed ${isDarkMode ? 'border-gray-700/60 text-gray-400' : 'border-gray-300/80 text-gray-500'} mt-8`}>
              <FaSearch size={50} className="mx-auto mb-6 opacity-40 text-cyan-500" />
              <h3 className="text-xl font-semibold mb-3">
                {options.searchTerm ? 'No public holidays match your search' : 'No public holidays found'}
              </h3>
              <p className="max-w-md mx-auto text-[15px] leading-relaxed opacity-80">
                {options.searchTerm ? 'Try searching for something else.' : 'Be the first to share your holiday publicly!'}
              </p>
            </div>
          )}

          {!loading && !error && publicHolidays.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicHolidays.map(holiday => {
                // Check if current user liked this holiday
                const hasLiked = user && holiday.likes?.includes(user._id);
                return (
                  <HolidayCard 
                    key={holiday._id} 
                    holiday={holiday} 
                    isDarkMode={isDarkMode} 
                    isExploreCard={true}
                    onLike={() => handleLike(holiday._id)} // Pass handler
                    onUnlike={() => handleUnlike(holiday._id)} // Pass handler
                    // hasLiked prop might be needed if HolidayCard doesn't have useAuth
                    // hasLiked={hasLiked}
                    onEdit={undefined}
                    onDelete={undefined}
                    onAddExpense={undefined}
                    onClick={() => setSelectedHoliday(holiday)} 
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Render Detail View Modally */}
        {selectedHoliday && (
          <HolidayDetailView
            holiday={selectedHoliday}
            isDarkMode={isDarkMode}
            onClose={() => setSelectedHoliday(null)}
            isPublicView={true}
            onAddExpense={undefined}
            onEditExpense={undefined}
            onDeleteExpense={undefined}
          />
        )}

        {/* TODO: Add Pagination Controls */} 
      </div>
    </AppLayout>
  );
} 