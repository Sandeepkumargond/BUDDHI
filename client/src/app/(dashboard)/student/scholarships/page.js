"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { toast } from "react-toastify";
import { FaPlus, FaFile } from "react-icons/fa";

const typeOptions = [
  { value: "merit", label: "Merit" },
  { value: "need", label: "Need-based" },
  { value: "sports", label: "Sports" },
  { value: "research", label: "Research" },
  { value: "alumni", label: "Alumni Funded" },
  { value: "other", label: "Other" },
];

const durationOptions = [
  { value: "one_semester", label: "One Semester" },
  { value: "one_year", label: "One Academic Year" },
  { value: "full_course", label: "Full Course" },
  { value: "other", label: "Other" },
];

export default function StudentScholarshipsPage() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({ status: "", page: 1, limit: 20 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });

  const [formData, setFormData] = useState({
    scholarshipName: "",
    scholarshipType: "merit",
    amount: "",
    duration: "one_semester",
    statement: "",
    document: null,
  });

  useEffect(() => {
    fetchScholarships();
  }, [filters]);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await apiService.getMyScholarships(filters.status, filters.page, filters.limit);
      if (res.success) {
        setScholarships(res.data.scholarships || []);
        setPagination({ total: res.data.total, page: res.data.page, limit: res.data.limit });
      }
    } catch (err) {
      toast.error(err.message || "Failed to load scholarships");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("scholarshipName", formData.scholarshipName);
      form.append("scholarshipType", formData.scholarshipType);
      form.append("amount", formData.amount);
      if (formData.duration) form.append("duration", formData.duration);
      if (formData.statement) form.append("statement", formData.statement);
      if (formData.document) form.append("document", formData.document);

      const res = await apiService.applyScholarship(form);
      if (res.success) {
        toast.success("Scholarship application submitted");
        resetForm();
        fetchScholarships();
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit application");
    }
  };

  const resetForm = () => {
    setFormData({ scholarshipName: "", scholarshipType: "merit", amount: "", duration: "", statement: "", document: null });
    setShowForm(false);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scholarships</h1>
          <p className="text-gray-600 dark:text-gray-400">Apply for scholarships and track approvals.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <FaPlus /> Apply
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 flex gap-4">
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

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : scholarships.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">No scholarship applications yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {scholarships.map((item) => (
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
                  {item.adminRemarks && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium">Admin remarks:</span> {item.adminRemarks}
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

      {/* Details modal */}
      {showDetails && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl w-full">
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
              {selected.adminRemarks && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Admin Remarks</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{selected.adminRemarks}</p>
                </div>
              )}
              <div>
                <span className={`text-xs px-2 py-1 rounded capitalize ${statusBadge(selected.status)}`}>
                  {selected.status}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => { setShowDetails(false); setSelected(null); }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Apply for Scholarship</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Scholarship Name *</label>
                <input
                  required
                  value={formData.scholarshipName}
                  onChange={(e) => setFormData({ ...formData, scholarshipName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Merit Scholarship"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Type *</label>
                  <select
                    required
                    value={formData.scholarshipType}
                    onChange={(e) => setFormData({ ...formData, scholarshipType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Duration *</label>
                  <select
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {durationOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Statement</label>
                  <textarea
                    rows="3"
                    value={formData.statement}
                    onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Why you are applying"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Supporting Document</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, document: e.target.files?.[0] })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {formData.document && <FaFile className="text-green-600" />}
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
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
