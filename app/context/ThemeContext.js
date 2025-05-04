'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Create a context for theme management
const ThemeContext = createContext();

/**
 * Provides theme state (dark/light mode) and a function to toggle it.
 * Persists the theme choice in localStorage and respects system preference.
 */
export function ThemeProvider({ children }) {
  // State to hold the current theme mode (true for dark, false for light)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Effect to initialize theme based on localStorage or system preference on mount
  useEffect(() => {
    // Check localStorage first for user's explicit choice
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Fallback to system preference if no saved theme exists
      setIsDarkMode(true);
    }
    // Empty dependency array ensures this runs only once on initial mount
  }, []);

  // Effect to update localStorage and apply/remove 'dark' class to HTML element
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    // Apply the 'dark' class to the root HTML element for CSS targeting
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]); // Re-run this effect whenever isDarkMode changes

  // Function to toggle the theme state
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Provide the theme state and toggle function to children components
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to easily access the theme context (isDarkMode, toggleTheme).
 * Ensures the hook is used within a ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Throw an error if used outside of the provider for early bug detection
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 