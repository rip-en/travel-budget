'use client';

import { useState, useEffect, useCallback } from 'react';

export function useHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/holidays');
      
      if (!response.ok) {
        throw new Error('Failed to fetch holidays');
      }
      
      const data = await response.json();
      // Extract holidays array from the response
      console.log('Fetched holidays data:', data.holidays);
      
      // Add additional validation checks
      if (data.holidays && Array.isArray(data.holidays)) {
        // Check if all holidays have unique IDs
        const holidayIds = data.holidays.map(h => h._id);
        const uniqueIds = new Set(holidayIds);
        if (holidayIds.length !== uniqueIds.size) {
          console.warn('WARNING: Duplicate holiday IDs detected in API response', 
            holidayIds.filter((id, index) => holidayIds.indexOf(id) !== index));
        }
        
        // Check for missing critical fields
        const incompleteHolidays = data.holidays.filter(h => !h._id || !h.title || h.imagePreset === undefined);
        if (incompleteHolidays.length > 0) {
          console.warn('WARNING: Some holidays have missing critical fields:', incompleteHolidays);
        }
      }
      
      setHolidays(data.holidays || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching holidays:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const createHoliday = async (holidayData) => {
    try {
      const response = await fetch('/api/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holidayData),
      });

      if (!response.ok) {
        throw new Error('Failed to create holiday');
      }

      const result = await response.json();
      const newHoliday = result.holiday; // Extract the holiday from the response
      
      setHolidays((prev) => [...prev, newHoliday]);
      return newHoliday;
    } catch (err) {
      console.error('Error creating holiday:', err);
      throw err;
    }
  };

  const updateHoliday = async (id, holidayData) => {
    try {
      const response = await fetch(`/api/holidays/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holidayData),
      });

      if (!response.ok) {
        throw new Error('Failed to update holiday');
      }

      const result = await response.json();
      const updatedHoliday = result.holiday; // Extract the holiday from the response
      
      // Explicitly refetch holidays to ensure UI consistency
      await fetchHolidays();
      
      return updatedHoliday;
    } catch (err) {
      console.error('Error updating holiday:', err);
      throw err;
    }
  };

  const deleteHoliday = async (id) => {
    try {
      const response = await fetch(`/api/holidays/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete holiday');
      }

      setHolidays((prev) => prev.filter((holiday) => holiday._id !== id));
    } catch (err) {
      console.error('Error deleting holiday:', err);
      throw err;
    }
  };

  const addExpense = async (holidayId, expenseData) => {
    try {
      const response = await fetch(`/api/holidays/${holidayId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Data:', errorData);
        throw new Error(errorData.error || 'Failed to add expense');
      }

      const newExpense = await response.json();
      console.log("useHolidays.addExpense - API returned:", newExpense);
      
      // Fetch fresh data after successful addition
      await fetchHolidays();
      
      // Return the new expense returned by the API
      return newExpense;
    } catch (err) {
      console.error('Error adding expense:', err);
      throw err;
    }
  };
  
  // Update an expense
  const updateExpense = async (holidayId, expenseId, expenseData) => {
    try {
      const response = await fetch(`/api/holidays/${holidayId}/expenses/${expenseId}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Data:', errorData);
        throw new Error(errorData.error || 'Failed to update expense');
      }

      const updatedExpense = await response.json(); // API returns the updated expense
      
      // Fetch fresh data after successful update
      await fetchHolidays(); 
      
      // Return the updated expense returned by the API
      return updatedExpense; 
    } catch (err) {
      console.error('Error updating expense:', err);
      throw err;
    }
  };
  
  // Delete an expense
  const deleteExpense = async (holidayId, expenseId) => {
    try {
      const response = await fetch(`/api/holidays/${holidayId}/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Data:', errorData);
        throw new Error(errorData.error || 'Failed to delete expense');
      }

      // Fetch fresh data after successful deletion
      await fetchHolidays(); 
      
      // Return success status
      return { success: true };
    } catch (err) {
      console.error('Error deleting expense:', err);
      throw err;
    }
  };

  // --- Like/Unlike Hook Functions ---
  const likeHoliday = async (holidayId) => {
    try {
      const response = await fetch(`/api/holidays/${holidayId}/like`, {
        method: 'POST',
        // No body needed, authentication is via cookie
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to like holiday');
      }
      // Refetch or optimistically update UI
      await fetchHolidays(); 
      return await response.json();
    } catch (err) {
      console.error(`Error liking holiday ${holidayId}:`, err);
      // Handle error in UI (e.g., show toast)
      throw err; 
    }
  };

  const unlikeHoliday = async (holidayId) => {
    try {
      const response = await fetch(`/api/holidays/${holidayId}/like`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to unlike holiday');
      }
      // Refetch or optimistically update UI
      await fetchHolidays(); 
      return await response.json();
    } catch (err) {
      console.error(`Error unliking holiday ${holidayId}:`, err);
      // Handle error in UI
      throw err;
    }
  };
  // --------------------------------

  return {
    holidays,
    loading,
    error,
    fetchHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    addExpense,
    updateExpense,
    deleteExpense,
    likeHoliday,   // Export like function
    unlikeHoliday, // Export unlike function
  };
} 