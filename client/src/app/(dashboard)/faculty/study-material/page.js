// src/app/(dashboard)/faculty/study-material/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MaterialList from "./_components/MaterialList";
import { loadMaterials } from "@/lib/studyMaterialData";

export default function StudyMaterialHome() {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    setMaterials(loadMaterials());
  }, []);

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Study Materials</h1>

        <div className="flex items-center gap-3">

          {/* Upload Material */}
          <Link
            href="/faculty/study-material/upload"
            className="px-4 py-2 rounded bg-[#C3EBFA] hover:bg-[#A9DDF0]"
          >
            + Upload Material
          </Link>

          {/* Bulk Upload */}
          <Link
            href="/faculty/study-material/upload"
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            Bulk Upload
          </Link>

        </div>
      </div>

      {/* FILTER BOX */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="text-sm text-gray-500 mb-2 font-medium">
          Quick Filters
        </div>
        {/* You can add subject, type, semester filters here later */}
      </div>

      {/* MATERIAL LIST */}
      <MaterialList
        materials={materials}
        onRefresh={() => setMaterials(loadMaterials())}
      />
      
    </div>
  );
}
