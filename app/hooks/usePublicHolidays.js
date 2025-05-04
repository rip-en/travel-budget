'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom Hook to fetch and manage public holidays.
 * @param {object} initialOptions - Initial search/filter/sort options.
 * @param {string} initialOptions.searchTerm - Initial search term.
 * @param {string[]} initialOptions.tags - Initial tags array.
 * @param {string} initialOptions.sortBy - Initial sort criteria.
 */
export function usePublicHolidays(initialOptions = {}) {
  const [publicHolidays, setPublicHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    searchTerm: initialOptions.searchTerm || '',
    tags: initialOptions.tags || [],
    sortBy: initialOptions.sortBy || 'createdAt_desc',
    // Add pagination state later if needed
    // page: 1,
    // limit: 12,
  });

  const fetchPublicHolidays = useCallback(async (currentOptions) => {
    setLoading(true);
    setError(null);
    try {
      // Construct query parameters
      const params = new URLSearchParams();
      if (currentOptions.searchTerm) {
        params.set('q', currentOptions.searchTerm);
      }
      if (currentOptions.tags && currentOptions.tags.length > 0) {
        params.set('tags', currentOptions.tags.join(','));
      }
      if (currentOptions.sortBy) {
        params.set('sortBy', currentOptions.sortBy);
      }
      // Add pagination params later
      // params.set('page', currentOptions.page);
      // params.set('limit', currentOptions.limit);

      const queryString = params.toString();
      const apiUrl = `/api/holidays/public${queryString ? `?${queryString}` : ''}`;
      
      console.log("Fetching public holidays from:", apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Data:', errorData);
        throw new Error(errorData.error || 'Failed to fetch public holidays');
      }

      const data = await response.json();
      setPublicHolidays(data.holidays || []);
      // Update total count/pages later for pagination

    } catch (err) {
      console.error('Error fetching public holidays:', err);
      setError(err.message);
      setPublicHolidays([]); // Clear holidays on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch holidays when options change
  useEffect(() => {
    fetchPublicHolidays(options);
  }, [options, fetchPublicHolidays]);

  // Function to update search/filter options
  const updateOptions = useCallback((newOptions) => {
    setOptions(prev => ({ ...prev, ...newOptions, /* page: 1 */ })); // Reset page on filter change
  }, []);

  return {
    publicHolidays,
    setPublicHolidays,
    loading,
    error,
    options,
    updateOptions,
    // Include refetch function if manual refresh is needed
    refetch: () => fetchPublicHolidays(options), 
  };
} 