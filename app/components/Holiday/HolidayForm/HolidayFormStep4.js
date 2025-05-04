import React from 'react';
import { currencies } from '../../../lib/constants'; // Adjust path as needed
import { getCurrencySymbol } from '../../../lib/utils'; // Adjust path as needed

/**
 * Step 4 Content for Holiday Form: Budget & Notes (Optional)
 */
export const HolidayFormStep4 = React.memo(({
  formData,
  setFormData,
  handleBudgetAmountChange,
  handleBudgetCurrencyChange,
  user,
  isDarkMode
}) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-6 text-center">Budget & Notes</h2>
      <div className="space-y-4">
        {/* Budget Amount and Currency */}
        <div>
          <label className="block mb-1 text-sm font-medium">Budget (Optional)</label>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Amount Input with Symbol */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {getCurrencySymbol(formData.budget?.currency || (user?.settings?.defaultCurrency || 'USD'))}
                </span>
              </div>
              <input
                type="number"
                value={formData.budget?.amount || ''}
                onChange={handleBudgetAmountChange}
                className={`w-full p-3 pl-8 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm transition-colors`}
                placeholder="e.g., 1500"
                min="0"
                step="0.01"
              />
            </div>
            {/* Currency Selector */}
            <select
              value={formData.budget?.currency || (user?.settings?.defaultCurrency || 'USD')}
              onChange={handleBudgetCurrencyChange}
              className={`px-3 py-3 sm:py-2.5 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300 text-gray-700'} focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full sm:w-28 transition-colors`}
              aria-label="Select budget currency"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Optional: Set a budget to track against expenses.
          </p>
        </div>
        
        {/* Notes Textarea */}
        <div>
          <label className="block mb-1 text-sm font-medium">Notes (Optional)</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
            className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-white' : 'bg-white/90 border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm transition-colors`}
            placeholder="e.g., Flight details, booking references..."
            rows="4"
          ></textarea>
        </div>
      </div>
    </>
  );
}); 