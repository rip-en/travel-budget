import React from 'react';
import { FaGlobeAmericas } from 'react-icons/fa';

/**
 * Step 1 Content for Holiday Form: Basic Details (Title, Destination)
 */
export const HolidayFormStep1 = React.memo(({
  formData,
  setFormData,
  errors,
  setErrors,
  isDarkMode,
  inputRef, // Ref for country input
  countryInput,
  handleCountryInputChange,
  setShowSuggestions
}) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-6 text-center">Holiday Details</h2>
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block mb-1 text-sm font-medium">Holiday Name</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData(prev => ({...prev, title: e.target.value}));
              if (errors.title) setErrors(prev => ({...prev, title: undefined})); 
            }}
            className={`w-full p-3 border rounded-lg ${
              errors.title ? 'border-red-500 focus:ring-red-500' : 
              isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'
            } focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm transition-colors`}
            placeholder="e.g., Summer Vacation"
            required
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>
        
        {/* Destination Input with Suggestions */}
        <div>
          <label className="block mb-1 text-sm font-medium">Destination</label>
          <div className="relative">
            <div className="relative">
              {/* Globe Icon */}
              <div style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)', color: '#06b6d4',
                zIndex: 10, pointerEvents: 'none'
              }}>
                <FaGlobeAmericas size={16} />
              </div>
              {/* Input Field */}
              <input
                ref={inputRef}
                type="text"
                value={countryInput}
                onChange={handleCountryInputChange}
                onClick={() => { if (countryInput.length > 0) setShowSuggestions(true); }}
                onFocus={() => { if (countryInput.length > 0) setShowSuggestions(true); }}
                className={`w-full p-3 pl-10 border rounded-lg ${
                  errors.destination ? 'border-red-500 focus:ring-red-500' : 
                  isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'
                } focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm transition-colors`}
                placeholder="Select or type a country"
                required
              />
            </div>
          </div>
          {errors.destination && <p className="mt-1 text-sm text-red-500">{errors.destination}</p>}
        </div>
      </div>
    </>
  );
}); 