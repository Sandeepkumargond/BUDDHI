"use client";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

export default function FacultyMaterialSubmissions({ materialId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!materialId) return;
    const fetchSubs = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiService.request(`/study-materials/faculty/${materialId}/submissions`);
        const list = res?.data?.submissions || res?.submissions || [];
        setSubmissions(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(e?.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, [materialId]);

  return (
    <div className="p-4 rounded-xl bg-white" style={{ border: "1px solid #e5e7eb", boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold" style={{ color: "#0f172a" }}>Submissions</h3>
        {loading && <span className="text-sm" style={{ color: "#64748b" }}>Loading…</span>}
      </div>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      {submissions.length === 0 && !loading ? (
        <div className="text-sm" style={{ color: "#64748b" }}>No submissions yet.</div>
      ) : (
        <div className="space-y-2">
          {submissions.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <div className="text-sm" style={{ color: "#0f172a" }}>
                  {(s.studentId?.firstName || "")+" "+(s.studentId?.lastName || "")} {s.studentId?.rollNumber ? `• ${s.studentId.rollNumber}` : ""}
                </div>
                <div className="text-xs" style={{ color: "#64748b" }}>
                  {s.type} • {s.fileName || "file"} {s.fileSize ? `• ${(s.fileSize/1024).toFixed(1)} KB` : ""}
                </div>
                <div className="text-xs" style={{ color: "#94a3b8" }}>
                  {s.at ? new Date(s.at).toLocaleString() : ""}
                </div>
              </div>
                      {s.fileUrl && (
                        <a href={(s.fileUrl.startsWith('/public') || s.fileUrl.startsWith('public')) ? `${apiService.baseURL.replace(/\/api\/v1$/, '')}${s.fileUrl.startsWith('public') ? `/${s.fileUrl}` : s.fileUrl}` : s.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-md text-white" style={{ background: "#0ea5e9" }}>
                  View
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
