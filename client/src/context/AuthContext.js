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

  useEffect(() => {
    // For now, just check if we have a saved role without fetching profile
    // This prevents the ObjectId error on startup
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setRole(savedRole);
      // Don't automatically fetch profile - wait for explicit login
    }
    setLoading(false);
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
      console.log('Attempting login with role:', selectedRole, 'credentials:', credentials);
      
      const response = await apiService.login(selectedRole, credentials);
      console.log('Login response:', response);
      
      if (response.success) {
        const userData = response.data.user || response.data.superAdmin || response.data.admin || response.data.subAdmin || response.data.student || response.data.faculty;
        console.log('User data received:', userData);
        
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

  const value = {
    user,
    role,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};