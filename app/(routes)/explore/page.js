"use client";

import { useState } from 'react';
import { Search, MapPin, Calendar, Users, TrendingUp, Compass } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { AppLayout } from '../../components';

export default function ExplorePage() {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample destination data
  const destinations = [
    { id: 1, name: 'Bali, Indonesia', image: '/bali.jpg', rating: 4.8, category: 'Beach', price: '$1,200' },
    { id: 2, name: 'Paris, France', image: '/paris.jpg', rating: 4.6, category: 'City', price: '$1,800' },
    { id: 3, name: 'Tokyo, Japan', image: '/tokyo.jpg', rating: 4.7, category: 'City', price: '$2,200' },
    { id: 4, name: 'Santorini, Greece', image: '/santorini.jpg', rating: 4.9, category: 'Island', price: '$1,600' },
    { id: 5, name: 'New York, USA', image: '/newyork.jpg', rating: 4.5, category: 'City', price: '$2,000' },
    { id: 6, name: 'Swiss Alps, Switzerland', image: '/swiss.jpg', rating: 4.8, category: 'Mountain', price: '$1,900' }
  ];
  
  // Popular travel categories
  const categories = [
    { name: 'Beach', icon: <Compass size={20} className="text-blue-500" /> },
    { name: 'Mountain', icon: <TrendingUp size={20} className="text-green-500" /> },
    { name: 'City', icon: <MapPin size={20} className="text-red-500" /> },
    { name: 'Island', icon: <MapPin size={20} className="text-purple-500" /> }
  ];
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} transition-colors`}>
            Explore
          </h1>
        </div>
        
        {/* Search bar */}
        <div className={`relative mb-8 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
          </div>
          <input
            type="text"
            className={`block w-full pl-10 pr-3 py-3 border-0 ${
              isDarkMode 
                ? 'bg-gray-900/80 text-gray-100 placeholder-gray-500' 
                : 'bg-white text-gray-900 placeholder-gray-400'
            } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors`}
            placeholder="Search destinations, cities, or travel ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Categories */}
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div 
                key={category.name}
                className={`p-4 rounded-xl ${
                  isDarkMode 
                    ? 'bg-gray-900/80 border-gray-800 hover:bg-gray-800/80' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } border shadow-sm cursor-pointer transition-colors flex items-center gap-3`}
              >
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  {category.icon}
                </div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Trending Destinations */}
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Trending Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <div 
                key={destination.id}
                className={`rounded-xl overflow-hidden ${
                  isDarkMode 
                    ? 'bg-gray-900/80 border-gray-800' 
                    : 'bg-white border-gray-200'
                } border shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="h-48 bg-gray-300 relative">
                  <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${
                    isDarkMode ? 'bg-black/70' : 'bg-white/70'
                  }`}>
                    {destination.price}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {destination.name}
                    </h3>
                    <span className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className={`ml-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {destination.rating}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {destination.category}
                    </span>
                  </div>
                  <div className="flex mt-4 justify-between">
                    <div className="flex items-center text-sm">
                      <Calendar size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        7 days
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        12+ travelers
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 