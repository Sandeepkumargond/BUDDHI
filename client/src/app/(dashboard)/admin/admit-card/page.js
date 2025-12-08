"use client";

import { useEffect, useMemo, useState } from "react";
import { apiService } from "@/lib/api";

// Simple utility to open a printable preview window
const openPreviewWindow = (payload) => {
  const { sessionDetails, schedule = [], coordinator } = payload || {};
  const popup = window.open("", "_blank", "width=900,height=700");
  const rows = (schedule || [])
    .map(
      (s) => `<tr>
        <td class="border p-2">${s.date || "-"}</td>
        <td class="border p-2">${s.code || "-"}</td>
        <td class="border p-2">${s.name || "-"}</td>
        <td class="border p-2">${s.time || "-"}</td>
      </tr>`
    )
    .join("");

  popup.document.write(`
    <html>
    <head>
      <title>Admit Card - ${sessionDetails?.session || "Session"}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        .title { font-weight: 600; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #999; padding: 8px; text-align: center; }
        th { background: #f3f4f6; }
      </style>
    </head>
    <body>
      <h2 style="text-align:center">Admit Card Configuration Preview</h2>
      <div class="card">
        <div class="title">Exam Session Details</div>
        <div><strong>Exam Type:</strong> ${sessionDetails?.examType || ""}</div>
        <div><strong>Session:</strong> ${sessionDetails?.session || ""}</div>
        <div><strong>Exam Center:</strong> ${sessionDetails?.examCenter || ""}</div>
        <div><strong>Center Code:</strong> ${sessionDetails?.centerCode || ""}</div>
        <div><strong>Reporting Time:</strong> ${sessionDetails?.reportingTime || ""}</div>
        <div><strong>Gate Close:</strong> ${sessionDetails?.gateClose || ""}</div>
      </div>

      <div class="card">
        <div class="title">Exam Schedule</div>
        <table>
          <thead>
            <tr><th>Date</th><th>Code</th><th>Subject</th><th>Time</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <div class="card">
        <div class="title">Coordinator Details</div>
        <div><strong>Name:</strong> ${coordinator?.name || ""}</div>
        <div><strong>Phone:</strong> ${coordinator?.phone || ""}</div>
        <div><strong>Email:</strong> ${coordinator?.email || ""}</div>
        <div><strong>Office:</strong> ${coordinator?.office || ""}</div>
      </div>
    </body>
    </html>
  `);
  popup.document.close();
};

