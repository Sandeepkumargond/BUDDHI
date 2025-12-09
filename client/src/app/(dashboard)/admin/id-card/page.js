"use client";
import { useState, useEffect } from "react";
import { showToast } from "@/lib/toast";
import { apiService } from "@/lib/api";
import { FiPlus, FiEdit, FiToggleLeft, FiToggleRight, FiUsers, FiTrash2 } from "react-icons/fi";

export default function IdCardManagement() {
  const [activeTab, setActiveTab] = useState("forms");
  const [forms, setForms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [filter, setFilter] = useState({ status: "", academicYear: "" });
  
  const [formData, setFormData] = useState({
    title: "ID Card Application Form",
    academicYear: "",
    fee: 100,
    instructions: "Please fill all the details carefully and upload required documents.",
    requiredDocuments: [],
    deadline: ""
  });

  useEffect(() => {
    fetchForms();
    fetchStatistics();
  }, []);

  useEffect(() => {
    if (activeTab === "applications") {
      fetchApplications();
    }
  }, [activeTab, filter]);

  const fetchForms = async () => {
    try {
      const response = await apiService.request("/id-card/forms", { method: "GET" });
      setForms(response.data);
    } catch (error) {
      showToast.error("Failed to fetch forms");
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filter.status) queryParams.append("status", filter.status);
      if (filter.academicYear) queryParams.append("academicYear", filter.academicYear);
      
      const response = await apiService.request(`/id-card/applications?${queryParams}`, { method: "GET" });
      setApplications(response.data.applications);
    } catch (error) {
      showToast.error("Failed to fetch applications");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiService.request("/id-card/statistics", { method: "GET" });
      setStatistics(response.data);
    } catch (error) {
      console.error("Failed to fetch statistics");
    }
  };

  const handleCreateForm = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiService.request("/id-card/forms/create", {
        method: "POST",
        body: formData
      });
      showToast.success("Form created successfully");
      setShowFormModal(false);
      fetchForms();
      resetFormData();
    } catch (error) {
      showToast.error(error.message || "Failed to create form");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFormStatus = async (formId) => {
    try {
      await apiService.request(`/id-card/forms/${formId}/toggle`, { method: "PATCH" });
      showToast.success("Form status updated");
      fetchForms();
    } catch (error) {
      showToast.error("Failed to update form status");
    }
  };

  const handleDeleteForm = async () => {
    if (!formToDelete) return;
    
    setIsLoading(true);
    try {
      await apiService.request(`/id-card/forms/${formToDelete._id}`, { method: "DELETE" });
      showToast.success("Form deleted successfully");
      setShowDeleteModal(false);
      setFormToDelete(null);
      fetchForms();
      fetchStatistics();
    } catch (error) {
      showToast.error(error.message || "Failed to delete form");
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      title: "ID Card Application Form",
      academicYear: "",
      fee: 100,
      instructions: "Please fill all the details carefully and upload required documents.",
      requiredDocuments: [],
      deadline: ""
    });
    setSelectedForm(null);
  };

  const addDocument = () => {
    setFormData({
      ...formData,
      requiredDocuments: [...formData.requiredDocuments, { name: "", description: "" }]
    });
  };

  const updateDocument = (index, field, value) => {
    const updated = [...formData.requiredDocuments];
    updated[index][field] = value;
    setFormData({ ...formData, requiredDocuments: updated });
  };

  const removeDocument = (index) => {
    const updated = formData.requiredDocuments.filter((_, i) => i !== index);
    setFormData({ ...formData, requiredDocuments: updated });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      printing: "bg-purple-100 text-purple-800",
      ready: "bg-indigo-100 text-indigo-800",
      dispatched: "bg-gray-100 text-gray-800",
      rejected: "bg-red-100 text-red-800"
    };
    return statusConfig[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ID Card Management</h1>
        <p className="text-gray-600">Manage ID card forms and applications</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Applications</p>
            <p className="text-2xl font-bold">{statistics.totalApplications}</p>
          </div>
          {statistics.statusWise.map((stat) => (
            <div key={stat._id} className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 capitalize">{stat._id.replace("_", " ")}</p>
              <p className="text-2xl font-bold">{stat.count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("forms")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "forms"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Forms
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "applications"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Applications
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "forms" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">ID Card Forms</h2>
                <button
                  onClick={() => setShowFormModal(true)}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  <FiPlus /> Create Form
                </button>
              </div>

              <div className="space-y-4">
                {forms.map((form) => (
                  <div key={form._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{form.title}</h3>
                          {form.isActive ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Academic Year: {form.academicYear}</p>
                        <p className="text-sm text-gray-600">Fee: ₹{form.fee}</p>
                        <p className="text-sm text-gray-600">Deadline: {new Date(form.deadline).toLocaleDateString()}</p>
                        {form.instructions && (
                          <p className="text-sm text-gray-600 mt-2">{form.instructions}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleFormStatus(form._id)}
                          className="text-2xl text-gray-600 hover:text-black"
                        >
                          {form.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                        </button>
                        <button
                          onClick={() => {
                            setFormToDelete(form);
                            setShowDeleteModal(true);
                          }}
                          className="text-xl text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "applications" && (
            <div>
              <div className="mb-4 flex gap-4">
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="printing">Printing</option>
                  <option value="ready">Ready</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
                          <div className="text-sm text-gray-500">{app.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.enrollmentNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{app.course}</div>
                          <div className="text-sm text-gray-500">{app.branch}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            app.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                            app.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {app.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(app.status)}`}>
                            {app.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a
                            href={`/admin/id-card/application/${app._id}`}
                            className="text-black hover:text-gray-700 font-medium"
                          >
                            View Details
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create ID Card Form</h2>
            <form onSubmit={handleCreateForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  placeholder="e.g., 2024-2025"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fee (₹)</label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Required Documents</label>
                  <button type="button" onClick={addDocument} className="text-sm text-black hover:underline">
                    + Add Document
                  </button>
                </div>
                {formData.requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Document Name"
                      value={doc.name}
                      onChange={(e) => updateDocument(index, "name", e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={doc.description}
                      onChange={(e) => updateDocument(index, "description", e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    resetFormData();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create Form"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete ID Card Form</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the form <strong>"{formToDelete?.title}"</strong>?
              {formToDelete && (
                <span className="block mt-2 text-sm text-gray-600">
                  Academic Year: {formToDelete.academicYear}
                </span>
              )}
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action cannot be undone. The form can only be deleted if there are no applications associated with it.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setFormToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteForm}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Deleting..." : "Delete Form"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
