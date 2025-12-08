"use client";

import { studentHostelData } from "@/lib/aryan_hosteldata";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { useEffect } from "react";
import { fetchHostels, submitHostelApplication, fetchStudentHostelAllocation, submitComplaint, getMyComplaints } from "@/lib/hostelApi";
import Image from "next/image";
import { useState } from "react";
import { showToast } from "@/lib/toast"; 

export default function HostelPage() {
  const { user, role, checkAuthStatus } = useAuth();
  const [profile, setProfile] = useState(null);

  const normalizeStudent = (raw) => {
    if (!raw) return null;
    // Backend model fields mapping → UI fields expected here
    const fullName = [raw.firstName, raw.lastName].filter(Boolean).join(" ") || raw.name || "";
    const enrollmentNo = raw.enrollmentNo ?? raw.enrolmentNo ?? raw.enrollmentNumber ?? raw.registrationNumber;
    const rollNo = raw.rollNo ?? raw.rollNumber ?? raw.roll ?? "";
    const dob = raw.dateOfBirth ? new Date(raw.dateOfBirth).toLocaleDateString() : (raw.dob || "");

    // Hostel allocation info may reside in separate properties
    const hostel = raw.hostel || {
      hostelName: raw.hostelAlloted || undefined,
      roomNumber: raw.roomNo || undefined,
    };

    return {
      ...raw,
      name: fullName,
      enrolmentNo: enrollmentNo,
      rollNo,
      dob,
      photo: raw.imageUrl || raw.photo || "/avatar.png",
      hostel,
    };
  };

  const fallbackStudent = studentHostelData[0];
  const student = normalizeStudent(profile && role === 'student' ? profile : (user && role === 'student' ? user : null)) || fallbackStudent;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Load hostels
        const hostelsList = await fetchHostels();
        if (mounted) setHostels(hostelsList);

        // Load allocation data
        const allocationData = await fetchStudentHostelAllocation();
        if (mounted && allocationData) {
          setHostelAllocationData(allocationData);
        }

        // Load complaints
        const complaintsList = await getMyComplaints();
        if (mounted) setComplaints(complaintsList);
      } catch (error) {
        console.error("Error loading hostel data:", error);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const [complaint, setComplaint] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintCategory, setComplaintCategory] = useState("Other");
  const [complaintPriority, setComplaintPriority] = useState("Medium");
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("Profile");
  const [showForm, setShowForm] = useState(false);
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [applyOpen, setApplyOpen] = useState(false);
  const [choice1Hostel, setChoice1Hostel] = useState("");
  const [choice1Floor, setChoice1Floor] = useState("");
  const [choice1Room, setChoice1Room] = useState("");
  const [choice2Hostel, setChoice2Hostel] = useState("");
  const [choice2Floor, setChoice2Floor] = useState("");
  const [choice2Room, setChoice2Room] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hostelAllocationData, setHostelAllocationData] = useState(null);
  const [hostelLoading, setHostelLoading] = useState(false);

  const getFloorLabel = (floorNumber) => {
    if (floorNumber === 0) return "Ground";
    const labels = ["", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
    return labels[floorNumber] || `Floor ${floorNumber}`;
  };

  const getAvailableRoomsForHostel = (hostelName) => {
    const hostel = hostels.find(h => h.name === hostelName);
    if (!hostel) return [];
    
    const availableRooms = hostel.rooms ? hostel.rooms.filter(r => !r.occupied) : [];
    return availableRooms;
  };

  const getAvailableRoomsForFloor = (hostelName, floor) => {
    const hostel = hostels.find(h => h.name === hostelName);
    if (!hostel) return [];
    
    const floorNum = parseInt(floor);
    const availableRooms = hostel.rooms 
      ? hostel.rooms.filter(r => (r.floor ?? 0) === floorNum && !r.occupied) 
      : [];
    return availableRooms;
  };

  const getAvailableFloorsForHostel = (hostelName) => {
    const hostel = hostels.find(h => h.name === hostelName);
    if (!hostel) return [];
    
    const floors = new Set();
    if (hostel.rooms) {
      hostel.rooms.forEach(r => {
        if (!r.occupied) {
          floors.add(r.floor ?? 0);
        }
      });
    }
    return Array.from(floors).sort((a, b) => a - b);
  };

  const getAllFloorsForHostel = (hostelName) => {
    const hostel = hostels.find(h => h.name === hostelName);
    if (!hostel) return [];
    
    const numberOfFloors = hostel.numberOfFloors || 1;
    const floors = [];
    for (let i = 0; i < numberOfFloors; i++) {
      floors.push(i);
    }
    return floors;
  };

  const getAvailableRoomsCountPerFloor = (hostelName) => {
    const hostel = hostels.find(h => h.name === hostelName);
    if (!hostel) return {};
    
    const countPerFloor = {};
    const allFloors = getAllFloorsForHostel(hostelName);
    
    allFloors.forEach(floor => {
      countPerFloor[floor] = hostel.rooms 
        ? hostel.rooms.filter(r => (r.floor ?? 0) === floor && !r.occupied).length 
        : 0;
    });
    
    return countPerFloor;
  };

  const getRoomsOnFloor = (hostelName, floor) => {
    const hostel = hostels.find(h => h.name === hostelName);
    if (!hostel) return [];
    
    const roomsOnFloor = hostel.rooms ? hostel.rooms.filter(r => !r.occupied && (r.floor ?? 0) === floor) : [];
    return roomsOnFloor.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setHostelLoading(true);
        const hs = await fetchHostels();
        if (mounted) {
          setHostels(hs);
          setHostelLoading(false);
        }
      } catch (e) {
        console.error("Failed to load hostels", e);
        if (mounted) setHostelLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const allocation = await fetchStudentHostelAllocation();
        if (mounted) {
          console.log("Hostel Allocation fetched:", allocation);
          if (allocation) {
            setHostelAllocationData(allocation);
            // Update profile with complete allocation details
            setProfile(prev => {
              const updated = prev || {};
              return {
                ...updated,
                hostelAlloted: allocation.hostelName,
                roomNo: allocation.roomNumber,
                hostel: {
                  ...(updated.hostel || {}),
                  hostelName: allocation.hostelName,
                  roomNumber: allocation.roomNumber,
                  floor: allocation.floor || '-',
                  roomType: allocation.roomType,
                  block: allocation.hostelDetails?.block || '-',
                  bedNumber: allocation.hostelDetails?.bedNumber || '-',
                  occupancy: allocation.hostelDetails?.occupancy || '-',
                  attachedWashroom: allocation.hostelDetails?.attachedWashroom,
                  hostelFee: allocation.hostelDetails?.feePerMonth || '-',
                  paymentStatus: allocation.hostelDetails?.paymentStatus || 'Unpaid',
                  lastPaymentDate: allocation.hostelDetails?.lastPaymentDate || '-',
                  wardenName: allocation.hostelDetails?.warden || '-',
                  wardenPhone: allocation.hostelDetails?.contact || '-',
                  wardenEmail: allocation.hostelDetails?.email || '-',
                  allocationDate: allocation.allottedDate ? new Date(allocation.allottedDate).toLocaleDateString() : '-',
                  roomStatus: allocation.status || 'Allocated'
                }
              };
            });
          } else {
            console.log("No hostel allocation found for student");
          }
        }
      } catch (e) {
        console.warn("Failed to load hostel allocation", e?.message || e);
      }
    })();
    return () => { mounted = false; };
  }, []);

