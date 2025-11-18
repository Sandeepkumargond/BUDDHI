// src/app/(dashboard)/faculty/study-material/edit/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FileUploader from "../_components/FileUploader";
import { loadMaterials, saveMaterials } from "@/lib/studyMaterialData";

export default function EditMaterial() {
  const router = useRouter();
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const id = path.split("/").pop();

  const [material, setMaterial] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const mats = loadMaterials();
    const found = mats.find(m => m.id === id);
    if (found) setMaterial(found);
  }, [id]);

  if (!material) return <div className="p-6">Material not found.</div>;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setMaterial(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  function onFilesAdded(list) {
    setFiles(prev => [...prev, ...list]);
  }

  function save() {
    const mats = loadMaterials();
    const idx = mats.findIndex(m => m.id === material.id);
    if (idx === -1) { alert("Not found"); return; }
    mats[idx] = { ...material, files: [...(material.files||[]), ...files.map(f=>({name:f.name, url: f.preview || URL.createObjectURL(f), size:f.size}))] };
    saveMaterials(mats);
    alert("Updated");
    router.push("/faculty/study-material");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Edit Material</h1>
      <div className="bg-white rounded shadow p-4">
        <input name="title" value={material.title} onChange={handleChange} className="border p-2 rounded w-full mb-3" />
        <input name="subject" value={material.subject} onChange={handleChange} className="border p-2 rounded w-full mb-3" />
        <textarea name="description" value={material.description} onChange={handleChange} className="border p-2 rounded w-full mb-3" rows={4} />

        <div className="mb-2 text-sm">Add files</div>
        <FileUploader onFilesAdded={onFilesAdded} />
        <div className="flex gap-2 mt-4">
          <button onClick={save} className="px-4 py-2 rounded bg-[#C3EBFA]">Save</button>
          <button onClick={() => router.back()} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
        </div>
      </div>
    </div>
  );
}
