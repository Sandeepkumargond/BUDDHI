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
    <div className="border rounded-xl p-5 shadow bg-white">
      <h2
        className="text-lg font-bold px-4 py-2 rounded-md mb-4"
        style={{ backgroundColor: color }}
      >
        {title}
      </h2>
      {children}
    </div>
  );

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">

      {/* ------------------------------------------------------ */}
      {/* FULL WIDTH STUDENT PROFILE CARD                       */}
      {/* ------------------------------------------------------ */}
      <Card title="Student Profile" color="#CFCEFF">
        <div className="flex items-center gap-6">
          <Image
            src={student.photo}
            width={130}
            height={130}
            className="rounded-full border shadow"
            alt="student"
          />
          <div className="text-lg">
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Roll No:</strong> {student.rollNo}</p>
            <p><strong>Enrollment No:</strong> {student.enrolmentNo}</p>
            <p><strong>DOB:</strong> {student.dob}</p>
          </div>
        </div>
      </Card>

      {/* APPLY FOR HOSTEL - Only show if not allocated */}
      {!student.hostelAlloted && !hostelAllocationData && (
        <Card title="Apply for Hostel" color="#C3EBFA">
          <div className="space-y-4">
            <button
              onClick={() => setApplyOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Fill Hostel Application
            </button>
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------ */}
      {/* TWO CARDS PER ROW (RESPONSIVE GRID)                   */}
      {/* ------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* HOSTEL ALLOCATION */}
        <Card title="Hostel Allocation" color="#C3EBFA">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Hostel Name:</strong> {hostelAllocationData?.hostelName || student.hostel?.hostelName || student.hostelAlloted || 'Not allocated'}</p>
            <p><strong>Room Number:</strong> {hostelAllocationData?.roomNumber || student.hostel?.roomNumber || student.roomNo || '-'}</p>
            <p><strong>Block:</strong> {hostelAllocationData?.hostelDetails?.block || student.hostel?.block || '-'}</p>
            <p><strong>Floor:</strong> {hostelAllocationData?.hostelDetails?.floor || student.hostel?.floor || '-'}</p>
            <p><strong>Room Type:</strong> {hostelAllocationData?.roomType || student.hostel?.roomType || '-'}</p>
            <p><strong>Status:</strong> {hostelAllocationData?.hostelName ? 'Allocated' : (student.hostel?.roomStatus || (student.hostelAlloted || student.roomNo ? 'Allocated' : 'Not allocated'))}</p>
          </div>
        </Card>

        {/* ROOM DETAILS */}
        <Card title="Room Details" color="#FAE27C">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Bed Number:</strong> {hostelAllocationData?.roomDetails?.bedNumber || student.hostel?.bedNumber || '-'}</p>
            <p><strong>Occupancy:</strong> {hostelAllocationData?.roomDetails?.occupancy || student.hostel?.occupancy || '-'}</p>
            <p>
              <strong>Attached Washroom:</strong>{" "}
              {hostelAllocationData?.hostelDetails?.attachedWashroom == null && student.hostel?.attachedWashroom == null ? '-' : (hostelAllocationData?.hostelDetails?.attachedWashroom || student.hostel?.attachedWashroom ? "Yes" : "No")}
            </p>
          </div>
        </Card>

        {/* FEE & PAYMENT */}
        <Card title="Fee & Payment" color="#CFCEFF">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Hostel Fee:</strong> {hostelAllocationData?.hostelDetails?.feePerMonth || student.hostel?.hostelFee || student.hostelAndMessFeePayment?.amount || '-'}</p>
<p><strong>Payment Status:</strong> {hostelAllocationData?.hostelName ? 'Pending' : (student.hostel?.paymentStatus || (student.hostelAndMessFeePayment ? 'Paid' : 'Unpaid'))}</p>
<p><strong>Last Payment Date:</strong> {hostelAllocationData?.hostelDetails?.lastPaymentDate || student.hostel?.lastPaymentDate || (student.hostelAndMessFeePayment?.paymentDate ? new Date(student.hostelAndMessFeePayment.paymentDate).toLocaleDateString() : '-')}</p>

<button
  onClick={downloadReceipt}
  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
>
  Download Fee Receipt (PDF)
</button>

          </div>
        </Card>

        {/* WARDEN DETAILS */}
        <Card title="Warden Details" color="#C3EBFA">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Name:</strong> {hostelAllocationData?.hostelDetails?.warden || student.hostel?.wardenName || '-'}</p>
            <p><strong>Phone:</strong> {hostelAllocationData?.hostelDetails?.contact || student.hostel?.wardenPhone || '-'}</p>
            <p><strong>Email:</strong> {hostelAllocationData?.hostelDetails?.email || student.hostel?.wardenEmail || '-'}</p>
          </div>
        </Card>

        {/* ALLOCATION INFO */}
        <Card title="Allocation Info" color="#FAE27C">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Allocation Date:</strong> {hostelAllocationData?.allottedDate ? new Date(hostelAllocationData.allottedDate).toLocaleDateString() : (student.hostel?.allocationDate || '-')}</p>
            <p><strong>Admission Year:</strong> {hostelAllocationData?.hostelDetails?.admissionYear || student.hostel?.admissionYear || '-'}</p>
          </div>
        </Card>

      </div>

      {/* ------------------------------------------------------ */}
      {/* COMPLAINT HISTORY (FULL WIDTH, SAME AS BEFORE)         */}
      {/* ------------------------------------------------------ */}
      <Card title="Complaint History" color="#CFCEFF">
        <div className="space-y-3">
          {(Array.isArray(student.complaints) ? student.complaints.length === 0 : true) && (
            <p>No complaints filed yet.</p>
          )}

          {(Array.isArray(student.complaints) ? student.complaints : []).map((c) => (
            <div
              key={c.id}
              className="border rounded-lg p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{c.issue}</p>
                <p className="text-sm text-gray-600">{c.date}</p>
              </div>
              <span
                className={`px-3 py-1 text-sm rounded-md ${
                  c.status === "Pending"
                    ? "bg-yellow-200"
                    : c.status === "In Progress"
                    ? "bg-blue-200"
                    : "bg-green-200"
                }`}
              >
                {c.status}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          + Write New Complaint
        </button>
      </Card>

      {/* ------------------------------------------------------ */}
      {/* COMPLAINT FORM POPUP                                   */}
      {/* ------------------------------------------------------ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h3 className="font-bold mb-3">Submit Complaint</h3>

            <textarea
              className="border w-full p-2 rounded"
              rows="4"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Describe your complaint..."
            ></textarea>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={addComplaint}
                className="px-4 py-2 rounded bg-blue-600 text-white"
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