"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

export default function StudentStudyMaterialsPage() {
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
      // Server already applies filters and audience targeting; just set safely
      setMaterials(Array.isArray(list) ? list : []);
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

  const handleSubmit = async (item, file) => {
    if (!file) return alert("Please choose a file");
    try {
      const fd = new FormData();
      fd.append("materialId", item.id || item._id);
      // Only assignments/homework are submittable; infer from materialType
      const submitType = (item.materialType === 'assignment') ? 'assignment' : (item.materialType === 'homework' ? 'homework' : 'assignment');
      fd.append("type", submitType);
      fd.append("file", file);
      // You can attach optional text answers, links, etc.
      const res = await apiService.request("/study-materials/student/submit", { method: "POST", body: fd });
      alert(res?.message || "Submitted successfully");
    } catch (err) {
      alert(err?.message || "Submission failed");
    }
  };

  const MaterialRow = ({ item }) => {
    const isInteractive = item.materialType === "assignment" || item.materialType === "homework";
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
              <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
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

        {isInteractive && (
          <div className="mt-4">
            <label className="block text-sm mb-2">Submit your {item.type}</label>
            <input type="file" className="border rounded p-2 w-full" onChange={(e) => item._selectedFile = e.target.files?.[0]} />
            <div className="flex justify-end mt-2">
              <button onClick={() => handleSubmit(item, item._selectedFile)}
                      className="px-4 py-2 rounded-md text-white"
                      style={{ background: "#22c55e" }}>
                Submit
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
