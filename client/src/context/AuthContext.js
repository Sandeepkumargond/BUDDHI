"use client";
import { createContext, useContext, useState, useEffect } from 'react';
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
    const bootstrap = async () => {
      const savedRole = localStorage.getItem('userRole');
      if (!savedRole) {
        setLoading(false);
        return;
      }

      try {
        // Try to refresh access token using refresh cookie
        const refreshRes = await apiService.refreshAccessToken(savedRole);
        const tokens = refreshRes?.data || {};

        setRole(savedRole);

        // Try to get user id from access token and fetch user by id
        const accessToken = tokens.accessToken;
        const decoded = accessToken ? decodeJwt(accessToken) : null;
        const userId = decoded?._id;
        if (userId) {
          try {
            const profileRes = await apiService.getById(savedRole, userId);
            const userData = profileRes.data?.user || profileRes.data?.superAdmin || profileRes.data?.admin || profileRes.data?.subAdmin || profileRes.data?.student || profileRes.data?.faculty || profileRes.data;
            if (userData) setUser(userData);
          } catch (e) {
            // If fetching by id fails, still keep user null but stay authenticated
            console.warn('Profile fetch by id failed:', e?.message || e);
          }
        }

        // Mark authenticated after attempting to fetch user
        setIsAuthenticated(true);
      } catch (err) {
        // Refresh failed; clear auth
        console.error('Session bootstrap refresh failed:', err);
        localStorage.removeItem('userRole');
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedRole = localStorage.getItem('userRole');
      if (savedRole) {
        console.log('Checking auth status for role:', savedRole);
        const profileData = await apiService.getProfile(savedRole);
        console.log('Profile data received:', profileData);
        
        const userData = profileData.data?.user || profileData.data?.superAdmin || profileData.data?.admin || profileData.data?.subAdmin || profileData.data?.student || profileData.data?.faculty;
        
        if (userData) {
          setUser(userData);
          setRole(savedRole);
          setIsAuthenticated(true);
        } else {
          throw new Error('No user data found in response');
        }
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      // User not authenticated or token expired
      localStorage.removeItem('userRole');
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (selectedRole, credentials) => {
    try {
      setLoading(true);
      
      const response = await apiService.login(selectedRole, credentials);
      
      if (response.success) {
        const userData = response.data.user || response.data.superAdmin || response.data.admin || response.data.subAdmin || response.data.student || response.data.faculty;
        
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