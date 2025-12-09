"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { toast } from "react-toastify";
import { FaPlus, FaFile } from "react-icons/fa";

export default function StudentBonafidePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ status: "", page: 1, limit: 20 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });
  const [formData, setFormData] = useState({ purpose: "", reason: "", document: null });

  useEffect(() => { fetchData(); }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getMyBonafides(filters.status, filters.page, filters.limit);
      if (res.success) {
        setItems(res.data.bonafides || []);
        setPagination({ total: res.data.total, page: res.data.page, limit: res.data.limit });
      }
    } catch (err) {
      toast.error(err.message || "Failed to load bonafide requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("reason", formData.reason);
      if (formData.purpose) form.append("purpose", formData.purpose);
      if (formData.document) form.append("document", formData.document);

      const res = await apiService.applyBonafide(form);
      if (res.success) {
        toast.success("Bonafide request submitted");
        setFormData({ purpose: "", reason: "", document: null });
        setShowForm(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit bonafide request");
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const viewPdf = (url) => {
    if (!url) return toast.info("PDF not available yet");
    window.open(url, "_blank");
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bonafide Requests</h1>
          <p className="text-gray-600 dark:text-gray-400">Apply for a bonafide certificate and track status.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">No bonafide requests yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white dark:bg-gray-800 border rounded-lg p-5 shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bonafide Request</h3>
                    <span className={`text-xs px-2 py-1 rounded capitalize ${statusBadge(item.status)}`}>{item.status}</span>
                  </div>
                  {item.purpose && <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Purpose: {item.purpose}</p>}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reason: {item.reason}</p>
                  {item.rejectionReason && item.status === "rejected" && (
                    <p className="text-sm text-red-600 dark:text-red-400">Rejection: {item.rejectionReason}</p>
                  )}
                  {item.documentUrl && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Uploaded Document: <a className="text-blue-600 hover:underline" href={item.documentUrl} target="_blank">View</a>
                    </p>
                  )}
                  {item.pdfUrl && item.status === "approved" && (
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Certificate: <button onClick={() => viewPdf(item.pdfUrl)} className="text-blue-600 hover:underline">View PDF</button>
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
          <button disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Previous</button>
          <span className="px-4 py-2">{filters.page} / {Math.ceil(pagination.total / pagination.limit)}</span>
          <button disabled={filters.page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Next</button>
        </div>
      )}

      {showDetails && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Bonafide Details</h2>
            <div className="space-y-2 text-sm">
              {selected.purpose && <p><span className="font-medium">Purpose:</span> {selected.purpose}</p>}
              <p><span className="font-medium">Reason:</span> {selected.reason}</p>
              <p><span className="font-medium">Status:</span> <span className={`text-xs px-2 py-1 rounded capitalize ${statusBadge(selected.status)}`}>{selected.status}</span></p>
              {selected.rejectionReason && selected.status === "rejected" && (
                <p className="text-red-600 dark:text-red-400"><span className="font-medium">Rejection:</span> {selected.rejectionReason}</p>
              )}
              {selected.documentUrl && (
                <p><span className="font-medium">Document:</span> <a href={selected.documentUrl} target="_blank" className="text-blue-600 hover:underline">View</a></p>
              )}
              {selected.pdfUrl && selected.status === "approved" && (
                <p><span className="font-medium">Certificate:</span> <button onClick={() => viewPdf(selected.pdfUrl)} className="text-blue-600 hover:underline">View PDF</button></p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => { setShowDetails(false); setSelected(null); }} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400">Close</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Apply for Bonafide</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Purpose</label>
                <input
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Passport, Bank account"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reason *</label>
                <textarea
                  required
                  rows="4"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="State why you need the bonafide"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Supporting Document (optional)</label>
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
                <button type="button" onClick={() => { setShowForm(false); setFormData({ purpose: "", reason: "", document: null }); }} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
