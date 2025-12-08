"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaEye, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function AlumniManagementPage() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [donationStats, setDonationStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [approvalTab, setApprovalTab] = useState("internships");

  // Filters
  const [filters, setFilters] = useState({
    department: "",
    graduationYear: "",
    isVerified: "",
    isActive: "",
    search: "",
    page: 1,
    limit: 20,
  });

  // Form state for new alumni registration
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    mobile: "",
    alternateEmail: "",
    department: "",
    degree: "",
    batch: "",
    graduationYear: "",
    rollNumber: "",
    currentCompany: "",
    currentDesignation: "",
    industry: "",
    linkedinUrl: "",
  });

  useEffect(() => {
    fetchAlumni();
    fetchDonationStats();
    fetchDepartments();
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getAllDepartments();
      if (response.success) {
        setDepartments(response.data.departments || []);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await apiService.listAllAlumni(filters);
      if (response.success) {
        setAlumni(response.data.alumni);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch alumni");
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationStats = async () => {
    try {
      const response = await apiService.getDonationStats();
      if (response.success) {
        setDonationStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch donation stats:", error);
    }
  };

  const handleRegisterAlumni = async (e) => {
    e.preventDefault();
    try {
      // Auto-generate alumni ID: ALM + graduationYear + random 4 digits
      const alumniId = `ALM${formData.graduationYear}${Math.floor(1000 + Math.random() * 9000)}`;
      const dataToSend = { ...formData, alumniId };
      
      const response = await apiService.registerAlumni(dataToSend);
      if (response.success) {
        toast.success("Alumni registered successfully");
        setShowRegisterForm(false);
        resetForm();
        fetchAlumni();
      }
    } catch (error) {
      toast.error(error.message || "Failed to register alumni");
    }
  };

  const handleVerifyAlumni = async (alumniId, currentStatus) => {
    try {
      const response = await apiService.updateAlumniStatus(alumniId, {
        isVerified: !currentStatus,
      });
      if (response.success) {
        toast.success(`Alumni ${!currentStatus ? "verified" : "unverified"} successfully`);
        fetchAlumni();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update alumni status");
    }
  };

  const handleToggleActive = async (alumniId, currentStatus) => {
    try {
      const response = await apiService.updateAlumniStatus(alumniId, {
        isActive: !currentStatus,
      });
      if (response.success) {
        toast.success(`Alumni ${!currentStatus ? "activated" : "deactivated"} successfully`);
        fetchAlumni();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update alumni status");
    }
  };

  const handleViewDetails = async (alumniId) => {
    try {
      const response = await apiService.getAlumniById(alumniId);
      if (response.success) {
        setSelectedAlumni(response.data.alumni);
        setShowDetailsModal(true);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch alumni details");
    }
  };

  const handleDeleteAlumni = async (alumniId) => {
    if (!confirm("Are you sure you want to delete this alumni?")) return;
    try {
      const response = await apiService.deleteAlumniById(alumniId);
      if (response.success) {
        toast.success("Alumni deleted successfully");
        fetchAlumni();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete alumni");
    }
  };

  const handleApproveInternship = async (alumniId, internshipId, isApproved) => {
    try {
      const response = await apiService.approveInternship(alumniId, internshipId, isApproved);
      if (response.success) {
        toast.success(`Internship ${isApproved ? "approved" : "marked pending"}`);
        handleViewDetails(alumniId);
        fetchAlumni();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update internship approval");
    }
  };

  const handleApproveReferral = async (alumniId, referralId, isApproved) => {
    try {
      const response = await apiService.approveReferral(alumniId, referralId, isApproved);
      if (response.success) {
        toast.success(`Referral ${isApproved ? "approved" : "marked pending"}`);
        handleViewDetails(alumniId);
        fetchAlumni();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update referral approval");
    }
  };

  const pendingInternships = alumni.flatMap((al) =>
    (al.internshipOpportunities || []).map((intern) => ({ ...intern, alumniName: `${al.firstName} ${al.lastName}`, alumniId: al._id }))
  );

  const pendingReferrals = alumni.flatMap((al) =>
    (al.referrals || []).map((ref) => ({ ...ref, alumniName: `${al.firstName} ${al.lastName}`, alumniId: al._id }))
  );

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      dateOfBirth: "",
      gender: "",
      mobile: "",
      alternateEmail: "",
      department: "",
      degree: "",
      batch: "",
      graduationYear: "",
      rollNumber: "",
      currentCompany: "",
      currentDesignation: "",
      industry: "",
      linkedinUrl: "",
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alumni Management</h1>
        <button
          onClick={() => setShowRegisterForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FaPlus /> Register Alumni
        </button>
      </div>

      {/* Approval Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="flex border-b dark:border-gray-700">
          {[
            { key: "internships", label: "Internships" },
            { key: "referrals", label: "Referrals" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setApprovalTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                approvalTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 dark:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {approvalTab === "internships" && (
            pendingInternships.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">No internships available.</p>
            ) : (
              pendingInternships.map((intern) => (
                <div key={`${intern.alumniId}-${intern._id}`} className="border dark:border-gray-700 rounded p-4 flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{intern.position} at {intern.companyName}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{intern.alumniName}</div>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className={`px-2 py-1 rounded ${intern.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{intern.isActive ? "Active" : "Inactive"}</span>
                      <span className={`px-2 py-1 rounded ${intern.isApproved ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{intern.isApproved ? "Approved" : "Pending"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      onClick={() => handleApproveInternship(intern.alumniId, intern._id, !intern.isApproved)}
                    >
                      {intern.isApproved ? "Mark Pending" : "Approve"}
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {approvalTab === "referrals" && (
            pendingReferrals.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">No referrals available.</p>
            ) : (
              pendingReferrals.map((ref) => (
                <div key={`${ref.alumniId}-${ref._id}`} className="border dark:border-gray-700 rounded p-4 flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{ref.position} at {ref.companyName}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{ref.alumniName}</div>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className={`px-2 py-1 rounded capitalize bg-purple-100 text-purple-800`}>{ref.referralType}</span>
                      <span className={`px-2 py-1 rounded ${ref.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{ref.isActive ? "Active" : "Inactive"}</span>
                      <span className={`px-2 py-1 rounded ${ref.isApproved ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{ref.isApproved ? "Approved" : "Pending"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      onClick={() => handleApproveReferral(ref.alumniId, ref._id, !ref.isApproved)}
                    >
                      {ref.isApproved ? "Mark Pending" : "Approve"}
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Donation Statistics */}
      {donationStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Donations</h3>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
              ₹{donationStats.overall?.totalDonations?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Donation Count</h3>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {donationStats.overall?.donationCount || 0}
            </p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Donation</h3>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              ₹{Math.round(donationStats.overall?.avgDonation || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Highest Donation</h3>
            <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
              ₹{donationStats.overall?.maxDonation?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search (name, email, ID)..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            placeholder="Department"
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="number"
            placeholder="Graduation Year"
            value={filters.graduationYear}
            onChange={(e) => setFilters({ ...filters, graduationYear: e.target.value, page: 1 })}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={filters.isVerified}
            onChange={(e) => setFilters({ ...filters, isVerified: e.target.value, page: 1 })}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All (Verified)</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>
          <select
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value, page: 1 })}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All (Active)</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Alumni Table */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Alumni ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Department</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Batch</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Company</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alumni.map((alum) => (
                <tr key={alum._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-4 py-3 text-sm">{alum.alumniId}</td>
                  <td className="px-4 py-3 text-sm">{alum.firstName} {alum.lastName}</td>
                  <td className="px-4 py-3 text-sm">{alum.email}</td>
                  <td className="px-4 py-3 text-sm">{alum.department}</td>
                  <td className="px-4 py-3 text-sm">{alum.batch}</td>
                  <td className="px-4 py-3 text-sm">{alum.currentCompany || "N/A"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          alum.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {alum.isVerified ? "Verified" : "Pending"}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          alum.isActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {alum.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(alum._id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleVerifyAlumni(alum._id, alum.isVerified)}
                        className={`${alum.isVerified ? "text-yellow-600" : "text-green-600"} hover:opacity-80`}
                        title={alum.isVerified ? "Unverify" : "Verify"}
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        onClick={() => handleToggleActive(alum._id, alum.isActive)}
                        className={`${alum.isActive ? "text-red-600" : "text-green-600"} hover:opacity-80`}
                        title={alum.isActive ? "Deactivate" : "Activate"}
                      >
                        <FaTimesCircle />
                      </button>
                      <button
                        onClick={() => handleDeleteAlumni(alum._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Register Alumni Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Register New Alumni</h2>
            <form onSubmit={handleRegisterAlumni} className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Alumni ID will be auto-generated (Format: ALM + Graduation Year + 4 digits)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name *"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="password"
                  placeholder="Password *"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="tel"
                  placeholder="Mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="date"
                  placeholder="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Department *</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Degree *"
                  required
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <select
                  required
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Batch *</option>
                  {Array.from({ length: 2025 - 1980 + 1 }, (_, i) => 1980 + i).reverse().map((year) => (
                    <option key={year} value={`${year}-${year + 4}`}>
                      {year}-{year + 4}
                    </option>
                  ))}
                </select>
                <select
                  required
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Graduation Year *</option>
                  {Array.from({ length: 2030 - 1980 + 1 }, (_, i) => 1980 + i).reverse().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Roll Number"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Current Company"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Current Designation"
                  value={formData.currentDesignation}
                  onChange={(e) => setFormData({ ...formData, currentDesignation: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Register Alumni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alumni Details Modal */}
      {showDetailsModal && selectedAlumni && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alumni Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedAlumni.firstName} {selectedAlumni.lastName}</div>
                  <div><span className="font-medium">Alumni ID:</span> {selectedAlumni.alumniId}</div>
                  <div><span className="font-medium">Email:</span> {selectedAlumni.email}</div>
                  <div><span className="font-medium">Mobile:</span> {selectedAlumni.mobile || "N/A"}</div>
                  <div><span className="font-medium">Department:</span> {selectedAlumni.department}</div>
                  <div><span className="font-medium">Batch:</span> {selectedAlumni.batch}</div>
                  <div><span className="font-medium">Graduation Year:</span> {selectedAlumni.graduationYear}</div>
                  <div><span className="font-medium">Degree:</span> {selectedAlumni.degree}</div>
                </div>
              </div>

              {/* Professional Info */}
              {selectedAlumni.currentCompany && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Professional Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Company:</span> {selectedAlumni.currentCompany}</div>
                    <div><span className="font-medium">Designation:</span> {selectedAlumni.currentDesignation || "N/A"}</div>
                    <div><span className="font-medium">Industry:</span> {selectedAlumni.industry || "N/A"}</div>
                    {selectedAlumni.linkedinUrl && (
                      <div>
                        <span className="font-medium">LinkedIn:</span>{" "}
                        <a href={selectedAlumni.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                          View Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Internships */}
              {selectedAlumni.internshipOpportunities?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Internship Opportunities</h3>
                  <div className="space-y-2">
                    {selectedAlumni.internshipOpportunities.map((intern, idx) => (
                      <div key={idx} className="border dark:border-gray-700 p-3 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{intern.position} at {intern.companyName}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{intern.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {intern.location} | {intern.stipend ? `₹${intern.stipend}` : "Unpaid"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${intern.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {intern.isApproved ? "Approved" : "Pending"}
                            </span>
                            <button
                              className="text-sm px-2 py-1 bg-blue-600 text-white rounded"
                              onClick={() => handleApproveInternship(selectedAlumni._id, intern._id, !intern.isApproved)}
                            >
                              {intern.isApproved ? "Mark Pending" : "Approve"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referrals */}
              {selectedAlumni.referrals?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Referrals</h3>
                  <div className="space-y-2">
                    {selectedAlumni.referrals.map((ref, idx) => (
                      <div key={idx} className="border dark:border-gray-700 p-3 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{ref.position} at {ref.companyName}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{ref.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${ref.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {ref.isApproved ? "Approved" : "Pending"}
                            </span>
                            <button
                              className="text-sm px-2 py-1 bg-blue-600 text-white rounded"
                              onClick={() => handleApproveReferral(selectedAlumni._id, ref._id, !ref.isApproved)}
                            >
                              {ref.isApproved ? "Mark Pending" : "Approve"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Donations */}
              {selectedAlumni.donations?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Donations</h3>
                  <div className="space-y-2">
                    {selectedAlumni.donations.map((donation, idx) => (
                      <div key={idx} className="border dark:border-gray-700 p-3 rounded flex justify-between items-center">
                        <div>
                          <div className="font-medium">₹{donation.amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {donation.purpose} - {donation.status}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(donation.donatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
