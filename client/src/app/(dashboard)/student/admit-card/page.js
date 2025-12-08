"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { apiService } from "@/lib/api";

export default function AdmitCardPage() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [admitCardStudent, setAdmitCardStudent] = useState({
    name: "",
    rollNo: "",
    enrolmentNo: "",
    registrationNo: "",
    course: "",
    year: "",
    semester: "",
    dob: "",
    photo: "/avatar.png",
  });
  const [examSession, setExamSession] = useState({
    type: "",
    session: "",
    examCenter: "",
    centerCode: "",
    reportingTime: "",
    gateClose: "",
  });
  const [examCoordinator, setExamCoordinator] = useState({
    name: "",
    phone: "",
    email: "",
    office: "",
    signatureUrl: "",
  });
  const [instituteName, setInstituteName] = useState("");
  const [examInstructions, setExamInstructions] = useState([]);
  const [examSchedule, setExamSchedule] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await apiService.studentGetMyAdmitCard();
        const data = res?.data || {};
        if (!active) return;
        if (data.student) setAdmitCardStudent((s) => ({ ...s, ...data.student, photo: data.student.photo || "/avatar.png" }));
        if (data.session) setExamSession({
          type: data.session.examType || data.session.type || "",
          session: data.session.session || "",
          examCenter: data.session.examCenter || "",
          centerCode: data.session.centerCode || "",
          reportingTime: data.session.reportingTime || "",
          gateClose: data.session.gateClose || "",
        });
        if (Array.isArray(data.schedule)) setExamSchedule(data.schedule);
        if (data.coordinator) setExamCoordinator(data.coordinator);
        if (data.instituteName) setInstituteName(data.instituteName);
        if (Array.isArray(data.instructions)) setExamInstructions(data.instructions);
        setMessage("");
      } catch (err) {
        if (!active) return;
        setMessage(err?.message || "Failed to load admit card");
      }
    };
    load();
    return () => { active = false };
  }, []);

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
          .container { max-width: 900px; margin: 0 auto; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #555; padding: 8px; }
          th { background: #eee; }
          .student-box { display: flex; gap: 16px; align-items: center; justify-content: space-between; }
          .student-info { flex: 1; margin-right: 16px; }
          .student-photo { width: 90px; height: 90px; border-radius: 8px; object-fit: cover; border: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 style="text-align:center;margin:0;">${instituteName || ''}</h1>
          <h2 style="text-align:center;margin-top:4px;">Admit Card - ${examSession.session}</h2>
          <hr />

          <h3>Student Details</h3>
          <div class="student-box">
            <div class="student-info">
              <p><strong>Name:</strong> ${admitCardStudent.name}</p>
              <p><strong>Roll No:</strong> ${admitCardStudent.rollNo}</p>
              <p><strong>Enrollment No:</strong> ${admitCardStudent.enrolmentNo}</p>
              <p><strong>Course:</strong> ${admitCardStudent.course}</p>
            </div>
            <img class="student-photo" src="${admitCardStudent.photo || '/avatar.png'}" alt="Student Photo" />
          </div>

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

          <h3 style="margin-top:16px;">Important Instructions</h3>
          <ul style="margin-left:20px;">
            ${ (Array.isArray(examInstructions) ? examInstructions : [])
                .map((i) => `<li>${i}</li>`)
                .join("") }
          </ul>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
            <div></div>
            <div style="text-align:right;">
              ${examCoordinator?.signatureUrl ? `<img src="${examCoordinator.signatureUrl}" alt="Signature" style="height:60px;object-fit:contain;display:block;margin-left:auto;" />` : ''}
              <div style="margin-top:4px;">Exam Coordinator</div>
            </div>
          </div>
        </div>
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
          .container { max-width: 900px; margin: 0 auto; }
          h2 { text-align: center; }
          table { width: 100%; margin-top: 10px; border-collapse: collapse; }
          td, th { border: 1px solid #555; padding: 8px; }
          th { background: #eee; }
          .student-box { display: flex; gap: 16px; align-items: center; justify-content: space-between; }
          .student-info { flex: 1; margin-right: 16px; }
          .student-photo { width: 90px; height: 90px; border-radius: 8px; object-fit: cover; border: 1px solid #ccc; }
        </style>
      </head>
      <body>

        <div class="container">
          <h1 style="text-align:center;margin:0;">${instituteName || ''}</h1>
          <h2 style="text-align:center;margin-top:4px;">Admit Card Preview</h2>
          <hr/>

          <h3>Student Details</h3>
          <div class="student-box">
            <div class="student-info">
              <p><strong>Name:</strong> ${admitCardStudent.name}</p>
              <p><strong>Roll No:</strong> ${admitCardStudent.rollNo}</p>
              <p><strong>Enrollment:</strong> ${admitCardStudent.enrolmentNo}</p>
            </div>
            <img class="student-photo" src="${admitCardStudent.photo || '/avatar.png'}" alt="Student Photo" />
          </div>

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
          <h3 style="margin-top:16px;">Important Instructions</h3>
          <ul style="margin-left:20px;">
            ${ (Array.isArray(examInstructions) ? examInstructions : [])
                .map((i) => `<li>${i}</li>`)
                .join("") }
          </ul>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
            <div></div>
            <div style="text-align:right;">
              ${examCoordinator?.signatureUrl ? `<img src="${examCoordinator.signatureUrl}" alt="Signature" style="height:60px;object-fit:contain;display:block;margin-left:auto;" />` : ''}
              <div style="margin-top:4px;">Exam Coordinator</div>
            </div>
          </div>
        </div>

      </body>
      </html>
    `);
    popup.document.close();
  };

  return (
    <div className="p-6 space-y-6">
      {message ? (
        <div className="text-sm text-red-600">{message}</div>
      ) : null}

      {/* Consolidated Admit Card */}
      <div className="rounded-xl bg-white" style={{ border: "1px solid #e5e7eb", boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>
        <div className="p-5 space-y-0" style={{ color: "#0f172a" }}>
          {/* Student Details */}
          <section className="pb-6">
            <h3 className="text-base md:text-lg font-semibold mb-3 inline-block px-3 py-2 rounded-md" style={{ color: "#3730a3", background: "#eef2ff", border: "1px solid #e5e7eb" }}>Student Details</h3>
            <div className="flex items-center gap-4">
              <Image src={admitCardStudent.photo || "/avatar.png"} width={90} height={90} alt="student" className="rounded-lg object-cover" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p><strong>Name:</strong> {admitCardStudent.name}</p>
                <p><strong>Roll No:</strong> {admitCardStudent.rollNo}</p>
                <p><strong>Enrollment:</strong> {admitCardStudent.enrolmentNo}</p>
                <p><strong>Course:</strong> {admitCardStudent.course}</p>
                <p><strong>Year/Sem:</strong> {admitCardStudent.year} / Sem {admitCardStudent.semester}</p>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t" style={{ borderColor: "#e5e7eb" }}></div>

          {/* Exam Session Details */}
          <section className="py-6">
            <h3 className="text-base md:text-lg font-semibold mb-3 inline-block px-3 py-2 rounded-md" style={{ color: "#3730a3", background: "#eef2ff", border: "1px solid #e5e7eb" }}>Exam Session</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p><strong>Exam Type:</strong> {examSession.type}</p>
              <p><strong>Session:</strong> {examSession.session}</p>
              <p><strong>Exam Center:</strong> {examSession.examCenter}</p>
              <p><strong>Center Code:</strong> {examSession.centerCode}</p>
              <p><strong>Reporting Time:</strong> {examSession.reportingTime}</p>
              <p><strong>Gate Close:</strong> {examSession.gateClose}</p>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t" style={{ borderColor: "#e5e7eb" }}></div>

          {/* Coordinator Details */}
          <section className="py-6">
            <h3 className="text-base md:text-lg font-semibold mb-3 inline-block px-3 py-2 rounded-md" style={{ color: "#3730a3", background: "#eef2ff", border: "1px solid #e5e7eb" }}>Coordinator Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p><strong>Name:</strong> {examCoordinator.name}</p>
              <p><strong>Phone:</strong> {examCoordinator.phone}</p>
              <p><strong>Email:</strong> {examCoordinator.email}</p>
              <p><strong>Office:</strong> {examCoordinator.office}</p>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t" style={{ borderColor: "#e5e7eb" }}></div>

          {/* Instructions */}
          <section className="py-6">
            <h3 className="text-base md:text-lg font-semibold mb-3 inline-block px-3 py-2 rounded-md" style={{ color: "#3730a3", background: "#eef2ff", border: "1px solid #e5e7eb" }}>Important Instructions</h3>
            <ul className="list-disc ml-6 space-y-2">
              {examInstructions.map((i, index) => (
                <li key={index}>{i}</li>
              ))}
            </ul>
          </section>

          {/* Divider */}
          <div className="border-t" style={{ borderColor: "#e5e7eb" }}></div>

          {/* Exam Schedule at bottom */}
          <section className="py-6">
            <h3 className="text-base md:text-lg font-semibold mb-3 inline-block px-3 py-2 rounded-md" style={{ color: "#3730a3", background: "#eef2ff", border: "1px solid #e5e7eb" }}>Exam Schedule</h3>
            <div className="overflow-x-auto">
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
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={openPreview} className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700">Preview Admit Card</button>
              <button onClick={downloadPDF} className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700">Download Admit Card (PDF)</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
