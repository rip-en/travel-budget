import React from 'react';

/**
 * Step 2 Content for Holiday Form: Travel Dates (Start, End)
 */
export const HolidayFormStep2 = React.memo(({
  formData,
  handleStartDateChange,
  handleEndDateChange,
  errors,
  isDarkMode
}) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-6 text-center">Travel Dates</h2>
      <div className="space-y-4">
          {/* Start Date Input */}
          <div>
            <label className="block mb-1 text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              min={formData._id ? undefined : new Date().toISOString().split('T')[0]}
              onChange={handleStartDateChange}
              className={`w-full p-3 border rounded-lg ${isDarkMode ? 'date-input-dark' : 'date-input-light'} ${
                errors.startDate ? 'border-red-500 focus:ring-red-500' : 
                isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'
              } focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm transition-colors`}
              required
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
          </div>
        
          {/* End Date Input */}
          <div>
            <label className="block mb-1 text-sm font-medium">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              min={formData.startDate || (formData._id ? undefined : new Date().toISOString().split('T')[0])}
              onChange={handleEndDateChange}
              className={`w-full p-3 border rounded-lg ${isDarkMode ? 'date-input-dark' : 'date-input-light'} ${
                errors.endDate ? 'border-red-500 focus:ring-red-500' : 
                isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'
              } focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm transition-colors`}
              required
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
          </div>
      </div>
    </>
  );
}); 