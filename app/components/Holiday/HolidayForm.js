import React from 'react';
import { XCircle } from 'lucide-react';
import Stepper, { Step } from '../Stepper/Stepper';

function HolidayForm({ isDarkMode, formData, setFormData, onClose, onSubmit }) {
  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Please enter a holiday name');
      return false;
    }
    if (!formData.destination.trim()) {
      alert('Please enter a destination');
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      alert('Please select both start and end dates');
      return false;
    }
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (start > end) {
      alert('End date must be after start date');
      return false;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className={`rounded-lg p-6 max-w-md w-full ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/50'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} transform transition-all duration-300 scale-100`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Create New Holiday
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
          >
            <XCircle size={20} />
          </button>
        </div>

        <Stepper
          initialStep={1}
          isDarkMode={isDarkMode}
          onStepChange={(step) => console.log('Step changed:', step)}
          onFinalStepCompleted={() => {
            if (validateForm()) {
              onSubmit();
            }
          }}
        >
          <Step>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Holiday Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`mt-1 block w-full rounded-md ${isDarkMode ? 'bg-gray-800/50 text-white' : 'bg-white text-gray-900'} border-0 focus:ring-2 focus:ring-cyan-500`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Destination
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className={`mt-1 block w-full rounded-md ${isDarkMode ? 'bg-gray-800/50 text-white' : 'bg-white text-gray-900'} border-0 focus:ring-2 focus:ring-cyan-500`}
                  required
                />
              </div>
            </div>
          </Step>
          <Step>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`mt-1 block w-full rounded-md ${isDarkMode ? 'bg-gray-800/50 text-white' : 'bg-white text-gray-900'} border-0 focus:ring-2 focus:ring-cyan-500`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`mt-1 block w-full rounded-md ${isDarkMode ? 'bg-gray-800/50 text-white' : 'bg-white text-gray-900'} border-0 focus:ring-2 focus:ring-cyan-500`}
                    required
                  />
                </div>
              </div>
            </div>
          </Step>
          <Step>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cover Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {formData.image ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(formData.image)}
                          alt="Preview"
                          className="mx-auto h-32 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: null })}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none"
                          >
                            <span>Upload an image</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFormData({ ...formData, image: file });
                                }
                              }}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Step>
        </Stepper>
      </div>
    </div>
  );
}

export default HolidayForm; 