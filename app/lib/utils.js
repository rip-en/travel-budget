import { currencies } from './constants';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Formats a date string into a more readable format (e.g., "Aug 15, 2024").
 * Handles invalid date strings gracefully.
 * 
 * @param {string | Date} dateString - The date string or Date object to format.
 * @returns {string} The formatted date string or "Invalid Date".
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Invalid Date';
  try {
    const date = new Date(dateString);
    // Check if date is valid after parsing
    if (isNaN(date.getTime())) return 'Invalid Date'; 
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return 'Invalid Date';
  }
};

/**
 * Gets the currency symbol for a given currency code.
 * 
 * @param {string} code - The 3-letter currency code (e.g., 'USD', 'EUR').
 * @returns {string} The currency symbol (e.g., '$', '€') or '$' as a default.
 */
export const getCurrencySymbol = (code) => {
  const currency = currencies.find(c => c.code === code);
  return currency ? currency.symbol : '$';
};

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Extracted function for consistent background color generation
export const getBackgroundColorStyle = (name, isDarkMode) => {
  const fallbackName = name || 'Default'; 
  const hash = fallbackName.split('').reduce((acc, char) => {
    // Simple hash function
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const h = Math.abs(hash % 360); // Hue (0-359)
  const s = 65; // Saturation (fixed) - increased for more vibrant colors
  const l = isDarkMode ? 35 : 70; // Lightness (adjusted for dark/light mode)
  const a = 1.0; // Alpha (fully opaque for consistency)
  
  return { 
    backgroundColor: `hsla(${h}, ${s}%, ${l}%, ${a})`,
    // Adding a gradient overlay for more depth and consistency
    backgroundImage: isDarkMode 
      ? `linear-gradient(to bottom right, hsla(${h}, ${s}%, ${l+5}%, ${a}), hsla(${(h+30) % 360}, ${s}%, ${l-5}%, ${a}))`
      : `linear-gradient(to bottom right, hsla(${h}, ${s}%, ${l+5}%, ${a}), hsla(${(h+30) % 360}, ${s}%, ${l-5}%, ${a}))`
  }; 
}; 