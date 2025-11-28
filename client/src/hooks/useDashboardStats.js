"use client";
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api';

export const useDashboardStats = (refreshInterval = 30000) => {
  const [data, setData] = useState({
    stats: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchStats = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiService.getDashboardStats();
      
      setData({
        stats: response.data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      
      // Provide fallback data if API fails
      const fallbackStats = {
        student: 0,
        faculty: 0,
        subAdmin: 0,
        admin: 0,
        staff: 0,
        studentGender: {
          male: 0,
          female: 0,
          total: 0
        },
        studentDistribution: {
          semester: [],
          branch: []
        }
      };
      
      setData({
        stats: fallbackStats,
        loading: false,
        error: error.message || 'Failed to fetch dashboard statistics',
        lastUpdated: new Date()
      });
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Set up auto-refresh if interval is provided
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, refreshInterval]);

  return {
    ...data,
    refetch: fetchStats,
    // Convenience getters for common stats
    get studentCount() {
      return this.stats?.student || 0;
    },
    get facultyCount() {
      return this.stats?.faculty || 0;
    },
    get maleStudentCount() {
      return this.stats?.studentGender?.male || 0;
    },
    get femaleStudentCount() {
      return this.stats?.studentGender?.female || 0;
    },
    get totalStudentCount() {
      return this.stats?.studentGender?.total || 0;
    }
  };
};