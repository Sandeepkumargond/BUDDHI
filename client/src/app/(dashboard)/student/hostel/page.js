"use client";

import { studentHostelData } from "@/lib/aryan_hosteldata";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { useEffect } from "react";
import { fetchHostels, submitHostelApplication, fetchStudentHostelAllocation } from "@/lib/hostelApi";
import Image from "next/image";
import { useState } from "react"; 

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
        // If not authenticated student, try to fetch profile directly
        if (!user || role !== 'student') {
          // Attempt auth bootstrap
          await checkAuthStatus();
        }
        const res = await apiService.getProfile('student');
        const data = res.data?.student || res.data?.user || res.data;
        if (mounted && data) setProfile(data);
      } catch (e) {
        // keep fallback to dummy data
        console.warn('Student profile fetch failed:', e?.message || e);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const [complaint, setComplaint] = useState("");
  const [activeTab, setActiveTab] = useState("Profile");

  const [showForm, setShowForm] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [applyOpen, setApplyOpen] = useState(false);
  const [choice1Hostel, setChoice1Hostel] = useState("");
  const [choice1Room, setChoice1Room] = useState("");
  const [choice2Hostel, setChoice2Hostel] = useState("");
  const [choice2Room, setChoice2Room] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hostelAllocationData, setHostelAllocationData] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const hs = await fetchHostels();
        if (mounted) setHostels(hs);
      } catch (e) {
        console.error("Failed to load hostels", e);
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
                  roomType: allocation.roomType,
                  block: allocation.hostelDetails?.block || '-',
                  floor: allocation.hostelDetails?.floor || '-',
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
                  admissionYear: allocation.hostelDetails?.admissionYear || '-',
                  roomStatus: 'Allocated'
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


  const addComplaint = () => {
    if (!complaint.trim()) return;

    student.complaints.push({
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      issue: complaint,
      status: "Pending",
    });

    setComplaint("");
    setShowForm(false);
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
                <p><strong>Hostel Name:</strong> {student.hostel.hostelName}</p>
                <p><strong>Room Number:</strong> {student.hostel.roomNumber}</p>
                <p><strong>Block:</strong> {student.hostel.block}</p>
                <p><strong>Floor:</strong> {student.hostel.floor}</p>
                <p><strong>Room Type:</strong> {student.hostel.roomType}</p>
                <p><strong>Status:</strong> {student.hostel.roomStatus}</p>
              </div>
            </section>

            {/* Room Details */}
            <div className="border-t" style={{ borderColor: "#e5e7eb" }}></div>
            <section className="py-6">
              <h3
                className="text-base md:text-lg font-semibold mb-3 inline-block px-3 py-2 rounded-md"
                style={{ color: "#3730a3", background: "#eef2ff", border: "1px solid #e5e7eb" }}
              >
                Room Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>Bed Number:</strong> {student.hostel.bedNumber}</p>
                <p><strong>Occupancy:</strong> {student.hostel.occupancy}</p>
                <p><strong>Attached Washroom:</strong> {student.hostel.attachedWashroom ? "Yes" : "No"}</p>
              </div>
            </section>

            {/* Fee & Payment */}
            <div className="border-t" style={{ borderColor: "#e5e7eb" }}></div>
            <section className="py-6">
              <h3
                className="text-base md:text-lg font-semibold mb-3 inline-block px-3 py-2 rounded-md"
                style={{ color: "#3730a3", background: "#eef2ff", border: "1px solid #e5e7eb" }}
              >
                Fee & Payment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>Hostel Fee:</strong> {student.hostel.hostelFee}</p>
                <p><strong>Payment Status:</strong> {student.hostel.paymentStatus}</p>
                <p><strong>Last Payment Date:</strong> {student.hostel.lastPaymentDate}</p>
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
                <p><strong>Name:</strong> {student.hostel.wardenName}</p>
                <p><strong>Phone:</strong> {student.hostel.wardenPhone}</p>
                <p><strong>Email:</strong> {student.hostel.wardenEmail}</p>
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
                <p><strong>Allocation Date:</strong> {student.hostel.allocationDate}</p>
                <p><strong>Admission Year:</strong> {student.hostel.admissionYear}</p>
              </div>
            </section>
            <div className="flex justify-end pt-2">
              <button
                onClick={downloadReceipt}
                className="mt-2 text-white px-4 py-2 rounded-md"
                style={{ background: "#6366f1" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
              >
                Download Fee Receipt (PDF)
              </button>
            </div>
          </div>
        </div>
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
          {student.complaints.length === 0 && (
            <p style={{ color: "#64748b" }}>No complaints filed yet.</p>
          )}
          {student.complaints.map((c) => (
            <div
              key={c.id}
              className="rounded-lg p-3 flex justify-between items-center"
              style={{ border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(2,6,23,0.06)" }}
            >
              <div>
                <p className="font-semibold" style={{ color: "#0f172a" }}>{c.issue}</p>
                <p className="text-sm" style={{ color: "#64748b" }}>{c.date}</p>
              </div>
              <span
                className={`px-3 py-1 text-sm rounded-md ${
                  c.status === "Pending"
                    ? "bg-amber-100 text-amber-800"
                    : c.status === "In Progress"
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {c.status}
              </span>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96" style={{ boxShadow: "0 10px 28px rgba(2,6,23,0.18)" }}>
            <h3 className="font-bold mb-3" style={{ color: "#0f172a" }}>Submit Complaint</h3>

            <textarea
              className="w-full p-2 rounded"
              style={{ border: "1px solid #cbd5e1", color: "#0f172a" }}
              rows="4"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Describe your complaint..."
            ></textarea>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded"
                style={{ background: "#e5e7eb", color: "#0f172a" }}
              >
                Cancel
              </button>
              <button
                onClick={addComplaint}
                className="px-4 py-2 rounded text-white"
                style={{ background: "#6366f1" }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOSTEL APPLICATION POPUP */}
      {applyOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[28rem] shadow-lg">
            <h3 className="font-bold mb-3">Hostel Application</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Choice 1: Hostel</label>
                <select className="border w-full p-2 rounded" value={choice1Hostel} onChange={(e)=>setChoice1Hostel(e.target.value)}>
                  <option value="">Select hostel</option>
                  {hostels.map(h => (
                    <option key={h.id || h._id} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Choice 1: Room (optional)</label>
                <input className="border w-full p-2 rounded" value={choice1Room} onChange={(e)=>setChoice1Room(e.target.value)} placeholder="e.g., 12" />
              </div>
              <div>
                <label className="block text-sm mb-1">Choice 2: Hostel (optional)</label>
                <select className="border w-full p-2 rounded" value={choice2Hostel} onChange={(e)=>setChoice2Hostel(e.target.value)}>
                  <option value="">Select hostel</option>
                  {hostels.map(h => (
                    <option key={h.id || h._id} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Choice 2: Room (optional)</label>
                <input className="border w-full p-2 rounded" value={choice2Room} onChange={(e)=>setChoice2Room(e.target.value)} placeholder="e.g., 34" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={()=>setApplyOpen(false)} className="px-4 py-2 rounded bg-gray-300">Cancel</button>
              <button
                onClick={async ()=>{
                  // Check if already allocated
                  if (hostelAllocationData || student.hostelAlloted) {
                    alert('You have already been allocated a hostel. You cannot apply again.');
                    setApplyOpen(false);
                    return;
                  }
                  
                  setSubmitting(true);
                  try {
                    const choices = [];
                    if (choice1Hostel) choices.push({ hostelName: choice1Hostel, roomNumber: choice1Room || undefined, priority: 1 });
                    if (choice2Hostel) choices.push({ hostelName: choice2Hostel, roomNumber: choice2Room || undefined, priority: 2 });
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
                disabled={submitting || hostelAllocationData || student.hostelAlloted}
                className={`px-4 py-2 rounded text-white ${(submitting || hostelAllocationData || student.hostelAlloted) ? 'bg-gray-400' : 'bg-blue-600'}`}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}