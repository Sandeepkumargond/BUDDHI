"use client";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProfileForm from "@/components/ProfileForm";
import { showToast } from "@/lib/toast";

export default function AlumniProfilePage() {
  const { role, isAuthenticated, loading: authLoading, user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setError(null);
      setLoading(true);
      try {
        const activeRole = role || localStorage.getItem("userRole");
        if (activeRole !== "alumni") {
          throw new Error("Please log in as alumni to view profile.");
        }
        const res = await apiService.getAlumniProfile();
        const data = res?.data?.alumni || res?.data?.user || res?.data;
        setUser(data);
        updateUser?.(data);
      } catch (e) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (authUser) setUser(authUser);
      else fetchProfile();
    }
  }, [authLoading, role, authUser, updateUser]);

  const handleSave = async (formData) => {
    try {
      setLoading(true);

      // Backend does not parse multipart here; send JSON only
      const accountData = {};
      for (let [key, value] of formData.entries()) {
        if (key !== 'image') accountData[key] = value;
      }
      await apiService.updateAlumniProfile(accountData);

      // Refresh
      const res = await apiService.getAlumniProfile();
      const data = res?.data?.alumni || res?.data?.user || res?.data;
      setUser(data);
      updateUser?.(data);
      showToast?.success?.('Profile updated successfully!');
    } catch (err) {
      showToast?.error?.('Error updating profile: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (role && role !== 'alumni')) {
    return (
      <div className="p-4 text-red-600">You are not authenticated as alumni. Please log in.</div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <ProfileForm user={user} onSave={handleSave} userType="alumni" />
    </div>
  );
}
