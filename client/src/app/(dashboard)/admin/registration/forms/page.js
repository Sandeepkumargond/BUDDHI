"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiService } from "@/lib/api";

export default function AdminRegistrationFormsListPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await apiService.adminListRegistrationForms();
      setForms(res?.data?.forms || []);
      if (!(res?.data?.forms || []).length) setMessage("No forms created yet.");
    } catch (e) {
      setMessage(e?.message || "Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;
    if (!confirm("Delete this registration form? Submissions remain but form will disappear for students.")) return;
    setDeletingId(id);
    setMessage("");
    try {
      await apiService.adminDeleteRegistrationForm(id);
      setForms(prev => prev.filter(f => f._id !== id));
    } catch (e) {
      setMessage(e?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Registration Forms</h1>
        <Link href="/admin/registration" className="px-3 py-2 rounded bg-blue-600 text-white">Create New</Link>
      </div>
      {message ? <div className="text-sm text-blue-600">{message}</div> : null}

      <div className="space-y-3">
        {forms.map((f) => (
          <div key={f._id} className="bg-white p-4 rounded-md border flex items-center justify-between">
            <div>
              <div className="font-semibold">{f.title || `Semester ${f.semester} Registration (${f.session})`}</div>
              <div className="text-sm text-gray-700">Dept: {f.departmentId} | Semester: {f.semester} | Session: {f.session} | Published: {f.published ? 'Yes' : 'No'}</div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/registration/forms/${f._id}/submissions`} className="px-3 py-2 rounded bg-green-600 text-white">View Submissions</Link>
              <button
                onClick={() => handleDelete(f._id)}
                disabled={deletingId === f._id}
                className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-60"
              >
                {deletingId === f._id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
