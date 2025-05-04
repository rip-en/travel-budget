'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import { useRouter } from 'next/navigation';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * Provides authentication state (user, loading, isAuthenticated) and functions
 * (login, signup, logout) using JWT stored in httpOnly cookies.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Holds user data {id, name, email, username, ...} or null
  const [loading, setLoading] = useState(true); // True during initial check, login, signup
  const [authError, setAuthError] = useState(null); // Stores login/signup errors
  const router = useRouter();

  // Function to fetch user data based on cookie
  const fetchUser = useCallback(async () => {
    // Don't reset loading to true here, initial load handles it
    setAuthError(null);
    try {
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        console.log("AuthContext: User fetched successfully", userData.id);
      } else {
        // If /api/user/me fails (401, 404, 500), treat as logged out
        setUser(null);
        if (response.status !== 401) { // Don't log expected 401s too loudly
            console.log(`AuthContext: Failed to fetch user, status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('AuthContext: Error fetching user:', error);
      setUser(null);
    } finally {
       // Only set loading to false after the *initial* fetch completes
       // Subsequent fetches (after login/signup) don't need to manage this global loading state
       if (loading) { 
           setLoading(false); 
       }
    }
  }, [loading]); // Dependency includes loading to manage initial state

  // Initial fetch on component mount
  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Login function
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success - set user state immediately from login response
      setUser(data.user);
      // No need to call fetchUser here as login response is complete
      setLoading(false);
      return { success: true };

    } catch (error) {
      console.error('AuthContext: Login error:', error);
      setAuthError(error.message);
      setUser(null);
      setLoading(false);
      return { success: false, error: error.message };
    } 
  }, []);

  // Signup function
  const signup = useCallback(async (name, email, username, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      // 1. Call Signup API
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, username, password }),
      });
      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.error || 'Failed to create account');
      }

      // 2. Signup successful, now automatically log in
      console.log("AuthContext: Signup successful, attempting auto-login...");
      const loginResult = await login(email, password); // Use the login function
      
      // login function handles setting user and loading state
      return loginResult; // Return the result of the login attempt

    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      setAuthError(error.message);
      setUser(null); // Ensure user is null on signup failure
      setLoading(false);
      return { success: false, error: error.message };
    }
  }, [login]); // Depends on the login function

  // Logout function
  const logout = useCallback(async () => {
    setAuthError(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' }); // Call the logout API
    } catch (error) {
      console.error("AuthContext: Logout API call failed:", error);
      // Proceed with local logout anyway
    } finally {
      setUser(null); // Clear user state
      console.log("AuthContext: User logged out.");
    }
  }, []);

  // Memoize context value
  const value = useMemo(() => ({
    user,
    loading,
    error: authError,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    fetchUser, // Expose fetchUser if manual refresh is needed elsewhere
    clearError: () => setAuthError(null) // Function to clear errors
  }), [user, loading, authError, login, signup, logout, fetchUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 