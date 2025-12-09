"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { apiService } from "@/lib/api";
import { FiArrowLeft, FiClock, FiCheckCircle, FiXCircle, FiFileText } from "react-icons/fi";

export default function StudentApplicationDetails() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, [params.id]);

  const fetchApplication = async () => {
    try {
      const response = await apiService.request(`/id-card-student/my-applications/${params.id}`, {
        method: "GET"
      });
      setApplication(response.data);
    } catch (error) {
      showToast.error("Failed to fetch application details");
      router.push("/student/id-card");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        icon: FiClock, 
        color: "text-yellow-600", 
        bg: "bg-yellow-100", 
        label: "Pending",
        description: "Your application is waiting for payment completion" 
      },
      under_review: { 
        icon: FiFileText, 
        color: "text-blue-600", 
        bg: "bg-blue-100", 
        label: "Under Review",
        description: "Your application is being reviewed by the administration" 
      },
      approved: { 
        icon: FiCheckCircle, 
        color: "text-green-600", 
        bg: "bg-green-100", 
        label: "Approved",
        description: "Your application has been approved" 
      },
      printing: { 
        icon: FiFileText, 
        color: "text-purple-600", 
        bg: "bg-purple-100", 
        label: "Printing",
        description: "Your ID card is being printed" 
      },
      ready: { 
        icon: FiCheckCircle, 
        color: "text-indigo-600", 
        bg: "bg-indigo-100", 
        label: "Ready for Collection",
        description: "Your ID card is ready! Please collect it from the admin office" 
      },
      dispatched: { 
        icon: FiCheckCircle, 
        color: "text-gray-600", 
        bg: "bg-gray-100", 
        label: "Dispatched",
        description: "Your ID card has been dispatched" 
      },
      rejected: { 
        icon: FiXCircle, 
        color: "text-red-600", 
        bg: "bg-red-100", 
        label: "Rejected",
        description: "Your application was rejected. Please check the remarks for details" 
      }
    };
    return configs[status] || configs.pending;
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

  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
        >
          <FiArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
        <p className="text-gray-600">Track your ID card application status</p>
      </div>

      {/* Status Banner */}
      <div className={`${statusConfig.bg} rounded-lg p-6 mb-6`}>
        <div className="flex items-start gap-4">
          <StatusIcon className={statusConfig.color} size={40} />
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${statusConfig.color}`}>{statusConfig.label}</h2>
            <p className={`${statusConfig.color} mt-1`}>{statusConfig.description}</p>
            {application.idCardNumber && (
              <div className="mt-3">
                <span className="text-sm font-medium">ID Card Number: </span>
                <span className="text-lg font-bold">{application.idCardNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Action */}
      {application.paymentStatus === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-medium mb-3">
            ⚠️ Payment Pending - Please complete the payment to proceed with your application
          </p>
          <button
            onClick={() => router.push(`/student/id-card/payment/${application._id}`)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Complete Payment
          </button>
        </div>
      )}

      {/* Rejection Notice */}
      {application.status === 'rejected' && application.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium mb-2">Rejection Reason:</p>
          <p className="text-red-700">{application.rejectionReason}</p>
        </div>
      )}

      {/* Dispatch Information */}
      {application.status === 'dispatched' && application.dispatchDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 font-medium">
            📦 Dispatched on: {new Date(application.dispatchDate).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
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
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
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

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{application.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{application.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{application.permanentAddress}</p>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Status History</h3>
            <div className="space-y-4">
              {application.statusHistory && application.statusHistory.map((history, index) => {
                const config = getStatusConfig(history.status);
                const HistoryIcon = config.icon;
                return (
                  <div key={index} className="flex gap-3 pb-4 border-b last:border-b-0">
                    <div className={`${config.bg} p-2 rounded-full h-fit`}>
                      <HistoryIcon className={config.color} size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{config.label}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(history.timestamp).toLocaleString()}
                      </p>
                      {history.remarks && (
                        <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">
                          {history.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold">₹{application.paymentAmount}</p>
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
                  <p className="text-xs font-mono break-all">{application.paymentId}</p>
                </div>
              )}
              {application.paymentDate && (
                <div>
                  <p className="text-sm text-gray-600">Payment Date</p>
                  <p className="text-sm">{new Date(application.paymentDate).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
            <div className="space-y-4">
              {application.photoUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Photo</p>
                  <img
                    src={application.photoUrl}
                    alt="Student Photo"
                    className="w-full rounded border"
                  />
                </div>
              )}
              {application.signatureUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Signature</p>
                  <img
                    src={application.signatureUrl}
                    alt="Signature"
                    className="w-full h-20 object-contain rounded border bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Application Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Application Info</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Application ID</p>
                <p className="font-mono text-xs break-all">{application._id}</p>
              </div>
              <div>
                <p className="text-gray-600">Submitted On</p>
                <p className="font-medium">{new Date(application.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
