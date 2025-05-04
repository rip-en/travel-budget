import React from 'react';
import { FaUpload } from 'react-icons/fa';
import { presetIcons } from '../../../lib/constants'; // Adjust path as needed

/**
 * Step 3 Content for Holiday Form: Image Selection (Upload or Preset)
 */
export const HolidayFormStep3 = React.memo(({
  previewImage,
  selectedPreset,
  renderSelectedIcon,
  fileInputRef,
  handleFileChange,
  triggerFileInput,
  handlePresetSelect,
  errors,
  isDarkMode
}) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-6 text-center">Holiday Image</h2>
      <div className="space-y-6">
        {/* Image Preview Area */}
        {(previewImage || selectedPreset !== null) && (
          <div className="overflow-hidden rounded-lg h-44 w-full mb-4 relative bg-gray-200 dark:bg-gray-700">
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/placeholder-image.svg'; }}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${presetIcons[selectedPreset]?.color || 'bg-gray-500'}`}>
                {renderSelectedIcon()} 
              </div>
            )}
          </div>
        )}

        {/* Upload Option */}
        <div>
          <p className="mb-3 text-sm font-medium">Upload your own image</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/webp, image/gif"
            className="hidden"
          />
          <button
            type="button"
            onClick={triggerFileInput}
            className={`w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 hover:border-cyan-600 bg-gray-800/50' 
                : 'border-gray-300 hover:border-cyan-500 bg-gray-50/80'
            } transition-colors text-sm font-medium`}
          >
            <FaUpload size={18} />
            <span>Choose Image (Max 2MB)</span>
          </button>
          {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
        </div>

        {/* Preset Options */}
        <div>
          <p className="mb-3 text-sm font-medium">Or select a preset icon</p>
          <div className="grid grid-cols-3 gap-3">
            {presetIcons.map((iconData, index) => (
              <button
                key={iconData.name.toLowerCase()}
                type="button"
                onClick={() => handlePresetSelect(index)}
                className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-150 ease-in-out border-2 ${
                  selectedPreset === index
                    ? `border-cyan-500 ${iconData.color} text-white shadow-md`
                    : `border-transparent ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`
                }`}
                aria-label={`Select ${iconData.name} icon`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedPreset !== index ? iconData.color : ''}`}>
                  <iconData.icon size={18} className={selectedPreset === index ? "text-white" : "text-white/90"} />
                </div>
                <span className={`text-xs font-medium ${selectedPreset === index ? (isDarkMode ? 'text-cyan-300' : 'text-cyan-700') : ''}`}>{iconData.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}); 