"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaPowerOff, FaCheckCircle, FaClock } from "react-icons/fa";

export default function InternshipsPage() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    position: "",
    description: "",
    duration: "",
    stipend: "",
    location: "",
    requirements: "",
    applyLink: "",
    deadline: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAlumniProfile();
      if (response.success) {
        setInternships(response.data.user?.internshipOpportunities || []);
      }
    } catch (error) {
      toast.error("Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiService.updateInternshipOpportunity(editingId, formData);
        toast.success("Internship updated successfully");
      } else {
        await apiService.addInternshipOpportunity(formData);
        toast.success("Internship added successfully");
      }
      resetForm();
      fetchProfile();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = (internship) => {
    setFormData({
      companyName: internship.companyName || "",
      position: internship.position || "",
      description: internship.description || "",
      duration: internship.duration || "",
      stipend: internship.stipend || "",
      location: internship.location || "",
      requirements: internship.requirements || "",
      applyLink: internship.applyLink || "",
      deadline: internship.deadline ? new Date(internship.deadline).toISOString().split('T')[0] : "",
    });
    setEditingId(internship._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this internship?")) return;
    try {
      await apiService.deleteInternshipOpportunity(id);
      toast.success("Internship deleted successfully");
      fetchProfile();
    } catch (error) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const handleToggleActive = async (internship) => {
    try {
      await apiService.updateInternshipOpportunity(internship._id, {
        isActive: !internship.isActive,
      });
        const handleToggleApproved = async (internship) => {
          try {
            await apiService.updateInternshipOpportunity(internship._id, {
              isApproved: !internship.isApproved,
            });
            toast.success(`Internship ${!internship.isApproved ? "approved" : "marked as pending"}`);
            fetchProfile();
          } catch (error) {
            toast.error("Failed to update approval");
          }
        };
      toast.success(`Internship ${!internship.isActive ? "activated" : "deactivated"}`);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      position: "",
      description: "",
      duration: "",
      stipend: "",
      location: "",
      requirements: "",
      applyLink: "",
      deadline: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Internship Opportunities</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FaPlus /> Add Internship
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : internships.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No internships posted yet. Click "Add Internship" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {internships.map((internship) => (
            <div
              key={internship._id}
              className={`bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-md ${
                !internship.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {internship.position}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        internship.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {internship.isActive ? "Active" : "Inactive"}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                        internship.isApproved
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      <FaCheckCircle /> {internship.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{internship.companyName}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(internship)}
                    className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                      internship.isActive 
                        ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100" 
                        : "bg-gray-50 text-gray-500 border-gray-300 hover:bg-gray-100"
                    }`}
                    title={internship.isActive ? "Deactivate" : "Activate"}
                  >
                    {internship.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleToggleApproved(internship)}
                    className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                      internship.isApproved
                        ? "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                        : "bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    }`}
                    title={internship.isApproved ? "Mark pending" : "Approve"}
                  >
                    {internship.isApproved ? "Approved" : "Pending"}
                  </button>
                  <button
                    onClick={() => handleEdit(internship)}
                    className="px-3 py-1 text-xs font-semibold rounded border bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 transition-colors"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(internship._id)}
                    className="px-3 py-1 text-xs font-semibold rounded border bg-red-50 text-red-700 border-red-300 hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4">{internship.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                {internship.location && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Location:</span>
                    <p className="font-medium">{internship.location}</p>
                  </div>
                )}
                {internship.duration && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <p className="font-medium">{internship.duration}</p>
                  </div>
                )}
                {internship.stipend && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Stipend:</span>
                    <p className="font-medium">₹{internship.stipend.toLocaleString()}</p>
                  </div>
                )}
                {internship.deadline && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Deadline:</span>
                    <p className="font-medium">{new Date(internship.deadline).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {internship.requirements && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Requirements:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{internship.requirements}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Applications: {internship.applicationsReceived || 0}
                </span>
                {internship.applyLink && (
                  <a
                    href={internship.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Application Link
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingId ? "Edit Internship" : "Add New Internship"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Company Name *"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Position *"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <textarea
                placeholder="Description *"
                required
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Duration (e.g., 3 months)"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Stipend (₹)"
                  value={formData.stipend}
                  onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="date"
                  placeholder="Application Deadline"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <textarea
                placeholder="Requirements"
                rows="3"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />

              <input
                type="url"
                placeholder="Application Link (URL)"
                value={formData.applyLink}
                onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />

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
                  {editingId ? "Update" : "Create"} Internship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