export default function AdminAdmitCardPublishPage() {
  // Session details
  const [examType, setExamType] = useState("");
  const [session, setSession] = useState("");
  const [examCenter, setExamCenter] = useState("");
  const [centerCode, setCenterCode] = useState("");
  const [reportingTime, setReportingTime] = useState("");
  const [gateClose, setGateClose] = useState("");

  // Filters to fetch courses
  const [departmentCode, setDepartmentCode] = useState("");
  const [semester, setSemester] = useState("");

  // Dynamic options
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Coordinator details
  const [coordName, setCoordName] = useState("");
  const [coordPhone, setCoordPhone] = useState("");
  const [coordEmail, setCoordEmail] = useState("");
  const [coordOffice, setCoordOffice] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);

  // Schedule rows: { courseId, code, name, date, time }
  const [schedule, setSchedule] = useState([
    { courseId: "", code: "", name: "", date: "", time: "" },
  ]);

  // Load departments once (admin-only route; uses auth cookies)
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await apiService.adminListDepartments();
        const list = res?.data?.departments || [];
        if (active) setDepartments(list);
      } catch (e) {
        if (active) setDepartments([]);
      }
    };
    load();
    return () => { active = false };
  }, []);

  // Load courses whenever dept/semester changes
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingCourses(true);
      try {
        const res = await apiService.adminListCoursesByDepartmentCode(
          departmentCode,
          { semester }
        );
        const list = res?.data?.courses || [];
        if (active) setCourses(list);
      } catch (e) {
        if (active) setCourses([]);
      } finally {
        if (active) setLoadingCourses(false);
      }
    };
    if (departmentCode && semester) load();
    return () => { active = false };
  }, [departmentCode, semester]);

  const departmentOptions = useMemo(() => {
    if (!departments?.length) {
      // Fallback common codes if API not ready
      return [
        { code: "CSE", name: "Computer Science and Engineering" },
        { code: "ECE", name: "Electronics and Communication Engineering" },
        { code: "EE", name: "Electrical Engineering" },
        { code: "ME", name: "Mechanical Engineering" },
        { code: "CE", name: "Civil Engineering" },
      ];
    }
    return departments.map((d) => ({ code: d.code, name: d.name }));
  }, [departments]);

  const handleCourseSelect = (idx, selectedId) => {
    const found = courses.find((c) => String(c._id) === String(selectedId));
    setSchedule((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        courseId: selectedId || "",
        code: found?.code || "",
        name: found?.name || "",
      };
      return next;
    });
  };

  const handleRowChange = (idx, key, value) => {
    setSchedule((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const addRow = () => setSchedule((prev) => [...prev, { courseId: "", code: "", name: "", date: "", time: "" }]);
  const removeRow = (idx) => setSchedule((prev) => prev.filter((_, i) => i !== idx));

  const payload = useMemo(() => ({
    filters: { departmentCode, semester: Number(semester) },
    sessionDetails: { examType, session, examCenter, centerCode, reportingTime, gateClose },
    schedule: schedule.filter((s) => s.code && s.name),
    coordinator: { name: coordName, phone: coordPhone, email: coordEmail, office: coordOffice },
  }), [departmentCode, semester, examType, session, examCenter, centerCode, reportingTime, gateClose, schedule, coordName, coordPhone, coordEmail, coordOffice]);

  const { isValid, errors } = useMemo(() => {
    const errs = [];
    if (!departmentCode) errs.push("Department is required");
    if (!semester || !Number.isFinite(Number(semester)) || Number(semester) < 1) errs.push("Valid semester is required");
    if (!examType) errs.push("Exam Type is required");
    if (!session) errs.push("Session is required");
    if (!examCenter) errs.push("Exam Center is required");
    if (!centerCode) errs.push("Center Code is required");
    if (!reportingTime) errs.push("Reporting Time is required");
    if (!gateClose) errs.push("Gate Close is required");
    if (!coordName) errs.push("Coordinator Name is required");
    if (!coordPhone) errs.push("Coordinator Phone is required");
    if (!coordEmail) errs.push("Coordinator Email is required");
    if (!coordOffice) errs.push("Coordinator Office is required");
    const validRows = schedule.filter((s) => s.code && s.name && s.date && s.time);
    if (!validRows.length) errs.push("At least one schedule row (course+date+time) is required");
    return { isValid: errs.length === 0, errors: errs };
  }, [departmentCode, semester, examType, session, examCenter, centerCode, reportingTime, gateClose, coordName, coordPhone, coordEmail, coordOffice, schedule]);

  const onPreview = (e) => {
    e.preventDefault();
    openPreviewWindow(payload);
  };

  const onPublish = async (e) => {
    e.preventDefault();
    setTriedSubmit(true);
    if (!isValid) return;
    try {
      setPublishing(true);
      // Build FormData to include optional signature upload
      const fd = new FormData();
      fd.append('filters', JSON.stringify(payload.filters));
      fd.append('sessionDetails', JSON.stringify(payload.sessionDetails));
      fd.append('schedule', JSON.stringify(payload.schedule));
      fd.append('coordinator', JSON.stringify(payload.coordinator));
      if (signatureFile) fd.append('signature', signatureFile);
      const res = await apiService.adminPublishAdmitCard(fd);
      alert(res?.message || "Admit Card published");
    } catch (err) {
      alert(err?.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Publish Admit Card</h1>

      <form className="space-y-4 bg-white p-4 rounded-md">
        {/* Session Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Exam Type <span className="text-red-600">*</span></label>
            <input className="w-full border rounded p-2" placeholder="End Semester Examination" value={examType} onChange={(e) => setExamType(e.target.value)} required />
            {triedSubmit && !examType ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
          </div>
          <div>
            <label className="block text-sm font-medium">Session <span className="text-red-600">*</span></label>
            <input className="w-full border rounded p-2" placeholder="Nov–Dec 2025" value={session} onChange={(e) => setSession(e.target.value)} required />
            {triedSubmit && !session ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
          </div>
          <div>
            <label className="block text-sm font-medium">Exam Center <span className="text-red-600">*</span></label>
            <input className="w-full border rounded p-2" placeholder="NIT Patna Main Campus" value={examCenter} onChange={(e) => setExamCenter(e.target.value)} required />
            {triedSubmit && !examCenter ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
          </div>
          <div>
            <label className="block text-sm font-medium">Center Code <span className="text-red-600">*</span></label>
            <input className="w-full border rounded p-2" placeholder="NITP-01" value={centerCode} onChange={(e) => setCenterCode(e.target.value)} required />
            {triedSubmit && !centerCode ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
          </div>
          <div>
            <label className="block text-sm font-medium">Reporting Time <span className="text-red-600">*</span></label>
            <input className="w-full border rounded p-2" placeholder="9:00 AM" value={reportingTime} onChange={(e) => setReportingTime(e.target.value)} required />
            {triedSubmit && !reportingTime ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
          </div>
          <div>
            <label className="block text-sm font-medium">Gate Close <span className="text-red-600">*</span></label>
            <input className="w-full border rounded p-2" placeholder="9:30 AM" value={gateClose} onChange={(e) => setGateClose(e.target.value)} required />
            {triedSubmit && !gateClose ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
          </div>
        </div>

        {/* Filters to fetch courses */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Department <span className="text-red-600">*</span></label>
            <select
              className="w-full border rounded p-2"
              value={departmentCode}
              onChange={(e) => setDepartmentCode(e.target.value)}
              required
            >
              <option value="">Select department… (e.g., CSE)</option>
              {departmentOptions.map((d) => (
                <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
              ))}
            </select>
            {triedSubmit && !departmentCode ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
          </div>
          <div>
            <label className="block text-sm font-medium">Semester <span className="text-red-600">*</span></label>
            <input
              type="number"
              min={1}
              className="w-full border rounded p-2"
              placeholder="e.g., 5"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
            />
            {triedSubmit && (!semester || Number(semester) < 1) ? <div className="text-xs text-red-600 mt-1">Enter a valid semester</div> : null}
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {loadingCourses ? "Loading courses…" : `Courses loaded: ${courses.length}`}
            </div>
          </div>
        </div>

        {/* Schedule builder */}
        <div className="border rounded p-3 bg-gray-50">
          <div className="font-medium mb-2">Exam Schedule</div>
          <div className="space-y-3">
            {schedule.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-end">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium">Course <span className="text-red-600">*</span></label>
                  <select
                    className="w-full border rounded p-2"
                    value={row.courseId}
                    onChange={(e) => handleCourseSelect(idx, e.target.value)}
                  >
                    <option value="">Select course…</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Code <span className="text-red-600">*</span></label>
                  <input className="w-full border rounded p-2" value={row.code} onChange={(e) => handleRowChange(idx, "code", e.target.value)} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium">Subject <span className="text-red-600">*</span></label>
                  <input className="w-full border rounded p-2" value={row.name} onChange={(e) => handleRowChange(idx, "name", e.target.value)} readOnly />
                </div>
                <div className="grid grid-cols-2 gap-2 lg:col-span-2">
                  <div>
                    <label className="block text-sm font-medium">Date <span className="text-red-600">*</span></label>
                    <input type="date" className="w-full border rounded p-2" value={row.date} onChange={(e) => handleRowChange(idx, "date", e.target.value)} />
                    {triedSubmit && (!row.date) ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Time <span className="text-red-600">*</span></label>
                    <input placeholder="10:00 AM – 1:00 PM" className="w-full border rounded p-2" value={row.time} onChange={(e) => handleRowChange(idx, "time", e.target.value)} />
                    {triedSubmit && (!row.time) ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
                  </div>
                </div>
                <div className="flex lg:justify-end">
                  <button type="button" className="px-3 py-2 bg-red-200 text-red-700 rounded hover:bg-red-300" onClick={() => removeRow(idx)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button type="button" className="px-4 py-2 bg-[#C3EBFA] text-gray-600 rounded hover:bg-[#A8DBF2]" onClick={addRow}>
              + Add Row
            </button>
          </div>
        </div>

        {/* Coordinator */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Coordinator Name <span className="text-red-600">*</span></label>
            <input className="w-full border rounded p-2" placeholder="Dr. Sunil Kumar" value={coordName} onChange={(e) => setCoordName(e.target.value)} required />
            {triedSubmit && !coordName ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
          </div>
          <div>
            <label className="block text-sm font-medium">Phone <span className="text-red-600">*</span></label>
            <input className="w-full border rounded p-2" placeholder="9876543210" value={coordPhone} onChange={(e) => setCoordPhone(e.target.value)} required />
            {triedSubmit && !coordPhone ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
          </div>
          <div>
            <label className="block text-sm font-medium">Email <span className="text-red-600">*</span></label>
            <input className="w-full border rounded p-2" placeholder="exam.coordinator@college.com" value={coordEmail} onChange={(e) => setCoordEmail(e.target.value)} required />
            {triedSubmit && !coordEmail ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
          </div>
          <div>
            <label className="block text-sm font-medium">Office <span className="text-red-600">*</span></label>
            <input className="w-full border rounded p-2" placeholder="Academic Block 2, Room 108" value={coordOffice} onChange={(e) => setCoordOffice(e.target.value)} required />
            {triedSubmit && !coordOffice ? <div className="text-xs text-red-600 mt-1">Required</div> : null}
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium">Exam Coordinator Signature (Image)</label>
            <input type="file" accept="image/*" className="w-full border rounded p-2" onChange={(e) => setSignatureFile(e.target.files?.[0] || null)} />
            <div className="text-xs text-gray-500 mt-1">PNG/JPG preferred. This will appear on the admit card.</div>
          </div>
        </div>

        {triedSubmit && !isValid ? (
          <div className="text-sm text-red-600">Please complete all required fields before publishing.</div>
        ) : null}

        <div className="flex gap-3">
          <button onClick={onPreview} className="px-4 py-2 bg-blue-600 text-white rounded">Preview</button>
          <button onClick={onPublish} disabled={!isValid || publishing} className={`px-4 py-2 rounded ${(!isValid || publishing) ? 'bg-green-200 text-green-600 cursor-not-allowed' : 'bg-green-200 text-green-700 hover:bg-green-300'}`}>
            {publishing ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </form>

      
    </div>
  );
}
