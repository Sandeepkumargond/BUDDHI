"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { toast } from "react-toastify";

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    leaveId: "",
    status: "approved",
    adminRemarks: "",
  });
  const [statistics, setStatistics] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [filters, setFilters] = useState({
    status: "",
    applicantType: "",
    search: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });

  useEffect(() => {
    fetchLeaves();
  }, [filters]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllLeaves(
        filters.status,
        filters.applicantType,
        filters.search,
        filters.page,
        filters.limit
      );
      if (response.success) {
        setLeaves(response.data.leaves);
        setPagination({ total: response.data.total, page: response.data.page, limit: response.data.limit });
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      toast.error("Failed to fetch leave applications");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (leave, status = "approved") => {
    setReviewData({ leaveId: leave._id, status, adminRemarks: "" });
    setSelectedLeave(leave);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewData.status) {
      toast.error("Please select a status");
      return;
    }
    try {
      await apiService.reviewLeave(reviewData.leaveId, reviewData.status, reviewData.adminRemarks);
      toast.success(`Leave ${reviewData.status} successfully`);
      setShowReviewModal(false);
      fetchLeaves();
    } catch (error) {
      toast.error(error.message || "Failed to review leave");
    }
  };

  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setShowDetailsModal(true);
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Leave Management</h1>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Leaves</h3>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{statistics.total}</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</h3>
          <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{statistics.pending}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Approved</h3>
          <p className="text-2xl font-bold text-green-800 dark:text-green-200">{statistics.approved}</p>
        </div>
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Rejected</h3>
          <p className="text-2xl font-bold text-red-800 dark:text-red-200">{statistics.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search (name, email)..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
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
          <select
            value={filters.applicantType}
            onChange={(e) => setFilters({ ...filters, applicantType: e.target.value, page: 1 })}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Applicants</option>
            <option value="Student">Students</option>
            <option value="Faculty">Faculty</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No leave applications found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {leaves.map((leave) => (
            <div key={leave._id} className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {leave.applicantName}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {leave.applicantType}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusBadgeColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{leave.applicantEmail}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    <span className="ml-4 font-semibold">({leave.numberOfDays} days)</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">{leave.reason}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(leave)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    View
                  </button>
                  {leave.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleReviewClick(leave, "approved")}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewClick(leave, "rejected")}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </>
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

      {/* Details Modal */}
      {showDetailsModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Leave Details</h2>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Applicant:</span>
                  <p className="text-gray-600 dark:text-gray-400">{selectedLeave.applicantName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                  <p className="text-gray-600 dark:text-gray-400">{selectedLeave.applicantType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                  <p className="text-gray-600 dark:text-gray-400">{selectedLeave.applicantEmail}</p>
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

      {/* Review Modal */}
      {showReviewModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Review Leave Application</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <strong>{selectedLeave.applicantName}</strong> - {selectedLeave.leaveType.toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {new Date(selectedLeave.startDate).toLocaleDateString()} to {new Date(selectedLeave.endDate).toLocaleDateString()}
                  ({selectedLeave.numberOfDays} days)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Decision *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="approved"
                      checked={reviewData.status === "approved"}
                      onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Approve</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="rejected"
                      checked={reviewData.status === "rejected"}
                      onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Reject</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Remarks (Optional)
                </label>
                <textarea
                  rows="3"
                  value={reviewData.adminRemarks}
                  onChange={(e) => setReviewData({ ...reviewData, adminRemarks: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Add remarks for the applicant..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
