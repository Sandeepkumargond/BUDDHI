"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { toast } from "react-toastify";

export default function AdminBonafidePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", search: "", page: 1, limit: 20 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });
  const [selected, setSelected] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [remark, setRemark] = useState("");

  useEffect(() => { fetchData(); }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllBonafides(filters.status, filters.search, filters.page, filters.limit);
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

  const statusBadge = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleReview = async (item, status) => {
    try {
      const rejectionReason = status === "rejected" ? remark : "";
      if (status === "rejected" && !rejectionReason.trim()) {
        toast.error("Rejection reason is required");
        return;
      }
      await apiService.reviewBonafide(item._id, status, rejectionReason);
      toast.success(`Bonafide ${status}`);
      setShowDetails(false);
      setSelected(null);
      setRemark("");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const viewPdf = (url) => {
    if (!url) return toast.info("PDF not available");
    window.open(url, "_blank");
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bonafide Approvals</h1>
          <p className="text-gray-600 dark:text-gray-400">Match student data and approve or reject requests.</p>
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
          placeholder="Search by name/email/enrollment"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">No bonafide requests found.</div>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Student: {item.studentSnapshot?.firstName} {item.studentSnapshot?.lastName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Enroll: {item.studentSnapshot?.enrollmentNo} | Roll: {item.studentSnapshot?.rollNo}</p>
                  {item.purpose && <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Purpose: {item.purpose}</p>}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reason: {item.reason}</p>
                  {item.rejectionReason && item.status === "rejected" && (
                    <p className="text-sm text-red-600 dark:text-red-400">Rejection: {item.rejectionReason}</p>
                  )}
                  {item.documentUrl && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Document: <a href={item.documentUrl} target="_blank" className="text-blue-600 hover:underline">View</a></p>
                  )}
                  {item.pdfUrl && item.status === "approved" && (
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">Certificate: <button onClick={() => viewPdf(item.pdfUrl)} className="text-blue-600 hover:underline">View PDF</button></p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelected(item); setShowDetails(true); setRemark(item.rejectionReason || ""); }} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">View</button>
                  {item.status === "pending" && (
                    <>
                      <button onClick={() => handleReview(item, "approved")} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve</button>
                      <button onClick={() => handleReview(item, "rejected")} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject</button>
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
          <button disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Previous</button>
          <span className="px-4 py-2">{filters.page} / {Math.ceil(pagination.total / pagination.limit)}</span>
          <button disabled={filters.page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Next</button>
        </div>
      )}

      {showDetails && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Bonafide Details</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {selected.studentSnapshot?.firstName} {selected.studentSnapshot?.lastName}</p>
              <p><span className="font-medium">Enrollment:</span> {selected.studentSnapshot?.enrollmentNo} | Roll: {selected.studentSnapshot?.rollNo}</p>
              <p><span className="font-medium">Program:</span> {selected.studentSnapshot?.program} | Branch: {selected.studentSnapshot?.branch}</p>
              <p><span className="font-medium">Semester/Section:</span> {selected.studentSnapshot?.semester}{selected.studentSnapshot?.section ? ` / ${selected.studentSnapshot.section}` : ""}</p>
              {selected.studentSnapshot?.batch && <p><span className="font-medium">Batch:</span> {selected.studentSnapshot.batch}</p>}
              <p><span className="font-medium">Institute Email:</span> {selected.studentSnapshot?.email}</p>
              {selected.studentSnapshot?.personalMail && <p><span className="font-medium">Personal Email:</span> {selected.studentSnapshot.personalMail}</p>}
              {selected.purpose && <p><span className="font-medium">Purpose:</span> {selected.purpose}</p>}
              <p><span className="font-medium">Reason:</span> {selected.reason}</p>
              <p><span className="font-medium">Status:</span> <span className={`text-xs px-2 py-1 rounded capitalize ${statusBadge(selected.status)}`}>{selected.status}</span></p>
              {selected.rejectionReason && selected.status === "rejected" && (
                <p className="text-red-600 dark:text-red-400"><span className="font-medium">Rejection:</span> {selected.rejectionReason}</p>
              )}
              {selected.documentUrl && (
                <p><span className="font-medium">Uploaded Document:</span> <a href={selected.documentUrl} target="_blank" className="text-blue-600 hover:underline">View</a></p>
              )}
              {selected.pdfUrl && selected.status === "approved" && (
                <p><span className="font-medium">Certificate:</span> <button onClick={() => viewPdf(selected.pdfUrl)} className="text-blue-600 hover:underline">View PDF</button></p>
              )}
              {selected.status === "pending" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Rejection Reason (if rejecting)</label>
                  <textarea
                    rows="3"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter rejection reason"
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              {selected.status === "pending" && (
                <>
                  <button onClick={() => handleReview(selected, "approved")} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                  <button onClick={() => handleReview(selected, "rejected")} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                </>
              )}
              <button onClick={() => { setShowDetails(false); setSelected(null); setRemark(""); }} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
