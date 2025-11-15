"use client";

import { studentHostelData } from "@/lib/aryan_hosteldata";
import Image from "next/image";
import { useState } from "react";

export default function HostelPage() {
  const student = studentHostelData[0]; // TEMP → replace with auth user later
  const [showForm, setShowForm] = useState(false);
  const [complaint, setComplaint] = useState("");

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

      {/* ------------------------------------------------------ */}
      {/* TWO CARDS PER ROW (RESPONSIVE GRID)                   */}
      {/* ------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* HOSTEL ALLOCATION */}
        <Card title="Hostel Allocation" color="#C3EBFA">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Hostel Name:</strong> {student.hostel.hostelName}</p>
            <p><strong>Room Number:</strong> {student.hostel.roomNumber}</p>
            <p><strong>Block:</strong> {student.hostel.block}</p>
            <p><strong>Floor:</strong> {student.hostel.floor}</p>
            <p><strong>Room Type:</strong> {student.hostel.roomType}</p>
            <p><strong>Status:</strong> {student.hostel.roomStatus}</p>
          </div>
        </Card>

        {/* ROOM DETAILS */}
        <Card title="Room Details" color="#FAE27C">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Bed Number:</strong> {student.hostel.bedNumber}</p>
            <p><strong>Occupancy:</strong> {student.hostel.occupancy}</p>
            <p>
              <strong>Attached Washroom:</strong>{" "}
              {student.hostel.attachedWashroom ? "Yes" : "No"}
            </p>
          </div>
        </Card>

        {/* FEE & PAYMENT */}
        <Card title="Fee & Payment" color="#CFCEFF">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Hostel Fee:</strong> {student.hostel.hostelFee}</p>
            <p><strong>Payment Status:</strong> {student.hostel.paymentStatus}</p>
            <p><strong>Last Payment Date:</strong> {student.hostel.lastPaymentDate}</p>
          </div>
        </Card>

        {/* WARDEN DETAILS */}
        <Card title="Warden Details" color="#C3EBFA">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Name:</strong> {student.hostel.wardenName}</p>
            <p><strong>Phone:</strong> {student.hostel.wardenPhone}</p>
            <p><strong>Email:</strong> {student.hostel.wardenEmail}</p>
          </div>
        </Card>

        {/* ALLOCATION INFO */}
        <Card title="Allocation Info" color="#FAE27C">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Allocation Date:</strong> {student.hostel.allocationDate}</p>
            <p><strong>Admission Year:</strong> {student.hostel.admissionYear}</p>
          </div>
        </Card>

      </div>

      {/* ------------------------------------------------------ */}
      {/* COMPLAINT HISTORY (FULL WIDTH, SAME AS BEFORE)         */}
      {/* ------------------------------------------------------ */}
      <Card title="Complaint History" color="#CFCEFF">
        <div className="space-y-3">
          {student.complaints.length === 0 && (
            <p>No complaints filed yet.</p>
          )}

          {student.complaints.map((c) => (
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

    </div>
  );
}
