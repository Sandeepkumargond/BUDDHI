// src/app/(dashboard)/faculty/study-material/_components/MaterialCard.js
"use client";

import Link from "next/link";
import { saveMaterials, loadMaterials } from "@/lib/studyMaterialData";

export default function MaterialCard({ material, onRefresh }) {
  const handleDelete = () => {
    if (!confirm("Delete this material?")) return;
    const mats = loadMaterials().filter(m => m.id !== material.id);
    saveMaterials(mats);
    onRefresh();
  };

  const togglePublish = () => {
    const mats = loadMaterials();
    const m = mats.find(x => x.id === material.id);
    if (!m) return;
    m.status = m.status === "published" ? "draft" : "published";
    saveMaterials(mats);
    onRefresh();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">{material.type?.[0]}</div>
          <div>
            <h3 className="font-semibold">{material.title}</h3>
            <div className="text-sm text-gray-500">{material.subject} • Sem {material.semester} • Section {material.section}</div>
            <div className="text-xs text-gray-400 mt-1">Uploaded: {new Date(material.uploadedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/faculty/study-material/view/${material.id}`}><a className="px-3 py-1 rounded bg-[#C3EBFA]">View</a></Link>
        <Link href={`/faculty/study-material/edit/${material.id}`}><a className="px-3 py-1 rounded bg-gray-100">Edit</a></Link>
        <button onClick={togglePublish} className="px-3 py-1 rounded bg-[#FAE27C]">{material.status === "published" ? "Unpublish" : "Publish"}</button>
        <button onClick={handleDelete} className="px-3 py-1 rounded bg-gray-200">Delete</button>
      </div>
    </div>
  );
}
