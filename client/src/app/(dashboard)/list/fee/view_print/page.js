"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  currentStudentLogin, 
  paymentHistory 
} from "@/lib/data";

const ViewPrintPage = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [semesterReceipts, setSemesterReceipts] = useState([]);

  useEffect(() => {
    // Simulate loading student data
    setTimeout(() => {
      const currentStudent = currentStudentLogin;
      setStudentData(currentStudent);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSemesterSelect = (semester) => {
    setSelectedSemester(semester);
    // Filter payment history for selected semester
    const receipts = paymentHistory.filter(p => 
      p.studentEnrollment === studentData?.enrollment && 
      p.semester === semester &&
      p.status === 'Completed'
    );
    setSemesterReceipts(receipts);
  };

  const printReceipt = (payment) => {
    const printWindow = window.open('', '_blank');
    const feeBreakdown = payment.feeBreakdown || {};
    const receiptHTML = `
      <html>
        <head>
          <title>Fee Receipt - ${payment.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .fee-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .fee-table th, .fee-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .fee-table th { background-color: #f2f2f2; }
            .total { font-weight: bold; background-color: #e8f4fd; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BUDDHI COLLEGE</h1>
            <h2>Fee Payment Receipt</h2>
          </div>
          
          <div class="details">
            <div class="row"><strong>Receipt Number:</strong> ${payment.receiptNumber}</div>
            <div class="row"><strong>Date:</strong> ${payment.paymentDate}</div>
            <div class="row"><strong>Student Name:</strong> ${payment.studentName}</div>
            <div class="row"><strong>Enrollment Number:</strong> ${payment.studentEnrollment}</div>
            <div class="row"><strong>Semester:</strong> ${payment.semester}</div>
            <div class="row"><strong>Academic Year:</strong> ${payment.academicYear}</div>
            <div class="row"><strong>Payment Method:</strong> ${payment.paymentMethod}</div>
            <div class="row"><strong>Transaction ID:</strong> ${payment.transactionId}</div>
          </div>

          <table class="fee-table">
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${feeBreakdown.tuitionFee > 0 ? `<tr><td>Tuition Fee</td><td>${feeBreakdown.tuitionFee.toLocaleString()}</td></tr>` : ''}
              ${feeBreakdown.libraryFee > 0 ? `<tr><td>Library Fee</td><td>${feeBreakdown.libraryFee.toLocaleString()}</td></tr>` : ''}
              ${feeBreakdown.labFee > 0 ? `<tr><td>Laboratory Fee</td><td>${feeBreakdown.labFee.toLocaleString()}</td></tr>` : ''}
              ${feeBreakdown.sportsFee > 0 ? `<tr><td>Sports Fee</td><td>${feeBreakdown.sportsFee.toLocaleString()}</td></tr>` : ''}
              ${feeBreakdown.developmentFee > 0 ? `<tr><td>Development Fee</td><td>${feeBreakdown.developmentFee.toLocaleString()}</td></tr>` : ''}
              ${feeBreakdown.examFee > 0 ? `<tr><td>Examination Fee</td><td>${feeBreakdown.examFee.toLocaleString()}</td></tr>` : ''}
              ${feeBreakdown.hostelFee > 0 ? `<tr><td>Hostel Fee</td><td>${feeBreakdown.hostelFee.toLocaleString()}</td></tr>` : ''}
              ${feeBreakdown.messFee > 0 ? `<tr><td>Mess Fee</td><td>${feeBreakdown.messFee.toLocaleString()}</td></tr>` : ''}
              ${feeBreakdown.lateFee > 0 ? `<tr><td>Late Fee</td><td>${feeBreakdown.lateFee.toLocaleString()}</td></tr>` : ''}
              <tr class="total"><td><strong>Total Amount Paid</strong></td><td><strong>₹${payment.amount.toLocaleString()}</strong></td></tr>
            </tbody>
          </table>

          <div class="footer">
            <p>This is a computer-generated receipt. No signature required.</p>
            <p>For any queries, contact the Finance Office.</p>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Print Receipt</button>
            <button onclick="window.close()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
  };

  const downloadReceipt = (payment) => {
    const receiptHTML = `
      <html>
        <head>
          <title>Fee Receipt - ${payment.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .fee-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .fee-table th, .fee-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .fee-table th { background-color: #f2f2f2; }
            .total { font-weight: bold; background-color: #e8f4fd; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BUDDHI COLLEGE</h1>
            <h2>Fee Payment Receipt</h2>
          </div>
          
          <div class="details">
            <div class="row"><strong>Receipt Number:</strong> ${payment.receiptNumber}</div>
            <div class="row"><strong>Date:</strong> ${payment.paymentDate}</div>
            <div class="row"><strong>Student Name:</strong> ${payment.studentName}</div>
            <div class="row"><strong>Enrollment Number:</strong> ${payment.studentEnrollment}</div>
            <div class="row"><strong>Semester:</strong> ${payment.semester}</div>
            <div class="row"><strong>Academic Year:</strong> ${payment.academicYear}</div>
            <div class="row"><strong>Payment Method:</strong> ${payment.paymentMethod}</div>
            <div class="row"><strong>Transaction ID:</strong> ${payment.transactionId}</div>
          </div>

          <table class="fee-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Total Fee Amount</td><td>${payment.amount}</td></tr>
              <tr class="total"><td><strong>Total Amount Paid</strong></td><td><strong>₹${payment.amount}</strong></td></tr>
            </tbody>
          </table>

          <div class="footer">
            <p>This is a computer-generated receipt. No signature required.</p>
            <p>For any queries, contact the Finance Office.</p>
          </div>
        </body>
      </html>
    `;

    // Create and download receipt
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fee_Receipt_${payment.receiptNumber}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  const availableSemesters = [...new Set(paymentHistory
    .filter(p => p.studentEnrollment === studentData?.enrollment && p.status === 'Completed')
    .map(p => p.semester)
  )].sort();

  return (
    <div className="flex-1 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Fee Receipt Viewer</h1>
            <div className="text-right">
              <p className="text-sm text-gray-500">Student Portal</p>
              <p className="font-semibold">{studentData?.name}</p>
            </div>
          </div>

          {/* Student Information Card */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Image 
                src={studentData?.photo || "/noAvatar.png"} 
                alt="" 
                width={60} 
                height={60} 
                className="rounded-full object-cover mr-4"
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
            <select
              value={selectedSemester}
              onChange={(e) => handleSemesterSelect(e.target.value)}
              className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">-- Select Semester --</option>
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
                Receipts for Semester {selectedSemester}
              </h2>
              
              {semesterReceipts.length === 0 ? (
                <div className="text-center py-16">
                  <Image src="/empty.png" alt="" width={80} height={80} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">No Receipts Found</h3>
                  <p className="text-gray-600">No payment receipts found for Semester {selectedSemester}.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {semesterReceipts.map((payment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">
                            Receipt #{payment.receiptNumber}
                          </h3>
                          <p className="text-gray-600">Payment Date: {payment.paymentDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-600">₹{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                        </div>
                      </div>
                      
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Student Name:</span>
                          <span className="font-medium">{payment.studentName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Enrollment:</span>
                          <span className="font-medium">{payment.studentEnrollment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Semester:</span>
                          <span className="font-medium">{payment.semester}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Academic Year:</span>
                          <span className="font-medium">{payment.academicYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-medium">{payment.transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fee Breakdown Display */}
                    {payment.feeBreakdown && (
                      <div className="mb-6 bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Fee Breakdown:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          {payment.feeBreakdown.tuitionFee > 0 && <div className="flex justify-between"><span>Tuition Fee:</span><span>₹{payment.feeBreakdown.tuitionFee.toLocaleString()}</span></div>}
                          {payment.feeBreakdown.libraryFee > 0 && <div className="flex justify-between"><span>Library Fee:</span><span>₹{payment.feeBreakdown.libraryFee.toLocaleString()}</span></div>}
                          {payment.feeBreakdown.labFee > 0 && <div className="flex justify-between"><span>Lab Fee:</span><span>₹{payment.feeBreakdown.labFee.toLocaleString()}</span></div>}
                          {payment.feeBreakdown.sportsFee > 0 && <div className="flex justify-between"><span>Sports Fee:</span><span>₹{payment.feeBreakdown.sportsFee.toLocaleString()}</span></div>}
                          {payment.feeBreakdown.developmentFee > 0 && <div className="flex justify-between"><span>Development Fee:</span><span>₹{payment.feeBreakdown.developmentFee.toLocaleString()}</span></div>}
                          {payment.feeBreakdown.examFee > 0 && <div className="flex justify-between"><span>Exam Fee:</span><span>₹{payment.feeBreakdown.examFee.toLocaleString()}</span></div>}
                          {payment.feeBreakdown.hostelFee > 0 && <div className="flex justify-between"><span>Hostel Fee:</span><span>₹{payment.feeBreakdown.hostelFee.toLocaleString()}</span></div>}
                          {payment.feeBreakdown.messFee > 0 && <div className="flex justify-between"><span>Mess Fee:</span><span>₹{payment.feeBreakdown.messFee.toLocaleString()}</span></div>}
                          {payment.feeBreakdown.lateFee > 0 && <div className="flex justify-between text-red-600"><span>Late Fee:</span><span>₹{payment.feeBreakdown.lateFee.toLocaleString()}</span></div>}
                        </div>
                      </div>
                    )}                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => printReceipt(payment)}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                          </svg>
                          Print Receipt
                        </button>
                        <button
                          onClick={() => downloadReceipt(payment)}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
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
};

export default ViewPrintPage;
