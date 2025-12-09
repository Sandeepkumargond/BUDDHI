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
      const savedRole = localStorage.getItem('userRole');
      
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
        // Check if it's a session expired error
        const errorMsg = refreshErr?.message || '';
        if (errorMsg.includes('Session expired') || errorMsg.includes('Session invalid') || errorMsg.includes('Refresh Token')) {
          console.log('[Auth] Session expired - user needs to log in again');
          // Clear everything immediately for expired sessions
          localStorage.removeItem('userRole');
          setUser(null);
          setRole(null);
          setIsAuthenticated(false);
          setLoading(false);
          return; // Exit early, no need to try fallback
        }
        console.warn('[Auth] Token refresh failed:', refreshErr?.message);
        // Don't clear auth yet - try the fallback for other errors
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
          console.error('[Auth] Direct profile fetch also failed:', profileErr?.message);
        }
      }

      // Set authentication state based on whether at least one strategy worked
      if (authSuccess) {
        setIsAuthenticated(true);
      } else {
        // Both strategies failed - clear authentication
        console.error('[Auth] All restoration strategies failed - clearing session');
        localStorage.removeItem('userRole');
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
      const savedRole = localStorage.getItem('userRole');
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
      
      // Only clear auth if it's actually an authentication error (401, 403, or session expired)
      const isAuthError = error?.status === 401 || 
                         error?.status === 403 || 
                         error?.message?.includes('Session expired') ||
                         error?.message?.includes('Session invalid') ||
                         error?.message?.includes('Unauthorized') ||
                         error?.message?.includes('Token');
      
      if (isAuthError) {
        console.log('Authentication error detected - clearing session');
        localStorage.removeItem('userRole');
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
      } else {
        // For other errors, keep the user logged in
        console.warn('Non-auth error in checkAuthStatus - keeping user logged in');
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
          localStorage.setItem('userRole', selectedRole);
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
      localStorage.removeItem('userRole');
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