"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";

export default function StudentRegistrationPage() {
  const { user, loading: authLoading, isAuthenticated, role } = useAuth();
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const mySemester = user?.semester ? Number(user.semester) : null;

  const loadForms = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await apiService.studentListRegistrationForms();
      const list = res?.data?.forms || [];
      setForms(list);
      if (!list.length) setMessage("No registration form currently available.");
    } catch (err) {
      setMessage(err?.message || "Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && (role?.toLowerCase?.() === 'student')) {
      loadForms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, role]);

  const submit = async (formId) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await apiService.studentSubmitRegistration(formId);
      setMessage(res?.message || "Submitted");
      // Redirect to fee payment after successful submission
      router.push("/list/fee/payment");
    } catch (err) {
      setMessage(err?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Semester Registration</h1>
      {user ? (
        <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-md border">
          <div className="flex items-center gap-3">
            <img
              src={user.imageUrl || "/avatar.png"}
              alt={(user.firstName || "") + " " + (user.lastName || "")}
              className="w-12 h-12 rounded-full object-cover bg-gray-100"
            />
            <div>
              <div className="font-medium text-gray-800">
                {(user.firstName || '') + ' ' + (user.lastName || '')}
              </div>
              <div className="text-xs text-gray-500">Enrollment No: {user.enrollmentNo ?? '-'}</div>
            </div>
          </div>
          <div className="text-sm text-gray-700">Semester: {mySemester ?? '-'} • Branch: {user.branch || '-'}</div>
        </div>
      ) : null}

      <div className="flex items-end">
        <button onClick={loadForms} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? 'Loading…' : 'Refresh Forms'}
        </button>
      </div>

      {message ? <div className="text-sm text-blue-600">{message}</div> : null}

      <div className="space-y-3">
        {forms.map((f) => (
          <div key={f._id} className="bg-white p-4 rounded-md border">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold mb-1">{f.title || `Semester ${f.semester} Registration (${f.session})`}</div>
                <div className="text-xs text-gray-500">Session: {f.session} • Semester: {f.semester}</div>
              </div>
              {user ? (
                <div className="flex items-center gap-2 bg-gray-50 border rounded-md p-2">
                  <img
                    src={user.imageUrl || "/avatar.png"}
                    alt={(user.firstName || "") + " " + (user.lastName || "")}
                    className="w-10 h-10 rounded-full object-cover bg-gray-100"
                  />
                  <div className="text-xs">
                    <div className="font-medium text-gray-700">
                      {(user.firstName || '') + ' ' + (user.lastName || '')}
                    </div>
                    <div className="text-gray-500">Enrollment No: {user.enrollmentNo ?? '-'}</div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="text-sm text-gray-700 mt-3 mb-2">Courses attached: {(f.attachedCourses?.length || f.courses?.length || 0)}</div>
            {Array.isArray(f.attachedCourses) && f.attachedCourses.length > 0 ? (
              <ul className="list-disc pl-5 text-sm mb-2">
                {f.attachedCourses.map((c, idx) => (
                  <li key={`${c.code}-${idx}`}>{c.code} - {c.name} ({c.credits} cr)</li>
                ))}
              </ul>
            ) : null}
            <button onClick={() => submit(f._id)} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
              {loading ? 'Submitting…' : 'Submit and Pay'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
