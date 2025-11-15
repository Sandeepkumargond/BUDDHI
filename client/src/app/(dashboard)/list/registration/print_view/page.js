"use client";

import { useState } from "react";
import Image from "next/image";
import { registrationRecords } from "@/lib/roushaniData";

export default function ViewPrintRegistration() {
  const student = registrationRecords[0]; // logged-in student (dummy)

  const semesters = [
    ...new Set(registrationRecords.map((r) => r.semester)),
  ].sort();

  const [selectedSemester, setSelectedSemester] = useState("");

  const selectedRecord = registrationRecords.find(
    (r) => String(r.semester) === String(selectedSemester)
  );

  /* -------------------------------
        PRINT FUNCTION
  --------------------------------*/
  const handlePrint = () => {
    if (!selectedRecord) return;

    const html = generateHTML(selectedRecord);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  /* -------------------------------
        DOWNLOAD FUNCTION
  --------------------------------*/
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

  /* -------------------------------
       TEMPLATE FOR PRINT / DOWNLOAD
  --------------------------------*/
  const generateHTML = (record) => `
    <html>
      <head>
        <title>Registration Form - Semester ${record.semester}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          .header { text-align: center; padding-bottom: 20px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          th { background: #f0f0f0; }
          .footer { margin-top: 30px; text-align:center; font-size:12px; color:#555; }
          .logo { width: 90px; margin-bottom: 10px; }
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
                (c) =>
                  `<tr><td>${c.code}</td><td>${c.name}</td><td>${c.credits}</td></tr>`
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
    <div className="p-6 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">

      {/* PAGE HEADER */}
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">
        View & Print Registration Form
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Select a semester to preview your registration details.
      </p>

      {/* SELECT SEMESTER BOX */}
      <div className="p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7FF] shadow-sm mb-6">
        <label className="text-sm font-medium text-gray-600 mb-1 block">
          Select Semester
        </label>

        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="p-2 rounded-md bg-white ring-1 ring-gray-300 text-sm w-full max-w-xs"
        >
          <option value="">-- Choose Semester --</option>
          {semesters.map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>
      </div>

      {/* REGISTRATION CARD */}
      {selectedRecord && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-md p-6">

          {/* HEADER WITH LOGO */}
          <div className="flex items-center gap-4 mb-6">
            <Image
              src={selectedRecord.instituteLogo}
              width={85}
              height={85}
              alt="Institute Logo"
              className="rounded-lg bg-white p-1 border"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Buddhi Institute of Technology
              </h2>
              <p className="text-gray-600 text-sm">Semester Registration Form</p>
            </div>
          </div>

          {/* STUDENT INFO CARD */}
          <div className="flex gap-4 bg-[#F5F9FF] border border-[#DCE7FF] p-4 rounded-xl shadow-sm mb-6">
            <Image
              src={selectedRecord.photo}
              width={70}
              height={70}
              className="rounded-full"
              alt="Student"
            />
            <div>
              <p className="font-semibold text-lg text-gray-800">
                {selectedRecord.studentName}
              </p>
              <p className="text-gray-600 text-sm">{selectedRecord.studentEnrollment}</p>
              <p className="text-gray-600 text-sm">{selectedRecord.department}</p>
            </div>
          </div>

          {/* COURSE TABLE */}
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Registered Courses
          </h3>

          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-[#E9F2FF] text-gray-700">
              <tr>
                <th className="p-3 text-left">Course Code</th>
                <th className="p-3 text-left">Course Name</th>
                <th className="p-3 text-left">Credits</th>
              </tr>
            </thead>
            <tbody>
              {selectedRecord.registeredCourses.map((c, i) => (
                <tr key={i} className="border-t border-gray-200 hover:bg-[#F7FBFF]">
                  <td className="p-3">{c.code}</td>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.credits}</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan={2} className="p-3 font-bold">
                  Total Credits
                </td>
                <td className="p-3 font-bold">{selectedRecord.totalCredits}</td>
              </tr>
            </tbody>
          </table>

          {/* BUTTONS */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Print
            </button>

            <button
              onClick={handleDownload}
              className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
