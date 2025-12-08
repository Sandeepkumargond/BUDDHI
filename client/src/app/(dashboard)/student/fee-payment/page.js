"use client";

import { useState, useEffect } from "react";
import RazorpayPaymentButton from "@/components/RazorpayPaymentButton";

export default function StudentFeePaymentPage() {
  const [feeStructures, setFeeStructures] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [activeTab, setActiveTab] = useState("pay"); // "pay" or "history"
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [adminCheckStatus, setAdminCheckStatus] = useState(null); // For debugging

  useEffect(() => {
    checkAdminConfig(); // NEW: Check if admin configured Razorpay
    fetchStudentData();
    fetchFeeStructures();
    fetchFeePayments();
  }, []);

  const checkAdminConfig = async () => {
    try {
      console.log("🔍 Checking if admin configured Razorpay...");
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") +
          "/api/v1/razorpay/credentials",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success && data.data) {
        console.log("✅ Razorpay configured!");
        setAdminCheckStatus("configured");
      } else {
        console.warn("⚠️ Razorpay NOT configured by admin");
        setAdminCheckStatus("not-configured");
      }
    } catch (err) {
      console.error("❌ Error checking Razorpay config:", err);
      setAdminCheckStatus("error");
    }
  };

  const fetchStudentData = async () => {
    try {
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") +
          "/api/v1/student/profile",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      console.log("Student data:", data);
      if (data.success && data.data) {
        console.log("Student details:", {
          branch: data.data.branch,
          semester: data.data.semester,
          program: data.data.program
        });
        setStudentData(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch student data:", err);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      console.log("Fetching fee structures from:", (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") + "/api/v1/student/fee-structure");
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") +
          "/api/v1/student/fee-structure",
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      console.log("Fee structures response status:", res.status);
      const data = await res.json();
      console.log("Fee structures response:", data);
      if (data.success && data.data) {
        if (data.data.structure) {
          // Single structure response
          console.log("Single fee structure found:", data.data.structure);
          setFeeStructures([data.data.structure]);
        } else if (Array.isArray(data.data)) {
          // Array response
          console.log("Fee structures array:", data.data);
          setFeeStructures(data.data);
        } else if (Array.isArray(data.data.items)) {
          // Ranked response
          console.log("Fee structures items array:", data.data.items);
          setFeeStructures(data.data.items.map(item => item.structure));
        }
      } else {
        console.error("API returned error:", data.message);
      }
    } catch (err) {
      console.error("Failed to fetch fee structures:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeePayments = async () => {
    try {
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") +
          "/api/v1/razorpay/payments",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      console.log("Fee payments response:", data);
      if (data.success && Array.isArray(data.data)) {
        console.log("Fee payments found:", data.data);
        setFeePayments(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch fee payments:", err);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setPaymentSuccess(true);
    setSuccessMessage(
      `Payment successful! Receipt ID: ${paymentData.id}`
    );
    setSelectedStructure(null);
    fetchFeePayments(); // Refresh payment history
    setTimeout(() => {
      setPaymentSuccess(false);
      setSuccessMessage("");
    }, 5000);
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
  };

  const getCurrentFeeStructure = () => {
    if (!studentData || feeStructures.length === 0) {
      console.log("Missing data:", { studentData, structuresCount: feeStructures.length });
      return null;
    }
    
    // The API might return a single structure that's already applicable
    if (feeStructures.length === 1) {
      console.log("Using single fee structure returned from API");
      return feeStructures[0];
    }
    
    // Otherwise, find matching structure
    const matched = feeStructures.find(
      (fs) => {
        const branchMatch = (fs.branch === studentData.branch || fs.branch === studentData.program);
        const semesterMatch = fs.semester === studentData.semester;
        const publishedMatch = fs.published;
        
        console.log("Checking structure:", {
          branch: fs.branch,
          studentBranch: studentData.branch,
          semester: fs.semester,
          studentSemester: studentData.semester,
          published: fs.published,
          matches: { branchMatch, semesterMatch, publishedMatch }
        });
        
        return branchMatch && semesterMatch && publishedMatch;
      }
    );
    
    if (!matched) {
      console.log("No matching fee structure found for student");
    } else {
      console.log("Found matching fee structure:", matched);
    }
    
    return matched;
  };

  const currentStructure = getCurrentFeeStructure();

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Fee Payment</h1>
          <p className="text-gray-600">
            View and pay your semester fees securely through Razorpay
          </p>
        </div>

        {/* Success Message */}
        {paymentSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Admin Config Warning */}
        {adminCheckStatus === "not-configured" && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
            <p className="font-semibold">⚠️ Payment Gateway Not Configured</p>
            <p className="text-sm mt-2">
              The admin needs to configure Razorpay credentials before you can pay.
              Please contact your administrator to:
            </p>
            <ol className="list-decimal list-inside text-sm mt-2 ml-2">
              <li>Go to Admin Dashboard → Settings → Razorpay</li>
              <li>Enter Razorpay Key ID and Key Secret</li>
              <li>Test credentials to verify they work</li>
              <li>Save the configuration</li>
            </ol>
          </div>
        )}

        {adminCheckStatus === "error" && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
            <p className="font-semibold">❌ Error Checking Payment Setup</p>
            <p className="text-sm mt-2">
              There was an error verifying the payment gateway setup. Please refresh the page or contact support.
            </p>
          </div>
        )}

        {/* Student Info Card */}
        {studentData && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">
                  {studentData.firstName} {studentData.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Roll No</p>
                <p className="font-semibold">{studentData.rollNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Program</p>
                <p className="font-semibold">
                  {studentData.program} - {studentData.branch}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Semester</p>
                <p className="font-semibold">{studentData.semester}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("pay")}
            className={`pb-3 px-2 font-semibold border-b-2 transition ${
              activeTab === "pay"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Pay Fees
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-2 font-semibold border-b-2 transition ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Payment History
          </button>
        </div>

        {/* Pay Fees Tab */}
        {activeTab === "pay" && (
          <div>
            {currentStructure ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-6">
                  Current Semester Fee Structure
                </h2>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Session:</strong> {currentStructure.session}
                  </p>
                </div>

                <div className="space-y-4">
                  {currentStructure.feeHeads && Array.isArray(currentStructure.feeHeads) ? (
                    currentStructure.feeHeads.map((head, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {head.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Amount: ₹{Number(head.amount).toLocaleString()}
                          </p>
                        </div>
                        <RazorpayPaymentButton
                          feeStructureHeadId={head.name}
                          amount={Number(head.amount)}
                          session={currentStructure.session}
                          onPaymentSuccess={handlePaymentSuccess}
                          onPaymentError={handlePaymentError}
                          disabled={false}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No fee heads available</p>
                  )}
                </div>

                {/* Total Fee Summary */}
                {currentStructure.feeHeads && Array.isArray(currentStructure.feeHeads) && (
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">
                        Total Fees:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹
                        {currentStructure.feeHeads.reduce(
                          (sum, head) => sum + (Number(head.amount) || 0),
                          0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-600">
                  No fee structure available for your current semester.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please contact your department administrator.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === "history" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6">Payment History</h2>
            {feePayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Receipt ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Fee Head
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Session
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {feePayments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {payment.id}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {payment.feeHead}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {payment.session}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                          ₹{payment.amount}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              payment.transactionStatus === "success"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payment.transactionStatus || "pending"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                No payments recorded yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
