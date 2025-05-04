"use client";

import { useEffect, useState } from 'react';
import { User, CreditCard, Wallet, Map, Award, DollarSign, Heart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaLock, FaSave, FaTimes, FaEdit } from 'react-icons/fa';

export default function ProfilePage() {
  const { isDarkMode } = useTheme();
  const { user, loading, updateUserContext, error: authError } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    countriesVisited: 0,
    completedTrips: 0,
    totalSpent: 0,
    avgSpend: 0,
    totalLikesReceived: 0,
  });
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setNewUsername(user.username || '');
      
      setStats({
        countriesVisited: user.countriesVisited || 0,
        completedTrips: user.completedTrips || 0,
        totalSpent: user.totalSpent || 0,
        avgSpend: user.avgSpend || 0,
        totalLikesReceived: user.totalLikesReceived || 0,
      });
    }
  }, [user, loading, router]);

  // Get user's preferred currency
  const getCurrencySymbol = (code = 'USD') => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'Fr',
      CNY: '¥',
      TRY: '₺',
    };
    return symbols[code] || '$';
  };

  const currencySymbol = getCurrencySymbol(
    user?.settings?.defaultCurrency || 'USD'
  );

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccess('');

    if (newUsername === user?.username) {
        setIsEditingUsername(false);
        return; // No change
    }
    
    // Client-side validation (matches API)
    if (!newUsername || newUsername.length < 3 || !/^[a-zA-Z0-9]+$/.test(newUsername)) {
        setUsernameError('Username must be 3+ letters/numbers only.');
        return;
    }

    setIsSubmitting(true);
    try {
        const response = await fetch('/api/user/username', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: newUsername }),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update username');
        }
        
        // Update context locally
        updateUserContext({ username: data.username });
        setUsernameSuccess('Username updated successfully!');
        setIsEditingUsername(false);
    } catch (err) {
        setUsernameError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return <AppLayout><div className="flex justify-center items-center min-h-[60vh]">Loading profile...</div></AppLayout>;
  }
  
  if (authError) {
     return <AppLayout><div className="text-center py-10 text-red-500">Error loading profile: {authError}</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className={`mb-8 p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-6 ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200'} border backdrop-blur-md`}>
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex-shrink-0 flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} relative group overflow-hidden shadow-lg`}>
            <User size={40} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <button className="text-white text-xs p-1 rounded-full bg-gray-800/80 hover:bg-gray-700">
                <FaEdit size={14} />
              </button>
            </div>
          </div>
          <div className="text-center sm:text-left flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{user.name || 'User Name'}</h1>
            </div>
            <div className={`text-md mb-1 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} font-mono flex items-center justify-center sm:justify-start gap-2`}>
                <span>@{user.username}</span>
                {!isEditingUsername ? (
                    <button onClick={() => setIsEditingUsername(true)} className="text-xs opacity-70 hover:opacity-100">
                        <FaEdit />
                    </button>
                ) : (
                    <form onSubmit={handleUsernameChange} className="flex items-center gap-1">
                        <input 
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className={`px-2 py-0.5 text-sm rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border`}
                            minLength="3"
                            pattern="^[a-zA-Z0-9]+$"
                            required
                            disabled={isSubmitting}
                        />
                        <button type="submit" disabled={isSubmitting} className="text-green-500 hover:text-green-400"><FaSave /></button>
                        <button type="button" onClick={() => setIsEditingUsername(false)} disabled={isSubmitting} className="text-red-500 hover:text-red-400"><FaTimes /></button>
                    </form>
                )}
            </div>
             {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
             {usernameSuccess && <p className="text-xs text-green-500 mt-1">{usernameSuccess}</p>}
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 items-center sm:items-start">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                <FaEnvelope size={12} /> {user.email}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} flex items-center gap-1`}>
                <FaUser size={12} /> Member since: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className={`mt-3 pt-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-center sm:justify-start gap-3`}>
              <button 
                onClick={() => router.push('/settings')}
                className={`text-xs px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors`}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={Map} 
            label="Countries Visited" 
            value={stats.countriesVisited}
            colorClasses={isDarkMode ? "text-blue-400 bg-blue-900/30" : "text-blue-600 bg-blue-100"}
            isDarkMode={isDarkMode}
          />
          <StatCard 
            icon={DollarSign} 
            label="Total Spent" 
            value={`${currencySymbol}${stats.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
            colorClasses={isDarkMode ? "text-green-400 bg-green-900/30" : "text-green-600 bg-green-100"}
            isDarkMode={isDarkMode}
          />
          <StatCard 
            icon={Award} 
            label="Completed Trips" 
            value={stats.completedTrips}
            colorClasses={isDarkMode ? "text-purple-400 bg-purple-900/30" : "text-purple-600 bg-purple-100"}
            isDarkMode={isDarkMode}
          />
          <StatCard 
            icon={Wallet} 
            label="Avg. Spent Per Trip" 
            value={`${currencySymbol}${Math.round(stats.avgSpend).toLocaleString()}`}
            colorClasses={isDarkMode ? "text-yellow-400 bg-yellow-900/30" : "text-yellow-600 bg-yellow-100"}
            isDarkMode={isDarkMode}
          />
          <StatCard 
            icon={Heart} 
            label="Likes Received" 
            value={stats.totalLikesReceived}
            colorClasses={isDarkMode ? "text-pink-400 bg-pink-900/30" : "text-pink-600 bg-pink-100"}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ icon: Icon, label, value, colorClasses, isDarkMode }) {
  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'} border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
} 