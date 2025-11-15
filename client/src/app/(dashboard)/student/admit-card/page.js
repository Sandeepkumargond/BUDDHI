"use client";

import {
  admitCardStudent,
  examSession,
  examCoordinator,
  examInstructions,
  examSchedule,
} from "@/lib/aryan_admitcarddata";
import Image from "next/image";
import { useState } from "react";

export default function AdmitCardPage() {
  const [previewOpen, setPreviewOpen] = useState(false);

  /* ---------------------------------------
      DOWNLOAD ADMIT CARD (PDF)
  --------------------------------------- */
  const downloadPDF = () => {
    const popup = window.open("", "_blank");
    popup.document.write(`
      <html>
      <head>
        <title>Admit Card</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #555; padding: 8px; }
          th { background: #eee; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center;">Admit Card - ${examSession.session}</h2>
        <hr />

        <h3>Student Details</h3>
        <p><strong>Name:</strong> ${admitCardStudent.name}</p>
        <p><strong>Roll No:</strong> ${admitCardStudent.rollNo}</p>
        <p><strong>Enrollment No:</strong> ${admitCardStudent.enrolmentNo}</p>
        <p><strong>Course:</strong> ${admitCardStudent.course}</p>

        <h3>Exam Session</h3>
        <p><strong>Exam Type:</strong> ${examSession.type}</p>
        <p><strong>Center:</strong> ${examSession.examCenter}</p>

        <h3>Exam Schedule</h3>
        <table>
          <tr><th>Date</th><th>Code</th><th>Name</th><th>Time</th></tr>
          ${examSchedule
            .map(
              (s) =>
                `<tr><td>${s.date}</td><td>${s.code}</td><td>${s.name}</td><td>${s.time}</td></tr>`
            )
            .join("")}
        </table>

        <br><p style="text-align:right;">Controller of Examination</p>
      </body>
      </html>
    `);
    popup.document.close();
    popup.print();
  };

  /* ---------------------------------------
      PREVIEW ADMIT CARD (OPEN POPUP)
  --------------------------------------- */
  const openPreview = () => {
    const popup = window.open("", "_blank", "width=900,height=700");
    popup.document.write(`
      <html>
      <head>
        <title>Admit Card Preview</title>
        <style>
          body { font-family: Arial; padding: 20px; line-height: 1.6; }
          h2 { text-align: center; }
          table { width: 100%; margin-top: 10px; border-collapse: collapse; }
          td, th { border: 1px solid #555; padding: 8px; }
          th { background: #eee; }
        </style>
      </head>
      <body>

        <h2>Admit Card Preview</h2>
        <hr/>

        <h3>Student Details</h3>
        <p><strong>Name:</strong> ${admitCardStudent.name}</p>
        <p><strong>Roll No:</strong> ${admitCardStudent.rollNo}</p>
        <p><strong>Enrollment:</strong> ${admitCardStudent.enrolmentNo}</p>

        <h3>Exam Session</h3>
        <p><strong>Exam:</strong> ${examSession.type}</p>
        <p><strong>Session:</strong> ${examSession.session}</p>
        <p><strong>Center:</strong> ${examSession.examCenter}</p>

        <h3>Exam Schedule</h3>
        <table>
          <tr><th>Date</th><th>Code</th><th>Subject</th><th>Time</th></tr>
          ${examSchedule
            .map(
              (exam) =>
                `<tr><td>${exam.date}</td><td>${exam.code}</td><td>${exam.name}</td><td>${exam.time}</td></tr>`
            )
            .join("")}
        </table>

      </body>
      </html>
    `);
    popup.document.close();
  };

  return (
    <div className="p-6 space-y-6">

      {/* TOP ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* STUDENT DETAILS */}
        <div className="bg-white shadow-lg rounded-xl p-5 border">
          <div
            className="rounded-lg px-4 py-2 mb-4 font-semibold"
            style={{ background: "#CFCEFF" }}
          >
            Student Details
          </div>

          <div className="flex items-center gap-4">
            <Image
              src={admitCardStudent.photo}
              width={90}
              height={90}
              alt="student"
              className="rounded-lg object-cover"
            />
            <div>
              <p className="font-semibold text-lg">{admitCardStudent.name}</p>
              <p>Roll No: {admitCardStudent.rollNo}</p>
              <p>Enrollment: {admitCardStudent.enrolmentNo}</p>
              <p>Course: {admitCardStudent.course}</p>
              <p>Year/Sem: {admitCardStudent.year} / Sem {admitCardStudent.semester}</p>
            </div>
          </div>
        </div>

        {/* EXAM SESSION */}
        <div className="bg-white shadow-lg rounded-xl p-5 border">
          <div
            className="rounded-lg px-4 py-2 mb-4 font-semibold"
            style={{ background: "#C3EBFA" }}
          >
            Exam Session Details
          </div>

          <p><strong>Exam Type:</strong> {examSession.type}</p>
          <p><strong>Session:</strong> {examSession.session}</p>
          <p><strong>Exam Center:</strong> {examSession.examCenter}</p>
          <p><strong>Center Code:</strong> {examSession.centerCode}</p>
          <p><strong>Reporting Time:</strong> {examSession.reportingTime}</p>
          <p><strong>Gate Close:</strong> {examSession.gateClose}</p>
        </div>

      </div>

      {/* EXAM SCHEDULE CENTER */}
      <div className="bg-white shadow-lg rounded-xl p-5 border">
        <h2 className="font-semibold text-lg mb-4 text-center">Exam Schedule</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-center">
              <th className="border p-2">Date</th>
              <th className="border p-2">Code</th>
              <th className="border p-2">Subject</th>
              <th className="border p-2">Time</th>
            </tr>
          </thead>

          <tbody>
            {examSchedule.map((exam, index) => (
              <tr key={index} className="text-center">
                <td className="border p-2">{exam.date}</td>
                <td className="border p-2">{exam.code}</td>
                <td className="border p-2">{exam.name}</td>
                <td className="border p-2">{exam.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BUTTONS BELOW SCHEDULE */}
      <div className="flex gap-4 justify-center mt-2">
        <button
          onClick={openPreview}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          Preview Admit Card
        </button>

        <button
          onClick={downloadPDF}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
        >
          Download Admit Card (PDF)
        </button>
      </div>

      {/* BOTTOM ROW — COORDINATOR + INSTRUCTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* COORDINATOR DETAILS */}
        <div className="bg-white shadow-lg rounded-xl p-5 border">
          <div
            className="rounded-lg px-4 py-2 mb-4 font-semibold"
            style={{ background: "#FAE27C" }}
          >
            Coordinator Details
          </div>

          <p><strong>Name:</strong> {examCoordinator.name}</p>
          <p><strong>Phone:</strong> {examCoordinator.phone}</p>
          <p><strong>Email:</strong> {examCoordinator.email}</p>
          <p><strong>Office:</strong> {examCoordinator.office}</p>
        </div>

        {/* INSTRUCTIONS */}
        <div className="bg-white shadow-lg rounded-xl p-5 border">
          <div
            className="rounded-lg px-4 py-2 mb-4 font-semibold"
            style={{ background: "#CFCEFF" }}
          >
            Important Instructions
          </div>

          <ul className="list-disc ml-6 space-y-2">
            {examInstructions.map((i, index) => (
              <li key={index}>{i}</li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
