"use client";

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

// Account Dialog Content
export function AccountDialogContent({ sectionId, item }) {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="space-y-4">
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {item.name === 'Edit Profile' && 'Update your personal information like name, email, and profile picture.'}
        {item.name === 'Password' && 'Change your password to keep your account secure.'}
        {item.name === 'Email Preferences' && 'Manage what types of emails you receive from us.'}
      </p>
      
      {item.name === 'Edit Profile' && (
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Full Name
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="your@email.com"
            />
          </div>
          
          <button
            className={`w-full py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-cyan-600 hover:bg-cyan-700' 
                : 'bg-cyan-600 hover:bg-cyan-700'
            } text-white transition-colors`}
          >
            Save Changes
          </button>
        </div>
      )}
      
      {item.name === 'Password' && (
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Current Password
            </label>
            <input
              type="password"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              New Password
            </label>
            <input
              type="password"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Confirm New Password
            </label>
            <input
              type="password"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="••••••••"
            />
          </div>
          
          <button
            className={`w-full py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-cyan-600 hover:bg-cyan-700' 
                : 'bg-cyan-600 hover:bg-cyan-700'
            } text-white transition-colors`}
          >
            Update Password
          </button>
        </div>
      )}
      
      {item.name === 'Email Preferences' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="marketing"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                defaultChecked
              />
              <label htmlFor="marketing" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Marketing emails
              </label>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Receive offers, promotions, and travel tips
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="notifications"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                defaultChecked
              />
              <label htmlFor="notifications" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Trip notifications
              </label>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Reminders about upcoming trips and budget alerts
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="account"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                defaultChecked
              />
              <label htmlFor="account" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Account updates
              </label>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Important information about your account and security
            </p>
          </div>
          
          <button
            className={`w-full py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-cyan-600 hover:bg-cyan-700' 
                : 'bg-cyan-600 hover:bg-cyan-700'
            } text-white transition-colors`}
          >
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
}

// Payments Dialog Content
export function PaymentsDialogContent({ sectionId, item }) {
  const { isDarkMode } = useTheme();
  const { user, updateSettings } = useAuth();
  const [currency, setCurrency] = useState(user?.settings?.defaultCurrency || 'USD');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  ];
  
  useEffect(() => {
    if (user?.settings?.defaultCurrency) {
      setCurrency(user.settings.defaultCurrency);
    }
  }, [user]);
  
  const handleUpdateCurrency = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Get current settings and update only the currency
      const settings = {
        ...(user?.settings || {}),
        defaultCurrency: currency
      };
      
      const result = await updateSettings(settings);
      
      if (result.success) {
        setSaveMessage('Currency updated successfully');
      } else {
        setSaveMessage(result.error || 'Failed to update currency');
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      setSaveMessage('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {item.name === 'Payment Methods' && 'Add or manage your payment methods for premium features.'}
        {item.name === 'Currency' && 'Set your preferred currency for all transactions.'}
      </p>
      
      {item.name === 'Payment Methods' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Payment methods will be available in a future update.
            </p>
          </div>
        </div>
      )}
      
      {item.name === 'Currency' && (
        <div className="space-y-4">
          {saveMessage && (
            <div className={`p-3 rounded-lg ${
              saveMessage.includes('success') 
                ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}>
              {saveMessage}
            </div>
          )}
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Preferred Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol}) - {curr.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleUpdateCurrency}
            disabled={isSaving}
            className={`w-full py-2 rounded-lg transition-colors ${
              isSaving 
                ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-400') 
                : (isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-600 hover:bg-cyan-700')
            } ${isDarkMode ? 'text-white' : 'text-white'}`}
          >
            {isSaving ? 'Saving...' : 'Update Currency'}
          </button>
        </div>
      )}
    </div>
  );
}