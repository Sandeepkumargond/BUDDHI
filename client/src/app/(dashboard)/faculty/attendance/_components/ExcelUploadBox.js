"use client";

import { useRef, useState } from "react";
import { parseExcelFile } from "../utils/excelParser";

export default function ExcelUploadBox({ classInfo, students = [], onApply }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const parsed = await parseExcelFile(f);
    setPreview(parsed);
  };

  const applyParsed = () => {
    if (!preview) return;
    const normalized = preview.map(r => ({ rollNo: String(r.rollNo), status: r.status || "present", remark: r.remark || "" }));
    onApply(normalized);
    alert("Applied parsed attendance");
  };

  return (
    <div className="p-4 border-dashed border-2 rounded text-center">
      <input ref={fileRef} type="file" accept=".csv, .xlsx, .xls" onChange={handleFile} className="hidden" />
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => fileRef.current.click()} className="px-4 py-2 rounded bg-[#C3EBFA]">Upload CSV/XLSX</button>
        <button onClick={applyParsed} className="px-4 py-2 rounded bg-gray-100">Apply Parsed</button>
      </div>

      {preview && (
        <div className="mt-4 text-left max-h-64 overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-gray-500"><th>Roll</th><th>Status</th><th>Remark</th></tr></thead>
            <tbody>
              {preview.slice(0,200).map((r,i)=>(<tr key={i}><td>{r.rollNo}</td><td>{r.status}</td><td>{r.remark}</td></tr>))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
