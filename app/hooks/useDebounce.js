'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * @param {T} value The value to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {T} The debounced value.
 * @template T
 */
export function useDebounce(value, delay) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout to update debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [
    value, // Only re-call effect if value changes
    delay // Or if delay changes
  ]);

  return debouncedValue;
} 