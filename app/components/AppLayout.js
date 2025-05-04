"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Dock } from './Navigation';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Home, User, Settings, ShieldCheck, Search } from 'lucide-react';

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  
  // --- Scroll detection logic ---
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const bottomThreshold = 50; // Pixels from bottom to trigger "at bottom" state

      setIsScrolled(scrollY > 10); // Scrolled down even a little bit
      setIsAtBottom(scrollY + windowHeight >= docHeight - bottomThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  // --- End scroll detection logic ---
  
  // Define the base routes
  const baseRoutes = [
    { path: '/holidays', label: 'Holidays', icon: <Home size={24} color="white" /> },
    { path: '/profile', label: 'Profile', icon: <User size={24} color="white" /> },
    { path: '/explore', label: 'Explore', icon: <Search size={24} color="white" /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={24} color="white" /> },
  ];

  // Conditionally add the admin route if the user is an admin
  const routes = [...baseRoutes];
  if (isAuthenticated && user?.isAdmin) {
    routes.push({ 
      path: '/admin/dashboard', 
      label: 'Admin', 
      icon: <ShieldCheck size={24} color="white" /> 
    });
  }

  const handleNavigation = useCallback((path) => {
    router.push(path);
  }, [router]);

  const dockItems = routes.map(route => ({
    label: route.label,
    icon: route.icon,
    onClick: () => handleNavigation(route.path),
    className: pathname === route.path ? 'ring-2 ring-cyan-500' : '',
  }));

  // Background gradient style based on theme
  const backgroundStyle = isDarkMode 
    ? {
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgb(0, 0, 0) 0%, rgb(10, 27, 35) 90%)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }
    : {
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgb(235, 245, 255) 0%, rgb(243, 250, 255) 90%)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      };
  
  // Determine Dock container classes based on scroll state
  const getDockContainerClasses = () => {
    let baseClasses = `fixed bottom-4 left-0 right-0 z-50 flex justify-center dock-container transition-all duration-300 ease-in-out`;
    if (isScrolled && !isAtBottom) {
      // Slightly shrunk and faded when scrolling down
      baseClasses += ' transform scale-95 opacity-80';
    } else if (isAtBottom) {
        // Further shrunk when at the bottom
        baseClasses += ' transform scale-90 opacity-70';
    } else {
      // Full size and opacity at the top
      baseClasses += ' transform scale-100 opacity-100';
    }
    return baseClasses;
  };

  return (
    <div 
      className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
      style={backgroundStyle}
    >
      {/* Decorative elements (absolute positioning, gradients, shapes) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-right decorative circle */}
        <div 
          className={`absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10 blur-3xl ${
            isDarkMode ? 'bg-cyan-900' : 'bg-cyan-200'
          }`}
        ></div>
        
        {/* Bottom-left decorative shape */}
        <div 
          className={`absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-5 blur-3xl ${
            isDarkMode ? 'bg-purple-900' : 'bg-purple-200'
          }`}
        ></div>
        
        {/* Additional pattern - only in light mode */}
        {!isDarkMode && (
          <div className="absolute inset-0 bg-[url('/pattern-light.svg')] opacity-5"></div>
        )}
        
        {/* Additional pattern - only in dark mode */}
        {/* Ensure /pattern-dark.svg exists in /public */}
        {isDarkMode && (
          <div className="absolute inset-0 bg-[url('/pattern-dark.svg')] opacity-10"></div>
        )}
      </div>
      
      {/* Add padding-bottom (pb-32 => 128px) to main to reserve space for the dock */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen pb-32">
        {children}
      </main>
      
      {/* Dock Navigation: Fixed at the bottom, centered horizontally */}
      <div className={getDockContainerClasses()}>
        {/* Add a subtle background blur and rounded shape */}
        {/* Use consistent background/border for all states */}
        <div className="px-4 py-2 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md shadow-lg border border-black/10 dark:border-white/10">
          <Dock 
            items={dockItems}
            baseItemSize={50}
            magnification={60}
            distance={120}
          />
        </div>
      </div>
    </div>
  );
} 