"use client";

import { useState, useEffect } from 'react';
import { Bell, Shield, UserCog, Languages, CreditCard, FileText, HelpCircle, LogOut, Image, DollarSign, Settings as SettingsIcon, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components';
import Dialog from '../../components/Dialog';
import { 
  AccountDialogContent, 
  PaymentsDialogContent, 
  // Remove unused imports
  // PrivacyDialogContent,
  // HelpDialogContent,
  // LegalDialogContent
} from '../../components/Settings';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaLock, FaSave, FaTimes, FaEdit, FaTrashAlt } from 'react-icons/fa';

// Ensure the page is properly exported
export default function Settings() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, updateSettings, logout, updateUserContext } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');
  const [imageDisplayMode, setImageDisplayMode] = useState('blurred-background');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [isSubmittingUsername, setIsSubmittingUsername] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [isVerifyingDelete, setIsVerifyingDelete] = useState(false);
  
  // Dialog state
  const [activeDialog, setActiveDialog] = useState({
    isOpen: false,
    sectionId: null,
    item: null
  });

  // Effect to handle redirect after logout
  useEffect(() => {
    // Only redirect if loading is finished and user is definitively logged out
    if (!loading && !isAuthenticated) {
        // Optional: Check if already on a public page to prevent loops
        // if (router.pathname !== '/login' && router.pathname !== '/signup') {
        console.log("User logged out, redirecting to /login...");
        router.push('/login');
        // }
    }
  }, [isAuthenticated, loading, router]);

  // Load user settings when user data is available
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setNotifications(user.settings?.notifications !== undefined ? user.settings.notifications : true);
      setLanguage(user.settings?.language || 'English');
      setImageDisplayMode(user.settings?.imageDisplayMode || 'blurred-background');
      setDefaultCurrency(user.settings?.defaultCurrency || 'USD');
      setNewUsername(user.username || '');
    }
  }, [user, loading, router]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage({ text: '', type: '' });

    try {
      // Structure settings to match the User model exactly
      const settings = {
        notifications,
        language,
        imageDisplayMode,
        defaultCurrency
      };

      console.log('Saving settings:', settings);
      const result = await updateSettings(settings);
      
      if (result.success) {
        setSaveMessage({ text: 'Settings saved successfully', type: 'success' });
      } else {
        setSaveMessage({ text: result.error || 'Failed to save settings', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ text: 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsSaving(false);
    }
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      if (saveMessage.type === 'success') {
        setSaveMessage({ text: '', type: '' });
      }
    }, 3000);
  };
  
  const openDialog = (sectionId, item) => {
    setActiveDialog({
      isOpen: true,
      sectionId,
      item
    });
  };
  
  const closeDialog = () => {
    setActiveDialog({
      isOpen: false,
      sectionId: null,
      item: null
    });
  };

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccess('');
    if (newUsername === user?.username) {
        setIsEditingUsername(false);
        return;
    }
    if (!newUsername || newUsername.length < 3 || !/^[a-zA-Z0-9]+$/.test(newUsername)) {
        setUsernameError('Username must be 3+ letters/numbers only.');
        return;
    }
    setIsSubmittingUsername(true);
    console.log(`Attempting to update username to: ${newUsername}`);
    try {
        const response = await fetch('/api/user/username', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: newUsername }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update username');
        updateUserContext({ username: data.username });
        setUsernameSuccess('Username updated!');
        setIsEditingUsername(false);
        setTimeout(() => setUsernameSuccess(''), 3000);
    } catch (err) {
        setUsernameError(err.message);
    } finally {
        setIsSubmittingUsername(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsVerifyingDelete(true);
    setIsDeleting(false);
    setDeleteError('');

    if (!deleteConfirmEmail || !deleteConfirmPassword) {
        setDeleteError('Please enter both your email and password to confirm.');
        setIsVerifyingDelete(false);
        return;
    }

    try {
        const response = await fetch('/api/user/me', { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: deleteConfirmEmail, 
                password: deleteConfirmPassword 
            })
        });
        
        const data = await response.json(); 
        
        if (!response.ok) {
            throw new Error(data.error || `Failed to delete account (status: ${response.status})`);
        }
        
        console.log('Account deletion successful via API after verification.');
        setShowDeleteConfirm(false);
        await logout();
        router.push('/login');

    } catch (err) {
        console.error("Delete account error:", err);
        setDeleteError(err.message || 'Could not delete account. Please try again.');
        setIsVerifyingDelete(false);
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
  
  // Render dialog content based on active section and item
  const renderDialogContent = () => {
    if (!activeDialog.isOpen || !activeDialog.sectionId || !activeDialog.item) return null;
    
    // Simple placeholder content based on sectionId
    // Replace these with actual form components later
    switch (activeDialog.sectionId) {
      case 'account':
        // Assuming AccountDialogContent handles Edit Profile, Password Change etc.
        // return <AccountDialogContent sectionId={activeDialog.sectionId} item={activeDialog.item} />;
        return <div className="p-4"><p>Account settings for {activeDialog.item?.name} go here (e.g., change password form).</p></div>;
      case 'payments':
        // Assuming PaymentsDialogContent handles methods and currency
        // return <PaymentsDialogContent sectionId={activeDialog.sectionId} item={activeDialog.item} />;
         return (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold">{activeDialog.item?.name}</h3>
            {activeDialog.item?.name === 'Currency' && (
              <div>
                <label htmlFor="currency-select" className="block text-sm font-medium mb-1">Select Currency:</label>
                <select
                  id="currency-select"
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className={`block w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                >
                  {currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>)}
                </select>
                <button onClick={handleSaveSettings} disabled={isSaving} className="mt-4 px-3 py-1.5 bg-cyan-600 text-white rounded text-sm">Save Currency</button>
              </div>
            )}
            {activeDialog.item?.name === 'Payment Methods' && <p>Payment methods management UI.</p>}
          </div>
        );
      case 'privacy':
        return <div className="p-4"><p>Privacy settings for {activeDialog.item?.name} go here.</p></div>;
      case 'help':
        return <div className="p-4"><p>Help content for {activeDialog.item?.name} go here.</p></div>;
      case 'legal':
        return <div className="p-4"><p>Legal information regarding {activeDialog.item?.name} go here.</p></div>;
      // Add cases for Appearance, Language, Notifications, etc. if they are separate sections
      // Or handle them within a general 'Preferences' section if applicable.
      default:
        console.warn(`Dialog content not implemented for section: ${activeDialog.sectionId}`);
        return (
          <div className="p-4">
            <p>Content for {activeDialog.item?.name} coming soon.</p>
          </div>
        );
    }
  };
  
  if (loading || !user) {
    return <AppLayout><div>Loading settings...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="py-10 px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-2xl font-semibold dark:text-white">Settings</h1>
           <button
               onClick={handleSaveSettings}
               disabled={isSaving}
               className={`px-4 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
               {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
        
        {saveMessage.text && (
          <div className={`mb-6 p-3 rounded-md text-sm ${
            saveMessage.type === 'success' 
              ? 'bg-green-500/10 text-green-700 dark:text-green-300'
              : 'bg-red-500/10 text-red-700 dark:text-red-300'
          }`}>
            {saveMessage.text}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-900 border border-gray-700/50' : 'bg-white border border-gray-200'} `}>
              <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Account Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 pt-4 border-t dark:border-gray-700 first:border-t-0 first:pt-0">
                   <span className="text-gray-500 dark:text-gray-400 w-6 text-center opacity-70">👤</span> 
                   <div>
                     <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</span>
                     <p className="mt-1 text-gray-900 dark:text-gray-100">{user.name || 'N/A'}</p>
                   </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                  <div className="flex items-center gap-3">
                     <FaUser className="text-gray-500 dark:text-gray-400 flex-shrink-0 w-6 text-center" />
                     <div>
                       <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</span>
                       {!isEditingUsername ? (
                           <p className="mt-1 text-gray-900 dark:text-gray-100">{user.username || <span className='text-gray-400 italic text-sm'>Not set</span>}</p>
                       ) : (
                           <form onSubmit={handleUsernameChange} className="mt-1 flex gap-2 items-center">
                               <input 
                                   type="text"
                                   value={newUsername}
                                   onChange={(e) => setNewUsername(e.target.value)}
                                   className={`flex-grow px-2 py-1 border rounded-md shadow-sm focus:outline-none sm:text-sm ${usernameError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-cyan-500 focus:border-cyan-500'} dark:bg-gray-700 dark:text-gray-200`}
                                   minLength="3" pattern="^[a-zA-Z0-9]+$" required
                               />
                               <button type="submit" className="p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50" title="Save" disabled={isSubmittingUsername}>
                                   {isSubmittingUsername ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <FaSave />} 
                               </button>
                               <button type="button" onClick={() => { setIsEditingUsername(false); setUsernameError(''); setNewUsername(user.username || ''); }} className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Cancel">
                                   <FaTimes />
                               </button>
                           </form>
                       )}
                       {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
                       {usernameSuccess && !isEditingUsername && <p className="text-xs text-green-500 mt-1">{usernameSuccess}</p>}
                     </div>
                  </div>
                  {!isEditingUsername && (
                      <button onClick={() => { setIsEditingUsername(true); setUsernameError(''); setUsernameSuccess(''); }} className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-500/10" title="Edit Username">
                          <FaEdit size={14} />
                      </button>
                  )}
                </div>
                 <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                   <div className="flex items-center gap-3">
                     <FaEnvelope className="text-gray-500 dark:text-gray-400 flex-shrink-0 w-6 text-center" />
                     <div>
                       <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                       <p className="mt-1 text-gray-900 dark:text-gray-100">{user.email}</p>
                     </div>
                   </div>
                   <button className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                     Change Email
                   </button>
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                   <div className="flex items-center gap-3">
                      <FaLock className="text-gray-500 dark:text-gray-400 flex-shrink-0 w-6 text-center" />
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Password</span>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:underline dark:text-blue-400">Change Password</button>
                 </div>
              </div>
            </div>
            
            {/* Danger Zone / Delete Account Section - Refined */}
            <div className={`p-6 rounded-lg border border-red-500/30 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                  <div>
                      <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Delete Account</h2>
                      <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                         Permanently remove your account and all data.
                      </p>
                  </div>
                  <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 rounded-md border border-red-600/50 bg-red-600/10 text-red-600 dark:text-red-400 hover:bg-red-600/20 text-sm font-medium transition-colors disabled:opacity-50"
                      title="Delete Account"
                  >
                      <FaTrashAlt size={16} />
                  </button>
              </div>
               {/* Error message for deletion, if any (appears in dialog now) */}
               {/* {deleteError && <p className="text-xs text-red-500 mt-3">Error: {deleteError}</p>} */} 
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-4">
            {settingsSections.map((section) => (
              <div key={section.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/70 border border-gray-700/30' : 'bg-gray-50/50 border border-gray-200/80'} `}>
                <div className="flex items-center gap-2 mb-3">
                  {section.icon}
                  <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{section.title}</h3>
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.name}
                      className={`w-full text-left p-2 rounded-md flex items-start hover:bg-gray-500/10 transition-colors ${
                        isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => openDialog(section.id, item)}
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Logout Button */}
            <button
              onClick={async () => {
                try {
                  await logout();
                  router.push('/login');
                } catch (error) {
                  console.error("Error during logout:", error);
                  // Still try to redirect even if there was an error
                  router.push('/login');
                }
              }}
              className={`w-full p-3 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800/50 hover:bg-gray-700/60 text-red-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-red-600'
              } transition-colors flex items-center justify-center gap-2 font-medium text-sm`}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <Dialog 
          isOpen={activeDialog.isOpen} 
          onClose={closeDialog}
          title={activeDialog.item?.name || 'Settings'}
        >
          {renderDialogContent()}
        </Dialog>
        
        <Dialog 
          isOpen={showDeleteConfirm} 
          onClose={() => {
              setShowDeleteConfirm(false);
              setDeleteConfirmEmail('');
              setDeleteConfirmPassword('');
              setDeleteError('');
          }}
          title="Confirm Account Deletion"
          titleIcon={<FaTrashAlt className="text-red-500" size={20}/>}
        >
          <div className="p-5 space-y-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  This action is permanent and cannot be undone. To confirm, please enter your email address and password.
              </p>
              
              <div>
                  <label htmlFor="delete-email" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Your Email</label>
                  <input 
                      id="delete-email"
                      type="email"
                      value={deleteConfirmEmail}
                      onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={user?.email || "you@example.com"}
                      disabled={isVerifyingDelete}
                  />
              </div>
              
              <div>
                  <label htmlFor="delete-password" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Your Password</label>
                  <input 
                      id="delete-password"
                      type="password"
                      value={deleteConfirmPassword}
                      onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="Enter your current password"
                      disabled={isVerifyingDelete}
                  />
              </div>

              {deleteError && (
                  <p className="text-xs text-red-500">Error: {deleteError}</p>
              )}
              
              <div className="flex justify-end gap-3 pt-2">
                  <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isVerifyingDelete}
                      className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-700'} text-sm font-medium transition-colors`}
                  >
                      Cancel
                  </button>
                  <button 
                      onClick={handleDeleteAccount}
                      disabled={isVerifyingDelete || !deleteConfirmEmail || !deleteConfirmPassword}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isVerifyingDelete ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                      ) : (
                          'Confirm & Delete Account'
                      )}
                  </button>
              </div>
          </div>
        </Dialog>
      </div>
    </AppLayout>
  );
}