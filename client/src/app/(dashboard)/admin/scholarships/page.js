"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { toast } from "react-toastify";

export default function AdminScholarshipsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", search: "", page: 1, limit: 20 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });
  const [selected, setSelected] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchScholarships();
  }, [filters]);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllScholarships(filters.status, filters.search, filters.page, filters.limit);
      if (res.success) {
        setApplications(res.data.scholarships || []);
        setPagination({ total: res.data.total, page: res.data.page, limit: res.data.limit });
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch scholarships");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (item, status) => {
    try {
      await apiService.reviewScholarship(item._id, status, selected?.adminRemarks || "");
      toast.success(`Scholarship ${status}`);
      setShowDetails(false);
      setSelected(null);
      fetchScholarships();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const statusBadge = (status) => {
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scholarship Approvals</h1>
          <p className="text-gray-600 dark:text-gray-400">Review student scholarship applications.</p>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <input
          type="text"
          placeholder="Search by name or statement"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">No applications found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((item) => (
            <div key={item._id} className="bg-white dark:bg-gray-800 border rounded-lg p-5 shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.scholarshipName}</h3>
                    <span className={`text-xs px-2 py-1 rounded capitalize ${statusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type: {item.scholarshipType}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount: ₹{item.amount}</p>
                  {item.duration && <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration: {item.duration}</p>}
                  {item.statement && <p className="text-sm text-gray-700 dark:text-gray-300">{item.statement}</p>}
                  {item.student && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Applicant: {item.student.firstName} {item.student.lastName} ({item.student.email})
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelected(item); setShowDetails(true); }}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    View
                  </button>
                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleReview(item, "approved")}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(item, "rejected")}
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

      {showDetails && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Application Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Scholarship</span>
                <span className="text-gray-700 dark:text-gray-300">{selected.scholarshipName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Type</span>
                <span className="text-gray-700 dark:text-gray-300 capitalize">{selected.scholarshipType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Amount</span>
                <span className="text-gray-700 dark:text-gray-300">₹{selected.amount}</span>
              </div>
              {selected.duration && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Duration</span>
                  <span className="text-gray-700 dark:text-gray-300">{selected.duration}</span>
                </div>
              )}
              {selected.statement && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Statement</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{selected.statement}</p>
                </div>
              )}
              {selected.documentUrl && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Document</span>
                  <a
                    href={`/${selected.documentUrl.replace(/^\//, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline ml-2"
                  >
                    View
                  </a>
                </div>
              )}
              {selected.student && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Applicant</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {selected.student.firstName} {selected.student.lastName} ({selected.student.email})
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Already has scholarship: <span className="font-medium">{selected.student.isScholarshipHolder ? "Yes" : "No"}</span>
                  </p>
                </div>
              )}
              {selected.adminRemarks && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Admin Remarks</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{selected.adminRemarks}</p>
                </div>
              )}
              <div className="mt-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Add Remarks</label>
                <textarea
                  rows="3"
                  value={selected.adminRemarks || ""}
                  onChange={(e) => setSelected({ ...selected, adminRemarks: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Remarks to student"
                />
              </div>
              <div className="mt-3 flex gap-2">
                {selected.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleReview(selected, "approved")}
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(selected, "rejected")}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setShowDetails(false); setSelected(null); }}
                  className="px-3 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
