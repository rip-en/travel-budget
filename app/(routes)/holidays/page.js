"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Plane } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { AppLayout } from '../../components';

// Import the main content component
import MainContent from '../../components/Holiday/MainContent';

export default function Holidays() {
  const { isDarkMode } = useTheme();
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} transition-colors`}>
            Travel Budget
          </h1>
        </div>
        
        {/* Main content */}
        <MainContent />
      </div>
    </AppLayout>
  );
} 