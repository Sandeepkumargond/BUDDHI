"use client";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

export default function AdminAllRegistrationsPage() {
  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState("");
  const [session, setSession] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setMessage("");
    try {
      const params = {};
      if (departmentId) params.departmentId = Number(departmentId);
      if (semester) params.semester = Number(semester);
      if (session) params.session = session;
      const res = await apiService.adminListAllRegistrations(params);
      setData(res?.data?.registrations || []);
      if (!(res?.data?.registrations || []).length) setMessage("No registrations found.");
    } catch (e) {
      setMessage(e?.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">All Registrations</h1>

      <div className="bg-white p-4 rounded-md grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-sm font-medium">Department ID</label>
          <input className="w-full border rounded p-2" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} placeholder="1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Semester</label>
          <input type="number" min={1} className="w-full border rounded p-2" value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Session</label>
          <input className="w-full border rounded p-2" value={session} onChange={(e) => setSession(e.target.value)} placeholder="2025-26" />
        </div>
        <div className="flex items-end">
          <button onClick={fetchData} className="px-4 py-2 bg-[#C3EBFA] text-gray-600 rounded hover:bg-[#A8DBF2]" disabled={loading}>
            {loading ? 'Loading…' : 'Apply Filters'}
          </button>
        </div>
      </div>

      {message ? <div className="text-sm text-blue-600">{message}</div> : null}

      <div className="bg-white rounded-md overflow-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-sm text-gray-600">
              <th className="p-2">Student</th>
              <th className="p-2">Roll No</th>
              <th className="p-2">Email</th>
              <th className="p-2">Semester</th>
              <th className="p-2">Dept</th>
              <th className="p-2">Session</th>
              <th className="p-2">Submitted</th>
              <th className="p-2">Courses</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-2">{r.student?.firstName} {r.student?.lastName}</td>
                <td className="p-2">{r.student?.rollNo}</td>
                <td className="p-2">{r.student?.email}</td>
                <td className="p-2">{r.semester}</td>
                <td className="p-2">{r.departmentId}</td>
                <td className="p-2">{r.session}</td>
                <td className="p-2">{new Date(r.submittedAt).toLocaleString()}</td>
                <td className="p-2">{r.courses?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
