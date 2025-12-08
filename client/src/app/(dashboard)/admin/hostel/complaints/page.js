"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllComplaints, getComplaintStats, updateComplaintStatus } from "@/lib/hostelApi";
import { showToast } from "@/lib/toast";
import Image from "next/image";

export default function AdminComplaintsPage() {
  const { user, role, loading } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [statusChanging, setStatusChanging] = useState(false);
  const [updatingComplaintId, setUpdatingComplaintId] = useState(null);

  useEffect(() => {
    if (role !== "admin") return;

    const fetchData = async () => {
      setPageLoading(true);
      try {
        const complaintsList = await getAllComplaints({
          status: filterStatus,
          priority: filterPriority,
          searchTerm: searchTerm,
        });
        setComplaints(complaintsList);

        const statsData = await getComplaintStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error loading complaints:", error);
        showToast("error", "Failed to load complaints");
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [filterStatus, filterPriority, searchTerm, role]);

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedComplaint) return;

    setStatusChanging(true);
    try {
      await updateComplaintStatus(selectedComplaint._id, newStatus, adminNotes);
      showToast("success", "Complaint status updated successfully");
      
      // Refresh complaints
      const complaintsList = await getAllComplaints({
        status: filterStatus,
        priority: filterPriority,
        searchTerm: searchTerm,
      });
      setComplaints(complaintsList);
      setSelectedComplaint(null);
      setAdminNotes("");
    } catch (error) {
      console.error("Error updating complaint:", error);
      showToast("error", "Failed to update complaint");
    } finally {
      setStatusChanging(false);
    }
  };

  // Quick status update from table row (without opening modal)
  const handleQuickStatusUpdate = async (complaintId, newStatus) => {
    setUpdatingComplaintId(complaintId);
    try {
      await updateComplaintStatus(complaintId, newStatus, "");
      
      // Update the complaint in the list immediately
      setComplaints(complaints.map(c => 
        c._id === complaintId ? { ...c, status: newStatus } : c
      ));

      // Update stats immediately
      const statsData = await getComplaintStats();
      setStats(statsData);

      showToast("success", `Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating complaint status:", error);
      showToast("error", "Failed to update status");
    } finally {
      setUpdatingComplaintId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: "#64748b" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: "#0f172a" }}>
          Hostel Complaints
        </h1>
        {stats && (
          <div className="flex gap-4">
            <div className="p-4 rounded-lg" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <p className="text-sm" style={{ color: "#0c4a6e" }}>Total</p>
              <p className="text-2xl font-bold" style={{ color: "#0369a1" }}>{stats.total}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ background: "#fef3c7", border: "1px solid #fcd34d" }}>
              <p className="text-sm" style={{ color: "#92400e" }}>Pending</p>
              <p className="text-2xl font-bold" style={{ color: "#d97706" }}>{stats.pending}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ background: "#e0e7ff", border: "1px solid #c7d2fe" }}>
              <p className="text-sm" style={{ color: "#3730a3" }}>In Progress</p>
              <p className="text-2xl font-bold" style={{ color: "#6366f1" }}>{stats.inProgress}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ background: "#d1fae5", border: "1px solid #a7f3d0" }}>
              <p className="text-sm" style={{ color: "#065f46" }}>Resolved</p>
              <p className="text-2xl font-bold" style={{ color: "#10b981" }}>{stats.resolved}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl" style={{ border: "1px solid #e5e7eb" }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 rounded border"
            style={{ borderColor: "#cbd5e1", color: "#0f172a" }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 rounded border"
            style={{ borderColor: "#cbd5e1", color: "#0f172a" }}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="p-2 rounded border"
            style={{ borderColor: "#cbd5e1", color: "#0f172a" }}
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
        {pageLoading ? (
          <div className="p-6 text-center">
            <p style={{ color: "#64748b" }}>Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-6 text-center">
            <p style={{ color: "#64748b" }}>No complaints found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "#f8fafc" }}>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: "#0f172a" }}>
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: "#0f172a" }}>
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: "#0f172a" }}>
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: "#0f172a" }}>
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: "#0f172a" }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: "#0f172a" }}>
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: "#0f172a" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td className="px-6 py-3 text-sm" style={{ color: "#0f172a" }}>
                      <div>
                        <p className="font-medium">{complaint.studentName}</p>
                        <p className="text-xs" style={{ color: "#64748b" }}>
                          {complaint.studentEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm" style={{ color: "#0f172a" }}>
                      {complaint.title}
                    </td>
                    <td className="px-6 py-3 text-sm" style={{ color: "#0f172a" }}>
                      <span
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          background: "#f0fdf4",
                          color: "#166534",
                          border: "1px solid #86efac",
                        }}
                      >
                        {complaint.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm" style={{ color: "#0f172a" }}>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          background:
                            complaint.priority === "Urgent"
                              ? "#fee2e2"
                              : complaint.priority === "High"
                              ? "#fef3c7"
                              : complaint.priority === "Medium"
                              ? "#dbeafe"
                              : "#dcfce7",
                          color:
                            complaint.priority === "Urgent"
                              ? "#991b1b"
                              : complaint.priority === "High"
                              ? "#92400e"
                              : complaint.priority === "Medium"
                              ? "#0c4a6e"
                              : "#166534",
                        }}
                      >
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm" style={{ color: "#0f172a" }}>
                      <div className="flex gap-2 flex-wrap items-center">
                        {["Pending", "In Progress", "Resolved", "Closed"].map((status, idx) => (
                          <div key={status}>
                            <button
                              onClick={() => handleQuickStatusUpdate(complaint._id, status)}
                              disabled={updatingComplaintId === complaint._id}
                              className={`px-3 py-2 rounded text-xs font-semibold transition-all ${
                                complaint.status === status
                                  ? "shadow-lg transform scale-105"
                                  : "hover:shadow-sm"
                              }`}
                              style={{
                                background:
                                  complaint.status === status
                                    ? status === "Pending"
                                      ? "#a16207"
                                      : status === "In Progress"
                                      ? "#1e40af"
                                      : status === "Resolved"
                                      ? "#065f46"
                                      : "#374151"
                                    : status === "Pending"
                                    ? "#fef3c7"
                                    : status === "In Progress"
                                    ? "#dbeafe"
                                    : status === "Resolved"
                                    ? "#d1fae5"
                                    : "#f3f4f6",
                                color:
                                  complaint.status === status
                                    ? "white"
                                    : status === "Pending"
                                    ? "#92400e"
                                    : status === "In Progress"
                                    ? "#0c4a6e"
                                    : status === "Resolved"
                                    ? "#065f46"
                                    : "#374151",
                                opacity: updatingComplaintId === complaint._id ? 0.6 : 1,
                                cursor: updatingComplaintId === complaint._id ? "not-allowed" : "pointer",
                                border: complaint.status === status ? "2px solid rgba(255,255,255,0.4)" : "2px solid transparent",
                                borderRadius: "6px",
                                boxShadow: complaint.status === status 
                                  ? "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)"
                                  : "none",
                              }}
                            >
                              {updatingComplaintId === complaint._id && complaint.status === status ? "..." : status}
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm" style={{ color: "#64748b" }}>
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="px-3 py-1 rounded text-white text-xs"
                        style={{ background: "#6366f1" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: "0 10px 28px rgba(2,6,23,0.18)" }}
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
                  {selectedComplaint.title}
                </h2>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>Student Name</p>
                  <p className="font-semibold" style={{ color: "#0f172a" }}>
                    {selectedComplaint.studentName}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>Email</p>
                  <p className="font-semibold text-xs" style={{ color: "#0f172a" }}>
                    {selectedComplaint.studentEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>Hostel</p>
                  <p className="font-semibold" style={{ color: "#0f172a" }}>
                    {selectedComplaint.hostelName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>Room</p>
                  <p className="font-semibold" style={{ color: "#0f172a" }}>
                    {selectedComplaint.roomNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>Category</p>
                  <p className="font-semibold" style={{ color: "#0f172a" }}>
                    {selectedComplaint.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>Priority</p>
                  <p className="font-semibold" style={{ color: "#0f172a" }}>
                    {selectedComplaint.priority}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>Submitted Date</p>
                  <p className="font-semibold text-xs" style={{ color: "#0f172a" }}>
                    {new Date(selectedComplaint.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedComplaint.resolvedDate && (
                  <div>
                    <p className="text-sm" style={{ color: "#64748b" }}>Resolved Date</p>
                    <p className="font-semibold text-xs" style={{ color: "#10b981" }}>
                      {new Date(selectedComplaint.resolvedDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: "#0f172a" }}>
                  Description
                </p>
                <p style={{ color: "#475569", lineHeight: "1.6" }}>
                  {selectedComplaint.description}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-3" style={{ color: "#0f172a" }}>
                  Current Status
                </p>
                <div className="inline-block">
                  {(() => {
                    const status = selectedComplaint.status;
                    const getStatusColor = (s) => {
                      switch(s) {
                        case "Pending":
                          return { bg: "#a16207", text: "white" };
                        case "In Progress":
                          return { bg: "#1e40af", text: "white" };
                        case "Resolved":
                          return { bg: "#065f46", text: "white" };
                        case "Closed":
                          return { bg: "#374151", text: "white" };
                        default:
                          return { bg: "#e5e7eb", text: "#0f172a" };
                      }
                    };
                    const colors = getStatusColor(status);
                    return (
                      <span
                        className="px-4 py-2 rounded-lg font-medium text-sm"
                        style={{
                          background: colors.bg,
                          color: colors.text,
                          border: "2px solid rgba(255,255,255,0.4)"
                        }}
                      >
                        {status}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: "#0f172a" }}>
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes || selectedComplaint.adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for this complaint..."
                  className="w-full p-3 rounded border"
                  style={{ borderColor: "#cbd5e1", color: "#0f172a" }}
                  rows="3"
                />
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>Notes will be saved when you change the status</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 rounded font-medium"
                  style={{ background: "#e5e7eb", color: "#0f172a" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#d1d5db")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#e5e7eb")}
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
