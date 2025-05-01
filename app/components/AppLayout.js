"use client";

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Dock } from './Navigation';
import { useTheme } from '../context/ThemeContext';
import { Home, User, Search, Settings } from 'lucide-react';

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  
  // Define the available pages/routes
  const routes = [
    { path: '/holidays', label: 'Holidays', icon: <Home size={24} color="white" /> },
    { path: '/profile', label: 'Profile', icon: <User size={24} color="white" /> },
    { path: '/explore', label: 'Explore', icon: <Search size={24} color="white" /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={24} color="white" /> },
  ];

  const handleNavigation = useCallback((path) => {
    router.push(path);
  }, [router]);

  const dockItems = routes.map(route => ({
    label: route.label,
    icon: route.icon,
    onClick: () => handleNavigation(route.path),
    className: pathname === route.path ? 'ring-2 ring-cyan-500' : '',
  }));

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <main className="pb-28 relative">
        {children}
      </main>
      <Dock 
        items={dockItems}
        className={isDarkMode ? 'bg-gray-900' : 'bg-white'} 
        baseItemSize={50}
        magnification={64}
        distance={100}
      />
    </div>
  );
} 