'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { login, isAuthenticated, loading, error: authError, clearError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/holidays');
    }
  }, [isAuthenticated, loading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (authError) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    if (!formData.email || !formData.password) {
      console.warn("Client-side validation: Email/Password required.");
      return;
    }
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      console.log("Login successful, waiting for redirect...");
    }
  };

  return (
    <div className="min-h-[calc(100vh-theme(space.32))] flex items-center justify-center px-4">
      <div className={`w-full max-w-md p-8 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Sign in to your account
        </h1>

        {authError && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6 text-sm">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
              placeholder="you@example.com"
            />
          </div>

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
              required
              className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-opacity ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Don't have an account?{' '}
            <Link href="/signup" className="text-cyan-600 hover:text-cyan-500 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 