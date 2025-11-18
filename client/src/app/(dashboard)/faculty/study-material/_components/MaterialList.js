// src/app/(dashboard)/faculty/study-material/_components/MaterialList.js
"use client";

import MaterialCard from "./MaterialCard";

export default function MaterialList({ materials = [], onRefresh = () => {} }) {
  if (!materials || materials.length === 0) {
    return <div className="bg-white p-4 rounded shadow">No materials yet.</div>;
  }

  return (
    <div className="grid gap-4">
      {materials.map((m) => (
        <MaterialCard key={m.id} material={m} onRefresh={onRefresh} />
      ))}
    </div>
  );
}
