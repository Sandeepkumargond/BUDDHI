"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";

export default function ViewPrintRegistration() {
  const { user, loading: authLoading, isAuthenticated, role } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fullName = useMemo(() => {
    if (!user) return "";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }, [user]);

  const semesters = useMemo(() => {
    const list = Array.from(
      new Set(
        (registrations || []).map((r) => String(r.form?.semester || r.semester))
      )
    ).sort((a, b) => Number(a) - Number(b));
    return list;
  }, [registrations]);

  const selectedRecord = useMemo(() => {
    return registrations.find(
      (r) => String(r.form?.semester || r.semester) === String(selectedSemester)
    );
  }, [registrations, selectedSemester]);

  const getTotalCredits = (record) =>
    (record?.attachedCourses || []).reduce((sum, c) => sum + (Number(c.credits) || 0), 0);

  const getPaymentStatusForSession = (session) => {
    const any = payments.find(
      (p) => p.session === session && (p.transactionStatus?.toLowerCase?.() === "success")
    );
    return any ? "paid" : "pending";
  };

  const loadData = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [regRes, payRes] = await Promise.all([
        apiService.studentListMyRegistrations(),
        apiService.listMyFeePayments()
      ]);
      const regs = regRes?.data?.registrations || [];
      const payData = payRes?.data;
      const payList = Array.isArray(payData) ? payData : (payData?.payments || []);
      setRegistrations(regs);
      setPayments(Array.isArray(payList) ? payList : []);
      if (!regs.length) setMessage("No registrations found.");
    } catch (e) {
      setMessage(e?.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && (role?.toLowerCase?.() === 'student')) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, role]);

  const generateHTML = (record) => {
    const session = record.form?.session || record.session;
    const semester = record.form?.semester || record.semester;
    const title = record.form?.title || record.formTitle || `Semester ${semester} Registration (${session})`;
    const courses = record.attachedCourses || [];
    const totalCredits = getTotalCredits(record);
    const paymentStatus = getPaymentStatusForSession(session);
    return `
    <html>
      <head>
        <title>Registration Form - Semester ${semester}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          .header { text-align: center; padding-bottom: 20px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          th { background: #f0f0f0; }
          .footer { margin-top: 30px; text-align:center; font-size:12px; color:#555; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BUDDHI INSTITUTE OF TECHNOLOGY</h1>
          <h3>${title}</h3>
        </div>

        <h3>Student Information</h3>
        <table>
          <tr><td><b>Name:</b></td><td>${fullName}</td></tr>
          <tr><td><b>Enrollment:</b></td><td>${user?.enrollmentNo ?? '-'}</td></tr>
          <tr><td><b>Department:</b></td><td>${user?.branch || '-'}</td></tr>
          <tr><td><b>Semester:</b></td><td>${semester}</td></tr>
          <tr><td><b>Session:</b></td><td>${session}</td></tr>
          <tr><td><b>Payment:</b></td><td>${paymentStatus}</td></tr>
        </table>

        <h3>Registered Courses</h3>
        <table>
          <thead>
            <tr><th>Course Code</th><th>Course Name</th><th>Credits</th></tr>
          </thead>
          <tbody>
            ${courses.map((c) => `<tr><td>${c.code}</td><td>${c.name}</td><td>${c.credits}</td></tr>`).join("")}
            <tr><td colspan="2"><b>Total Credits</b></td><td><b>${totalCredits}</b></td></tr>
          </tbody>
        </table>

        <div class="footer">
          This is a system-generated registration form. No signature required.
        </div>
      </body>
    </html>`;
  };

  const handlePrint = () => {
    if (!selectedRecord) return;
    const html = generateHTML(selectedRecord);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  const handleDownload = () => {
    if (!selectedRecord) return;
    const html = generateHTML(selectedRecord);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const semester = selectedRecord.form?.semester || selectedRecord.semester;
    a.href = url;
    a.download = `Registration_Form_Sem${semester}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">View & Print Registration Form</h1>
      <p className="text-gray-500 text-sm mb-6">Select a semester to preview your registration details.</p>

      <div className="p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7FF] shadow-sm mb-6">
        <label className="text-sm font-medium text-gray-600 mb-1 block">Select Semester</label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="p-2 rounded-md bg-white ring-1 ring-gray-300 text-sm w-full max-w-xs"
        >
          <option value="">-- Choose Semester --</option>
          {semesters.map((sem) => (
            <option key={sem} value={sem}>Semester {sem}</option>
          ))}
        </select>
      </div>

      {selectedRecord && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-4 mb-6">
            <Image
              src={user?.imageUrl || "/avatar.png"}
              width={85}
              height={85}
              alt={fullName}
              className="rounded-full bg-white p-1 border object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Buddhi Institute of Technology</h2>
              <p className="text-gray-600 text-sm">{selectedRecord.form?.title || selectedRecord.formTitle || `Semester ${selectedRecord.form?.semester || selectedRecord.semester} Registration (${selectedRecord.form?.session || selectedRecord.session})`}</p>
            </div>
          </div>

          <div className="flex gap-4 bg-[#F5F9FF] border border-[#DCE7FF] p-4 rounded-xl shadow-sm mb-6">
            <Image src={user?.imageUrl || "/avatar.png"} width={70} height={70} className="rounded-full object-cover" alt="Student" />
            <div>
              <p className="font-semibold text-lg text-gray-800">{fullName}</p>
              <p className="text-gray-600 text-sm">Enrollment: {user?.enrollmentNo ?? '-'}</p>
              <p className="text-gray-600 text-sm">Branch: {user?.branch || '-'}</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-700">Session: {selectedRecord.form?.session || selectedRecord.session}</div>
              <div className="text-sm text-gray-700">Semester: {selectedRecord.form?.semester || selectedRecord.semester}</div>
              <div className={`text-xs mt-1 inline-block px-2 py-1 rounded-md border ${getPaymentStatusForSession(selectedRecord.form?.session || selectedRecord.session) === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                Payment: {getPaymentStatusForSession(selectedRecord.form?.session || selectedRecord.session)}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-3 text-gray-700">Registered Courses</h3>
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-[#E9F2FF] text-gray-700">
              <tr>
                <th className="p-3 text-left">Course Code</th>
                <th className="p-3 text-left">Course Name</th>
                <th className="p-3 text-left">Credits</th>
              </tr>
            </thead>
            <tbody>
              {(selectedRecord.attachedCourses || []).map((c, i) => (
                <tr key={i} className="border-t border-gray-200 hover:bg-[#F7FBFF]">
                  <td className="p-3">{c.code}</td>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.credits}</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan={2} className="p-3 font-bold">Total Credits</td>
                <td className="p-3 font-bold">{getTotalCredits(selectedRecord)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex gap-4 mt-6">
            <button onClick={handlePrint} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Print</button>
            <button onClick={handleDownload} className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Download</button>
          </div>
        </div>
      )}
    </div>
  );
}
