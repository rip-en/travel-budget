"use client";

import { useEffect, useState } from 'react';
import { User, CreditCard, Wallet, Map, Award, DollarSign } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useHolidays } from '../../hooks/useHolidays';
import { AppLayout } from '../../components';

export default function ProfilePage() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { holidays, loading } = useHolidays();
  const [stats, setStats] = useState({
    countriesVisited: 0,
    completedTrips: 0,
    totalSpent: 0,
    avgSpend: 0,
  });

  // Calculate stats based on holidays data
  useEffect(() => {
    if (holidays && holidays.length > 0) {
      // Get unique countries from destinations
      const uniqueCountries = new Set();
      holidays.forEach(holiday => {
        if (holiday.destination) {
          // Extract country from destination (assumes format like "City, Country")
          const parts = holiday.destination.split(',');
          const country = parts.length > 1 
            ? parts[parts.length - 1].trim() 
            : holiday.destination.trim();
          uniqueCountries.add(country);
        }
      });

      // Count completed trips
      const today = new Date();
      const completedHolidays = holidays.filter(holiday => 
        new Date(holiday.endDate) < today
      );

      // Calculate total spent across all holidays
      const totalSpent = holidays.reduce((sum, holiday) => {
        const expenses = holiday.expenses || [];
        const holidayTotal = expenses.reduce((total, expense) => 
          total + Number(expense.amount), 0);
        return sum + holidayTotal;
      }, 0);

      // Calculate average spend per holiday (for holidays with expenses)
      const holidaysWithExpenses = holidays.filter(h => 
        h.expenses && h.expenses.length > 0
      );
      const avgSpend = holidaysWithExpenses.length > 0 
        ? totalSpent / holidaysWithExpenses.length 
        : 0;

      setStats({
        countriesVisited: uniqueCountries.size,
        completedTrips: completedHolidays.length,
        totalSpent: totalSpent,
        avgSpend: avgSpend,
      });
    }
  }, [holidays]);

  // Get user's preferred currency
  const getCurrencySymbol = (code = 'USD') => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'Fr',
      CNY: '¥',
      TRY: '₺',
    };
    return symbols[code] || '$';
  };

  const currencySymbol = getCurrencySymbol(
    user?.settings?.defaultCurrency || 'USD'
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} transition-colors`}>
            Profile
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className={`col-span-1 rounded-xl p-6 ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200'} shadow-md border backdrop-blur-md`}>
            <div className="flex flex-col items-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <User size={40} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              </div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {user?.name || 'User'}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {user?.email || 'user@example.com'}
              </p>
              
              <div className="w-full mt-6">
                <button className={`w-full py-2 rounded-lg ${isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-500 hover:bg-cyan-600'} text-white font-medium transition-colors`}>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats & Details */}
          <div className={`col-span-1 md:col-span-2 rounded-xl p-6 ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200'} shadow-md border backdrop-blur-md`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Travel Stats</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                    <Map size={20} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Countries Visited</p>
                    <p className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {stats.countriesVisited}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <DollarSign size={20} className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Spent</p>
                    <p className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {currencySymbol}{stats.totalSpent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <Award size={20} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed Trips</p>
                    <p className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {stats.completedTrips}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                    <Wallet size={20} className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg. Spent Per Trip</p>
                    <p className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {currencySymbol}{Math.round(stats.avgSpend).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 