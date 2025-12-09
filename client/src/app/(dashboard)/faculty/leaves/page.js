"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { toast } from "react-toastify";
import { FaPlus, FaFile } from "react-icons/fa";

export default function FacultyLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });

  const [formData, setFormData] = useState({
    leaveType: "sick",
    startDate: "",
    endDate: "",
    reason: "",
    proofDocument: null,
  });

  const leaveTypes = [
    { value: "sick", label: "Sick Leave" },
    { value: "casual", label: "Casual Leave" },
    { value: "emergency", label: "Emergency Leave" },
    { value: "personal", label: "Personal Leave" },
    { value: "academic", label: "Academic Leave" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchLeaves();
  }, [filters]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyLeavesFaculty(filters.status, filters.page, filters.limit);
      if (response.success) {
        setLeaves(response.data.leaves);
        setPagination({ total: response.data.total, page: response.data.page, limit: response.data.limit });
      }
    } catch (error) {
      toast.error("Failed to fetch leave applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("leaveType", formData.leaveType);
      form.append("startDate", formData.startDate);
      form.append("endDate", formData.endDate);
      form.append("reason", formData.reason);
      if (formData.proofDocument) {
        form.append("proofDocument", formData.proofDocument);
      }

      const response = await apiService.applyLeaveFaculty(form);
      if (response.success) {
        toast.success("Leave application submitted successfully");
        resetForm();
        fetchLeaves();
      }
    } catch (error) {
      toast.error(error.message || "Failed to apply for leave");
    }
  };

  const handleDelete = async (leaveId) => {
    if (!confirm("Are you sure you want to cancel this leave application?")) return;
    try {
      await apiService.cancelLeaveFaculty(leaveId);
      toast.success("Leave application cancelled");
      fetchLeaves();
    } catch (error) {
      toast.error(error.message || "Failed to cancel leave");
    }
  };

  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      leaveType: "sick",
      startDate: "",
      endDate: "",
      reason: "",
      proofDocument: null,
    });
    setShowForm(false);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Leave Applications</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FaPlus /> Apply for Leave
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No leave applications yet. Click "Apply for Leave" to submit one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {leaves.map((leave) => (
            <div key={leave._id} className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {leaveTypes.find(l => l.value === leave.leaveType)?.label || leave.leaveType}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusBadgeColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    <span className="ml-4 font-semibold">({leave.numberOfDays} days)</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{leave.reason}</p>
                  {leave.adminRemarks && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Admin Remarks:</span> {leave.adminRemarks}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(leave)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    View
                  </button>
                  {leave.status === "pending" && (
                    <button
                      onClick={() => handleDelete(leave._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">{filters.page} / {Math.ceil(pagination.total / pagination.limit)}</span>
          <button
            disabled={filters.page >= Math.ceil(pagination.total / pagination.limit)}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Apply Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Apply for Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Leave Type *
                  </label>
                  <select
                    required
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {leaveTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Reason *
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Provide details about your leave request"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Proof Document (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, proofDocument: e.target.files?.[0] })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {formData.proofDocument && <FaFile className="text-green-600" />}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Leave Details</h2>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Leave Type:</span>
                  <p className="text-gray-600 dark:text-gray-400">{leaveTypes.find(l => l.value === selectedLeave.leaveType)?.label}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  <p className={`${getStatusBadgeColor(selectedLeave.status)} px-2 py-1 rounded inline-block capitalize`}>
                    {selectedLeave.status}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Start Date:</span>
                  <p className="text-gray-600 dark:text-gray-400">{new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">End Date:</span>
                  <p className="text-gray-600 dark:text-gray-400">{new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Number of Days:</span>
                <p className="text-gray-600 dark:text-gray-400">{selectedLeave.numberOfDays}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Reason:</span>
                <p className="text-gray-600 dark:text-gray-400">{selectedLeave.reason}</p>
              </div>
              {selectedLeave.proofDocument && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Proof Document:</span>
                  <a href={selectedLeave.proofDocument} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Document
                  </a>
                </div>
              )}
              {selectedLeave.adminRemarks && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Admin Remarks:</span>
                  <p className="text-gray-600 dark:text-gray-400">{selectedLeave.adminRemarks}</p>
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
