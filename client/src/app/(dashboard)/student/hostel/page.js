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

  const getAvailableRoomsForHostel = (hostelName) => {
    const hostel = hostels.find(h => h.name === hostelName);
    if (!hostel) return [];
    
    const availableRooms = hostel.rooms ? hostel.rooms.filter(r => !r.occupied) : [];
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
    
    const roomsPerFloor = {};
    const numberOfFloors = hostel.numberOfFloors || 1;
    
    // Initialize all floors with 0
    for (let i = 0; i < numberOfFloors; i++) {
      roomsPerFloor[i] = 0;
    }
    
    // Count available rooms per floor
    if (hostel.rooms) {
      hostel.rooms.forEach(r => {
        const floor = r.floor ?? 0;
        if (!r.occupied) {
          roomsPerFloor[floor] = (roomsPerFloor[floor] || 0) + 1;
        }
      });
    }
    
    return roomsPerFloor;
  };

  const getRoomsOnFloor = (hostelName, floor) => {
    const hostel = hostels.find(h => h.name === hostelName);
    if (!hostel) return [];
    
    const roomsOnFloor = hostel.rooms ? hostel.rooms.filter(r => !r.occupied && (r.floor ?? 0) === floor) : [];
    return roomsOnFloor.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  };
  const [hostels, setHostels] = useState([]);
  const [hostelLoading, setHostelLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [choice1Hostel, setChoice1Hostel] = useState("");
  const [choice1Floor, setChoice1Floor] = useState("");
  const [choice1Room, setChoice1Room] = useState("");
  const [choice2Hostel, setChoice2Hostel] = useState("");
  const [choice2Floor, setChoice2Floor] = useState("");
  const [choice2Room, setChoice2Room] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hostelAllocationData, setHostelAllocationData] = useState(null);

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
  const allotmentContent = `
    <div style="font-family: Arial; padding: 20px;">
      <h2 style="text-align:center;">Hostel Allotment Details</h2>
      <hr />
      <h3>Student Details</h3>
      <p><strong>Name:</strong> ${student.name}</p>
      <p><strong>Roll No:</strong> ${student.rollNo}</p>
      <p><strong>Enrollment No:</strong> ${student.enrolmentNo}</p>

      <h3>Allotment Details</h3>
      <p><strong>Hostel Name:</strong> ${student.hostel.hostelName}</p>
      <p><strong>Room Number:</strong> ${student.hostel.roomNumber}</p>
      <p><strong>Room Type:</strong> ${student.hostel.roomType}</p>
      <p><strong>Allocation Date:</strong> ${student.hostel.allocationDate}</p>

      <h3>Warden Details</h3>
      <p><strong>Warden Name:</strong> ${student.hostel.wardenName}</p>
      <p><strong>Warden Phone:</strong> ${student.hostel.wardenPhone}</p>

      <br><br>
      <p style="text-align:right;">Authorized Signature</p>
    </div>
  `;

  const newWindow = window.open("", "_blank");
  newWindow.document.write(allotmentContent);
  newWindow.document.close();

  newWindow.print();
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


  const addComplaint = () => {
    if (!complaint.trim()) return;
    // Ensure complaints array exists
    if (!Array.isArray(student.complaints)) student.complaints = [];

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
        {hostelAllocationData && student.hostel?.hostelName ? (
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
                <p><strong>Floor:</strong> {student.hostel.floor}</p>
                <p><strong>Room Type:</strong> {student.hostel.roomType}</p>
                <p><strong>Status:</strong> {student.hostel.roomStatus}</p>
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
          {(Array.isArray(student.complaints) ? student.complaints.length === 0 : true) && (
            <p style={{ color: "#64748b" }}>No complaints filed yet.</p>
          )}
          {(Array.isArray(student.complaints) ? student.complaints : []).map((c) => (
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