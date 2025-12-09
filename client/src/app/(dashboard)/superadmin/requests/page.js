"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { apiService } from "@/lib/api";

const showToast = {
  success: (msg) => alert(msg),
  error: (msg) => alert(msg),
};

const ViewRequestsPage = () => {
  // Modal states for Add College
  const [showAddCollegeModal, setShowAddCollegeModal] = useState(false);
  const [collegeFormData, setCollegeFormData] = useState({
    collegeName: "",
    collegeType: "",
    establishedYear: "",
    affiliation: "",
    totalStudents: "",
    totalFaculty: "",
    website: "",
    description: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    adminName: "",
    adminDesignation: "",
    email: "",
    phone: "",
    alternatePhone: "",
    recognitionType: "",
    courses: "",
    infrastructure: ""
  });
  const [collegeFormErrors, setCollegeFormErrors] = useState({});
  const [isSubmittingCollege, setIsSubmittingCollege] = useState(false);

  // Requests state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Load requests from backend
  const loadRequests = async () => {
    setLoading(true);
    try {
      const statusFilter = filterStatus === "all" ? null : filterStatus;
      const res = await apiService.superAdminListCollegeRequests(statusFilter);
      setRequests(res?.data?.requests || []);
    } catch (error) {
      console.error("Error loading requests:", error);
      showToast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filterStatus]);

  // College form handling functions
  const handleCollegeFormChange = (e) => {
    const { name, value } = e.target;
    setCollegeFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (collegeFormErrors[name]) {
      setCollegeFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateCollegeForm = () => {
    const newErrors = {};

    // Required field validation
    const requiredFields = {
      collegeName: "College name is required",
      collegeType: "College type is required",
      establishedYear: "Established year is required",
      affiliation: "Affiliation is required",
      address: "Address is required",
      state: "State is required",
      city: "City is required",
      pincode: "Pincode is required",
      adminName: "Admin name is required",
      adminDesignation: "Admin designation is required",
      email: "Email is required",
      phone: "Phone number is required",
      recognitionType: "Recognition type is required"
    };

    Object.keys(requiredFields).forEach(field => {
      if (!collegeFormData[field].trim()) {
        newErrors[field] = requiredFields[field];
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (collegeFormData.email && !emailRegex.test(collegeFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (collegeFormData.phone && !phoneRegex.test(collegeFormData.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // Pincode validation
    if (collegeFormData.pincode && !/^\d{6}$/.test(collegeFormData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }

    // Established year validation
    const currentYear = new Date().getFullYear();
    if (collegeFormData.establishedYear && (collegeFormData.establishedYear < 1800 || collegeFormData.establishedYear > currentYear)) {
      newErrors.establishedYear = `Please enter a valid year between 1800 and ${currentYear}`;
    }

    setCollegeFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCollegeFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateCollegeForm()) {
      return;
    }

    setIsSubmittingCollege(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("College data:", collegeFormData);

      showToast.success("College added successfully!");

      // Reset form and close modal
      setCollegeFormData({
        collegeName: "",
        collegeType: "",
        establishedYear: "",
        affiliation: "",
        totalStudents: "",
        totalFaculty: "",
        website: "",
        description: "",
        address: "",
        state: "",
        city: "",
        pincode: "",
        adminName: "",
        adminDesignation: "",
        email: "",
        phone: "",
        alternatePhone: "",
        recognitionType: "",
        courses: "",
        infrastructure: ""
      });
      setShowAddCollegeModal(false);

    } catch (error) {
      showToast.error("Error adding college. Please try again.");
    } finally {
      setIsSubmittingCollege(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await apiService.superAdminApproveRequest(id);
      showToast.success("College request approved successfully!");
      await loadRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error approving request:", error);
      showToast.error("Failed to approve request");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Please enter rejection reason:");
    if (reason && reason.trim()) {
      try {
        await apiService.superAdminRejectRequest(id, reason.trim());
        showToast.success("College request rejected.");
        await loadRequests();
        setSelectedRequest(null);
      } catch (error) {
        console.error("Error rejecting request:", error);
        showToast.error("Failed to reject request");
      }
    }
  };

  const filteredRequests = requests;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">College Registration Requests</h1>
        <div className="flex items-center gap-4">
          {/* Add College Button */}
          <button
            onClick={() => setShowAddCollegeModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add College
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  College Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{request.collegeName}</div>
                      <div className="text-sm text-gray-500">{request.city}, {request.state}</div>
                      <div className="text-xs text-gray-400">Est. {request.establishedYear}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{request.adminName}</div>
                      <div className="text-sm text-gray-500">{request.email}</div>
                      <div className="text-sm text-gray-500">{request.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(request._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No requests found for the selected filter.
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* College Information */}
              <div>
                <h3 className="text-lg font-medium mb-3">College Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">College Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.collegeName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.city}, {selectedRequest.state}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Established Year</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.establishedYear}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Affiliation</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.affiliation}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Students</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.totalStudents}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Faculty</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.totalFaculty}</p>
                  </div>
                </div>
              </div>

              {/* Admin Information */}
              <div>
                <h3 className="text-lg font-medium mb-3">Admin Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.adminName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Request Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Submitted Documents</h3>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Image src="/home.png" alt="document" width={16} height={16} />
                        <a href={doc} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex-1">
                          Document {index + 1}
                        </a>
                        <a href={doc} download className="ml-auto text-blue-600 hover:text-blue-800 text-sm">
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedRequest.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(selectedRequest._id)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest._id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reject Request
                  </button>
                </div>
              )}

              {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800">Rejection Reason:</h4>
                  <p className="text-sm text-red-700 mt-1">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add College Modal */}
      {showAddCollegeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Add New College</h2>
                <button
                  onClick={() => {
                    setShowAddCollegeModal(false);
                    setCollegeFormErrors({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleCollegeFormSubmit} className="p-6">
              {/* College Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">College Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College Name *
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      value={collegeFormData.collegeName}
                      onChange={handleCollegeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.collegeName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter college name"
                    />
                    {collegeFormErrors.collegeName && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.collegeName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College Type *
                    </label>
                    <select
                      name="collegeType"
                      value={collegeFormData.collegeType}
                      onChange={handleCollegeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.collegeType ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Select college type</option>
                      <option value="engineering">Engineering</option>
                      <option value="medical">Medical</option>
                      <option value="arts">Arts & Science</option>
                      <option value="commerce">Commerce</option>
                      <option value="law">Law</option>
                      <option value="management">Management</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="other">Other</option>
                    </select>
                    {collegeFormErrors.collegeType && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.collegeType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Established Year *
                    </label>
                    <input
                      type="number"
                      name="establishedYear"
                      value={collegeFormData.establishedYear}
                      onChange={handleCollegeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.establishedYear ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="e.g., 2005"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                    {collegeFormErrors.establishedYear && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.establishedYear}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Affiliation/University *
                    </label>
                    <input
                      type="text"
                      name="affiliation"
                      value={collegeFormData.affiliation}
                      onChange={handleCollegeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.affiliation ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="e.g., University of Mumbai"
                    />
                    {collegeFormErrors.affiliation && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.affiliation}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recognition Type *
                    </label>
                    <select
                      name="recognitionType"
                      value={collegeFormData.recognitionType}
                      onChange={handleCollegeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.recognitionType ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Select recognition type</option>
                      <option value="ugc">UGC Recognized</option>
                      <option value="aicte">AICTE Approved</option>
                      <option value="naac">NAAC Accredited</option>
                      <option value="state">State Government Recognized</option>
                      <option value="deemed">Deemed University</option>
                      <option value="private">Private University</option>
                      <option value="other">Other</option>
                    </select>
                    {collegeFormErrors.recognitionType && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.recognitionType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Students
                    </label>
                    <input
                      type="number"
                      name="totalStudents"
                      value={collegeFormData.totalStudents}
                      onChange={handleCollegeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Faculty
                    </label>
                    <input
                      type="number"
                      name="totalFaculty"
                      value={collegeFormData.totalFaculty}
                      onChange={handleCollegeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 150"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={collegeFormData.website}
                      onChange={handleCollegeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://www.college.edu"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Courses Offered
                    </label>
                    <textarea
                      name="courses"
                      value={collegeFormData.courses}
                      onChange={handleCollegeFormChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="List the main courses/programs offered"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College Description
                    </label>
                    <textarea
                      name="description"
                      value={collegeFormData.description}
                      onChange={handleCollegeFormChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description about the college"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Address *
                    </label>
                    <textarea
                      name="address"
                      value={collegeFormData.address}
                      onChange={handleCollegeFormChange}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter complete address"
                    />
                    {collegeFormErrors.address && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={collegeFormData.state}
                      onChange={handleCollegeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="e.g., Maharashtra"
                    />
                    {collegeFormErrors.state && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={collegeFormData.city}
                      onChange={handleCollegeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="e.g., Mumbai"
                    />
                    {collegeFormErrors.city && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={collegeFormData.pincode}
                      onChange={handleCollegeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.pincode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="e.g., 400001"
                      maxLength="6"
                    />
                    {collegeFormErrors.pincode && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.pincode}</p>}
                  </div>
                </div>
              </div>

              {/* Admin Contact Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Administrative Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Name *
                    </label>
                    <input
                      type="text"
                      name="adminName"
                      value={collegeFormData.adminName}
                      onChange={handleCollegeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.adminName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Full name of the admin"
                    />
                    {collegeFormErrors.adminName && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.adminName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      name="adminDesignation"
                      value={collegeFormData.adminDesignation}
                      onChange={handleCollegeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.adminDesignation ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="e.g., Principal, Director"
                    />
                    {collegeFormErrors.adminDesignation && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.adminDesignation}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={collegeFormData.email}
                      onChange={handleCollegeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="admin@college.edu"
                    />
                    {collegeFormErrors.email && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={collegeFormData.phone}
                      onChange={handleCollegeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${collegeFormErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="+91 9876543210"
                    />
                    {collegeFormErrors.phone && <p className="text-red-500 text-xs mt-1">{collegeFormErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alternate Phone Number
                    </label>
                    <input
                      type="tel"
                      name="alternatePhone"
                      value={collegeFormData.alternatePhone}
                      onChange={handleCollegeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 9876543211"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Infrastructure Details
                    </label>
                    <textarea
                      name="infrastructure"
                      value={collegeFormData.infrastructure}
                      onChange={handleCollegeFormChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of college infrastructure"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCollegeModal(false);
                    setCollegeFormErrors({});
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCollege}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingCollege ? "Adding College..." : "Add College"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRequestsPage;