'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Plane, DollarSign, Share2, Moon, Sun, Plus, Calendar, Edit2, CheckCircle2, XCircle, Trash2, X } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import Stepper, { Step } from './Stepper';
import HolidayCard from './components/Holiday/HolidayCard';
import ExpenseForm from './components/Holiday/ExpenseForm';

export default function Home() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [holidays, setHolidays] = useState([]);
  const [showNewHolidayForm, setShowNewHolidayForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(null);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    image: null
  });
  const [editHoliday, setEditHoliday] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'upcoming'
  });
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
  });
  const [detailedHoliday, setDetailedHoliday] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    const savedHolidays = localStorage.getItem('holidays');
    if (savedHolidays) {
      setHolidays(JSON.parse(savedHolidays));
    }
  }, []);

  const handleCreateHoliday = (e) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedHolidays = [
        ...holidays,
        {
          ...formData,
          id: Date.now(),
          expenses: [],
          status: 'upcoming',
          image: formData.image ? reader.result : null // Store image as base64
        }
      ];
      setHolidays(updatedHolidays);
      localStorage.setItem('holidays', JSON.stringify(updatedHolidays));
      setFormData({
        name: '',
        destination: '',
        startDate: '',
        endDate: '',
        image: null
      });
      setShowNewHolidayForm(false);
    };

    if (formData.image) {
      reader.readAsDataURL(formData.image);
    } else {
      reader.onloadend();
    }
  };

  const getHolidayStatus = (holiday) => {
    const today = new Date();
    const startDate = new Date(holiday.startDate);
    const endDate = new Date(holiday.endDate);

    if (today >= startDate && today <= endDate) {
      return 'ongoing';
    } else if (today > endDate) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

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

  const nextStep = () => {
    if (formStep === 1 && !validateForm()) return;
    setFormStep(prev => prev + 1);
  };

  const prevStep = () => {
    setFormStep(prev => prev - 1);
  };

  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Holiday Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`mt-1 block w-full rounded-md ${isDarkMode ? 'bg-gray-800/50 text-white' : 'bg-white text-gray-900'} border-0 focus:ring-2 focus:ring-gray-500`}
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
                className={`mt-1 block w-full rounded-md ${isDarkMode ? 'bg-gray-800/50 text-white' : 'bg-white text-gray-900'} border-0 focus:ring-2 focus:ring-gray-500`}
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
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
                  className={`mt-1 block w-full rounded-md ${isDarkMode ? 'bg-gray-800/50 text-white' : 'bg-white text-gray-900'} border-0 focus:ring-2 focus:ring-gray-500`}
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
                  className={`mt-1 block w-full rounded-md ${isDarkMode ? 'bg-gray-800/50 text-white' : 'bg-white text-gray-900'} border-0 focus:ring-2 focus:ring-gray-500`}
                  required
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
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
                          className="relative cursor-pointer rounded-md font-medium text-gray-600 hover:text-gray-800 focus-within:outline-none"
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
        );
      default:
        return null;
    }
  };

  const handleEditHoliday = (holiday) => {
    setEditingHoliday(holiday.id);
    setEditHoliday({
      name: holiday.name,
      destination: holiday.destination,
      startDate: holiday.startDate,
      endDate: holiday.endDate,
      image: holiday.image
    });
  };

  const handleSaveHolidayEdit = () => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedHolidays = holidays.map(holiday => {
        if (holiday.id === editingHoliday) {
          return {
            ...holiday,
            ...editHoliday,
            image: editHoliday.image instanceof File ? reader.result : editHoliday.image
          };
        }
        return holiday;
      });
      setHolidays(updatedHolidays);
      localStorage.setItem('holidays', JSON.stringify(updatedHolidays));
      setEditingHoliday(null);
    };

    if (editHoliday.image instanceof File) {
      reader.readAsDataURL(editHoliday.image);
    } else {
      reader.onloadend();
    }
  };

  const handleAddExpense = (holidayId) => {
    setDetailedHoliday(null);
    setShowExpenseForm(holidayId);
  };

  const openDetailedView = (holiday) => {
    setDetailedHoliday(holiday);
  };

  const getTotalExpenses = (expenses) => {
    return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  };

  const getProgressPercentage = (holiday) => {
    const total = getTotalExpenses(holiday.expenses);
    return Math.min((total / holiday.budget) * 100, 100);
  };

  const renderHolidayCard = (holiday) => {
  return (
      <div 
        key={holiday.id} 
        onClick={() => openDetailedView(holiday)} 
        className="cursor-pointer"
      >
        <HolidayCard
          holiday={holiday}
          isDarkMode={isDarkMode}
          onEdit={() => handleEditHoliday(holiday)}
          onDelete={() => handleDeleteHoliday(holiday.id)}
          onAddExpense={() => handleAddExpense(holiday.id)}
        />
      </div>
    );
  };

  const renderHolidaySection = (title, holidays, status) => {
    if (holidays.length === 0) return null;
    
    return (
      <div className="mb-12">
        <h2 className={`text-xl font-semibold mb-6 tracking-tight ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {holidays.map((holiday) => renderHolidayCard(holiday))}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} transition-colors`}>
            Travel Budget
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} hover:scale-105 transition-all duration-300`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setShowNewHolidayForm(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-black text-white'} hover:scale-105 transition-all duration-300 text-sm font-medium`}
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">New Holiday</span>
            </button>
          </div>
        </div>

        {/* Modal Overlays */}
        {(showNewHolidayForm || showExpenseForm || editingHoliday) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" />
        )}

        {/* Holiday Form Modal */}
        {showNewHolidayForm && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div 
              className={`rounded-lg p-6 max-w-md w-full ${isDarkMode ? 'bg-black' : 'bg-white/90'} backdrop-blur-xl border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} transform transition-all duration-300 scale-100 hover:border-gray-600`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Create New Holiday
                </h2>
                <button
                  onClick={() => {
                    setShowNewHolidayForm(false);
                    setFormData({
                      name: '',
                      destination: '',
                      startDate: '',
                      endDate: '',
                      image: null
                    });
                  }}
                  className={`p-1 rounded-full hover:bg-gray-200/10 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <Stepper
                initialStep={1}
                isDarkMode={isDarkMode}
                onStepChange={(step) => console.log('Step changed:', step)}
                onFinalStepCompleted={() => {
                  const updatedHolidays = [
                    ...holidays,
                    {
                      ...formData,
                      id: Date.now(),
                      expenses: [],
                      status: 'upcoming'
                    }
                  ];
                  setHolidays(updatedHolidays);
                  localStorage.setItem('holidays', JSON.stringify(updatedHolidays));
                  setFormData({
                    name: '',
                    destination: '',
                    startDate: '',
                    endDate: '',
                    image: null
                  });
                  setShowNewHolidayForm(false);
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
                        className={`mt-1 block w-full rounded-md ${isDarkMode ? 'bg-gray-800/50 text-white' : 'bg-white text-gray-900'} border-0 focus:ring-2 focus:ring-gray-500`}
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
                        className={`mt-1 block w-full rounded-md ${isDarkMode ? 'bg-gray-800/50 text-white' : 'bg-white text-gray-900'} border-0 focus:ring-2 focus:ring-gray-500`}
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
                          className={`mt-1 block w-full rounded-md ${isDarkMode ? 'bg-gray-800/50 text-white' : 'bg-white text-gray-900'} border-0 focus:ring-2 focus:ring-gray-500`}
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
                          className={`mt-1 block w-full rounded-md ${isDarkMode ? 'bg-gray-800/50 text-white' : 'bg-white text-gray-900'} border-0 focus:ring-2 focus:ring-gray-500`}
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
                                  className="relative cursor-pointer rounded-md font-medium text-gray-600 hover:text-gray-800 focus-within:outline-none"
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
        )}

        {/* Expense Form Modal */}
        {showExpenseForm && (
          <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"></div>
            <ExpenseForm
              isDarkMode={isDarkMode}
              expense={null}
              onSave={(formData) => {
                const updatedHolidays = holidays.map(holiday => {
                  if (holiday.id === showExpenseForm) {
                    return {
                      ...holiday,
                      expenses: [...holiday.expenses, { ...formData, id: Date.now() }]
                    };
                  }
                  return holiday;
                });
                setHolidays(updatedHolidays);
                localStorage.setItem('holidays', JSON.stringify(updatedHolidays));
                setShowExpenseForm(null);
              }}
              onCancel={() => setShowExpenseForm(null)}
            />
          </>
        )}

        {/* Edit Holiday Modal */}
        {editingHoliday && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg">
              <div className={`rounded-lg p-6 ${isDarkMode ? 'bg-black' : 'bg-white/90'} backdrop-blur-xl border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} transform transition-all duration-300 scale-100 hover:border-gray-600`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-lg font-semibold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Edit Holiday
                  </h2>
                  <button
                    onClick={() => {
                      setEditingHoliday(null);
                      setEditHoliday({
                        name: '',
                        destination: '',
                        startDate: '',
                        endDate: '',
                        image: null
                      });
                    }}
                    className={`p-1 rounded-full ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'} transition-colors`}
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <Stepper
                  initialStep={1}
                  isDarkMode={isDarkMode}
                  onStepChange={(step) => console.log('Edit step:', step)}
                  onFinalStepCompleted={handleSaveHolidayEdit}
                >
                  <Step>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Holiday Name
                        </label>
                        <input
                          type="text"
                          value={editHoliday.name}
                          onChange={(e) => setEditHoliday({ ...editHoliday, name: e.target.value })}
                          className={`mt-1 block w-full rounded-lg ${
                            isDarkMode 
                              ? 'bg-gray-800/50 text-white placeholder-gray-400 focus:ring-gray-500' 
                              : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-gray-500'
                          } border-0 focus:ring-2 transition-colors`}
                          placeholder="Enter holiday name"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Destination
                        </label>
                        <input
                          type="text"
                          value={editHoliday.destination}
                          onChange={(e) => setEditHoliday({ ...editHoliday, destination: e.target.value })}
                          className={`mt-1 block w-full rounded-lg ${
                            isDarkMode 
                              ? 'bg-gray-800/50 text-white placeholder-gray-400 focus:ring-gray-500' 
                              : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-gray-500'
                          } border-0 focus:ring-2 transition-colors`}
                          placeholder="Enter destination"
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
                            value={editHoliday.startDate}
                            onChange={(e) => setEditHoliday({ ...editHoliday, startDate: e.target.value })}
                            className={`mt-1 block w-full rounded-lg ${
                              isDarkMode 
                                ? 'bg-gray-800/50 text-white focus:ring-gray-500' 
                                : 'bg-white text-gray-900 focus:ring-gray-500'
                            } border-0 focus:ring-2 transition-colors`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            End Date
                          </label>
                          <input
                            type="date"
                            value={editHoliday.endDate}
                            onChange={(e) => setEditHoliday({ ...editHoliday, endDate: e.target.value })}
                            className={`mt-1 block w-full rounded-lg ${
                              isDarkMode 
                                ? 'bg-gray-800/50 text-white focus:ring-gray-500' 
                                : 'bg-white text-gray-900 focus:ring-gray-500'
                            } border-0 focus:ring-2 transition-colors`}
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
                        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${
                          isDarkMode 
                            ? 'border-gray-600 hover:border-gray-500' 
                            : 'border-gray-300 hover:border-gray-400'
                        } transition-colors`}>
                          <div className="space-y-2 text-center">
                            {editHoliday.image ? (
                              <div className="relative">
                                <img
                                  src={editHoliday.image instanceof File ? URL.createObjectURL(editHoliday.image) : editHoliday.image}
                                  alt="Preview"
                                  className="mx-auto h-32 w-full object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditHoliday({ ...editHoliday, image: null })}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600/80 transition-colors backdrop-blur-sm"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <svg
                                  className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
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
                                <div className="flex text-sm justify-center">
                                  <label
                                    htmlFor="edit-file-upload"
                                    className={`relative cursor-pointer rounded-md font-medium ${
                                      isDarkMode 
                                        ? 'text-blue-400 hover:text-blue-300' 
                                        : 'text-blue-500 hover:text-blue-400'
                                    } focus-within:outline-none transition-colors`}
                                  >
                                    <span>Upload an image</span>
                                    <input
                                      id="edit-file-upload"
                                      name="edit-file-upload"
                                      type="file"
                                      className="sr-only"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          setEditHoliday({ ...editHoliday, image: file });
                                        }
                                      }}
                                    />
                                  </label>
                                  <p className={`pl-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    or drag and drop
                                  </p>
                                </div>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  PNG, JPG, GIF up to 10MB
                                </p>
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
        </div>
        )}

        {/* Detailed View Modal */}
        {detailedHoliday && (
          <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-40" onClick={() => setDetailedHoliday(null)}></div>
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
              <div 
                className={`rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-auto ${isDarkMode ? 'bg-black' : 'bg-white/95'} backdrop-blur-xl border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} shadow-2xl transform transition-all duration-500 scale-100 hover:border-gray-600`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className={`text-2xl md:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {detailedHoliday.name}
                  </h2>
                  <button
                    onClick={() => setDetailedHoliday(null)}
                    className={`p-2 rounded-full hover:bg-gray-200/10 transition-all duration-300 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'} hover:scale-110`}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="rounded-lg overflow-hidden mb-6 h-72 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                      {detailedHoliday.image ? (
                        <img
                          src={detailedHoliday.image}
                          alt={detailedHoliday.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/80'} flex items-center justify-center`}>
                          <Plane className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} size={80} />
                        </div>
                      )}
                    </div>
                    
                    <div className={`p-5 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-100/50'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} shadow-sm`}>
                      <h3 className={`text-lg font-medium tracking-tight mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Holiday Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Destination</span>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {detailedHoliday.destination}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Duration</span>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {new Date(detailedHoliday.startDate).toLocaleDateString()} - {new Date(detailedHoliday.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Status</span>
                          <span className={`font-medium ${
                            getHolidayStatus(detailedHoliday) === 'ongoing' ? 'text-green-500' :
                            getHolidayStatus(detailedHoliday) === 'upcoming' ? 'text-gray-700' :
                            'text-gray-500'
                          }`}>
                            {getHolidayStatus(detailedHoliday).charAt(0).toUpperCase() + getHolidayStatus(detailedHoliday).slice(1)}
                          </span>
                        </div>
                        {detailedHoliday.budget && (
                          <>
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Budget</span>
                              <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                ${parseFloat(detailedHoliday.budget).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Spent</span>
                              <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                ${getTotalExpenses(detailedHoliday.expenses).toFixed(2)}
                              </span>
                            </div>
                            <div className="pt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Budget Progress</span>
                                <span className={`font-medium ${
                                  (getTotalExpenses(detailedHoliday.expenses) / detailedHoliday.budget) > 0.8 ? 'text-red-500' :
                                  (getTotalExpenses(detailedHoliday.expenses) / detailedHoliday.budget) > 0.5 ? 'text-yellow-500' :
                                  'text-green-500'
                                }`}>
                                  {Math.min(Math.round((getTotalExpenses(detailedHoliday.expenses) / detailedHoliday.budget) * 100), 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                                    (getTotalExpenses(detailedHoliday.expenses) / detailedHoliday.budget) > 0.8 ? 'bg-red-500' :
                                    (getTotalExpenses(detailedHoliday.expenses) / detailedHoliday.budget) > 0.5 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((getTotalExpenses(detailedHoliday.expenses) / detailedHoliday.budget) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xl font-medium tracking-tight ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Expenses
                      </h3>
                      <button
                        onClick={() => handleAddExpense(detailedHoliday.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-green-600 text-white hover:bg-green-700'
                        } hover:scale-105 transition-all duration-300 shadow-sm`}
                      >
                        <Plus size={16} />
                        <span>Add Expense</span>
                      </button>
                    </div>
                    
                    {detailedHoliday.expenses.length > 0 ? (
                      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                        {detailedHoliday.expenses.map((expense) => (
                          <div
                            key={expense.id}
                            className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/30 hover:bg-gray-800/50' : 'bg-gray-100/50 hover:bg-gray-100/80'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} transition-all duration-300 hover:border-gray-500 hover:shadow-md group`}
                          >
                            {editingExpense === expense.id ? (
                              // Editing mode
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <input
                                    type="text"
                                    value={expense.description}
                                    onChange={(e) => {
                                      const updatedHolidays = holidays.map(h => {
                                        if (h.id === detailedHoliday.id) {
                                          return {
                                            ...h,
                                            expenses: h.expenses.map(exp => exp.id === expense.id ? {...exp, description: e.target.value} : exp)
                                          };
                                        }
                                        return h;
                                      });
                                      setHolidays(updatedHolidays);
                                      setDetailedHoliday({...detailedHoliday, expenses: detailedHoliday.expenses.map(exp => exp.id === expense.id ? {...exp, description: e.target.value} : exp)});
                                    }}
                                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-colors`}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={expense.amount}
                                      onChange={(e) => {
                                        const updatedHolidays = holidays.map(h => {
                                          if (h.id === detailedHoliday.id) {
                                            return {
                                              ...h,
                                              expenses: h.expenses.map(exp => exp.id === expense.id ? {...exp, amount: e.target.value} : exp)
                                            };
                                          }
                                          return h;
                                        });
                                        setHolidays(updatedHolidays);
                                        setDetailedHoliday({...detailedHoliday, expenses: detailedHoliday.expenses.map(exp => exp.id === expense.id ? {...exp, amount: e.target.value} : exp)});
                                      }}
                                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-colors`}
                                    />
                                  </div>
                                  <div>
                                    <select
                                      value={expense.category}
                                      onChange={(e) => {
                                        const updatedHolidays = holidays.map(h => {
                                          if (h.id === detailedHoliday.id) {
                                            return {
                                              ...h,
                                              expenses: h.expenses.map(exp => exp.id === expense.id ? {...exp, category: e.target.value} : exp)
                                            };
                                          }
                                          return h;
                                        });
                                        setHolidays(updatedHolidays);
                                        setDetailedHoliday({...detailedHoliday, expenses: detailedHoliday.expenses.map(exp => exp.id === expense.id ? {...exp, category: e.target.value} : exp)});
                                      }}
                                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-colors`}
                                    >
                                      <option value="food">Food & Dining</option>
                                      <option value="transportation">Transportation</option>
                                      <option value="accommodation">Accommodation</option>
                                      <option value="activities">Activities</option>
                                      <option value="shopping">Shopping</option>
                                      <option value="other">Other</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <input
                                    type="date"
                                    value={expense.date}
                                    onChange={(e) => {
                                      const updatedHolidays = holidays.map(h => {
                                        if (h.id === detailedHoliday.id) {
                                          return {
                                            ...h,
                                            expenses: h.expenses.map(exp => exp.id === expense.id ? {...exp, date: e.target.value} : exp)
                                          };
                                        }
                                        return h;
                                      });
                                      setHolidays(updatedHolidays);
                                      setDetailedHoliday({...detailedHoliday, expenses: detailedHoliday.expenses.map(exp => exp.id === expense.id ? {...exp, date: e.target.value} : exp)});
                                    }}
                                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-colors`}
                                  />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                  <button
                                    onClick={() => {
                                      setEditingExpense(null);
                                      // Save changes to localStorage
                                      localStorage.setItem('holidays', JSON.stringify(holidays));
                                    }}
                                    className={`px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors`}
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingExpense(null)}
                                    className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:opacity-80 transition-colors`}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // View mode
                              <>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                      {expense.description}
                                    </h4>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                      {new Date(expense.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      expense.category === 'food' ? 'bg-green-500/20 text-green-500' :
                                      expense.category === 'transportation' ? 'bg-blue-500/20 text-blue-500' :
                                      expense.category === 'accommodation' ? 'bg-purple-500/20 text-purple-500' :
                                      expense.category === 'activities' ? 'bg-yellow-500/20 text-yellow-500' :
                                      expense.category === 'shopping' ? 'bg-pink-500/20 text-pink-500' :
                                      'bg-gray-500/20 text-gray-500'
                                    }`}>
                                      {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                                    </span>
                                    <span className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                      ${parseFloat(expense.amount).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <button
                                    onClick={() => setEditingExpense(expense.id)}
                                    className={`p-1.5 rounded-full hover:bg-gray-200/10 transition-all duration-300 ${isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-500 hover:text-green-600'} hover:scale-110`}
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updatedHolidays = holidays.map(h => {
                                        if (h.id === detailedHoliday.id) {
                                          return {
                                            ...h,
                                            expenses: h.expenses.filter(exp => exp.id !== expense.id)
                                          };
                                        }
                                        return h;
                                      });
                                      setHolidays(updatedHolidays);
                                      localStorage.setItem('holidays', JSON.stringify(updatedHolidays));
                                      setDetailedHoliday({...detailedHoliday, expenses: detailedHoliday.expenses.filter(exp => exp.id !== expense.id)});
                                    }}
                                    className={`p-1.5 rounded-full hover:bg-red-500/10 transition-all duration-300 ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'} hover:scale-110`}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`p-8 rounded-lg ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-100/50'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} flex flex-col items-center justify-center text-center`}>
                        <DollarSign size={40} className={`mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          No expenses yet
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Add your first expense to start tracking
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Holiday Sections */}
        {renderHolidaySection("Ongoing Holidays", holidays.filter(h => getHolidayStatus(h) === 'ongoing'), 'ongoing')}
        {renderHolidaySection("Upcoming Holidays", holidays.filter(h => getHolidayStatus(h) === 'upcoming'), 'upcoming')}
        {renderHolidaySection("Past Holidays", holidays.filter(h => getHolidayStatus(h) === 'completed'), 'completed')}

        {/* Empty State */}
        {holidays.length === 0 && (
          <div className={`py-20 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <Plane size={60} className="mx-auto mb-6 opacity-50" />
            <h3 className="text-xl font-semibold mb-3">No holidays yet</h3>
            <p className="max-w-md mx-auto mb-8 text-[15px] leading-relaxed">Create your first holiday to start budgeting for your travels</p>
            <button
              onClick={() => setShowNewHolidayForm(true)}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-black text-white'} hover:scale-105 transition-all duration-300`}
            >
              <PlusCircle size={18} />
              <span>Create Holiday</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}