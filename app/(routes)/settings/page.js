"use client";

import { useState, useEffect } from 'react';
import { Bell, Shield, UserCog, Languages, CreditCard, FileText, HelpCircle, LogOut, Image, DollarSign, Settings as SettingsIcon, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components';

export default function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, updateSettings, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');
  const [imageDisplayMode, setImageDisplayMode] = useState('blurred-background');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

  // Load user settings when user data is available
  useEffect(() => {
    if (user && user.settings) {
      setNotifications(user.settings.notifications);
      setLanguage(user.settings.language);
      setImageDisplayMode(user.settings.imageDisplayMode);
      setDefaultCurrency(user.settings.defaultCurrency);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage({ text: '', type: '' });

    const settings = {
      notifications,
      language,
      imageDisplayMode,
      defaultCurrency
    };

    const result = await updateSettings(settings);
    
    if (result.success) {
      setSaveMessage({ text: 'Settings saved successfully', type: 'success' });
    } else {
      setSaveMessage({ text: result.error || 'Failed to save settings', type: 'error' });
    }

    setIsSaving(false);
    
    // Clear success message after 3 seconds
    if (result.success) {
      setTimeout(() => {
        setSaveMessage({ text: '', type: '' });
      }, 3000);
    }
  };

  const settingsSections = [
    {
      id: 'account',
      title: 'Account',
      icon: <UserCog size={20} className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} />,
      items: [
        { name: 'Edit Profile', description: 'Change your personal information' },
        { name: 'Password', description: 'Update your password' },
        { name: 'Email Preferences', description: 'Manage email notifications' },
      ]
    },
    {
      id: 'payments',
      title: 'Payments',
      icon: <CreditCard size={20} className={isDarkMode ? 'text-green-400' : 'text-green-600'} />,
      items: [
        { name: 'Payment Methods', description: 'Add or remove payment options' },
        { name: 'Currency', description: 'Set your preferred currency' },
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy',
      icon: <Shield size={20} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />,
      items: [
        { name: 'Privacy Settings', description: 'Control your data and permissions' },
        { name: 'Connected Accounts', description: 'Manage linked accounts' },
      ]
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: <HelpCircle size={20} className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} />,
      items: [
        { name: 'Help Center', description: 'Find answers to your questions' },
        { name: 'Contact Support', description: 'Get help from our team' },
        { name: 'Report a Problem', description: 'Let us know about issues' },
      ]
    },
    {
      id: 'legal',
      title: 'Legal',
      icon: <FileText size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />,
      items: [
        { name: 'Terms of Service', description: 'Read our terms' },
        { name: 'Privacy Policy', description: 'How we handle your data' },
      ]
    }
  ];
  
  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese'];
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
  
  const imageDisplayOptions = [
    { value: 'blurred-background', label: 'Blurred Background', description: 'Show image with a blurred version of itself as background' },
    { value: 'simple', label: 'Simple View', description: 'Show image without any special effects' },
    { value: 'contain', label: 'Fit to Screen', description: 'Resize image to fit available space' },
    { value: 'cover', label: 'Fill Screen', description: 'Fill available space (may crop image)' }
  ];
  
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} transition-colors`}>
            Settings
          </h1>
          
          {/* Save button */}
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        {/* Status message */}
        {saveMessage.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveMessage.type === 'success' 
              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            {saveMessage.text}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Settings Menu */}
          <div className="col-span-2 space-y-6">
            {/* Appearance Settings */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200'} border shadow-md`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Appearance</h2>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dark Mode</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    checked={isDarkMode}
                    onChange={toggleTheme}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>
            
            {/* Image Display Preferences */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200'} border shadow-md`}>
              <div className="flex items-center gap-2 mb-4">
                <Image size={20} className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Display Preferences</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Image Display Mode</p>
                  <select
                    value={imageDisplayMode}
                    onChange={(e) => setImageDisplayMode(e.target.value)}
                    className={`block w-full px-3 py-2.5 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-700'
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                  >
                    {imageDisplayOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {imageDisplayOptions.find(opt => opt.value === imageDisplayMode)?.description}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Currency Settings */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200'} border shadow-md`}>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Currency Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Default Currency</p>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className={`block w-full px-3 py-2.5 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-700'
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </option>
                    ))}
                  </select>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    This currency will be used as the default for new holidays
                  </p>
                </div>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200'} border shadow-md`}>
              <div className="flex items-center gap-2 mb-4">
                <Bell size={20} className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Push Notifications</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Get notified about budget alerts and trip updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications}
                      onChange={() => setNotifications(!notifications)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Alerts</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Receive emails about important updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={true}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Language Settings */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200'} border shadow-md`}>
              <div className="flex items-center gap-2 mb-4">
                <Languages size={20} className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Language</h2>
              </div>
              
              <div className="space-y-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`block w-full px-3 py-2.5 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-700'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Settings Navigation Sidebar */}
          <div className="col-span-1 space-y-4">
            {user && (
              <div className={`p-4 rounded-xl ${
                isDarkMode 
                  ? 'bg-cyan-900/20 border-cyan-800' 
                  : 'bg-cyan-50 border-cyan-100'
              } border mb-6`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.name}</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            {settingsSections.map((section) => (
              <div 
                key={section.id}
                className={`p-4 rounded-xl ${
                  isDarkMode 
                    ? 'bg-gray-900/80 border-gray-800 hover:bg-gray-800/80' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } border shadow-sm cursor-pointer transition-colors`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {section.icon}
                  <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{section.title}</h3>
                </div>
                <ul className="pl-7 mt-2 space-y-1">
                  {section.items.map((item, index) => (
                    <li key={index} className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} cursor-pointer`}>
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <button 
              onClick={logout}
              className={`flex items-center gap-2 w-full p-4 rounded-xl ${
                isDarkMode 
                  ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              } transition-colors mt-6`}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 