'use client';

import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaUmbrellaBeach, FaMountain, FaPlane, FaMapMarkerAlt, FaTree, FaCompass,
  FaTimes, FaUpload, FaGlobeAmericas
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Stepper, { Step } from '../Stepper/Stepper';

// Define preset icons/images - use react-icons
const presetIcons = [
  { icon: FaUmbrellaBeach, name: 'Beach', color: 'bg-blue-500' },
  { icon: FaMountain, name: 'Mountains', color: 'bg-green-600' },
  { icon: FaPlane, name: 'Plane', color: 'bg-cyan-600' },
  { icon: FaMapMarkerAlt, name: 'Location', color: 'bg-red-500' },
  { icon: FaTree, name: 'Tropical', color: 'bg-amber-600' },
  { icon: FaCompass, name: 'Adventure', color: 'bg-purple-600' },
];

// Country list for autofill
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", 
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", 
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", 
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", 
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", 
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", 
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", 
  "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", 
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", 
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", 
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", 
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", 
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", 
  "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", 
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", 
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", 
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", 
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", 
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", 
  "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", 
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", 
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", 
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", 
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", 
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", 
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", 
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", 
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", 
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", 
  "Zimbabwe"
];

// Currency options
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

export default function HolidayForm({ onClose, onSubmit, formData, setFormData }) {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  
  // Country suggestion states
  const [countryInput, setCountryInput] = useState(formData.destination || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const suggestionRef = useRef(null);
  
  // Client-side only rendering for portal
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Handle outside click for suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      // Close dropdown if clicking outside both the input and the suggestions
      if (inputRef.current && 
          !inputRef.current.contains(event.target) &&
          !document.querySelector('.country-suggestions-dropdown')?.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    // Add global document click listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Filter countries based on input
  useEffect(() => {
    if (countryInput.length > 0) {
      const filtered = countries.filter(country => 
        country.toLowerCase().includes(countryInput.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      
      console.log('Matches found:', filtered.length, filtered);
      
      setFilteredCountries(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredCountries([]);
      setShowSuggestions(false);
    }
  }, [countryInput]);
  
  // Handle country input change
  const handleCountryInputChange = (e) => {
    const value = e.target.value;
    setCountryInput(value);
    setFormData({...formData, destination: value});
    
    // Always try to show suggestions when typing
    if (value.length > 0) {
      const matches = countries.filter(country => 
        country.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      
      setFilteredCountries(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setFilteredCountries([]);
      setShowSuggestions(false);
    }
  };
  
  // Handle country selection from dropdown
  const handleCountrySelect = (country) => {
    console.log('Country selected in handler:', country);
    setCountryInput(country);
    setFormData({...formData, destination: country});
    setShowSuggestions(false);
    // Force render to update the input field immediately
    setTimeout(() => {
      setShowSuggestions(false);
    }, 100);
  };
  
  // Get currency symbol for selected currency
  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '$';
  };
  
  // Set default currency from user settings when component mounts
  useEffect(() => {
    if (user?.settings?.defaultCurrency && !formData.budget?.currency) {
      setFormData({
        ...formData,
        budget: {
          ...formData.budget,
          currency: user.settings.defaultCurrency
        }
      });
    }
    
    // Initialize countryInput if formData has a destination
    if (formData.destination) {
      setCountryInput(formData.destination);
    }
  }, [user, formData]);

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    }
    
    if (step === 2) {
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    // No validation for step 3 (Image) and 4 (Budget)
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepChange = (step) => {
    validateStep(currentStep);
    setCurrentStep(step);
  };

  const handleFinalStep = () => {
    if (validateStep(4)) {
      onSubmit();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPreset(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({...formData, imageType: 'upload', imageData: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (index) => {
    setSelectedPreset(index);
    setPreviewImage(null);
    setFormData({...formData, imageType: 'preset', imagePreset: index });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Render the selected icon in preview
  const renderSelectedIcon = () => {
    if (selectedPreset === null) return null;
    
    switch (selectedPreset) {
      case 0: return <FaUmbrellaBeach size={64} className="text-white" />;
      case 1: return <FaMountain size={64} className="text-white" />;
      case 2: return <FaPlane size={64} className="text-white" />;
      case 3: return <FaMapMarkerAlt size={64} className="text-white" />;
      case 4: return <FaTree size={64} className="text-white" />;
      case 5: return <FaCompass size={64} className="text-white" />;
      default: return <FaPlane size={64} className="text-white" />;
    }
  };

  // Handle budget amount change
  const handleBudgetAmountChange = (e) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setFormData({
      ...formData,
      budget: {
        ...formData.budget,
        amount: value
      }
    });
  };

  // Handle budget currency change
  const handleBudgetCurrencyChange = (e) => {
    setFormData({
      ...formData,
      budget: {
        ...formData.budget,
        currency: e.target.value
      }
    });
  };

  // Create a separate component for the suggestion dropdown
  const CountrySuggestions = () => {
    if (!showSuggestions || filteredCountries.length === 0) return null;
    
    // Get position of input element
    const inputRect = inputRef.current?.getBoundingClientRect();
    if (!inputRect) return null;
    
    const handleCountryItemClick = (country, event) => {
      // Prevent event bubbling
      event.stopPropagation();
      event.preventDefault();
      
      console.log('Country clicked:', country);
      
      // First update the state
      setCountryInput(country);
      setFormData({...formData, destination: country});
      
      // Then immediately hide the dropdown
      setShowSuggestions(false);
      setFilteredCountries([]);
      
      // Finally update the DOM directly
      if (inputRef.current) {
        inputRef.current.value = country;
        // Force blur to ensure focus is removed
        inputRef.current.blur();
      }
    };

    return (
      <div 
        className="fixed z-[9999] country-suggestions-dropdown"
        style={{
          top: `${inputRect.bottom + 5}px`,
          left: `${inputRect.left}px`,
          width: `${inputRect.width}px`,
          position: 'fixed'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ul 
          className={`w-full max-h-48 overflow-auto rounded-md py-1 text-base shadow-xl border`}
          style={{
            backgroundColor: isDarkMode ? '#111827' : 'white',
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          {filteredCountries.map((country, index) => (
            <li
              key={index}
              onClick={(e) => handleCountryItemClick(country, e)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                color: isDarkMode ? 'white' : 'black',
                borderBottom: index < filteredCountries.length - 1 ? 
                  (isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb') : 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#06b6d4';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = isDarkMode ? 'white' : 'black';
              }}
            >
              {country}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/20 dark:bg-black/40">
      <div className="relative w-full max-w-md mx-auto">
          <button
            onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 z-10"
          >
          <FaTimes size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
          </button>

        {/* Render suggestions in a portal to ensure it doesn't affect layout */}
        {isMounted && createPortal(
          <CountrySuggestions />,
          document.body
        )}

        <Stepper
          initialStep={1}
          onStepChange={handleStepChange}
          onFinalStepCompleted={handleFinalStep}
          isDarkMode={isDarkMode}
        >
          {/* Step 1: Basic Details */}
          <Step>
            <h2 className="text-xl font-bold mb-6">Holiday Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Holiday Name</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm`}
                  placeholder="Summer Vacation"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium">Destination</label>
                <div className="relative">
                  <div className="relative">
                    {/* Globe icon with direct inline styles */}
                    <div style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#06b6d4',
                      zIndex: 10,
                      pointerEvents: 'none'
                    }}>
                      <FaGlobeAmericas size={16} />
                    </div>
                <input
                      ref={inputRef}
                  type="text"
                      value={countryInput}
                      onChange={handleCountryInputChange}
                      onClick={() => {
                        // Show suggestions on click if we have matches for current input
                        if (countryInput.length > 0) {
                          const matches = countries.filter(country => 
                            country.toLowerCase().includes(countryInput.toLowerCase())
                          ).slice(0, 5);
                          
                          if (matches.length > 0) {
                            setFilteredCountries(matches);
                            setShowSuggestions(true);
                          }
                        }
                      }}
                      onFocus={() => {
                        // Show suggestions on focus if we have matches for current input
                        if (countryInput.length > 0) {
                          const matches = countries.filter(country => 
                            country.toLowerCase().includes(countryInput.toLowerCase())
                          ).slice(0, 5);
                          
                          if (matches.length > 0) {
                            setFilteredCountries(matches);
                            setShowSuggestions(true);
                          }
                        }
                      }}
                      className={`w-full p-3 pl-10 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm`}
                      placeholder="Select or type a country"
                    />
                  </div>
                </div>
                {errors.destination && <p className="mt-1 text-sm text-red-500">{errors.destination}</p>}
              </div>
            </div>
          </Step>
          
          {/* Step 2: Dates */}
          <Step>
            <h2 className="text-xl font-bold mb-6">Travel Dates</h2>
            <div className="space-y-4">
                <div>
                <label className="block mb-1 text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm`}
                  />
                {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
                </div>
              
                <div>
                <label className="block mb-1 text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
              </div>
            </div>
          </Step>
          
          {/* Step 3: Image Selection */}
          <Step>
            <h2 className="text-xl font-bold mb-6">Holiday Image</h2>
            <div className="space-y-6">
              {/* Preview area */}
              {(previewImage || selectedPreset !== null) && (
                <div className="overflow-hidden rounded-lg h-44 w-full mb-4 relative">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${presetIcons[selectedPreset]?.color || 'bg-gray-500'}`}>
                      {renderSelectedIcon()}
                    </div>
                  )}
                </div>
              )}

              {/* Upload option */}
              <div>
                <p className="mb-3 text-sm font-medium">Upload your own image</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className={`w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg ${
                    isDarkMode 
                      ? 'border-gray-700 hover:border-cyan-700 bg-gray-800/30' 
                      : 'border-gray-300 hover:border-cyan-500 bg-gray-50'
                  } transition-colors`}
                >
                  <FaUpload size={20} />
                  <span>Choose an image</span>
                </button>
              </div>

              {/* Preset options */}
              <div>
                <p className="mb-3 text-sm font-medium">Or select a preset icon</p>
                <div className="grid grid-cols-3 gap-3">
                  {presetIcons.map((icon, index) => (
                    <button
                      key={icon.name.toLowerCase()}
                      type="button"
                      onClick={() => handlePresetSelect(index)}
                      className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        selectedPreset === index
                          ? isDarkMode 
                            ? 'ring-2 ring-cyan-500 bg-gray-800'
                            : 'ring-2 ring-cyan-500 bg-cyan-50'
                          : isDarkMode
                            ? 'bg-gray-800/50 hover:bg-gray-800'
                            : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${icon.color}`}>
                        <icon.icon size={20} className="text-white" />
                      </div>
                      <span className="text-xs">{icon.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Step>
          
          {/* Step 4: Budget */}
          <Step>
            <h2 className="text-xl font-bold mb-6">Budget Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Budget (Optional)</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {getCurrencySymbol(formData.budget?.currency || 'USD')}
                      </span>
                      </div>
                            <input
                      type="number"
                      value={formData.budget?.amount || ''}
                      onChange={handleBudgetAmountChange}
                      className={`w-full p-3 pl-8 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm`}
                      placeholder="Budget amount (optional)"
                      min="0"
                    />
                  </div>
                  <select
                    value={formData.budget?.currency || (user?.settings?.defaultCurrency || 'USD')}
                    onChange={handleBudgetCurrencyChange}
                    className={`px-3 py-2.5 border rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-800/70 border-gray-700 text-white' 
                        : 'bg-white/90 border-gray-300 text-gray-700'
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500 w-28`}
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code}
                      </option>
                    ))}
                  </select>
                </div>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Set your holiday budget to track expenses
                </p>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm`}
                  placeholder="Any additional notes..."
                  rows="3"
                ></textarea>
              </div>
            </div>
          </Step>
        </Stepper>
      </div>
    </div>
  );
}