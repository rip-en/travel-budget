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
      
      setHolidays((prev) => 
        prev.map((holiday) => 
          holiday._id === id ? updatedHoliday : holiday
        )
      );
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
        throw new Error('Failed to add expense');
      }

      const result = await response.json();
      const newExpense = result.expense || result; // Extract the expense from the response if available
      
      // Refresh holidays to get the updated data
      await fetchHolidays();
      
      return newExpense;
    } catch (err) {
      console.error('Error adding expense:', err);
      throw err;
    }
  };

  return {
    holidays,
    loading,
    error,
    fetchHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    addExpense,
  };
} 