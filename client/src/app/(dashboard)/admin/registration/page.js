"use client";
import { useEffect, useMemo, useState } from "react";
import { apiService } from "@/lib/api";

export default function AdminRegistrationFormPage() {
  const [departmentCode, setDepartmentCode] = useState("CSE");
  const [semester, setSemester] = useState(1);
  const [session, setSession] = useState("");
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [createdForm, setCreatedForm] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewCourses, setPreviewCourses] = useState([]);
  const [serverStatus, setServerStatus] = useState(null); // null | 'ok' | 'down'

  // Always fetch real courses from server by selected department code and semester
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await apiService.adminListCoursesByDepartmentCode(departmentCode, { semester });
        const filtered = res?.data?.courses || [];
        if (active) setPreviewCourses(filtered);
      } catch (e) {
        if (active) setPreviewCourses([]);
      }
    };
    if (departmentCode && semester) load();
    return () => { active = false };
  }, [departmentCode, semester]);

  const onCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setCreatedForm(null);
    try {
      // Quick health check to surface server down errors clearly
      try {
        await apiService.health();
        setServerStatus('ok');
      } catch (err) {
        setServerStatus('down');
        throw new Error('Backend server is not reachable. Please start the server on http://localhost:5000');
      }

      const payload = {
        departmentCode: departmentCode || undefined,
        semester: Number(semester),
        session,
        opensAt: opensAt || undefined,
        closesAt: closesAt || undefined,
        attachedCourses: (previewCourses || []).map((c) => ({
          code: c.code,
          name: c.name,
          credits: Number.isFinite(Number(c.credits)) ? Number(c.credits) : 0,
        })),
      };
      const res = await apiService.adminCreateRegistrationForm(payload);
      const form = res?.data?.form;
      setCreatedForm(form || null);
      setMessage(res?.message || "Form created");
    } catch (err) {
      setMessage(err?.message || "Failed to create form");
    } finally {
      setLoading(false);
    }
  };

  const onPublish = async () => {
    if (!createdForm?._id) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await apiService.adminPublishRegistrationForm(createdForm._id);
      setCreatedForm(res?.data?.form || createdForm);
      setMessage(res?.message || "Form published");
    } catch (err) {
      setMessage(err?.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Create Semester Registration Form</h1>
      {message ? <div className="text-sm text-blue-600">{message}</div> : null}

      <form onSubmit={onCreate} className="space-y-4 bg-white p-4 rounded-md">
        {serverStatus === 'down' ? (
          <div className="text-sm text-red-600">Backend server not reachable. Start it at http://localhost:5000 and retry.</div>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Department</label>
            <select className="w-full border rounded p-2" value={departmentCode} onChange={(e) => setDepartmentCode(e.target.value)}>
              <option value="CSE">CSE</option>
              <option value="EE">EE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
              <option value="ECE">ECE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Semester</label>
            <input type="number" min={1} className="w-full border rounded p-2" value={semester} onChange={(e) => setSemester(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Session</label>
            <input className="w-full border rounded p-2" placeholder="2025-26" value={session} onChange={(e) => setSession(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Opens At (optional)</label>
            <input type="datetime-local" className="w-full border rounded p-2" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Closes At (optional)</label>
            <input type="datetime-local" className="w-full border rounded p-2" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} />
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded border">
          <div className="font-medium mb-2">Courses Preview ({departmentCode}, Semester {semester})</div>
          {previewCourses?.length ? (
            <ul className="list-disc pl-5 text-sm">
              {previewCourses.map((c) => (
                <li key={c._id}>{c.code} - {c.name} ({c.credits} cr)</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-600">No courses found for this selection.</div>
          )}
        </div>

        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
          {loading ? 'Creating…' : 'Create Draft Form'}
        </button>
      </form>

      {createdForm ? (
        <div className="bg-white p-4 rounded-md space-y-2">
          <div className="font-semibold">Draft Created</div>
          <div className="text-sm">Form ID: {createdForm._id}</div>
          <div className="text-sm">Attached Courses: {createdForm.courses?.length || 0}</div>
          <div className="text-sm">Published: {createdForm.published ? 'Yes' : 'No'}</div>
          {!createdForm.published ? (
            <button onClick={onPublish} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? 'Publishing…' : 'Publish Form'}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
