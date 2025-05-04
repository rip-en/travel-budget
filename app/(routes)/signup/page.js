'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ValidationIndicator from '../../components/Form/ValidationIndicator';
import { useDebounce } from '../../hooks/useDebounce';
import { Loader2 } from 'lucide-react';

// Basic email regex (adjust for stricter validation if needed)
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;
const DEBOUNCE_DELAY = 500; // milliseconds

export default function SignupPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { signup, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // State to track focus/interaction for showing validation
  const [focusedField, setFocusedField] = useState(null);

  // --- State for Async Validation ---
  const [usernameStatus, setUsernameStatus] = useState('idle');
  const [emailStatus, setEmailStatus] = useState('idle');

  // Debounce username and email inputs
  const debouncedUsername = useDebounce(formData.username, DEBOUNCE_DELAY);
  const debouncedEmail = useDebounce(formData.email, DEBOUNCE_DELAY);
  // --- End Async Validation State ---

  // Use effect for redirection when already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/holidays');
    }
  }, [isAuthenticated, router]);

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    // Optionally keep showing indicators after first blur, or setFocusedField(null) to hide on blur
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(''); // Clear general error on input change
    
    // Reset status when user types in the field
    if (name === 'username') setUsernameStatus('idle');
    if (name === 'email') setEmailStatus('idle');
  };

  // --- Validation Logic ---
  const usernameFormatRules = useMemo(() => [
    { id: 'un1', text: 'Minimum 3 characters', met: formData.username.length >= 3 },
    { id: 'un2', text: 'Letters and numbers only', met: USERNAME_REGEX.test(formData.username) || formData.username.length === 0 },
  ], [formData.username]);

  const emailFormatRules = useMemo(() => [
    { id: 'em1', text: 'Valid email format', met: EMAIL_REGEX.test(formData.email) || formData.email.length === 0 },
  ], [formData.email]);

  const passwordValidationRules = useMemo(() => [
    { id: 'pw1', text: 'Minimum 6 characters', met: formData.password.length >= 6 },
    // Add more password rules here if needed (e.g., uppercase, number, symbol)
    // { id: 'pw2', text: 'Includes an uppercase letter', met: /[A-Z]/.test(formData.password) },
    // { id: 'pw3', text: 'Includes a number', met: /\d/.test(formData.password) },
  ], [formData.password]);

  const isUsernameFormatValid = useMemo(() => usernameFormatRules.every(rule => rule.met), [usernameFormatRules]);
  const isEmailFormatValid = useMemo(() => emailFormatRules.every(rule => rule.met), [emailFormatRules]);
  const isPasswordValid = useMemo(() => passwordValidationRules.every(rule => rule.met), [passwordValidationRules]);
  // --- End Validation Logic ---

  // --- Effect for Debounced Username Check ---
  useEffect(() => {
    // Only check if format is valid and username has changed (debounced)
    if (debouncedUsername && isUsernameFormatValid) {
      const checkUsername = async () => {
        setUsernameStatus('checking');
        try {
          const response = await fetch('/api/auth/check-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: 'username', value: debouncedUsername })
          });
          const data = await response.json();
          setUsernameStatus(data.available ? 'available' : 'taken');
        } catch (err) {
          console.error("Username check failed:", err);
          setUsernameStatus('idle'); // Reset on error
        }
      };
      checkUsername();
    } else if (debouncedUsername && !isUsernameFormatValid) {
        setUsernameStatus('invalid_format');
    } else {
      setUsernameStatus('idle'); // Reset if input is cleared or invalid format
    }
  }, [debouncedUsername, isUsernameFormatValid]);
  // --- End Username Check Effect ---

  // --- Effect for Debounced Email Check ---
  useEffect(() => {
    // Only check if format is valid and email has changed (debounced)
    if (debouncedEmail && isEmailFormatValid) {
      const checkEmail = async () => {
        setEmailStatus('checking');
        try {
          const response = await fetch('/api/auth/check-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: 'email', value: debouncedEmail })
          });
          const data = await response.json();
          setEmailStatus(data.available ? 'available' : 'taken');
        } catch (err) {
          console.error("Email check failed:", err);
          setEmailStatus('idle'); // Reset on error
        }
      };
      checkEmail();
    } else if (debouncedEmail && !isEmailFormatValid) {
        setEmailStatus('invalid_format');
    } else {
        setEmailStatus('idle');
    }
  }, [debouncedEmail, isEmailFormatValid]);
  // --- End Email Check Effect ---

  // Helper to render status indicators
  const renderStatusIndicator = (status) => {
    switch (status) {
      case 'checking':
        return <Loader2 size={16} className="animate-spin text-gray-500" />;
      case 'available':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'taken':
        return <XCircle size={16} className="text-red-500" />;
      case 'invalid_format':
         return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Final validation before submitting
    if (!formData.name) {
        setError('Name is required.');
        return;
    }
    if (!formData.username || !isUsernameFormatValid || usernameStatus === 'taken' || usernameStatus === 'checking') {
        setError(usernameStatus === 'taken' ? 'Username is already taken.' : 'Please provide a valid, available username.');
        setFocusedField('username');
        return;
    }
    if (!formData.email || !isEmailFormatValid || emailStatus === 'taken' || emailStatus === 'checking') {
        setError(emailStatus === 'taken' ? 'Email is already registered.' : 'Please provide a valid, available email address.');
        setFocusedField('email');
        return;
    }
    if (!formData.password || !isPasswordValid) {
        setError('Please provide a valid password that meets all criteria.');
        setFocusedField('password');
        return;
    }

    setLoading(true);
    try {
      const result = await signup(
        formData.name,
        formData.email,
        formData.username,
        formData.password
      );
      
      if (result.success) {
        console.log("Signup successful, waiting for redirect...");
      } else {
        setError(result.error || 'Failed to create account');
      }
    } catch (err) {
      setError('An unexpected error occurred during submission.');
      console.error('Signup submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-theme(space.32))] flex items-center justify-center px-4">
      <div className={`w-full max-w-md p-8 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Create your account
        </h1>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (No specific validation indicators needed) */}
          <div>
            <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => handleFocus('name')} 
              onBlur={handleBlur}
              required
              className={`w-full p-3 border rounded-lg ${ isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300' } focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
              placeholder="Your name"
            />
          </div>

          {/* Username Field with Indicator */}
          <div>
            <label htmlFor="username" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => handleFocus('username')}
                onBlur={handleBlur}
                required
                minLength="3"
                pattern="^[a-zA-Z0-9]+$"
                title="Username must be at least 3 characters long and contain only letters and numbers."
                className={`w-full p-3 border rounded-lg ${ isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300' } focus:ring-2 focus:ring-cyan-500 focus:border-transparent pr-10`}
                placeholder="Choose a username"
                aria-describedby="username-status"
              />
              <div id="username-status" className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {renderStatusIndicator(usernameStatus)}
              </div>
            </div>
            <ValidationIndicator 
              rules={usernameFormatRules} 
              show={focusedField === 'username' && formData.username.length > 0 && usernameStatus !== 'checking'} // Show format rules when focused/typed, hide during check
              isDarkMode={isDarkMode} 
            />
            {usernameStatus === 'taken' && formData.username.length > 0 && (
                <p className="text-xs text-red-500 mt-1">This username is already taken.</p>
            )}
          </div>

          {/* Email Field with Indicator */}
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                required
                className={`w-full p-3 border rounded-lg ${ isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300' } focus:ring-2 focus:ring-cyan-500 focus:border-transparent pr-10`}
                placeholder="you@example.com"
                aria-describedby="email-status"
              />
              <div id="email-status" className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {renderStatusIndicator(emailStatus)}
              </div>
            </div>
            <ValidationIndicator 
              rules={emailFormatRules} 
              show={focusedField === 'email' && formData.email.length > 0 && emailStatus !== 'checking'} 
              isDarkMode={isDarkMode} 
            />
            {emailStatus === 'taken' && formData.email.length > 0 && (
                <p className="text-xs text-red-500 mt-1">This email is already registered.</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
              required
              minLength={6}
              className={`w-full p-3 border rounded-lg ${ isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300' } focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
              placeholder="Minimum 6 characters"
            />
            <ValidationIndicator 
              rules={passwordValidationRules} 
              show={focusedField === 'password' && formData.password.length > 0}
              isDarkMode={isDarkMode} 
            />
          </div>

          <button
            type="submit"
            disabled={loading || usernameStatus === 'checking' || emailStatus === 'checking' || usernameStatus === 'taken' || emailStatus === 'taken'}
            className={`w-full py-3 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${ loading ? 'opacity-70 cursor-not-allowed' : '' }`}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-600 hover:text-cyan-500 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 