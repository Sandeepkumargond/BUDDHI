"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { toast } from "react-toastify";
import { FaBriefcase, FaHandshake, FaDonate, FaUser, FaBuilding } from "react-icons/fa";

export default function AlumniDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiService.getAlumniProfile();
      if (response.success) {
        setProfile(response.data.user);
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const alumniData = profile || user;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {alumniData?.firstName} {alumniData?.lastName}!
        </h1>
        <p className="text-lg opacity-90">
          {alumniData?.currentCompany ? `${alumniData.currentDesignation} at ${alumniData.currentCompany}` : "Alumni Portal"}
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <div>
            <span className="opacity-80">Batch:</span> <span className="font-semibold">{alumniData?.batch}</span>
          </div>
          <div>
            <span className="opacity-80">Department:</span> <span className="font-semibold">{alumniData?.department}</span>
          </div>
          <div>
            <span className="opacity-80">Graduation:</span> <span className="font-semibold">{alumniData?.graduationYear}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <FaBriefcase className="text-2xl text-blue-600 dark:text-blue-300" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Internships</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
            {alumniData?.internshipOpportunities?.length || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Posted</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <FaHandshake className="text-2xl text-green-600 dark:text-green-300" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Referrals</h3>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-300">
            {alumniData?.referrals?.length || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Offered</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <FaDonate className="text-2xl text-purple-600 dark:text-purple-300" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Donations</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">
            {alumniData?.donations?.length || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Made</p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <FaUser className="text-2xl text-yellow-600 dark:text-yellow-300" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Status</h3>
          </div>
          <p className="text-lg font-bold text-yellow-600 dark:text-yellow-300">
            {alumniData?.isVerified ? "Verified" : "Pending"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {alumniData?.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/alumni/internships"
            className="flex items-center gap-3 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <FaBriefcase className="text-2xl text-blue-600 dark:text-blue-300" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Post Internship</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Help students with opportunities</p>
            </div>
          </a>

          <a
            href="/alumni/referrals"
            className="flex items-center gap-3 p-4 bg-green-100 dark:bg-green-900 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            <FaHandshake className="text-2xl text-green-600 dark:text-green-300" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Offer Referral</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Refer students to your company</p>
            </div>
          </a>

          <a
            href="/alumni/donations"
            className="flex items-center gap-3 p-4 bg-purple-100 dark:bg-purple-900 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
          >
            <FaDonate className="text-2xl text-purple-600 dark:text-purple-300" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Make Donation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Support your alma mater</p>
            </div>
          </a>
        </div>
      </div>

      {/* Contributions Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Internships</h2>
            <a href="/alumni/internships" className="text-sm text-blue-600 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {(alumniData?.internshipOpportunities || []).slice(0, 3).map((item) => (
              <div key={item._id} className="border dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{item.position}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.companyName}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {item.location && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{item.location}</p>
                )}
              </div>
            ))}
            {(alumniData?.internshipOpportunities || []).length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">No internships posted yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Referrals</h2>
            <a href="/alumni/referrals" className="text-sm text-blue-600 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {(alumniData?.referrals || []).slice(0, 3).map((item) => (
              <div key={item._id} className="border dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{item.position}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.companyName}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 capitalize">{item.referralType}</span>
                </div>
                {item.contactEmail && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Contact: {item.contactEmail}</p>
                )}
              </div>
            ))}
            {(alumniData?.referrals || []).length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">No referrals offered yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Donations</h2>
            <a href="/alumni/donations" className="text-sm text-blue-600 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {(alumniData?.donations || []).slice(0, 3).map((item) => (
              <div key={item._id} className="border dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">₹{item.amount?.toLocaleString?.() || item.amount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{item.purpose}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${item.status === "completed" ? "bg-green-100 text-green-700" : item.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-700"}`}>
                    {(item.status || "pending").toUpperCase()}
                  </span>
                </div>
                {item.transactionId && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Txn: {item.transactionId}</p>
                )}
              </div>
            ))}
            {(alumniData?.donations || []).length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">No donations recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Profile Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600 dark:text-gray-400">Email:</span> {alumniData?.email}</p>
              <p><span className="text-gray-600 dark:text-gray-400">Mobile:</span> {alumniData?.mobile || "Not provided"}</p>
              {alumniData?.linkedinUrl && (
                <p>
                  <span className="text-gray-600 dark:text-gray-400">LinkedIn:</span>{" "}
                  <a href={alumniData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                    View Profile
                  </a>
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Academic Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600 dark:text-gray-400">Department:</span> {alumniData?.department}</p>
              <p><span className="text-gray-600 dark:text-gray-400">Degree:</span> {alumniData?.degree}</p>
              <p><span className="text-gray-600 dark:text-gray-400">Batch:</span> {alumniData?.batch}</p>
              <p><span className="text-gray-600 dark:text-gray-400">Graduation Year:</span> {alumniData?.graduationYear}</p>
            </div>
          </div>

          {alumniData?.currentCompany && (
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Professional Information</h3>
              <div className="flex items-start gap-3">
                <FaBuilding className="text-xl text-gray-400 mt-1" />
                <div className="text-sm">
                  <p className="font-medium">{alumniData.currentDesignation || "Professional"}</p>
                  <p className="text-gray-600 dark:text-gray-400">{alumniData.currentCompany}</p>
                  {alumniData?.industry && (
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Industry: {alumniData.industry}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <a
            href="/alumni/profile"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </a>
        </div>
      </div>
    </div>
  );
}
