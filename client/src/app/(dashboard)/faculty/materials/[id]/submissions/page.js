"use client";
import { useParams } from "next/navigation";
import FacultyMaterialSubmissions from "@/components/FacultyMaterialSubmissions";

export default function MaterialSubmissionsPage() {
  const params = useParams();
  const materialId = params?.id;
  const hasId = Boolean(materialId);

  if (!hasId) {
    return (
      <div className="p-6">
        <div className="text-sm" style={{ color: "#64748b" }}>Invalid material id.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "#0f172a" }}>Material Submissions</h2>
        <div className="text-sm" style={{ color: "#64748b" }}>Material ID: {materialId}</div>
      </div>
      <FacultyMaterialSubmissions materialId={String(materialId)} />
    </div>
  );
}
