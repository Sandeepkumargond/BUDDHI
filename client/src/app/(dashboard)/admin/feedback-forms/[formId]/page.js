"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiService } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function FeedbackFormDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { role } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    if (role !== "admin") {
      router.push("/");
    }
    fetchFormDetails();
  }, [role, router, params.formId]);

  const fetchFormDetails = async () => {
    setLoading(true);
    try {
      console.log('[AdminFeedbackForm] Fetching form:', params.formId);
      const res = await apiService.getFeedbackFormByIdAdmin(params.formId);
      console.log('[AdminFeedbackForm] Response:', res);
      const formData = res.data || {};
      console.log('[AdminFeedbackForm] Form data:', formData);
      setForm(formData);
      setEditData(formData);
    } catch (error) {
      console.error('[AdminFeedbackForm] Error:', error);
      showToast.error("Failed to fetch form details: " + (error.message || "Unknown error"));
      router.push("/admin/feedback-forms");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await apiService.updateFeedbackForm(params.formId, editData);
      setForm(editData);
      setIsEditing(false);
      showToast.success("Form updated successfully");
    } catch (error) {
      showToast.error("Failed to update form");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      await apiService.deleteFeedbackForm(params.formId);
      showToast.success("Form deleted successfully");
      router.push("/admin/feedback-forms");
    } catch (error) {
      showToast.error("Failed to delete form");
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Loading form details...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-red-500">Form not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Link href="/admin/feedback-forms" className="text-blue-600 hover:text-blue-800 mb-2">
            ← Back to Forms
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">{form.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Form Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Form Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{form.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-600">{form.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(form.status)}`}>
                  {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <p className="text-gray-900">{form.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <p className="text-gray-900">{form.batch}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <p className="text-gray-900">{form.semester}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <p className="text-gray-900">{form.section || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <p className="text-gray-900">{form.branch || "N/A"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    value={editData.startDate}
                    onChange={(e) =>
                      setEditData({ ...editData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-900">
                    {new Date(form.startDate).toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    value={editData.endDate}
                    onChange={(e) =>
                      setEditData({ ...editData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-900">
                    {new Date(form.endDate).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <button
                onClick={handleUpdate}
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Questions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Questions ({form.questions?.length || 0})
          </h2>

          <div className="space-y-4">
            {form.questions && form.questions.length > 0 ? (
              form.questions.map((question, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">
                      {index + 1}. {question.text}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {question.type === "rating" ? "Rating (1-5)" : "Text"}
                    </span>
                  </div>
                  {question.options && (
                    <p className="text-sm text-gray-600">
                      Options: {question.options.join(", ")}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No questions added yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Form Statistics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Questions</p>
            <p className="text-2xl font-bold text-blue-600">
              {form.questions?.length || 0}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-2xl font-bold text-green-600 capitalize">
              {form.status}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Responses</p>
            <p className="text-2xl font-bold text-purple-600">
              {form.submissionCount || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