const downloadAllotmentDetails = () => {
  if (!hostelAllocationData) {
    alert('No allocation data available');
    return;
  }

  const allocationDate = hostelAllocationData.allottedDate 
    ? new Date(hostelAllocationData.allottedDate).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const floorLabel = hostelAllocationData.floor === 0 ? 'Ground Floor' : `Floor ${hostelAllocationData.floor}`;

  const allotmentContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #3730a3;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #3730a3;
          font-size: 28px;
          margin-bottom: 5px;
        }
        .header p {
          color: #666;
          font-size: 14px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h3 {
          color: #3730a3;
          font-size: 16px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .detail-label {
          font-weight: bold;
          color: #333;
          width: 40%;
        }
        .detail-value {
          color: #666;
          width: 60%;
          text-align: right;
        }
        .status {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-approved {
          background-color: #dcfce7;
          color: #166534;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: right;
        }
        .signature {
          margin-top: 30px;
          padding-top: 20px;
        }
        @media print {
          body {
            background-color: white;
            padding: 0;
          }
          .container {
            box-shadow: none;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hostel Allotment Details</h1>
          <p>Official Allocation Certificate</p>
        </div>

        <div class="section">
          <h3>Student Information</h3>
          <div class="detail-row">
            <div class="detail-label">Name:</div>
            <div class="detail-value">${student.name || 'N/A'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Roll No:</div>
            <div class="detail-value">${student.rollNo || 'N/A'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Enrollment No:</div>
            <div class="detail-value">${student.enrolmentNo || 'N/A'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Course:</div>
            <div class="detail-value">${student.course || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <h3>Hostel Allocation Details</h3>
          <div class="detail-row">
            <div class="detail-label">Hostel Name:</div>
            <div class="detail-value">${hostelAllocationData.hostelName || 'N/A'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Room Number:</div>
            <div class="detail-value">${hostelAllocationData.roomNumber || 'N/A'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Floor:</div>
            <div class="detail-value">${floorLabel}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Room Type:</div>
            <div class="detail-value">${hostelAllocationData.roomType || 'Shared'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value">
              <span class="status status-approved">${hostelAllocationData.status || 'Approved'}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Warden Details</h3>
          <div class="detail-row">
            <div class="detail-label">Warden Name:</div>
            <div class="detail-value">${hostelAllocationData.hostelDetails?.warden || 'N/A'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Contact Number:</div>
            <div class="detail-value">${hostelAllocationData.hostelDetails?.contact || 'N/A'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Address:</div>
            <div class="detail-value">${hostelAllocationData.hostelDetails?.address || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <h3>Allocation Information</h3>
          <div class="detail-row">
            <div class="detail-label">Allocation Date:</div>
            <div class="detail-value">${allocationDate}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Monthly Fee:</div>
            <div class="detail-value">₹${hostelAllocationData.hostelDetails?.feePerMonth || '0'}</div>
          </div>
        </div>

        <div class="footer">
          <p>This is an official document issued by the Hostel Management System.</p>
          <div class="signature">
            <p style="margin-top: 30px;">___________________________</p>
            <p style="font-size: 12px; color: #666;">Authorized Signature</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const newWindow = window.open("", "_blank");
  newWindow.document.write(allotmentContent);
  newWindow.document.close();
  
  // Print after a short delay to ensure content is rendered
  setTimeout(() => {
    newWindow.print();
  }, 250);
};


const downloadReceipt = () => {
  const receiptContent = `
    <div style="font-family: Arial; padding: 20px;">
      <h2 style="text-align:center;">Hostel Fee Receipt</h2>
      <hr />
      <h3>Student Details</h3>
      <p><strong>Name:</strong> ${student.name}</p>
      <p><strong>Roll No:</strong> ${student.rollNo}</p>
      <p><strong>Enrollment No:</strong> ${student.enrolmentNo}</p>

      <h3>Hostel Details</h3>
      <p><strong>Hostel:</strong> ${student.hostel.hostelName}</p>
      <p><strong>Room No:</strong> ${student.hostel.roomNumber}</p>

      <h3>Payment Details</h3>
      <p><strong>Hostel Fee:</strong> ${student.hostel.hostelFee}</p>
      <p><strong>Payment Status:</strong> ${student.hostel.paymentStatus}</p>
      <p><strong>Last Payment Date:</strong> ${student.hostel.lastPaymentDate}</p>

      <br><br>
      <p style="text-align:right;">Authorized Signature</p>
    </div>
  `;

  const newWindow = window.open("", "_blank");
  newWindow.document.write(receiptContent);
  newWindow.document.close();

  newWindow.print();
};


  const addComplaint = async () => {
    if (!complaint.trim() || !complaintDescription.trim()) {
      showToast("error", "Please enter both title and description");
      return;
    }

    setComplaintSubmitting(true);
    try {
      const result = await submitComplaint(complaint, complaintDescription, complaintCategory, complaintPriority);
      if (result) {
        setComplaint("");
        setComplaintDescription("");
        setComplaintCategory("Other");
        setComplaintPriority("Medium");
        setShowForm(false);
        showToast("success", "Complaint submitted successfully");
        
        // Refresh complaints list
        const updatedComplaints = await getMyComplaints();
        setComplaints(updatedComplaints);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      showToast("error", error.message || "Failed to submit complaint");
    } finally {
      setComplaintSubmitting(false);
    }
  };

  const Card = ({ title, color, children }) => (
    <div
      className="rounded-xl p-5 bg-white"
      style={{
        border: "1px solid #e5e7eb",
        boxShadow: "0 6px 18px rgba(2, 6, 23, 0.06)",
      }}
    >
      <div
        className="flex items-center justify-between mb-4"
        style={{
          background: "linear-gradient(135deg, #eef2ff, #e0e7ff)", // indigo-50 -> indigo-100
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        <h2 className="text-base font-semibold" style={{ color: "#0f172a" }}>
          {title}
        </h2>
        <span
          className="text-xs"
          style={{
            color: "#6366f1", // indigo-500 accent
          }}
        >
          {/* section tag, keep props untouched */}
        </span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">

      {/* ------------------------------------------------------ */}
      {/* STUDENT HOSTEL CARDS GRID (2 x 3)                    */}
      {/* ------------------------------------------------------ */}

      <div className="space-y-6">
        {/* Consolidated Hostel Information */}
        {hostelAllocationData && hostelAllocationData.hostelName ? (
        <div className="rounded-xl bg-white" style={{ border: "1px solid #e5e7eb", boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>
          <div className="p-5 space-y-0" style={{ color: "#0f172a" }}>
            {/* Hostel Allocation */}
            <section className="pb-6">
              <h3
                className="text-base md:text-lg font-semibold mb-3 inline-block px-3 py-2 rounded-md"
                style={{ color: "#3730a3", background: "#eef2ff", border: "1px solid #e5e7eb" }}
              >
                Hostel Allocation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>Hostel Name:</strong> {hostelAllocationData.hostelName || 'N/A'}</p>
                <p><strong>Room Number:</strong> {hostelAllocationData.roomNumber || 'N/A'}</p>
                <p><strong>Floor:</strong> {hostelAllocationData.floor !== '-' ? (hostelAllocationData.floor === 0 ? 'Ground' : `Floor ${hostelAllocationData.floor}`) : 'N/A'}</p>
                <p><strong>Room Type:</strong> {hostelAllocationData.roomType || 'Shared'}</p>
                <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize', color: hostelAllocationData.status === 'approved' ? '#10b981' : '#f59e0b' }}>{hostelAllocationData.status}</span></p>
              </div>
            </section>

            {/* Warden Details */}
            <div className="border-t" style={{ borderColor: "#e5e7eb" }}></div>
            <section className="py-6">
              <h3
                className="text-base md:text-lg font-semibold mb-3 inline-block px-3 py-2 rounded-md"
                style={{ color: "#3730a3", background: "#eef2ff", border: "1px solid #e5e7eb" }}
              >
                Warden Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>Name:</strong> {hostelAllocationData.hostelDetails?.warden || 'N/A'}</p>
                <p><strong>Phone:</strong> {hostelAllocationData.hostelDetails?.contact || 'N/A'}</p>
              </div>
            </section>

            {/* Allocation Info */}
            <div className="border-t" style={{ borderColor: "#e5e7eb" }}></div>
            <section className="py-6">
              <h3
                className="text-base md:text-lg font-semibold mb-3 inline-block px-3 py-2 rounded-md"
                style={{ color: "#3730a3", background: "#eef2ff", border: "1px solid #e5e7eb" }}
              >
                Allocation Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>Allocation Date:</strong> {hostelAllocationData.allottedDate ? new Date(hostelAllocationData.allottedDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              </div>
            </section>
            <div className="flex justify-end pt-2">
              <button
                onClick={downloadAllotmentDetails}
                className="mt-2 text-white px-4 py-2 rounded-md"
                style={{ background: "#6366f1" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
              >
                Download Allotment Details (PDF)
              </button>
            </div>
          </div>
        </div>
        ) : (
          // No allocation - show apply button
          <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #e5e7eb", boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold" style={{ color: "#0f172a" }}>No Hostel Allocation</h3>
              <p style={{ color: "#64748b" }}>You don't have an active hostel allocation. Click the button below to apply for hostel.</p>
              <button
                onClick={() => setApplyOpen(true)}
                className="px-6 py-3 text-white rounded-md font-semibold"
                style={{ background: "#6366f1" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
              >
                Apply for Hostel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Complaint History (separate section) */}
      <div className="rounded-xl p-5 bg-white" style={{ border: "1px solid #e5e7eb", boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>
        <div
          className="flex items-center justify-between mb-4"
          style={{
            background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "10px 12px",
          }}
        >
          <h2 className="text-base font-semibold" style={{ color: "#0f172a" }}>
            Complaint History
          </h2>
        </div>
        <div className="space-y-3" style={{ color: "#0f172a" }}>
          {complaints.length === 0 && (
            <p style={{ color: "#64748b" }}>No complaints filed yet.</p>
          )}
          {complaints.map((c) => (
            <div
              key={c._id}
              className="rounded-lg p-3 flex justify-between items-center"
              style={{ border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(2,6,23,0.06)" }}
            >
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "#0f172a" }}>{c.title}</p>
                <p className="text-sm" style={{ color: "#64748b" }}>{new Date(c.createdAt).toLocaleDateString()}</p>
                <p className="text-xs mt-1" style={{ color: "#6b7280" }}>{c.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-1 text-xs rounded-md"
                  style={{
                    background: c.priority === "Urgent" ? "#fee2e2" : c.priority === "High" ? "#fef3c7" : "#dbeafe",
                    color: c.priority === "Urgent" ? "#991b1b" : c.priority === "High" ? "#92400e" : "#0c4a6e"
                  }}
                >
                  {c.priority}
                </span>
                <span
                  className={`px-3 py-1 text-sm rounded-md ${
                    c.status === "Pending"
                      ? "bg-amber-100 text-amber-800"
                      : c.status === "In Progress"
                      ? "bg-indigo-100 text-indigo-800"
                      : c.status === "Resolved"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 text-white px-4 py-2 rounded-md"
          style={{ background: "#6366f1" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
        >
          + Write New Complaint
        </button>
      </div>

      {/* ------------------------------------------------------ */}
      {/* COMPLAINT FORM POPUP                                   */}
      {/* ------------------------------------------------------ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md" style={{ boxShadow: "0 10px 28px rgba(2,6,23,0.18)" }}>
            <h3 className="font-bold mb-4 text-lg" style={{ color: "#0f172a" }}>Submit Complaint</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0f172a" }}>
                  Complaint Title
                </label>
                <input
                  type="text"
                  className="w-full p-2 rounded"
                  style={{ border: "1px solid #cbd5e1", color: "#0f172a" }}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="Brief title of your complaint..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0f172a" }}>
                  Category
                </label>
                <select
                  className="w-full p-2 rounded"
                  style={{ border: "1px solid #cbd5e1", color: "#0f172a" }}
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cleanliness">Cleanliness</option>
                  <option value="Noise">Noise</option>
                  <option value="Roommate">Roommate</option>
                  <option value="Safety">Safety</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0f172a" }}>
                  Priority
                </label>
                <select
                  className="w-full p-2 rounded"
                  style={{ border: "1px solid #cbd5e1", color: "#0f172a" }}
                  value={complaintPriority}
                  onChange={(e) => setComplaintPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0f172a" }}>
                  Description
                </label>
                <textarea
                  className="w-full p-2 rounded"
                  style={{ border: "1px solid #cbd5e1", color: "#0f172a" }}
                  rows="4"
                  value={complaintDescription}
                  onChange={(e) => setComplaintDescription(e.target.value)}
                  placeholder="Describe your complaint in detail..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded"
                style={{ background: "#e5e7eb", color: "#0f172a" }}
              >
                Cancel
              </button>
              <button
                onClick={addComplaint}
                disabled={complaintSubmitting}
                className="px-4 py-2 rounded text-white"
                style={{ background: complaintSubmitting ? "#cbd5e1" : "#6366f1" }}
              >
                {complaintSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOSTEL APPLICATION POPUP */}
      {applyOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center overflow-y-auto p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-lg my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">Hostel Application</h3>
              <button onClick={()=>setApplyOpen(false)} className="text-gray-500 text-xl">✕</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Select your hostel preferences with optional floor and room preferences</p>
            
            {hostelLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading available hostels...</p>
              </div>
            ) : hostels.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No hostels available at the moment.</p>
              </div>
            ) : (
              <div className="space-y-6">
              {/* Choice 1 */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3 text-blue-600">Choice 1 (Priority)</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Select Hostel</label>
                  <select 
                    className="border w-full p-2 rounded" 
                    value={choice1Hostel} 
                    onChange={(e)=>{
                      setChoice1Hostel(e.target.value);
                      setChoice1Floor("");
                      setChoice1Room("");
                    }}
                  >
                    <option value="">Select hostel</option>
                    {hostels.map(h => {
                      const availableCount = h.rooms ? h.rooms.filter(r => !r.occupied).length : 0;
                      return (
                        <option key={h.id || h._id} value={h.name}>
                          {h.name} ({availableCount} rooms available)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {choice1Hostel && (
                  <>
                    <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800 mb-2">
                        Available rooms: <strong>{getAvailableRoomsForHostel(choice1Hostel).length}</strong>
                      </p>
                      {hostels.find(h => h.name === choice1Hostel) && (
                        <div className="text-xs text-blue-700 space-y-1 mt-2">
                          <p><strong>Type:</strong> {hostels.find(h => h.name === choice1Hostel)?.type}</p>
                          <p><strong>Warden:</strong> {hostels.find(h => h.name === choice1Hostel)?.warden}</p>
                          <p><strong>Contact:</strong> {hostels.find(h => h.name === choice1Hostel)?.contact}</p>
                          {hostels.find(h => h.name === choice1Hostel)?.numberOfFloors && (
                            <>
                              <p><strong>Total Floors:</strong> {hostels.find(h => h.name === choice1Hostel)?.numberOfFloors}</p>
                              <p><strong>Rooms per Floor:</strong> {hostels.find(h => h.name === choice1Hostel)?.roomsPerFloor || 1}</p>
                              <div className="mt-2 border-t border-blue-300 pt-2">
                                <p className="font-semibold mb-1">Available Rooms per Floor:</p>
                                <div className="grid grid-cols-2 gap-1">
                                  {Object.entries(getAvailableRoomsCountPerFloor(choice1Hostel)).map(([floor, count]) => (
                                    <p key={floor} className="text-xs">
                                      {floor === '0' ? 'Ground' : `Floor ${floor}`}: <strong>{count}</strong> rooms
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Select Floor (optional)</label>
                      <select 
                        className="border w-full p-2 rounded" 
                        value={choice1Floor} 
                        onChange={(e)=>{
                          setChoice1Floor(e.target.value);
                          setChoice1Room("");
                        }}
                      >
                        <option value="">All Floors</option>
                        {getAllFloorsForHostel(choice1Hostel).map(floor => {
                          const availableOnFloor = getAvailableRoomsCountPerFloor(choice1Hostel)[floor] || 0;
                          const roomsPerFloor = hostels.find(h => h.name === choice1Hostel)?.roomsPerFloor || 1;
                          return (
                            <option key={floor} value={floor.toString()}>
                              {floor === 0 ? 'Ground Floor' : `Floor ${floor}`} - {availableOnFloor}/{roomsPerFloor} rooms available
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {choice1Floor && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Select Room Number (optional)</label>
                        <select 
                          className="border w-full p-2 rounded" 
                          value={choice1Room} 
                          onChange={(e)=>setChoice1Room(e.target.value)}
                        >
                          <option value="">Any Room on Floor {choice1Floor === '0' ? 'Ground' : choice1Floor}</option>
                          {getRoomsOnFloor(choice1Hostel, parseInt(choice1Floor)).map(room => (
                            <option key={room.number} value={room.number}>
                              Room {room.number}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {!choice1Floor && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Select Room Number (optional)</label>
                        <select 
                          className="border w-full p-2 rounded" 
                          value={choice1Room} 
                          onChange={(e)=>setChoice1Room(e.target.value)}
                        >
                          <option value="">Any Room in {choice1Hostel}</option>
                          {getAvailableRoomsForHostel(choice1Hostel).map(room => (
                            <option key={room.number} value={room.number}>
                              Room {room.number} (Floor {room.floor === 0 ? 'Ground' : room.floor})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Application Summary */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-3">Application Summary</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p><strong>Selected Hostel:</strong> {choice1Hostel ? `${choice1Hostel}${choice1Floor ? ` - Floor ${choice1Floor === '0' ? 'Ground' : choice1Floor}` : ''}${choice1Room ? ` - Room ${choice1Room}` : ''}` : 'Not selected'}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={()=>setApplyOpen(false)} className="px-4 py-2 rounded bg-gray-300 text-gray-700">Cancel</button>
              <button
                onClick={async ()=>{
                  // Check if already allocated
                  if (hostelAllocationData && hostelAllocationData.hostelName) {
                    alert('You have already been allocated a hostel. Contact admin to change your allocation.');
                    setApplyOpen(false);
                    return;
                  }
                  
                  if (!choice1Hostel) {
                    alert('Please select at least one hostel');
                    return;
                  }
                  
                  setSubmitting(true);
                  try {
                    const choices = [];
                    if (choice1Hostel) {
                      choices.push({ 
                        hostelName: choice1Hostel, 
                        roomNumber: choice1Room || undefined,
                        floor: choice1Floor ? parseInt(choice1Floor) : undefined,
                        priority: 1 
                      });
                    }
                    const payload = {
                      studentId: student.enrolmentNo || student.rollNo || "UNKNOWN",
                      studentName: student.name,
                      course: student.course || "",
                      semester: student.semester || "",
                      cgpa: student.cgpa || 0,
                      roomType: (student.hostel?.roomType || "Shared").replace(/^(single)$/i,'Single').replace(/^(shared)$/i,'Shared').replace(/^(triple)$/i,'Triple'),
                      reason: "Student self-application",
                      emergencyContact: student.alternatePhone || "",
                      parentName: student.fatherName || "",
                      address: student.address || "",
                      choices
                    };
                    const res = await submitHostelApplication(payload);
                    alert(`Allocated: ${res.allottedHostel} Room ${res.allottedRoom}`);
                    // Refresh allocation data
                    setApplyOpen(false);
                    window.location.reload();
                  } catch (err) {
                    alert(err.message || 'Failed to submit application');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting || (hostelAllocationData && hostelAllocationData.hostelName) || !choice1Hostel}
                className={`px-4 py-2 rounded text-white ${(submitting || (hostelAllocationData && hostelAllocationData.hostelName) || !choice1Hostel) ? 'bg-gray-400' : 'bg-blue-600'}`}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
              </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}