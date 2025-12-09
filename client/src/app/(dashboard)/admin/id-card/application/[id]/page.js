"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { apiService } from "@/lib/api";
import { FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin, FiBook } from "react-icons/fi";

export default function ApplicationDetails() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    remarks: "",
    idCardNumber: "",
    dispatchDate: ""
  });

  useEffect(() => {
    fetchApplication();
  }, [params.id]);

  const fetchApplication = async () => {
    try {
      const response = await apiService.request(`/id-card/applications/${params.id}`, { method: "GET" });
      setApplication(response.data);
      setStatusUpdate({ ...statusUpdate, status: response.data.status });
    } catch (error) {
      showToast.error("Failed to fetch application details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiService.request(`/id-card/applications/${params.id}/status`, {
        method: "PATCH",
        body: statusUpdate
      });
      showToast.success("Status updated successfully");
      setShowStatusModal(false);
      fetchApplication();
    } catch (error) {
      showToast.error(error.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      under_review: { bg: "bg-blue-100", text: "text-blue-800", label: "Under Review" },
      approved: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
      printing: { bg: "bg-purple-100", text: "text-purple-800", label: "Printing" },
      ready: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Ready" },
      dispatched: { bg: "bg-gray-100", text: "text-gray-800", label: "Dispatched" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 text-sm rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Application not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
        >
          <FiArrowLeft /> Back
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ID Card Application Details</h1>
            <p className="text-gray-600">Application ID: {application._id}</p>
          </div>
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Update Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiUser /> Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">{application.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">{new Date(application.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="font-medium">{application.bloodGroup || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Enrollment No</p>
                <p className="font-medium">{application.enrollmentNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Father's Name</p>
                <p className="font-medium">{application.fatherName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mother's Name</p>
                <p className="font-medium">{application.motherName}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiPhone /> Contact Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{application.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{application.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Permanent Address</p>
                <p className="font-medium">{application.permanentAddress}</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiBook /> Academic Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Course</p>
                <p className="font-medium">{application.course}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Branch</p>
                <p className="font-medium">{application.branch}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Semester</p>
                <p className="font-medium">{application.semester}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Academic Year</p>
                <p className="font-medium">{application.academicYear}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Documents</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Photo</p>
                {application.photoUrl && (
                  <img
                    src={application.photoUrl}
                    alt="Student Photo"
                    className="w-32 h-32 object-cover rounded border"
                  />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Signature</p>
                {application.signatureUrl && (
                  <img
                    src={application.signatureUrl}
                    alt="Student Signature"
                    className="w-32 h-16 object-contain rounded border"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Status History</h2>
            <div className="space-y-3">
              {application.statusHistory.map((history, index) => (
                <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(history.status)}
                    <span className="text-sm text-gray-600">
                      {new Date(history.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {history.remarks && (
                    <p className="text-sm text-gray-600 mt-1">{history.remarks}</p>
                  )}
                  {history.updatedBy && (
                    <p className="text-xs text-gray-500 mt-1">
                      Updated by: {history.updatedBy.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Current Status</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                {getStatusBadge(application.status)}
              </div>
              {application.idCardNumber && (
                <div>
                  <p className="text-sm text-gray-600">ID Card Number</p>
                  <p className="font-medium">{application.idCardNumber}</p>
                </div>
              )}
              {application.dispatchDate && (
                <div>
                  <p className="text-sm text-gray-600">Dispatch Date</p>
                  <p className="font-medium">{new Date(application.dispatchDate).toLocaleDateString()}</p>
                </div>
              )}
              {application.remarks && (
                <div>
                  <p className="text-sm text-gray-600">Remarks</p>
                  <p className="text-sm">{application.remarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium text-lg">₹{application.paymentAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  application.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                  application.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {application.paymentStatus}
                </span>
              </div>
              {application.paymentId && (
                <div>
                  <p className="text-sm text-gray-600">Payment ID</p>
                  <p className="text-sm font-mono">{application.paymentId}</p>
                </div>
              )}
              {application.paymentDate && (
                <div>
                  <p className="text-sm text-gray-600">Payment Date</p>
                  <p className="text-sm">{new Date(application.paymentDate).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div> */}

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium">{new Date(application.createdAt).toLocaleString()}</p>
              </div>
              {application.reviewedAt && (
                <div>
                  <p className="text-gray-600">Reviewed</p>
                  <p className="font-medium">{new Date(application.reviewedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Application Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="printing">Printing</option>
                  <option value="ready">Ready</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {(statusUpdate.status === 'approved' || statusUpdate.status === 'printing' || 
                statusUpdate.status === 'ready' || statusUpdate.status === 'dispatched') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID Card Number</label>
                  <input
                    type="text"
                    value={statusUpdate.idCardNumber}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, idCardNumber: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="e.g., IDC2024001"
                  />
                </div>
              )}

              {statusUpdate.status === 'dispatched' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dispatch Date</label>
                  <input
                    type="date"
                    value={statusUpdate.dispatchDate}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, dispatchDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <textarea
                  value={statusUpdate.remarks}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, remarks: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Add any remarks or notes"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
