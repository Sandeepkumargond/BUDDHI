"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function FeedbackFormsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (role !== "admin") {
      router.push("/");
    }
    fetchForms();
  }, [role, router, filterStatus, searchTerm]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      const res = await apiService.getAllFeedbackForms(filters);
      const allForms = res.data?.forms || [];
      
      // Filter by search term
      const filtered = allForms.filter(
        (form) =>
          form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          form.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setForms(filtered);
    } catch (error) {
      showToast.error("Failed to fetch feedback forms");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (formId) => {
    if (!confirm("Are you sure you want to delete this form?")) return;

    try {
      await apiService.deleteFeedbackForm(formId);
      showToast.success("Form deleted successfully");
      setForms((prev) => prev.filter((f) => f._id !== formId));
    } catch (error) {
      showToast.error("Failed to delete form");
    }
  };

  const handleStatusChange = async (formId, newStatus) => {
    try {
      if (newStatus === "active") {
        await apiService.activateFeedbackForm(formId);
      } else if (newStatus === "closed") {
        await apiService.closeFeedbackForm(formId);
      }
      showToast.success("Form status updated");
      fetchForms();
    } catch (error) {
      showToast.error("Failed to update form status");
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Feedback Forms</h1>
        <Link
          href="/admin/feedback-forms/create"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Form
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Forms
            </label>
            <input
              type="text"
              placeholder="Search by title or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">Loading feedback forms...</div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No feedback forms found. Create one to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Batch/Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Active Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {forms.map((form) => (
                <tr key={form._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {form.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {form.department}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {form.batch} / Sem {form.semester}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(form.status)}`}>
                      {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(form.startDate).toLocaleDateString()} -{" "}
                    {new Date(form.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <Link
                      href={`/admin/feedback-forms/${form._id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                    {form.status === "draft" && (
                      <button
                        onClick={() => handleStatusChange(form._id, "active")}
                        className="text-green-600 hover:text-green-800"
                      >
                        Activate
                      </button>
                    )}
                    {form.status === "active" && (
                      <button
                        onClick={() => handleStatusChange(form._id, "closed")}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(form._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
