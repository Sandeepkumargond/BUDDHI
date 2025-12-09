"use client";
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Safe localStorage wrapper to prevent errors
const safeLocalStorage = {
  getItem: (key) => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    } catch (e) {
      console.warn('localStorage.getItem failed:', e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('localStorage.setItem failed:', e);
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('localStorage.removeItem failed:', e);
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const bootstrapAttempted = useRef(false);

  // Lightweight JWT decoder (no verification, just payload parse)
  const decodeJwt = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    // Only run bootstrap once per app load
    if (bootstrapAttempted.current) return;
    bootstrapAttempted.current = true;

    const bootstrap = async () => {
      const savedRole = safeLocalStorage.getItem('userRole');
      
      // If no saved role, user is not authenticated
      if (!savedRole) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      setRole(savedRole);
      let authSuccess = false;

      // Strategy 1: Try to refresh token first (most reliable)
      try {
        console.log('[Auth] Attempting token refresh for role:', savedRole);
        const refreshRes = await apiService.refreshAccessToken(savedRole);
        const tokens = refreshRes?.data || {};

        if (tokens.accessToken) {
          // Token refresh succeeded, now fetch user profile
          try {
            const profileRes = await apiService.getProfile(savedRole);
            const userData = 
              profileRes.data?.user || 
              profileRes.data?.superAdmin || 
              profileRes.data?.admin || 
              profileRes.data?.subAdmin || 
              profileRes.data?.student || 
              profileRes.data?.faculty || 
              profileRes.data?.alumni;
            
            if (userData) {
              setUser(userData);
              console.log('[Auth] Session restored successfully');
              authSuccess = true;
            } else {
              console.warn('[Auth] Profile returned no user data');
            }
          } catch (profileErr) {
            console.warn('[Auth] Profile fetch failed, but session may still be valid:', profileErr?.message);
            // Don't fail here - the refresh succeeded, so user is authenticated
            authSuccess = true;
          }
        }
      } catch (refreshErr) {
        // Check if it's a DEFINITE session expired error
        const errorMsg = (refreshErr?.message || '').toLowerCase();
        const isDefiniteSessionError = 
          errorMsg.includes('session expired') || 
          errorMsg.includes('session invalid') || 
          errorMsg.includes('refresh token is expired') ||
          errorMsg.includes('refresh token is used') ||
          errorMsg.includes('invalid refresh token') ||
          refreshErr?.status === 401;
        
        if (isDefiniteSessionError) {
          console.log('[Auth] Session definitely expired - user needs to log in again');
          // Clear everything immediately for expired sessions
          safeLocalStorage.removeItem('userRole');
          setUser(null);
          setRole(null);
          setIsAuthenticated(false);
          setLoading(false);
          return; // Exit early, no need to try fallback
        }
        console.warn('[Auth] Token refresh failed (non-auth error):', refreshErr?.message);
        // Don't clear auth for network errors or server errors - try the fallback
      }

      // Strategy 2: If refresh failed, try direct profile call
      if (!authSuccess) {
        try {
          console.log('[Auth] Attempting direct profile fetch (fallback)');
          const profileRes = await apiService.getProfile(savedRole);
          const userData = 
            profileRes.data?.user || 
            profileRes.data?.superAdmin || 
            profileRes.data?.admin || 
            profileRes.data?.subAdmin || 
            profileRes.data?.student || 
            profileRes.data?.faculty || 
            profileRes.data?.alumni;
          
          if (userData) {
            setUser(userData);
            console.log('[Auth] Session restored via profile endpoint');
            authSuccess = true;
          }
        } catch (profileErr) {
          const errorMsg = (profileErr?.message || '').toLowerCase();
          const isDefiniteAuthError = 
            profileErr?.status === 401 || 
            profileErr?.status === 403 ||
            errorMsg.includes('session expired') ||
            errorMsg.includes('unauthorized') ||
            errorMsg.includes('not authenticated');
          
          if (isDefiniteAuthError) {
            console.error('[Auth] Profile fetch failed with auth error:', profileErr?.message);
          } else {
            console.warn('[Auth] Profile fetch failed with non-auth error (keeping session):', profileErr?.message);
            // For network/server errors, assume session is still valid
            authSuccess = true;
          }
        }
      }

      // Set authentication state based on whether at least one strategy worked
      if (authSuccess) {
        setIsAuthenticated(true);
      } else {
        // Both strategies failed with definite auth errors - clear authentication
        console.error('[Auth] All restoration strategies failed with auth errors - clearing session');
        safeLocalStorage.removeItem('userRole');
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    bootstrap();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedRole = safeLocalStorage.getItem('userRole');
      if (!savedRole) {
        setIsAuthenticated(false);
        return;
      }
      
      console.log('Checking auth status for role:', savedRole);
      const profileData = await apiService.getProfile(savedRole);
      console.log('Profile data received:', profileData);
      
      const userData = profileData.data?.user || profileData.data?.superAdmin || profileData.data?.admin || profileData.data?.subAdmin || profileData.data?.student || profileData.data?.faculty || profileData.data?.alumni;
      
      if (userData) {
        setUser(userData);
        setRole(savedRole);
        setIsAuthenticated(true);
      } else {
        throw new Error('No user data found in response');
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      
      // Only clear auth if it's a DEFINITE authentication error
      const errorMsg = error?.message?.toLowerCase() || '';
      const isDefiniteAuthError = 
        error?.status === 401 || 
        error?.status === 403 || 
        errorMsg.includes('session expired') ||
        errorMsg.includes('session invalid') ||
        errorMsg.includes('unauthorized') ||
        errorMsg.includes('not authenticated') ||
        errorMsg.includes('invalid token') ||
        errorMsg.includes('token expired') ||
        errorMsg.includes('refresh token');
      
      if (isDefiniteAuthError) {
        console.log('Definite authentication error detected - clearing session');
        safeLocalStorage.removeItem('userRole');
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
      } else {
        // For network errors, server errors, or other issues - keep the user logged in
        console.warn('Non-auth error in checkAuthStatus - keeping user logged in:', error?.message);
        // Don't change the authentication state for transient errors
      }
    }
  };

  const login = async (selectedRole, credentials) => {
    try {
      setLoading(true);
      
      const response = await apiService.login(selectedRole, credentials);
      
      if (response.success) {
        const userData = response.data.user || response.data.superAdmin || response.data.admin || response.data.subAdmin || response.data.student || response.data.faculty || response.data.alumni;
        
        if (userData) {
          setUser(userData);
          setRole(selectedRole);
          setIsAuthenticated(true);
          safeLocalStorage.setItem('userRole', selectedRole);
          return { success: true, user: userData };
        } else {
          console.error('No user data in successful response:', response);
          return { success: false, error: 'No user data received' };
        }
      } else {
        console.error('Login failed - response not successful:', response);
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login failed with error:', error);
      return { success: false, error: error.message || 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (role) {
        await apiService.logout(role);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
      safeLocalStorage.removeItem('userRole');
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  const value = {
    user,
    role,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};