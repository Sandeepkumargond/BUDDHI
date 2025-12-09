"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaPowerOff, FaCheckCircle, FaClock } from "react-icons/fa";

export default function ReferralsPage() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    position: "",
    description: "",
    requirements: "",
    contactEmail: "",
    referralType: "direct",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAlumniProfile();
      if (response.success) {
        setReferrals(response.data.user?.referrals || []);
      }
    } catch (error) {
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiService.updateReferral(editingId, formData);
        toast.success("Referral updated successfully");
      } else {
        await apiService.addReferral(formData);
        toast.success("Referral added successfully");
      }
      resetForm();
      fetchProfile();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = (referral) => {
    setFormData({
      companyName: referral.companyName || "",
      position: referral.position || "",
      description: referral.description || "",
      requirements: referral.requirements || "",
      contactEmail: referral.contactEmail || "",
      referralType: referral.referralType || "direct",
    });
    setEditingId(referral._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this referral?")) return;
    try {
      await apiService.deleteReferral(id);
      toast.success("Referral deleted successfully");
      fetchProfile();
    } catch (error) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const handleToggleActive = async (referral) => {
    try {
      await apiService.updateReferral(referral._id, {
        isActive: !referral.isActive,
      });
      toast.success(`Referral ${!referral.isActive ? "activated" : "deactivated"}`);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleApproved = async (referral) => {
    try {
      await apiService.updateReferral(referral._id, {
        isApproved: !referral.isApproved,
      });
      toast.success(`Referral ${!referral.isApproved ? "approved" : "marked as pending"}`);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update approval");
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      position: "",
      description: "",
      requirements: "",
      contactEmail: "",
      referralType: "direct",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Referrals</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <FaPlus /> Offer Referral
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : referrals.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No referrals offered yet. Click "Offer Referral" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {referrals.map((referral) => (
            <div
              key={referral._id}
              className={`bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-md ${
                !referral.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {referral.position}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        referral.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {referral.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {referral.referralType}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                        referral.isApproved
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      <FaCheckCircle /> {referral.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{referral.companyName}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(referral)}
                    className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                      referral.isActive 
                        ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100" 
                        : "bg-gray-50 text-gray-500 border-gray-300 hover:bg-gray-100"
                    }`}
                    title={referral.isActive ? "Deactivate" : "Activate"}
                  >
                    {referral.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleToggleApproved(referral)}
                    className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                      referral.isApproved
                        ? "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                        : "bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    }`}
                    title={referral.isApproved ? "Mark pending" : "Approve"}
                  >
                    {referral.isApproved ? "Approved" : "Pending"}
                  </button>
                  <button
                    onClick={() => handleEdit(referral)}
                    className="px-3 py-1 text-xs font-semibold rounded border bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 transition-colors"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(referral._id)}
                    className="px-3 py-1 text-xs font-semibold rounded border bg-red-50 text-red-700 border-red-300 hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {referral.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">{referral.description}</p>
              )}

              {referral.requirements && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Requirements:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{referral.requirements}</p>
                </div>
              )}

              <div className="flex items-center justify-between border-t dark:border-gray-700 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FaCheckCircle />
                  <span>Interested Students: {referral.interestedStudents?.length || 0}</span>
                </div>
                {referral.contactEmail && (
                  <a
                    href={`mailto:${referral.contactEmail}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {referral.contactEmail}
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
              {editingId ? "Edit Referral" : "Offer New Referral"}
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

              <select
                value={formData.referralType}
                onChange={(e) => setFormData({ ...formData, referralType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="direct">Direct Referral</option>
                <option value="indirect">Indirect Referral</option>
                <option value="networking">Networking</option>
              </select>

              <textarea
                placeholder="Description"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />

              <textarea
                placeholder="Requirements"
                rows="3"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />

              <input
                type="email"
                placeholder="Contact Email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingId ? "Update" : "Offer"} Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
