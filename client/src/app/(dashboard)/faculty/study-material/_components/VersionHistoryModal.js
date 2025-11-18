// src/app/(dashboard)/faculty/study-material/_components/VersionHistoryModal.js
"use client";

import { useEffect, useState } from "react";
import { loadMaterials } from "@/lib/studyMaterialData";

export default function VersionHistoryModal({ onClose = () => {} }) {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    setMaterials(loadMaterials());
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Version History (All Materials)</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <div className="space-y-3 max-h-80 overflow-auto">
          {materials.map(m => (
            <div key={m.id} className="border rounded p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{m.title} <span className="text-xs text-gray-400">({m.subject})</span></div>
                  <div className="text-xs text-gray-500">Versions: {m.versions?.length || 0}</div>
                </div>
                <div className="text-xs text-gray-500">{new Date(m.uploadedAt).toLocaleString()}</div>
              </div>
              {m.versions && m.versions.length > 0 && (
                <ul className="mt-2 text-sm space-y-1">
                  {m.versions.map((v, i) => (
                    <li key={i} className="text-xs text-gray-600">v{i+1} • {new Date(v.versionAt).toLocaleString()}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
