"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiService } from "@/lib/api";

export default function AdminFormSubmissionsPage() {
  const params = useParams();
  const formId = params?.id;

  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!formId) return;
    const load = async () => {
      setLoading(true);
      setMessage("");
      try {
        const res = await apiService.adminListRegistrationFormSubmissions(formId);
        setSubs(res?.data?.submissions || []);
        if (!(res?.data?.submissions || []).length) setMessage("No submissions yet.");
      } catch (e) {
        setMessage(e?.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [formId]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Form Submissions</h1>
      {message ? <div className="text-sm text-blue-600">{message}</div> : null}
      <div className="bg-white rounded-md">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-sm text-gray-600">
              <th className="p-2">Student</th>
              <th className="p-2">Roll No</th>
              <th className="p-2">Email</th>
              <th className="p-2">Semester</th>
              <th className="p-2">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="p-2">{s.student?.firstName} {s.student?.lastName}</td>
                <td className="p-2">{s.student?.rollNo}</td>
                <td className="p-2">{s.student?.email}</td>
                <td className="p-2">{s.student?.semester}</td>
                <td className="p-2">{new Date(s.submittedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
