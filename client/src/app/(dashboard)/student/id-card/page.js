"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { apiService } from "@/lib/api";
import { FiClock, FiCheckCircle, FiXCircle, FiFileText } from "react-icons/fi";

export default function StudentIdCard() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveForm();
    fetchMyApplications();
  }, []);

  const fetchActiveForm = async () => {
    try {
      const response = await apiService.request("/id-card-student/form/active", { method: "GET" });
      setActiveForm(response.data.form);
      setHasApplied(response.data.hasApplied);
    } catch (error) {
      // No active form or error
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await apiService.request("/id-card-student/my-applications", { method: "GET" });
      setApplications(response.data);
    } catch (error) {
      console.error("Failed to fetch applications");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: FiClock, label: "Pending" },
      under_review: { bg: "bg-blue-100", text: "text-blue-800", icon: FiFileText, label: "Under Review" },
      approved: { bg: "bg-green-100", text: "text-green-800", icon: FiCheckCircle, label: "Approved" },
      printing: { bg: "bg-purple-100", text: "text-purple-800", icon: FiFileText, label: "Printing" },
      ready: { bg: "bg-indigo-100", text: "text-indigo-800", icon: FiCheckCircle, label: "Ready for Collection" },
      dispatched: { bg: "bg-gray-100", text: "text-gray-800", icon: FiCheckCircle, label: "Dispatched" },
      rejected: { bg: "bg-red-100", text: "text-red-800", icon: FiXCircle, label: "Rejected" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full ${config.bg} ${config.text}`}>
        <Icon size={16} />
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const config = {
      completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      failed: { bg: "bg-red-100", text: "text-red-800", label: "Failed" }
    };
    const paymentConfig = config[status] || config.pending;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${paymentConfig.bg} ${paymentConfig.text}`}>
        {paymentConfig.label}
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ID Card Application</h1>
        <p className="text-gray-600">Apply for your student ID card and track status</p>
      </div>

      {/* Active Form Card */}
      {activeForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-black">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold">{activeForm.title}</h2>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
              </div>
              <p className="text-gray-600 mb-4">{activeForm.instructions}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Academic Year</p>
                  <p className="font-semibold">{activeForm.academicYear}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Application Fee</p>
                  <p className="font-semibold text-lg">₹{activeForm.fee}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Deadline</p>
                  <p className="font-semibold text-red-600">
                    {new Date(activeForm.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {activeForm.requiredDocuments && activeForm.requiredDocuments.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Required Documents:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {activeForm.requiredDocuments.map((doc, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {doc.name} {doc.description && `- ${doc.description}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            {!hasApplied && new Date() <= new Date(activeForm.deadline) ? (
              <button
                onClick={() => router.push("/student/id-card/apply")}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium"
              >
                Apply Now
              </button>
            ) : hasApplied ? (
              <div className="px-6 py-2 bg-gray-100 text-gray-600 rounded-md font-medium">
                Already Applied
              </div>
            ) : (
              <div className="px-6 py-2 bg-red-100 text-red-600 rounded-md font-medium">
                Deadline Passed
              </div>
            )}
          </div>
        </div>
      )}

      {!activeForm && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
          <p className="text-yellow-800 font-medium">No active ID card application form available at the moment.</p>
          <p className="text-sm text-yellow-700 mt-2">Please check back later or contact the administration.</p>
        </div>
      )}

      {/* My Applications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">My Applications</h2>

        {applications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiFileText size={48} className="mx-auto mb-3 opacity-50" />
            <p>No applications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/student/id-card/application/${app._id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{app.formId?.title || "ID Card Application"}</h3>
                    <p className="text-sm text-gray-600">Academic Year: {app.academicYear}</p>
                    <p className="text-sm text-gray-600">
                      Applied on: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    {getPaymentBadge(app.paymentStatus)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Amount</p>
                    <p className="font-semibold">₹{app.paymentAmount}</p>
                  </div>
                  {app.idCardNumber && (
                    <div>
                      <p className="text-sm text-gray-600">ID Card Number</p>
                      <p className="font-semibold">{app.idCardNumber}</p>
                    </div>
                  )}
                </div>

                {app.remarks && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700">Remarks:</p>
                    <p className="text-sm text-gray-600">{app.remarks}</p>
                  </div>
                )}

                {app.status === 'ready' && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800 font-medium">
                      Your ID card is ready for collection! Please visit the administration office.
                    </p>
                  </div>
                )}

                {app.status === 'dispatched' && app.dispatchDate && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800 font-medium">
                      Your ID card has been dispatched on {new Date(app.dispatchDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {app.paymentStatus === 'pending' && (
                  <div className="mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/student/id-card/payment/${app._id}`);
                      }}
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm"
                    >
                      Complete Payment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
