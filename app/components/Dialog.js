"use client";

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Dialog({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' // 'sm', 'md', 'lg', 'xl'
}) {
  const { isDarkMode } = useTheme();
  const dialogRef = useRef(null);
  
  // Handle escape key press to close the dialog
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);
  
  // Prevent background body scroll when the dialog is open for better UX
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // Calculate width based on size prop
  const widthClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }[size] || 'max-w-lg';
  
  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${ 
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none' 
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out" 
        onClick={onClose}
      />
      
      {/* Dialog Content Container - Add transition classes */}
      <div 
        ref={dialogRef}
        className={`relative w-full max-w-lg rounded-xl shadow-xl m-auto transition-all duration-300 ease-out ${ 
          isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        } ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${
              isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            } transition-colors`}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
} 