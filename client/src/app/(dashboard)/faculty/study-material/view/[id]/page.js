// src/app/(dashboard)/faculty/study-material/view/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { loadMaterials, saveMaterials } from "@/lib/studyMaterialData";

export default function ViewMaterialPage() {
  const router = useRouter();
  // get id from pathname
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const id = path.split("/").pop();
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    const mats = loadMaterials();
    const found = mats.find(m => m.id === id);
    setMaterial(found || null);
  }, [id]);

  if (!material) return <div className="p-6">Material not found.</div>;

  const handleDownload = (file) => {
    // increment stat
    const mats = loadMaterials();
    const m = mats.find(x => x.id === material.id);
    if (m) {
      m.stats = m.stats || { views: 0, downloads: 0 };
      m.stats.downloads = (m.stats.downloads || 0) + 1;
      saveMaterials(mats);
      setMaterial({ ...m });
      // open file in new tab
      window.open(file.url, "_blank");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
          <img src={material.uploadedBy.photo || "/teacher.png"} alt="" className="object-cover w-full h-full" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{material.title}</h1>
          <div className="text-sm text-gray-500">{material.subject} • Sem {material.semester} • Section {material.section}</div>
          <div className="text-xs text-gray-500 mt-1">Status: {material.status}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow">
        <div className="mb-2 text-sm font-medium" style={{ background: "#CFCEFF", display: "inline-block", padding: "6px 10px", borderRadius: 6 }}>Description</div>
        <p className="mt-2 text-sm text-gray-700">{material.description}</p>

        <div className="mt-4">
          <div className="text-sm font-medium mb-2" style={{ background: "#C3EBFA", display: "inline-block", padding: "6px 10px", borderRadius: 6 }}>Files</div>
          {material.files && material.files.length > 0 ? (
            <ul className="space-y-2 mt-3">
              {material.files.map((f, i) => (
                <li key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div>{f.name}</div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDownload(f)} className="text-sm px-3 py-1 bg-[#C3EBFA] rounded">Download</button>
                    <a target="_blank" rel="noreferrer" href={f.url} className="text-sm px-3 py-1 bg-gray-100 rounded">Open</a>
                  </div>
                </li>
              ))}
            </ul>
          ) : <div className="text-sm text-gray-500">No files attached.</div>}
        </div>

        {material.externalLinks && material.externalLinks.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2" style={{ background: "#FAE27C", display: "inline-block", padding: "6px 10px", borderRadius: 6 }}>External Links</div>
            <ul className="mt-2 space-y-1">
              {material.externalLinks.map((l, idx) => (
                <li key={idx}><a target="_blank" rel="noreferrer" href={l} className="text-blue-600 underline">{l}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link href="/faculty/study-material"><a className="px-4 py-2 bg-gray-100 rounded">Back</a></Link>
        <Link href={`/faculty/study-material/edit/${material.id}`}><a className="px-4 py-2 bg-[#C3EBFA] rounded">Edit</a></Link>
      </div>
    </div>
  );
}
