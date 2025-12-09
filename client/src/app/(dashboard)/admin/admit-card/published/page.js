"use client";

import { useEffect, useState, useCallback } from "react";
import { apiService } from "@/lib/api";

export default function AdminPublishedAdmitCardsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({ departmentCode: "", semester: "" });
  const [departments, setDepartments] = useState([]);

  // Load department options once
  useEffect(() => {
    let active = true;
    const loadDepartments = async () => {
      try {
        const res = await apiService.adminListDepartments();
        const list = res?.data?.departments || [];
        if (active) setDepartments(list);
      } catch (e) {
        if (active) setDepartments([]);
      }
    };
    loadDepartments();
    return () => { active = false; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const params = { published: true };
      if (filters.departmentCode) params.departmentCode = filters.departmentCode;
      if (filters.semester) params.semester = filters.semester;
      const res = await apiService.adminListAdmitCards(params);
      setItems(res?.data?.admitCards || []);
    } catch (err) {
      setMessage(err?.message || "Failed to load admit cards");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const onDelete = async (id) => {
    if (!confirm("Delete this admit card? This will remove it from students immediately.")) return;
    try {
      await apiService.adminDeleteAdmitCard(id);
      await load();
    } catch (err) {
      alert(err?.message || "Failed to delete");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Published Admit Cards</h1>
      {message ? <div className="text-sm text-red-600">{message}</div> : null}

      <div className="bg-white p-4 rounded-md space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Department</label>
            <select
              className="w-full border rounded p-2"
              value={filters.departmentCode}
              onChange={(e) => setFilters({ ...filters, departmentCode: e.target.value })}
            >
              <option value="">Select department…</option>
              {departments.map((d) => (
                <option key={d._id || d.code} value={d.code}>{d.code} - {d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Semester</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded p-2"
              value={filters.semester}
              onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">{loading ? "Loading…" : `Total: ${items.length}`}</div>
          </div>
        </div>

        <div className="text-sm text-gray-600">Total: {items.length}</div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-2">Department</th>
                <th className="border p-2">Semester</th>
                <th className="border p-2">Session</th>
                <th className="border p-2">Exam Type</th>
                <th className="border p-2">Schedule Rows</th>
                <th className="border p-2">Published</th>
                <th className="border p-2">Published At</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id}>
                  <td className="border p-2">{it.departmentCode}</td>
                  <td className="border p-2">{it.semester}</td>
                  <td className="border p-2">{it.sessionDetails?.session || ""}</td>
                  <td className="border p-2">{it.sessionDetails?.examType || it.sessionDetails?.type || ""}</td>
                  <td className="border p-2">{it.schedule?.length || 0}</td>
                  <td className="border p-2">{it.published ? "Yes" : "No"}</td>
                  <td className="border p-2">{it.publishedAt ? new Date(it.publishedAt).toLocaleString() : ""}</td>
                  <td className="border p-2">
                    <button className="px-3 py-1 bg-red-200 text-red-700 rounded hover:bg-red-300" onClick={() => onDelete(it._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td className="border p-2 text-center text-gray-500" colSpan={8}>No admit cards found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
