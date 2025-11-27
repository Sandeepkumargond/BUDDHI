"use client";
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/ProfileForm';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import { showToast } from '@/lib/toast';

const StudentProfile = () => {
  const { user: authUser, role, isAuthenticated, updateUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    } else if (isAuthenticated && role === 'student') {
      fetchProfile();
    }
  }, [authUser, isAuthenticated, role]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfile('student');
      const userData = response.data?.student || response.data?.user;
      setUser(userData);
      updateUser(userData); // Update AuthContext
    } catch (err) {
      console.error('Failed to fetch student profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      // First update account details
      const accountData = {};
      for (let [key, value] of formData.entries()) {
        if (key !== 'image') {
          accountData[key] = value;
        }
      }

      await apiService.request('/student/update-account', {
        method: 'PATCH',
        body: accountData,
      });

      // Update image if provided
      if (formData.get('image')) {
        const imageData = new FormData();
        imageData.append('image', formData.get('image'));

        await apiService.request('/student/update-image', {
          method: 'PATCH',
          body: imageData,
          headers: {}, // Remove Content-Type to let browser set it for FormData
        });
      }

      // Update signature if provided
      if (formData.get('sign')) {
        const signData = new FormData();
        signData.append('sign', formData.get('sign'));

        await apiService.request('/student/update-sign', {
          method: 'PATCH',
          body: signData,
          headers: {},
        });
      }

      // Refresh profile data
      await fetchProfile();
      showToast.success('Profile updated successfully!');
    } catch (err) {
      showToast.error('Error updating profile: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-2">Error loading profile</p>
          <p>{error}</p>
          <button 
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get BUDDHI score and status
  const buddhiScore = user?.buddhiScore || 50;
  
  const getStatusText = (score) => {
    if (score < 40) return "At-Risk";
    if (score < 60) return "On the Verge";
    return "Normal";
  };

  const getStatusColor = (score) => {
    if (score < 40) return { bg: 'bg-red-500', text: 'text-white' };
    if (score < 60) return { bg: 'bg-yellow-500', text: 'text-white' };
    return { bg: 'bg-green-500', text: 'text-white' };
  };

  const statusColor = getStatusColor(buddhiScore);

  return (
    <div className="p-4 space-y-6">
      {/* BUDDHI Status Badge */}
      <div className="flex items-center gap-3">
        <span className="text-gray-700 font-medium">BUDDHI Status:</span>
        <span className={`px-4 py-2 rounded-lg font-semibold ${statusColor.bg} ${statusColor.text}`}>
          {getStatusText(buddhiScore)}
        </span>
      </div>

      {/* Profile Form */}
      <ProfileForm 
        user={user} 
        onSave={handleSave} 
        userType="student"
      />
    </div>
  );
};

export default StudentProfile;