"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";

export default function ViewPrintReceiptsPage() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [imageSrc, setImageSrc] = useState("https://i.pravatar.cc/100?img=12");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [semesterReceipts, setSemesterReceipts] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const toAbsoluteUrl = (url) => {
    if (!url) return "/noAvatar.png";
    try {
      // Already absolute (http/https)
      if (/^https?:\/\//i.test(url)) return url;
      // Remove leading slashes to avoid double slashes
      const cleaned = url.startsWith("/") ? url.slice(1) : url;
      const base = process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
      return `${base}/${cleaned}`;
    } catch {
      return "/noAvatar.png";
    }
  };

  useEffect(() => {
    if (user) {
      setStudentData({
        name: user.name,
        enrollment: user.enrollment,
        department: user.department,
        photo: user.photo,
      });
      // Initialize image source with user photo if valid, else fallback
      const candidate = typeof user.photo === "string" && user.photo.trim().length > 0 ? user.photo : "/noAvatar.png";
      setImageSrc(candidate);
      setAvailableSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const res = await apiService.get("/api/v1/student/me");
        const profile = res?.data || {};
        const rawPhoto = (typeof profile.photo === "string" && profile.photo.trim().length > 0)
          ? profile.photo
          : (typeof profile.avatarUrl === "string" && profile.avatarUrl.trim().length > 0 ? profile.avatarUrl : "/noAvatar.png");
        const photoUrl = toAbsoluteUrl(rawPhoto);
        setStudentData({
          name: profile.name || user.name,
          enrollment: profile.enrollment || user.enrollment,
          department: profile.department || user.department,
          photo: photoUrl,
        });
        setImageSrc(photoUrl);
        // TODO: fetch semesters from backend if available
        setAvailableSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
      } catch (err) {
        setStudentData({
          name: user.name,
          enrollment: user.enrollment,
          department: user.department,
          photo: "/noAvatar.png",
        });
        setImageSrc("/noAvatar.png");
      }
    };
    fetchProfile();
  }, [user]);

  // Fetch all payment receipts
  useEffect(() => {
    if (!user) {
      console.log("⚠️ No user, skipping fetch");
      return;
    }
    const fetchPayments = async () => {
      setLoading(true);
      try {
        console.log("🔍 Starting to fetch payments for user:", user);
        console.log("🌐 Fetching from: /api/v1/razorpay/payments");
        const res = await apiService.request("/razorpay/payments", { method: "GET" });
        console.log("✅ Full API response:", res);
        console.log("✅ Response type:", typeof res);
        console.log("✅ Response keys:", res ? Object.keys(res) : 'null');
        
        // Backend returns { success: true, data: [...] }
        const payments = res?.data || [];
        
        console.log("📦 Payments array:", payments);
        console.log("📊 Number of payments:", payments.length);
        if (payments.length > 0) {
          console.log("🎯 First payment:", payments[0]);
        } else {
          console.log("⚠️ No payments found in response");
        }
        setAllPayments(payments);
      } catch (err) {
        console.error("❌ Error fetching payments:", err);
        console.error("❌ Error details:", {
          message: err.message,
          status: err.status,
          endpoint: err.endpoint
        });
        setAllPayments([]);
      } finally {
        setLoading(false);
        console.log("✔️ Fetch complete");
      }
    };
    fetchPayments();
  }, [user]);
  const handleSemesterSelect = (semester) => {
    setSelectedSemester(semester);
    console.log("Selected semester:", semester);
    console.log("All payments:", allPayments);
    
    if (!semester || semester === "all") {
      // Show all payments
      console.log("Showing all payments");
      setSemesterReceipts(allPayments);
      return;
    }
    
    // Filter payments by semester
    const semesterNum = parseInt(semester);
    const filtered = allPayments.filter(payment => {
      console.log("Payment semester:", payment.semester, "Selected:", semesterNum);
      // Match semester if available
      if (payment.semester) {
        return payment.semester === semesterNum;
      }
      // If no semester info, don't show it
      return false;
    });
    console.log("Filtered payments:", filtered);
    setSemesterReceipts(filtered);
  };

  const generateReceiptHTML = (payment) => {
    const receiptDate = payment.transactionDate 
      ? new Date(payment.transactionDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    const academicYear = payment.session || '2024-25';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fee Payment Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; background: white; }
    .receipt-container { max-width: 900px; margin: 0 auto; border: 2px solid #000; }
    .receipt-header { text-align: center; padding: 20px; border-bottom: 2px solid #000; background: #f8f9fa; }
    .receipt-header h1 { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .receipt-body { padding: 30px; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #ddd; }
    .info-label { font-weight: bold; font-size: 16px; }
    .info-value { text-align: right; font-size: 16px; }
    .fee-table { width: 100%; margin-top: 30px; border-collapse: collapse; }
    .fee-table th { background: #e9ecef; padding: 15px; text-align: left; border: 1px solid #000; font-size: 16px; font-weight: bold; }
    .fee-table td { padding: 15px; border: 1px solid #ddd; font-size: 16px; }
    .total-row { background: #f8f9fa; font-weight: bold; font-size: 18px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #000; text-align: center; font-size: 14px; color: #666; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="receipt-header">
      <h1>Fee Payment Receipt</h1>
    </div>
    
    <div class="receipt-body">
      <div class="info-row">
        <span class="info-label">Receipt Number:</span>
        <span class="info-value">RCP-${payment.id || payment.transactionId}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${receiptDate}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Student Name:</span>
        <span class="info-value">${payment.studentName || studentData?.name || 'N/A'}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Enrollment Number:</span>
        <span class="info-value">${payment.enrollmentNo || studentData?.enrollment || 'N/A'}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Semester:</span>
        <span class="info-value">${payment.semester || 'N/A'}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Academic Year:</span>
        <span class="info-value">${academicYear}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Payment Method:</span>
        <span class="info-value">${payment.paymentMode || 'Razorpay'}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Transaction ID:</span>
        <span class="info-value">${payment.transactionId}</span>
      </div>
      
      <table class="fee-table">
        <thead>
          <tr>
            <th>Fee Type</th>
            <th style="text-align: right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${payment.feeHead || 'Tuition Fee'}</td>
            <td style="text-align: right;">${payment.amount || 0}</td>
          </tr>
          <tr class="total-row">
            <td>Total Amount Paid</td>
            <td style="text-align: right;">₹${payment.amount || 0}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="footer">
        <p>This is a computer-generated receipt and does not require a signature.</p>
        <p>For any queries, please contact the accounts department.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  };

  const printReceipt = (payment) => {
    const receiptHTML = generateReceiptHTML(payment);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const downloadReceipt = (payment) => {
    const receiptHTML = generateReceiptHTML(payment);
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fee_Receipt_RCP-${payment.id || payment.transactionId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Student Information Card */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Image
                src={imageSrc}
                alt=""
                width={60}
                height={60}
                className="rounded-full object-cover mr-4"
                unoptimized
                onError={() => setImageSrc("/noAvatar.png")}
                priority
              />
              <div>
                <h3 className="font-semibold text-lg">{studentData?.name}</h3>
                <p className="text-gray-600">{studentData?.enrollment}</p>
                <p className="text-sm text-gray-500">{studentData?.department}</p>
              </div>
            </div>
          </div>

          {/* Semester Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Semester to View Receipts:
            </label>
            {allPayments.length > 0 && (
              <p className="text-sm text-gray-600 mb-2">
                {allPayments.length} payment(s) found
              </p>
            )}
            <select
              value={selectedSemester}
              onChange={(e) => handleSemesterSelect(e.target.value)}
              className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">-- Select Semester --</option>
              <option value="all">All Semesters</option>
              {availableSemesters.map((semester, index) => (
                <option key={index} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </div>

          {/* Receipts Display */}
          {selectedSemester && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {selectedSemester === "all" ? "All Receipts" : `Receipts for Semester ${selectedSemester}`}
              </h2>

              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading receipts...</p>
                </div>
              ) : semesterReceipts.length === 0 ? (
                <div className="text-center py-16">
                  <Image
                    src="/empty.png"
                    alt=""
                    width={80}
                    height={80}
                    className="mx-auto mb-4 opacity-50"
                  />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    No Receipts Found
                  </h3>
                  <p className="text-gray-600">
                    No payment receipts found for Semester {selectedSemester}.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {semesterReceipts.map((payment, index) => (
                    <div
                      key={payment.id || index}
                      className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">
                            Receipt #{payment.id || payment.transactionId}
                          </h3>
                          <p className="text-gray-600">
                            Payment Date: {payment.transactionDate ? new Date(payment.transactionDate).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Fee Head: {payment.feeHead}
                          </p>
                          <p className="text-sm text-gray-500">
                            Session: {payment.session}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-600">
                            ₹{payment.amount?.toLocaleString?.() || payment.amount}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.transactionStatus === 'success' ? '✓ Paid' : payment.transactionStatus}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => printReceipt(payment)}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
                        >
                          Print Receipt
                        </button>
                        <button
                          onClick={() => downloadReceipt(payment)}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
                        >
                          Download Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
