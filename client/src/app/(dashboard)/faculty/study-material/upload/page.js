// src/app/(dashboard)/faculty/study-material/upload/page.js
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import FileUploader from "../_components/FileUploader";
import ScheduleModal from "../_components/ScheduleModal";
import VersionHistoryModal from "../_components/VersionHistoryModal";
import { loadMaterials, saveMaterials } from "@/lib/studyMaterialData";

export default function UploadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    type: "Lecture Notes",
    subject: "",
    semester: "",
    section: "",
    description: "",
    externalLinks: "",
    visibilityTo: "All",
    visibilitySections: "",
    releaseOn: "",
    expireOn: "",
    downloadAllowed: true,
    status: "draft", // draft | published
  });

  const [files, setFiles] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    document.title = "Upload Study Material";
  }, []);

  function handleChange(e) {
    const { name, value, type: t, checked } = e.target;
    if (t === "checkbox") setForm((p) => ({ ...p, [name]: checked }));
    else setForm((p) => ({ ...p, [name]: value }));
  }

  function onFilesAdded(list) {
    setFiles((prev) => [...prev, ...list]);
  }

  function generateId() {
    const now = Date.now();
    return "MAT" + String(now).slice(-6);
  }

  function buildMaterialObj(publishNow = false) {
    const id = generateId();
    return {
      id,
      title: form.title,
      type: form.type,
      subject: form.subject,
      semester: form.semester,
      section: form.section,
      description: form.description,
      files: files.map((f) => ({
        name: f.name,
        url: f.preview || URL.createObjectURL(f),
        size: f.size,
      })),
      externalLinks: form.externalLinks ? form.externalLinks.split(",").map(s => s.trim()).filter(Boolean) : [],
      visibility: {
        to: form.visibilityTo,
        sections: form.visibilitySections ? form.visibilitySections.split(",").map(s=>s.trim()) : [],
      },
      releaseOn: form.releaseOn || null,
      expireOn: form.expireOn || null,
      downloadAllowed: !!form.downloadAllowed,
      uploadedAt: new Date().toISOString(),
      uploadedBy: { name: "You (Faculty)", photo: "/teacher.png" },
      stats: { views: 0, downloads: 0 },
      status: publishNow ? "published" : "draft",
      versions: [],
    };
  }

  function save(publishNow = false) {
    if (!form.title || !form.subject) {
      showToast.error("Please provide title and subject");
      return;
    }

    const materials = loadMaterials();
    // versioning: if same title+subject exists then push version
    const dup = materials.find(m => m.title === form.title && m.subject === form.subject);
    if (dup) {
      const version = {
        versionAt: new Date().toISOString(),
        data: { ...dup },
      };
      dup.versions = dup.versions || [];
      dup.versions.push(version);
      // update dup with new files & details
      dup.files = [...dup.files, ...files.map(f=>({ name: f.name, url: f.preview || URL.createObjectURL(f), size: f.size }))];
      dup.description = form.description || dup.description;
      dup.status = publishNow ? "published" : dup.status;
      dup.releaseOn = form.releaseOn || dup.releaseOn;
      dup.expireOn = form.expireOn || dup.expireOn;
      saveMaterials(materials);
      showToast.success("Existing material updated (version saved).");
      router.push("/faculty/study-material");
      return;
    }

    const newMat = buildMaterialObj(publishNow);
    materials.unshift(newMat);
    saveMaterials(materials);
    showToast.success(publishNow ? "Material published" : "Saved as draft");
    router.push("/faculty/study-material");
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b" style={{ background: "#C3EBFA" }}>
            <h2 className="text-lg font-semibold">Upload Study Material</h2>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="title" value={form.title} onChange={handleChange} placeholder="Material Title" className="border p-2 rounded" />
            <select name="type" value={form.type} onChange={handleChange} className="border p-2 rounded">
              <option>Lecture Notes</option>
              <option>PPT</option>
              <option>Reference Book</option>
              <option>Question Bank</option>
              <option>Assignment</option>
              <option>Lab Manual</option>
              <option>Video Lecture</option>
              <option>External Link</option>
            </select>

            <input name="subject" value={form.subject} onChange={handleChange} placeholder="Subject Code (e.g. CS201)" className="border p-2 rounded" />
            <input name="semester" value={form.semester} onChange={handleChange} placeholder="Semester (e.g. 3)" className="border p-2 rounded" />
            <input name="section" value={form.section} onChange={handleChange} placeholder="Section (A/B/C)" className="border p-2 rounded" />
            <input name="externalLinks" value={form.externalLinks} onChange={handleChange} placeholder="External links (comma separated)" className="border p-2 rounded" />

            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" className="col-span-1 md:col-span-2 border p-2 rounded" rows={4} />

            <div className="col-span-1 md:col-span-2">
              <div className="mb-2 text-sm text-gray-600">Files (drag & drop or browse)</div>
              <FileUploader onFilesAdded={onFilesAdded} />
              {files.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div>{f.name} • {(f.size/1000).toFixed(0)} KB</div>
                      <div className="text-xs text-gray-500">{f.type || "file"}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="downloadAllowed" checked={!!form.downloadAllowed} onChange={(e) => setForm(p=>({...p, downloadAllowed: e.target.checked}))} />
                <span className="text-sm">Download allowed</span>
              </label>

              <label className="flex items-center gap-2">
                <select name="visibilityTo" value={form.visibilityTo} onChange={(e)=>setForm(p=>({...p, visibilityTo: e.target.value}))} className="border p-2 rounded">
                  <option value="All">Visible to All</option>
                  <option value="Selected">Selected Sections</option>
                </select>
              </label>

              <input name="visibilitySections" value={form.visibilitySections} onChange={handleChange} placeholder="Sections (comma separated)" className="border p-2 rounded" />
            </div>

            <div className="col-span-1 md:col-span-2 flex items-center gap-3">
              <button type="button" onClick={() => setShowSchedule(true)} className="px-4 py-2 rounded bg-[#FAE27C]">Set Schedule</button>
              <button type="button" onClick={() => setShowVersions(true)} className="px-4 py-2 rounded bg-gray-100">Version History</button>
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={() => save(false)} className="px-4 py-2 rounded bg-gray-200">Save Draft</button>
                <button type="button" onClick={() => save(true)} className="px-4 py-2 rounded bg-[#C3EBFA]">Publish Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} onApply={(r,e)=>{ setForm(p=>({ ...p, releaseOn: r, expireOn: e })); setShowSchedule(false); }} />}
      {showVersions && <VersionHistoryModal onClose={() => setShowVersions(false)} />}
    </div>
  );
}
