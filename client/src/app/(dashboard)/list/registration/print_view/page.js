"use client";

import { useState } from "react";
import Image from "next/image";
import { registrationRecords } from "@/lib/roushaniData";

export default function ViewPrintRegistration() {
  const student = registrationRecords[0]; // current logged-in student (dummy)

  // Semesters available
  const semesters = [
    ...new Set(registrationRecords.map((r) => r.semester)),
  ].sort();

  const [selectedSemester, setSelectedSemester] = useState("");
  const selectedRecord = registrationRecords.find(
    (r) => String(r.semester) === String(selectedSemester)
  );

  // -----------------------------------------
  // PRINT FUNCTION
  // -----------------------------------------
  const handlePrint = () => {
    if (!selectedRecord) return;

    const html = generateHTML(selectedRecord);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  // -----------------------------------------
  // DOWNLOAD FUNCTION
  // -----------------------------------------
  const handleDownload = () => {
    if (!selectedRecord) return;

    const html = generateHTML(selectedRecord);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Registration_Form_Sem${selectedRecord.semester}.html`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // -----------------------------------------
  // HTML TEMPLATE FOR PRINT / DOWNLOAD
  // -----------------------------------------
  const generateHTML = (record) => `
    <html>
      <head>
        <title>Registration Form - Semester ${record.semester}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          th { background: #f0f0f0; }
          .footer { margin-top: 30px; text-align:center; font-size:12px; color:#555; }
          .logo { width: 90px; height: auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${record.instituteLogo}" class="logo" />
          <h1>BUDDHI INSTITUTE OF TECHNOLOGY</h1>
          <h3>Semester Registration Form</h3>
        </div>

        <h3>Student Information</h3>
        <table>
          <tr><td><b>Name:</b></td><td>${record.studentName}</td></tr>
          <tr><td><b>Enrollment:</b></td><td>${record.studentEnrollment}</td></tr>
          <tr><td><b>Department:</b></td><td>${record.department}</td></tr>
          <tr><td><b>Semester:</b></td><td>${record.semester}</td></tr>
          <tr><td><b>Academic Year:</b></td><td>${record.academicYear}</td></tr>
          <tr><td><b>Date:</b></td><td>${record.date}</td></tr>
        </table>

        <h3>Registered Courses</h3>
        <table>
          <thead>
            <tr><th>Course Code</th><th>Course Name</th><th>Credits</th></tr>
          </thead>
          <tbody>
            ${record.registeredCourses
              .map(
                (c) => `<tr><td>${c.code}</td><td>${c.name}</td><td>${c.credits}</td></tr>`
              )
              .join("")}
            <tr><td colspan="2"><b>Total Credits</b></td><td><b>${record.totalCredits}</b></td></tr>
          </tbody>
        </table>

        <div class="footer">
          This is a system-generated registration form. No signature required.
        </div>
      </body>
    </html>
  `;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">View & Print Registration Form</h1>

      {/* Select Semester */}
      <div className="mb-4">
        <label className="block text-gray-600 mb-1 text-sm font-medium">
          Select Semester:
        </label>

        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="p-2 border rounded-md bg-white"
        >
          <option value="">-- Choose Semester --</option>
          {semesters.map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>
      </div>

      {/* Show Registration Form */}
      {selectedRecord && (
        <div className="bg-white border rounded-lg p-6 shadow-sm mt-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Image
              src={selectedRecord.instituteLogo}
              width={80}
              height={80}
              alt="Institute Logo"
            />
            <div>
              <h2 className="text-xl font-semibold">Buddhi Institute of Technology</h2>
              <p className="text-gray-600 text-sm">Semester Registration Form</p>
            </div>
          </div>

          {/* Student Card */}
          <div className="flex gap-4 bg-gray-50 p-4 rounded-lg mb-6">
            <Image
              src={selectedRecord.photo}
              width={70}
              height={70}
              className="rounded-full object-cover"
              alt="Student"
            />
            <div>
              <p className="font-semibold text-lg">{selectedRecord.studentName}</p>
              <p className="text-gray-600 text-sm">{selectedRecord.studentEnrollment}</p>
              <p className="text-gray-600 text-sm">{selectedRecord.department}</p>
            </div>
          </div>

          {/* Course Table */}
          <h3 className="text-lg font-semibold mb-3">Registered Courses</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Code</th>
                <th className="border p-2 text-left">Course</th>
                <th className="border p-2 text-left">Credits</th>
              </tr>
            </thead>
            <tbody>
              {selectedRecord.registeredCourses.map((c, i) => (
                <tr key={i}>
                  <td className="border p-2">{c.code}</td>
                  <td className="border p-2">{c.name}</td>
                  <td className="border p-2">{c.credits}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} className="border p-2 font-bold">
                  Total Credits
                </td>
                <td className="border p-2 font-bold">{selectedRecord.totalCredits}</td>
              </tr>
            </tbody>
          </table>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Print
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
