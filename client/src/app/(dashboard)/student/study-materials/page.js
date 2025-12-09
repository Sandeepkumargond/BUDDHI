"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaFile } from 'react-icons/fa';
import { apiService } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function StudentStudyMaterialsPage() {
  const { user } = useAuth();
  const [semester, setSemester] = useState("");
  const [course, setCourse] = useState("");
  const [courseOptions, setCourseOptions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState("");
  const [typeOptions, setTypeOptions] = useState([]);

  const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];

  useEffect(() => {
    // Fetch available course/class options for the logged-in student and selected semester
    (async () => {
      try {
        setError("");
        const qs = semester ? `?semester=${encodeURIComponent(semester)}` : "";
        const res = await apiService.request(`/study-materials/student/options${qs}`);
        const courses = Array.isArray(res?.courses) ? res.courses : [];
        const types = Array.isArray(res?.types) ? res.types : [];
        setCourseOptions(courses);
        setTypeOptions(types);
        // Reset selections if no longer valid
        if (course && !courses.includes(course)) setCourse("");
        if (type && !types.includes(type)) setType("");
      } catch (err) {
        // Non-blocking: keep previous options if call fails
        console.warn('Failed to load study material options', err?.message || err);
      }
    })();
  }, [semester]);

  // Auto-fetch on mount (initial load)
  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fetch whenever filters change (like notices)
  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semester, course, type]);

  const fetchMaterials = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (semester) params.semester = semester;
      if (course) params.course = course;
      if (type) params.materialType = type;
      // Example endpoint; adjust to server routes if different
      const query = new URLSearchParams(params).toString();
      const res = await apiService.request(`/study-materials/student${query ? `?${query}` : ""}`);
      const list = res?.data?.materials || res?.materials || [];
      // Annotate with submitted state based on server-side submissions for current user
      const uid = user?._id || user?.id;
      const annotated = Array.isArray(list) ? list.map((m) => {
        const subs = Array.isArray(m.submissions) ? m.submissions : [];
        const hasMine = uid ? subs.some((s) => String(s.studentId) === String(uid)) : false;
        return { ...m, _submitted: hasMine };
      }) : [];
      setMaterials(annotated);
    } catch (err) {
      setError(err?.message || "Failed to fetch materials");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      const id = material.id || material._id;
      if (!id) return;
      const res = await apiService.request(`/study-materials/student/${id}/download`, { method: 'POST' });
      const fileUrl = res?.data?.fileUrl || material.fileUrl;
      if (!fileUrl) return;
      const a = document.createElement('a');
      a.href = fileUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.warn('Download failed', e?.message || e);
    }
  };

  const handleSubmit = async (item, files) => {
    if (!files || files.length === 0) return alert("Please choose file(s)");
    try {
      const fd = new FormData();
      const id = item.id || item._id;
      fd.append("materialId", id);
      // Only assignments/homework are submittable; infer from materialType
      const submitType = (item.materialType === 'assignment') ? 'assignment' : (item.materialType === 'homework' ? 'homework' : 'assignment');
      fd.append("type", submitType);
      (Array.isArray(files) ? files : [files]).forEach((f) => fd.append("files", f));
      // You can attach optional text answers, links, etc.
      const res = await apiService.request("/study-materials/student/submit", { method: "POST", body: fd });
      alert(res?.message || "Submitted successfully");
      // Mark locally as submitted in state; disable the button and clear selected file
      setMaterials((prev) => prev.map((m) => ((m.id || m._id) === id) ? { ...m, _submitted: true, _selectedFiles: undefined } : m));
    } catch (err) {
      alert(err?.message || "Submission failed");
    }
  };

  const MaterialRow = ({ item }) => {
    const isInteractive = item.materialType === "assignment" || item.materialType === "homework";
    const submitted = item._submitted === true;
    const [selectedFiles, setSelectedFiles] = useState([]);
    const id = item.id || item._id;
    const inputId = `submit-files-${id}`;
    return (
      <div className="rounded-xl p-4 bg-white" style={{ border: "1px solid #e5e7eb", boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold" style={{ color: "#0f172a" }}>{item.title}</div>
            <div className="text-sm" style={{ color: "#64748b" }}>{item.courseCode} • Sem {item.semester} • Branch {item.branch}</div>
            <div className="mt-1 text-xs px-2 py-1 inline-block rounded-md"
                 style={{ background: "#eef2ff", border: "1px solid #e5e7eb", color: "#3730a3" }}>
              {String(item.materialType || '').replace(/_/g,' ').replace(/^./, c=>c.toUpperCase())}
            </div>
          </div>
          <div className="flex gap-2">
            {item.fileUrl && (
                  <a href={(String(item.fileUrl).startsWith('/public') || String(item.fileUrl).startsWith('public')) ? `${apiService.baseURL.replace(/\/api\/v1$/, '')}${String(item.fileUrl).startsWith('public') ? `/${item.fileUrl}` : item.fileUrl}` : item.fileUrl} target="_blank" rel="noopener noreferrer"
                 className="px-3 py-1 rounded-md text-white" style={{ background: "#6366f1" }}>
                View
              </a>
            )}
            {(item._id || item.id) && (
              <button onClick={() => handleDownload(item)}
                      className="px-3 py-1 rounded-md text-white" style={{ background: "#10b981" }}>
                Download
              </button>
            )}
          </div>
        </div>

        {Array.isArray(item.attachments) && item.attachments.length > 1 && (
          <div className="mt-3">
            <div className="text-sm font-medium" style={{ color: "#0f172a" }}>Additional files</div>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              {item.attachments.slice(1).map((att, i) => (
                <li key={i} className="text-sm" style={{ color: "#334155" }}>
                  <a
                    href={(String(att.fileUrl).startsWith('/public') || String(att.fileUrl).startsWith('public')) ? `${apiService.baseURL.replace(/\/api\/v1$/, '')}${String(att.fileUrl).startsWith('public') ? `/${att.fileUrl}` : att.fileUrl}` : att.fileUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {att.fileName || `Attachment ${i+1}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isInteractive && (
          <div className="mt-4">
            <label className="block text-sm mb-2">{submitted ? 'Submission status: Submitted' : `Submit your ${item.materialType}`}</label>
            {!submitted && (
              <div className="flex items-center gap-3">
                <input
                  id={inputId}
                  type="file"
                  accept="*/*"
                  multiple
                  className="border rounded p-2 w-full"
                  onChange={(e) => {
                    const list = Array.from(e.target.files || []);
                    if (!list.length) return;
                    setSelectedFiles((prev) => {
                      const merged = [...prev, ...list];
                      const seen = new Set();
                      const unique = [];
                      for (const f of merged) {
                        const key = `${f.name}::${f.size}`;
                        if (!seen.has(key)) {
                          seen.add(key);
                          unique.push(f);
                        }
                      }
                      return unique;
                    });
                  }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById(inputId)?.click()}
                  className="ml-3 inline-flex items-center gap-2 px-3 py-2 rounded-md text-white"
                  style={{ background: "#2563eb" }}
                >
                  <FaPlus /> Add more files
                </button>
                {Array.isArray(selectedFiles) && selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-2 w-full">
                    {selectedFiles.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-xs text-gray-700 flex items-center gap-2"><FaFile style={{ color: '#C9CCFF' }} /> {f.name}</span>
                        <button
                          type="button"
                          className="text-red-600 text-xs"
                          onClick={() => setSelectedFiles((prev)=> prev.filter((_, i) => i !== idx))}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end mt-2">
              <button
                onClick={() => !submitted && selectedFiles.length > 0 && handleSubmit(item, selectedFiles)}
                disabled={submitted}
                className={`px-4 py-2 rounded-md text-white ${submitted ? 'bg-green-600/70 cursor-default' : (selectedFiles.length > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-400 cursor-not-allowed')}`}
              >
                {submitted ? 'Submitted' : (selectedFiles.length > 0 ? 'Submit' : 'Choose files')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-xl bg-white" style={{ border: "1px solid #e5e7eb", boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>
        <div className="p-5" style={{ color: "#0f172a" }}>
          <h2 className="text-lg font-semibold mb-4">Study Materials</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Semester</label>
              <select className="border w-full p-2 rounded" value={semester} onChange={(e)=>setSemester(e.target.value)}>
                <option value="">All</option>
                {semesterOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Course</label>
              <select className="border w-full p-2 rounded" value={course} onChange={(e)=>setCourse(e.target.value)}>
                <option value="">All</option>
                {courseOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            
            <div>
              <label className="block text-sm mb-1">Type</label>
              <select className="border w-full p-2 rounded" value={type} onChange={(e)=>setType(e.target.value)}>
                <option value="">All Types</option>
                <option value="lecture_notes">Lecture Notes</option>
                <option value="assignment">Assignment</option>
                <option value="reference_book">Reference Book</option>
                <option value="question_paper">Question Paper</option>
                <option value="lab_manual">Lab Manual</option>
                <option value="presentation">Presentation</option>
                <option value="other">Other</option>
                {typeOptions && typeOptions.filter(t => !['lecture_notes','assignment','reference_book','question_paper','lab_manual','presentation','other'].includes(t)).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

          <div className="mt-6 space-y-3">
            {loading && (
              <div className="text-sm" style={{ color: "#64748b" }}>Loading materials...</div>
            )}
            {materials.length === 0 && !loading && (
              <div className="text-sm" style={{ color: "#64748b" }}>No materials found. Adjust filters and fetch again.</div>
            )}
            {materials.map((m) => (
              <MaterialRow key={m.id || m._id} item={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
