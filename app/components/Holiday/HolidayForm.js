'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaUmbrellaBeach, FaMountain, FaMapMarkerAlt, FaTree, FaCompass,
  FaTimes, FaUpload, FaGlobeAmericas,
  FaPlane, FaArrowLeft, FaTrash, FaSpinner
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Stepper, { Step } from '../Stepper/Stepper';
import { PRESET_HOLIDAY_TAGS, getTagClasses, presetIcons } from '../../lib/constants'; // Import preset tags and presetIcons
import { getCurrencySymbol } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import countryList from 'country-list';

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

export default function HolidayForm({ 
  onClose, 
  onSubmit, 
  initialData = {}, // Default to empty object for safety
  isEditing = false,
  isDarkMode // Receive isDarkMode prop
}) {
  const { user } = useAuth();
  
  // --- State managed internally --- 
  const [formData, setFormData] = useState(() => { // Initialize state from initialData
    return {
        title: initialData.title || '',
        destination: initialData.destination || '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        budget: {
            amount: initialData.budget?.amount || '',
            currency: initialData.budget?.currency || user?.settings?.defaultCurrency || 'USD' // Prioritize initial, then user, then default
        },
        notes: initialData.notes || '',
        imageType: initialData.imageType || null,
        imageData: initialData.imageData || null,
        imagePreset: initialData.imagePreset !== undefined ? initialData.imagePreset : null, // Handle 0 correctly
        gradientColor: initialData.gradientColor || 'cyan', // Default gradient color
        isPublic: initialData.isPublic || false,
        tags: initialData.tags || [],
    };
  });
  
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState(initialData.imagePreset !== undefined ? initialData.imagePreset : null); // Initialize from initialData
  const [previewImage, setPreviewImage] = useState(initialData.imageData || null); // Initialize from initialData
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  // Initialize countryInput safely from initialData
  const [countryInput, setCountryInput] = useState(initialData?.destination || ''); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const suggestionRef = useRef(null);
  
  // Client-side only rendering for portal
  const [isMounted, setIsMounted] = useState(false);
  
  // Initialize gradientColor safely from initialData
  const [gradientColor, setGradientColor] = useState(initialData?.gradientColor || 'cyan');
  
  useEffect(() => {
    setIsMounted(true);
    
    // If there's an imageType and imagePreset, set the selected preset
    if (formData.imageType === 'preset' && typeof formData.imagePreset === 'number') {
      setSelectedPreset(formData.imagePreset);
    }
    
    // If there's an imageType and imageData, set the preview image
    if (formData.imageType === 'upload' && formData.imageData) {
      setPreviewImage(formData.imageData);
    }
  }, []);
  
  // Handle outside click for suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (inputRef.current && 
          !inputRef.current.contains(event.target) &&
          !document.querySelector('.country-suggestions-dropdown')?.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Filter countries based on input - more efficient implementation
  useEffect(() => {
    if (countryInput.length > 0) {
      const lowercaseInput = countryInput.toLowerCase();
      const filtered = countries
        .filter(country => country.toLowerCase().includes(lowercaseInput))
        .slice(0, 5); // Limit to 5 suggestions
      
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
    setFormData(prev => ({ ...prev, destination: value }));
  };
  
  // Handle country selection from dropdown
  const handleCountrySelect = (country) => {
    setCountryInput(country);
    setFormData(prev => ({ ...prev, destination: country }));
    setShowSuggestions(false);
  };
  
  // Get currency symbol for selected currency
  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '$';
  };
  
  // Enhanced validation function
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
      else if (!countries.some(country => 
        country.toLowerCase() === formData.destination.toLowerCase()
      )) {
        newErrors.destination = 'Please select a valid country from the list';
      }
    }
    
    if (step === 2) {
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      }
      
      if (formData.startDate && formData.endDate) {
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        
        // Ensure dates are valid
        if (isNaN(startDate.getTime())) {
          newErrors.startDate = 'Invalid start date';
        }
        
        if (isNaN(endDate.getTime())) {
          newErrors.endDate = 'Invalid end date';
        }
        
        // Check end date is after start date (allow same day)
        if (!newErrors.startDate && !newErrors.endDate && startDate > endDate) {
          newErrors.endDate = 'End date must be on or after start date';
        }
      }
    }
    
    // No validation for step 3 (Image) and 4 (Budget)
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Callback passed to Stepper, performs validation before allowing step change
  const handleStepChange = useCallback((step) => {
    setShowSuggestions(false); // Hide suggestions on step change
    if (step > currentStep && !validateStep(currentStep)) {
      return false; // Prevent advancing if current step invalid
    }
    setCurrentStep(step);
    return true;
  }, [currentStep, validateStep]);

  // Updated handleFinalStep
  const handleFinalStep = useCallback(async () => {
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);

    if (!isStep1Valid || !isStep2Valid) {
      if (!isStep1Valid) {
        setCurrentStep(1);
      } else if (!isStep2Valid) {
        setCurrentStep(2);
      }
      console.warn("Validation failed on final submit. Check previous steps.");
      return; // Prevent submission
    }

    setIsSubmitting(true);
    try {
      // Pass the current formData state to the onSubmit handler from the parent
      await onSubmit(formData);
      // No need to set isSubmitting false here;
      // the parent closes the modal on success, unmounting this component
      // and resetting state for the next mount.
    } catch (error) {
      console.error('Error submitting holiday form:', error);
      // Ensure submitting state is reset ONLY on error, so user can retry
      setIsSubmitting(false);
      // Optionally: Show a toast error to the user here
    }
  }, [
    onSubmit, 
    formData, // Internal form data state
    validateStep, 
    isEditing, 
    setCurrentStep // Include setCurrentStep as it's used in validation feedback
  ]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPreset(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({
          ...prev, 
          imageType: 'upload', 
          imageData: reader.result 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (index) => {
    setSelectedPreset(index);
    setPreviewImage(null);
    setFormData(prev => ({
      ...prev, 
      imageType: 'preset', 
      imagePreset: index,
      gradientColor: gradientColor // Save the currently selected gradient color
    }));
  };

  // Add a function to handle gradient color change
  const handleGradientColorChange = (color) => {
    setGradientColor(color);
    // Always update formData with the new gradient color, regardless of imageType
    setFormData(prev => ({
      ...prev,
      gradientColor: color
    }));
  };
  
  // Function to get gradient class based on color name
  const getGradientClass = (color) => {
    switch (color) {
      case 'cyan': return 'from-cyan-500 to-blue-600';
      case 'purple': return 'from-purple-500 to-pink-600';
      case 'green': return 'from-green-500 to-emerald-600';
      case 'yellow': return 'from-yellow-400 to-orange-600';
      case 'red': return 'from-red-500 to-rose-600';
      case 'blue': return 'from-blue-500 to-indigo-600';
      default: return 'from-cyan-500 to-blue-600';
    }
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
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        amount: value
      }
    }));
  };

  // Handle budget currency change
  const handleBudgetCurrencyChange = (e) => {
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        currency: e.target.value
      }
    }));
  };

  // Handle start date change with validation
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    
    setFormData(prev => {
      const updated = { ...prev, startDate: newStartDate };
      
      // If end date exists and is now before start date, adjust it
      if (updated.endDate && new Date(newStartDate) > new Date(updated.endDate)) {
        updated.endDate = newStartDate;
      }
      
      return updated;
    });
    
    // Clear any existing date errors when changing dates
    if (errors.startDate || errors.endDate) {
      setErrors(prev => ({
        ...prev,
        startDate: undefined,
        endDate: undefined
      }));
    }
  };

  // Handle end date change with validation
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    
    // Check if the end date is before the start date
    if (formData.startDate && new Date(newEndDate) < new Date(formData.startDate)) {
      setErrors(prev => ({
        ...prev,
        endDate: 'End date cannot be before start date'
      }));
      // Still update the form data
      setFormData(prev => ({ ...prev, endDate: newEndDate }));
      return;
    }
    
    setFormData(prev => ({ ...prev, endDate: newEndDate }));
    
    // Clear any existing date errors when changing dates
    if (errors.endDate) {
      setErrors(prev => ({
        ...prev,
        endDate: undefined
      }));
    }
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
      
      // Update the form values and UI state
      handleCountrySelect(country);
      
      // Update the input field directly to ensure immediate visual feedback
      if (inputRef.current) {
        inputRef.current.value = country;
        inputRef.current.blur();
      }
      
      // Explicitly hide the dropdown
      setTimeout(() => {
        setShowSuggestions(false);
      }, 50);
    };

    return (
      <div 
        className="fixed z-[9999] country-suggestions-dropdown shadow-2xl"
        style={{
          top: `${inputRect.bottom + 5}px`,
          left: `${inputRect.left}px`,
          width: `${inputRect.width}px`,
          position: 'fixed'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.preventDefault()} // Prevent blur event when clicking dropdown
      >
        <ul 
          className={`w-full max-h-48 overflow-y-auto rounded-md py-1 text-base shadow-lg border`}
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
              className={`px-4 py-2.5 cursor-pointer ${
                isDarkMode ? 'text-white hover:bg-cyan-600' : 'text-black hover:bg-cyan-500 hover:text-white'
              } ${index < filteredCountries.length - 1 ? (isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200') : ''}`}
            >
              {country}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Function to handle cancel/close - make sure to clean up
  const handleClose = () => {
    // Hide any open dropdowns
    setShowSuggestions(false);
    onClose();
  };

  // NEW LOGIC for preset tags
  const handleTagToggle = (tagKey) => {
    const currentTags = formData.tags || [];
    const isSelected = currentTags.includes(tagKey);

    if (isSelected) {
      // Remove tag
      setFormData(prev => ({ ...prev, tags: currentTags.filter(tag => tag !== tagKey) }));
    } else {
      // Add tag only if less than 3 tags are selected
      if (currentTags.length < 3) {
        setFormData(prev => ({ ...prev, tags: [...currentTags, tagKey] }));
      } else {
        // Optional: Add user feedback (e.g., toast notification) that limit is reached
        console.warn("Maximum of 3 tags allowed.");
      }
    }
  };
  // ------------------------

  return (
    // Add transition classes to backdrop
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 backdrop-blur-md bg-black/40 dark:bg-black/60 transition-opacity duration-300 ease-out opacity-0 animate-fade-in">
      {/* Modal container */}
      <div className="relative w-full max-w-md mx-auto transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-scale-in">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 z-10"
            disabled={isSubmitting}
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
          allowSkipping={false}
          isSubmitting={isSubmitting}
          finalStepLabel={isEditing ? "Update Holiday" : "Create Holiday"}
          // Reduce height in editing mode
          className={isEditing ? "max-h-[80vh] overflow-auto" : ""}
        >
          {/* Step 1: Basic Details */}
          <Step>
            <h2 className="text-xl font-bold mb-6">Holiday Details</h2>
            <div className="space-y-4 max-w-sm mx-auto">
              <div>
                <label className="block mb-1 text-sm font-medium">Holiday Name</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                  className={`w-full p-3 border rounded-lg ${
                    errors.title 
                      ? 'border-red-500 focus:ring-red-500' 
                      : isDarkMode 
                        ? 'bg-gray-800/70 border-gray-700 text-white' 
                        : 'bg-white/90 border-gray-300'
                  } focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm`}
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
                        if (countryInput.length > 0) {
                          const lowercaseInput = countryInput.toLowerCase();
                          const matches = countries
                            .filter(country => country.toLowerCase().includes(lowercaseInput))
                            .slice(0, 5);
                          
                          if (matches.length > 0) {
                            setFilteredCountries(matches);
                            setShowSuggestions(true);
                          }
                        }
                      }}
                      onFocus={() => {
                        if (countryInput.length > 0) {
                          const lowercaseInput = countryInput.toLowerCase();
                          const matches = countries
                            .filter(country => country.toLowerCase().includes(lowercaseInput))
                            .slice(0, 5);
                          
                          if (matches.length > 0) {
                            setFilteredCountries(matches);
                            setShowSuggestions(true);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        // Use timeout to allow click events to process before hiding
                        setTimeout(() => {
                          // Check if the related target (where focus is going) is part of the suggestions
                          // OR if the active element is within the suggestions dropdown
                          const suggestionsDropdown = document.querySelector('.country-suggestions-dropdown');
                          if (!suggestionsDropdown?.contains(e.relatedTarget) && 
                              !suggestionsDropdown?.contains(document.activeElement)) {
                            setShowSuggestions(false);
                          }
                        }, 150); // Slightly shorter timeout
                      }}
                      className={`
                        w-full p-3 pl-10 border rounded-lg
                        ${errors.destination
                          ? 'border-red-500 focus:ring-red-500'
                          : isDarkMode
                            ? 'bg-gray-800/70 border-gray-700 text-white'
                            : 'bg-white/90 border-gray-300'
                        } focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm`}
                      placeholder="Enter country name..."
                      autoComplete="off" // Prevent browser autofill interfering
                    />
                  </div>
                  {errors.destination && <p className="mt-1 text-sm text-red-500">{errors.destination}</p>}
                </div>
              </div>
            </div>
          </Step>

          {/* Step 2: Dates */}
          <Step>
            <h2 className="text-xl font-bold mb-6">Select Dates</h2>
            <div className="space-y-4 max-w-sm mx-auto">
              <div>
                <label className="block mb-1 text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={handleStartDateChange}
                  className={`w-full p-3 border rounded-lg ${
                    errors.startDate 
                      ? 'border-red-500 focus:ring-red-500' 
                      : isDarkMode 
                        ? 'bg-gray-800/70 border-gray-700 text-white' 
                        : 'bg-white/90 border-gray-300'
                  } focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm`}
                  min={new Date().toISOString().split('T')[0]} // Optional: Prevent past dates
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={handleEndDateChange}
                  className={`w-full p-3 border rounded-lg ${
                    errors.endDate 
                      ? 'border-red-500 focus:ring-red-500' 
                      : isDarkMode 
                        ? 'bg-gray-800/70 border-gray-700 text-white' 
                        : 'bg-white/90 border-gray-300'
                  } focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm`}
                  min={formData.startDate || new Date().toISOString().split('T')[0]} // End date cannot be before start date
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
              </div>
            </div>
          </Step>

          {/* Step 3: Image */}
          <Step>
            <h2 className="text-xl font-bold mb-6">Choose Image</h2>
            <div className="space-y-4 max-w-sm mx-auto">
              {/* Image Preview/Selection Area */}
              <div 
                className={`relative w-full rounded-lg overflow-hidden border-2 border-dashed flex items-center justify-center ${
                  isDarkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-100/50'
                } backdrop-blur-sm ${isEditing ? 'h-36' : 'h-48'}`}
              >
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => { setPreviewImage(null); setFormData(prev => ({...prev, imageType: null, imageData: null, imagePreset: null})); setSelectedPreset(null); if(fileInputRef.current) fileInputRef.current.value = null; }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <FaTrash size={14} />
                    </button>
                  </>
                ) : selectedPreset !== null ? (
                  <div className={`flex items-center justify-center w-full h-full bg-gradient-to-br ${getGradientClass(gradientColor)}`}>
                    {renderSelectedIcon()}
                  </div>
                ) : (
                  <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FaUpload size={40} className="mx-auto mb-2" />
                    <p>Upload or select a preset</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={triggerFileInput}
                className={`w-full p-3 rounded-lg font-semibold transition-colors duration-200 ${
                  isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                }`}
              >
                Upload Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              {/* Preset Icons */}
              <div className="text-center text-sm mb-2">Or select a preset icon:</div>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetSelect(index)}
                    className={`flex items-center justify-center h-20 rounded-lg transition-all duration-200 border-2 ${
                      selectedPreset === index ? 'border-cyan-500 scale-105 ring-2 ring-cyan-500/50' : isDarkMode ? 'border-gray-700 hover:border-cyan-600' : 'border-gray-300 hover:border-cyan-500'
                    } ${isDarkMode ? 'bg-gray-800/70' : 'bg-white/90'} backdrop-blur-sm`}
                  >
                    {React.createElement(presetIcons[index]?.icon || FaPlane, { size: 32, className: isDarkMode ? 'text-cyan-400' : 'text-cyan-600' })}
                  </button>
                ))}
              </div>
              
              {/* Gradient Color Selection - added for preset icons */}
              {selectedPreset !== null && (
                <div className="mt-4">
                  <div className="text-center text-sm mb-2">Choose background gradient:</div>
                  <div className="grid grid-cols-6 gap-2">
                    {['cyan', 'purple', 'green', 'yellow', 'red', 'blue'].map((color) => (
                      <button
                        key={color}
                        onClick={() => handleGradientColorChange(color)}
                        className={`h-10 rounded-lg transition-all duration-200 bg-gradient-to-r ${getGradientClass(color)} ${
                          gradientColor === color ? 'ring-2 ring-white shadow-lg scale-110' : ''
                        }`}
                        title={`${color.charAt(0).toUpperCase() + color.slice(1)} gradient`}
                        aria-label={`Select ${color} gradient`}
                      />
                    ))}
                  </div>
                  
                  {/* Preview with selected gradient */}
                  <div className="mt-4 rounded-lg overflow-hidden bg-gradient-to-r h-28 flex items-center justify-center">
                    <div className={`w-full h-full bg-gradient-to-r ${getGradientClass(gradientColor)} flex items-center justify-center`}>
                      {selectedPreset !== null && React.createElement(presetIcons[selectedPreset]?.icon || FaPlane, { 
                        size: 48, 
                        className: "text-white/90" 
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Step>

          {/* Step 4: Budget & Tags */}
          <Step>
            <h2 className="text-xl font-bold mb-6">Budget & Details</h2>
            <div className="space-y-4 max-w-sm mx-auto">
              {/* Budget Input */}
              <div>
                <label className="block mb-1 text-sm font-medium">Budget (Optional)</label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {getCurrencySymbol(formData.budget.currency)}
                    </span>
                    <input
                      type="number"
                      value={formData.budget.amount}
                      onChange={handleBudgetAmountChange}
                      className={`w-full p-3 pl-8 border rounded-l-lg ${
                        isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'
                      } focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                      placeholder="e.g., 1000"
                      min="0"
                    />
                  </div>
                  <select
                    value={formData.budget.currency}
                    onChange={handleBudgetCurrencyChange}
                    className={`p-3 border rounded-r-lg appearance-none ${
                      isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'
                    } focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm pr-8`}
                  >
                    {currencies.map(curr => (
                      <option key={curr.code} value={curr.code}>{curr.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                  <label className="block mb-1 text-sm font-medium">Notes (Optional)</label>
                  <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className={`w-full p-3 border rounded-lg ${
                          isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'
                      } focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm resize-none`}
                      placeholder="Flight details, places to visit..."
                  />
              </div>

              {/* Tags Selection - NEW */}
              <div>
                <label className="block mb-1 text-sm font-medium">Tags (Max 3, Optional)</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PRESET_HOLIDAY_TAGS).map(([key, { label, icon }]) => {
                    const isSelected = formData.tags?.includes(key);
                    const isDisabled = !isSelected && formData.tags?.length >= 3;
                    // Get the full class string from the helper
                    const tagClassString = getTagClasses(key, isSelected, isDarkMode);
                    
                    // Determine icon color based on selection and mode (simplified logic)
                    let iconColorClass = '';
                    if (isSelected) {
                      // Selected tags usually have a contrasting icon color (often white or black)
                      // We can infer this based on the background of the selected tag defined in getTagClasses
                      // Example: If bg is dark, use white text/icon. If light (like yellow), use black.
                      const tagInfo = PRESET_HOLIDAY_TAGS[key];
                      iconColorClass = (tagInfo?.color === 'yellow') ? 'text-black' : 'text-white'; 
                    } else {
                      // Unselected tags use theme-based colors
                      iconColorClass = isDarkMode ? PRESET_HOLIDAY_TAGS[key] ? `text-${PRESET_HOLIDAY_TAGS[key].color}-400` : 'text-gray-400' 
                                                 : PRESET_HOLIDAY_TAGS[key] ? `text-${PRESET_HOLIDAY_TAGS[key].color}-700` : 'text-gray-700';
                    }
                    // Need to adjust for Tailwind JIT: ensure full class names exist
                    // Define potential icon classes explicitly if necessary, but let's try dynamic first.

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => !isDisabled && handleTagToggle(key)}
                        disabled={isDisabled}
                        // Apply the full class string from the helper, plus disabled styles
                        className={`${tagClassString} ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        } backdrop-blur-sm`} // Added backdrop-blur-sm here as it wasn't in getTagClasses
                      >
                        {/* Apply dynamically determined icon color */}
                        {React.createElement(icon, { className: `mr-1.5 ${iconColorClass}` })} 
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between mt-4">
                  <label htmlFor="isPublicToggle" className="text-sm font-medium flex items-center">
                      <FaGlobeAmericas className={`mr-2 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                      Make Holiday Public?
                  </label>
                  <button
                      id="isPublicToggle"
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, isPublic: !prev.isPublic}))}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${
                          formData.isPublic ? (isDarkMode ? 'bg-cyan-600' : 'bg-cyan-500') : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')
                      }`}
                  >
                      <span
                          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                              formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                  </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Public holidays can be seen by others (e.g., in an Explore feed). Private holidays are only visible to you.
              </p>

            </div>
          </Step>
        </Stepper>
      </div>
    </div>
  );
}
