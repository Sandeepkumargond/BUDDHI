"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";

const FeePaymentPage = () => {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  
  const { user, role } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [structures, setStructures] = useState([]);
  const [selectedStructureId, setSelectedStructureId] = useState(null);
  const [paymentMode, setPaymentMode] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showReceiptView, setShowReceiptView] = useState(false);

  useEffect(() => {
    // Check if we should show receipt view
    if (view === 'receipt') {
      setShowReceiptView(true);
    }
    
    const computeAcademicYear = (admissionDate, semester) => {
      if (!admissionDate || !semester) return null;
      try {
        const adm = new Date(admissionDate);
        if (isNaN(adm.getTime())) return null;
        // Assuming 2 semesters per academic year
        const offsetYears = Math.floor((Number(semester) - 1) / 2);
        const startYear = adm.getFullYear() + offsetYears;
        return `${startYear}-${startYear + 1}`;
      } catch {
        return null;
      }
    };

    const load = async () => {
      try {
        // Use authenticated user context for student identity
        if (role === 'student' && user) {
          setStudentData({
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            enrollment: user.enrollmentNo || user.registrationNumber || '—',
            department: user.branch || '—',
            program: user.program || '—',
            semester: user.semester || null,
            photo: user.imageUrl || null,
            isHosteller: user.isHosteller || false,
            hostelAlloted: user.hostelAlloted || null,
            roomNo: user.roomNo || null,
            academicYear: computeAcademicYear(user.dateOfAdmission, user.semester) || '—'
          });
        }

        // Fetch student's fee payments from backend
        const res = await apiService.listMyFeePayments();
        const items = Array.isArray(res?.data) ? res.data : [];
        setPayments(items);

        // Fetch applicable published fee structure (latest preferred, kept for header if no selection yet)
        try {
          const sres = await apiService.getMyFeeStructure();
          const structure = sres?.data?.structure;
          const total = Number(sres?.data?.total || 0);
          if (structure && Array.isArray(structure.feeHeads)) {
            // compute paid amount for this session
            const paidAmount = items
              .filter(p => String(p.session) === String(structure.session) && String(p.transactionStatus).toLowerCase() === 'success')
              .reduce((sum, p) => sum + Number(p.amount || 0), 0);
            const pendingAmount = Math.max(total - paidAmount, 0);
            const paymentStatus = pendingAmount === 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Pending');

            const reg = {
              semester: structure.semester ?? user?.semester ?? '—',
              academicYear: structure.session,
              isHosteler: user?.isHosteller || false,
              hostelBlock: user?.hostelAlloted || '—',
              roomNumber: user?.roomNo || '—',
              registrationStatus: 'Completed',
              registrationDate: new Date().toISOString().slice(0,10),
              subjects: [],
            };

            const fd = {
              semester: structure.semester ?? user?.semester ?? '—',
              academicYear: structure.session,
              heads: structure.feeHeads.map(h => ({ name: h.name, amount: Number(h.amount || 0) })),
              fees: { total },
              dueDate: '—',
              lateFeeApplicable: false,
              lateFeeAmount: 0,
              paidAmount,
              pendingAmount,
              paymentStatus,
            };

            // Only set if no selection exists yet
            setRegistrationData(prev => prev ?? reg);
            setFeeData(prev => prev ?? fd);
            setSelectedStructureId(prev => prev ?? (structure._id || null));
          } else {
            setFeeData(null);
          }
        } catch (e) {
          // No structure available is fine; keep feeData null
          setFeeData(null);
        }

        // Fetch all published fee structures for this branch
        try {
          const listRes = await apiService.getMyFeeStructures();
          const listItemsRaw = Array.isArray(listRes?.data?.items) ? listRes.data.items : [];
          // Decorate with status/paid/pending using payments
          const listItems = listItemsRaw.map((it) => {
            const s = it.structure;
            const total = Number(it.total || 0);
            const paidAmount = items
              .filter(p => String(p.session) === String(s.session) && String(p.transactionStatus).toLowerCase() === 'success')
              .reduce((sum, p) => sum + Number(p.amount || 0), 0);
            const pendingAmount = Math.max(total - paidAmount, 0);
            const paymentStatus = pendingAmount === 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Pending');
            return { ...it, paidAmount, pendingAmount, paymentStatus };
          });
          setStructures(listItems);
          // If nothing selected yet, pick the first new item
          if (!selectedStructureId && listItems.length > 0) {
            const sel = listItems[0];
            setSelectedStructureId(sel.structure._id || null);
            // set header feeData to this selection if not already set from single applicable
            if (!feeData) {
              const heads = (sel.structure.feeHeads || []).map(h => ({ name: h.name, amount: Number(h.amount || 0) }));
              setRegistrationData(prev => prev ?? {
                semester: sel.structure.semester ?? user?.semester ?? '—',
                academicYear: sel.structure.session,
                isHosteler: user?.isHosteller || false,
                hostelBlock: user?.hostelAlloted || '—',
                roomNumber: user?.roomNo || '—',
                registrationStatus: 'Completed',
                registrationDate: new Date().toISOString().slice(0,10),
                subjects: [],
              });
              setFeeData({
                semester: sel.structure.semester ?? user?.semester ?? '—',
                academicYear: sel.structure.session,
                heads,
                fees: { total: Number(sel.total || 0) },
                dueDate: '—',
                lateFeeApplicable: false,
                lateFeeAmount: 0,
                paidAmount: sel.paidAmount,
                pendingAmount: sel.pendingAmount,
                paymentStatus: sel.paymentStatus,
              });
            }
          }
        } catch (e) {
          setStructures([]);
        }
      } catch (e) {
        console.error('Failed loading fee payments:', e?.message || e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [view, role, user]);

  const handlePayment = async () => {
    if (!paymentMode) {
      alert("Please select a payment method");
      return;
    }

    setPaymentInProgress(true);
    
    // Simulate payment process
    setTimeout(() => {
      const receipt = {
        receiptNumber: `RCP-${Date.now()}`,
        studentName: studentData.name,
        enrollment: studentData.enrollment,
        amount: feeData.pendingAmount + (feeData.lateFeeApplicable ? feeData.lateFeeAmount : 0),
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: paymentMode,
        transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        semester: feeData.semester,
        academicYear: feeData.academicYear,
        feeBreakdown: feeData.fees,
        lateFee: feeData.lateFeeApplicable ? feeData.lateFeeAmount : 0,
      };

      setReceiptData(receipt);
      setPaymentInProgress(false);
      setPaymentSuccess(true);
      setShowPaymentModal(false);

      // Update fee status
      setFeeData(prev => ({
        ...prev,
        paymentStatus: "Paid",
        paidAmount: prev.pendingAmount + (prev.lateFeeApplicable ? prev.lateFeeAmount : 0),
        pendingAmount: 0,
        lateFeeApplicable: false,
        lateFeeAmount: 0,
      }));
    }, 3000);
  };

  const downloadReceipt = () => {
    if (!receiptData) return;

    // Create receipt HTML
    const receiptHTML = `
      <html>
        <head>
          <title>Fee Receipt</title>
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
            <div class="row"><strong>Receipt Number:</strong> ${receiptData.receiptNumber}</div>
            <div class="row"><strong>Date:</strong> ${receiptData.paymentDate}</div>
            <div class="row"><strong>Student Name:</strong> ${receiptData.studentName}</div>
            <div class="row"><strong>Enrollment Number:</strong> ${receiptData.enrollment}</div>
            <div class="row"><strong>Semester:</strong> ${receiptData.semester}</div>
            <div class="row"><strong>Academic Year:</strong> ${receiptData.academicYear}</div>
            <div class="row"><strong>Payment Method:</strong> ${receiptData.paymentMethod}</div>
            <div class="row"><strong>Transaction ID:</strong> ${receiptData.transactionId}</div>
          </div>

          <table class="fee-table">
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Tuition Fee</td><td>${receiptData.feeBreakdown.tuitionFee}</td></tr>
              <tr><td>Library Fee</td><td>${receiptData.feeBreakdown.libraryFee}</td></tr>
              <tr><td>Laboratory Fee</td><td>${receiptData.feeBreakdown.labFee}</td></tr>
              <tr><td>Sports Fee</td><td>${receiptData.feeBreakdown.sportsFee}</td></tr>
              <tr><td>Development Fee</td><td>${receiptData.feeBreakdown.developmentFee}</td></tr>
              <tr><td>Examination Fee</td><td>${receiptData.feeBreakdown.examFee}</td></tr>
              ${receiptData.feeBreakdown.hostelFee > 0 ? `<tr><td>Hostel Fee</td><td>${receiptData.feeBreakdown.hostelFee}</td></tr>` : ''}
              ${receiptData.feeBreakdown.messFee > 0 ? `<tr><td>Mess Fee</td><td>${receiptData.feeBreakdown.messFee}</td></tr>` : ''}
              ${receiptData.lateFee > 0 ? `<tr><td>Late Fee</td><td>${receiptData.lateFee}</td></tr>` : ''}
              <tr class="total"><td><strong>Total Amount Paid</strong></td><td><strong>₹${receiptData.amount}</strong></td></tr>
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
    a.download = `Fee_Receipt_${receiptData.receiptNumber}.html`;
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

  // Receipt View Component (uses backend payments)
  if (showReceiptView) {
    const paidPayments = payments.filter(p => String(p.transactionStatus).toLowerCase() === 'success');

    return (
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Payment Receipts</h1>
              <button
                onClick={() => setShowReceiptView(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Back to Payment
              </button>
            </div>

            {paidPayments.length === 0 ? (
              <div className="text-center py-12">
                <Image src="/empty.png" alt="" width={64} height={64} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Payment Records Found</h3>
                <p className="text-gray-600">You haven't made any payments yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paidPayments.map((payment) => (
                  <div key={payment._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Receipt #{payment.id}</h3>
                        <p className="text-gray-600">Payment Date: {new Date(payment.transactionDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">₹{payment.amount}</p>
                        <p className="text-sm text-gray-600">{payment.paymentMode?.toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p><strong>Student:</strong> {payment.studentName}</p>
                        <p><strong>Enrollment:</strong> {payment.enrollmentNo}</p>
                      </div>
                      <div>
                        <p><strong>Session:</strong> {payment.session}</p>
                        <p><strong>Transaction ID:</strong> {payment.transactionId}</p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={async () => {
                          try {
                            const res = await apiService.getMyFeeReceipt(payment._id);
                            const r = res?.data;
                            if (!r) return;
                            const receipt = {
                              receiptNumber: r.receiptNo,
                              studentName: r.student?.name,
                              enrollment: r.student?.enrollmentNo,
                              amount: r.amount,
                              paymentDate: new Date(r.transaction?.date).toLocaleDateString(),
                              paymentMethod: (r.paymentMode || '').toUpperCase(),
                              transactionId: r.transaction?.id,
                              semester: r.student?.semester ?? '-',
                              academicYear: r.session,
                              feeBreakdown: {
                                tuitionFee: 0, libraryFee: 0, labFee: 0, sportsFee: 0, developmentFee: 0, examFee: 0, hostelFee: 0, messFee: 0
                              },
                              lateFee: 0,
                            };
                            setReceiptData(receipt);
                            downloadReceipt();
                          } catch (e) {
                            console.error('Failed to fetch receipt:', e?.message || e);
                          }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Download Receipt
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                      >
                        Print Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show registration warning only if registration data exists and is not completed
  // If we had registration status previously via dummy data, keep logic guarded.
  if (registrationData && registrationData.registrationStatus !== "Completed") {
    return (
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <Image src="/warning.png" alt="" width={64} height={64} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-4">Registration Not Completed</h2>
            <p className="text-red-700 mb-4">
              Your semester registration for {feeData?.semester} semester ({feeData?.academicYear}) is not completed yet.
            </p>
            <p className="text-red-600 mb-6">
              Please complete your semester registration before proceeding with fee payment.
            </p>
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
              Complete Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fee Payment Portal</h1>
              <p className="text-gray-600 mt-1">Academic Year: {feeData?.academicYear}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Student Portal</p>
              <p className="font-semibold">{studentData?.name}</p>
            </div>
          </div>
        </div>

        {/* Payment Success Message */}
        {paymentSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-2 mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
                  <p className="text-green-700">Your fee payment has been processed successfully.</p>
                </div>
              </div>
              <button
                onClick={downloadReceipt}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Download Receipt
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Section - Student & Registration Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Student Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Student Information</h2>
              <div className="flex items-center mb-4">
                <Image 
                  src={studentData?.photo || "/noAvatar.png"} 
                  alt="" 
                  width={60} 
                  height={60} 
                  className="rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-semibold">{studentData?.name}</h3>
                  <p className="text-sm text-gray-600">{studentData?.enrollment}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{studentData?.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Semester:</span>
                  <span className="font-medium">{registrationData?.semester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Academic Year:</span>
                  <span className="font-medium">{registrationData?.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student Type:</span>
                  <span className="font-medium">{registrationData?.isHosteler ? "Hosteler" : "Day Scholar"}</span>
                </div>
                {registrationData?.isHosteler && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hostel Block:</span>
                      <span className="font-medium">{registrationData?.hostelBlock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Number:</span>
                      <span className="font-medium">{registrationData?.roomNumber}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Registration Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Registration Status</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="font-medium text-green-800">Registration Completed</p>
                    <p className="text-sm text-gray-600">Date: {registrationData?.registrationDate}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Registered Subjects:</p>
                  <div className="space-y-1">
                    {registrationData?.subjects.map((subject, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {subject}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Fee Details & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fee Summary */}
            {feeData ? (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Fee Details - Semester {feeData?.semester}</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  feeData?.paymentStatus === "Paid" ? "bg-green-100 text-green-800" :
                  feeData?.paymentStatus === "Partial" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {feeData?.paymentStatus}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-3">Fee Heads</h3>
                  <div className="space-y-2 text-sm">
                    {feeData?.heads?.map((h, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{h.name}</span>
                        <span>₹{Number(h.amount).toLocaleString()}</span>
                      </div>
                    ))}
                    {feeData?.lateFeeApplicable && (
                      <div className="flex justify-between text-red-600">
                        <span>Late Fee</span>
                        <span>₹{feeData?.lateFeeAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t mt-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Total Amount</p>
                    <p className="text-xl font-bold text-blue-800">
                      ₹{(feeData?.fees.total + (feeData?.lateFeeApplicable ? feeData?.lateFeeAmount : 0)).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Paid Amount</p>
                    <p className="text-xl font-bold text-green-800">₹{feeData?.paidAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600">Pending Amount</p>
                    <p className="text-xl font-bold text-red-800">
                      ₹{(feeData?.pendingAmount + (feeData?.lateFeeApplicable ? feeData?.lateFeeAmount : 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {feeData?.paymentStatus !== "Paid" && (
                <div className="mt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <Image src="/calendar.png" alt="" width={20} height={20} className="mr-2" />
                      <div>
                        <p className="font-medium text-yellow-800">Due Date: {feeData?.dueDate}</p>
                        {feeData?.lateFeeApplicable && (
                          <p className="text-sm text-yellow-700">Late fee of ₹{feeData?.lateFeeAmount} is applicable</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Pay Now - ₹{(feeData?.pendingAmount + (feeData?.lateFeeApplicable ? feeData?.lateFeeAmount : 0)).toLocaleString()}
                  </button>
                </div>
              )}
            </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-2">Fee Details</h2>
                <p className="text-gray-600">Fee breakdown is not available yet. You can still view your payment history and download receipts below.</p>
              </div>
            )}

            {/* All Published Fee Structures for Your Branch */}
            {structures.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">All Published Fee Structures (Your Branch)</h2>
                  <span className="text-sm text-gray-500">{structures.length} items</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {structures.map(({ structure: s, total, score, paidAmount, pendingAmount, paymentStatus }, idx) => (
                    <div key={s._id || idx} className={`border rounded p-4 ${selectedStructureId === (s._id || null) ? 'ring-2 ring-blue-500' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{s.session} • Sem {s.semester} • {String(s.category).toUpperCase()}</div>
                        <div className="text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <div className="text-gray-600">Total: <span className="font-semibold">₹{Number(total).toLocaleString()}</span></div>
                        <div className={`px-2 py-0.5 rounded-full text-xs ${paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{paymentStatus}</div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>Paid: ₹{Number(paidAmount).toLocaleString()}</span>
                        <span>Pending: ₹{Number(pendingAmount).toLocaleString()}</span>
                      </div>
                      <div className="max-h-28 overflow-auto text-sm">
                        {Array.isArray(s.feeHeads) && s.feeHeads.map((h, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{h.name}</span>
                            <span>₹{Number(h.amount).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStructureId(s._id || null);
                            const heads = (s.feeHeads || []).map(h => ({ name: h.name, amount: Number(h.amount || 0) }));
                            setRegistrationData({
                              semester: s.semester ?? user?.semester ?? '—',
                              academicYear: s.session,
                              isHosteler: user?.isHosteller || false,
                              hostelBlock: user?.hostelAlloted || '—',
                              roomNumber: user?.roomNo || '—',
                              registrationStatus: 'Completed',
                              registrationDate: new Date().toISOString().slice(0,10),
                              subjects: [],
                            });
                            setFeeData({
                              semester: s.semester ?? user?.semester ?? '—',
                              academicYear: s.session,
                              heads,
                              fees: { total: Number(total || 0) },
                              dueDate: '—',
                              lateFeeApplicable: false,
                              lateFeeAmount: 0,
                              paidAmount: Number(paidAmount || 0),
                              pendingAmount: Number(pendingAmount || 0),
                              paymentStatus,
                            });
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Use this structure
                        </button>
                        {paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => {
                              setSelectedStructureId(s._id || null);
                              setShowPaymentModal(true);
                            }}
                            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            Pay now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History (backend) */}
            {payments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Payment History</h2>
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{new Date(payment.transactionDate).toLocaleDateString()} • {payment.paymentMode?.toUpperCase()}</p>
                        <p className="text-xs text-gray-500">Receipt: {payment.id}</p>
                      </div>
                      <div className="text-right">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {String(payment.transactionStatus).toUpperCase()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{payment.transactionId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {feeData && showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Select Payment Method</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">Amount to Pay:</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{(feeData?.pendingAmount + (feeData?.lateFeeApplicable ? feeData?.lateFeeAmount : 0)).toLocaleString()}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="UPI"
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="mr-3"
                  />
                  <Image src="/upi.png" alt="" width={24} height={24} className="mr-3" />
                  <span>UPI Payment</span>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="Net Banking"
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="mr-3"
                  />
                  <Image src="/bank.png" alt="" width={24} height={24} className="mr-3" />
                  <span>Net Banking</span>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="Debit/Credit Card"
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="mr-3"
                  />
                  <Image src="/card.png" alt="" width={24} height={24} className="mr-3" />
                  <span>Debit/Credit Card</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!paymentMode || paymentInProgress}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentInProgress ? "Processing..." : "Proceed to Pay"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Processing Modal */}
        {paymentInProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your payment...</p>
              <p className="text-sm text-gray-500 mt-2">Do not close this window</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeePaymentPage;
