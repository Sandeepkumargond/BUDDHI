"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { showToast } from "@/lib/toast";

export default function ChangePasswordPage() {
  const { role, isAuthenticated } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !role) {
      showToast.error("Please log in to change your password.");
      return;
    }
    if (!currentPassword || !newPassword) {
      showToast.error("Both current and new passwords are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      showToast.error("New password must be at least 8 characters.");
      return;
    }
    try {
      setLoading(true);
      await apiService.changePassword(role, { currentPassword, newPassword });
      showToast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showToast.error(error?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">Change Password</h1>
        <p className="text-sm text-gray-600 mb-6">Update your account password using your current password.</p>

        {!isAuthenticated ? (
          <div className="text-sm text-red-600">You need to be logged in to change your password.</div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-3">
              <p><strong>Note:</strong> You must enter your current password. New password should be at least 8 characters.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
