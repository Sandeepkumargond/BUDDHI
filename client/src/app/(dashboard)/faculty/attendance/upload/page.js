"use client";

import { useState } from "react";
import ExcelUploadBox from "../_components/ExcelUploadBox";

export default function AttendanceUploadPage() {
  const [result, setResult] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Excel Upload (Attendance)</h1>
      <div className="max-w-3xl bg-white p-4 rounded shadow">
        <ExcelUploadBox
          classInfo={{ subject: "", semester: "", section: "", date: new Date().toISOString().slice(0,10), mode: "theory" }}
          students={[]}
          onApply={(parsed) => setResult(parsed)}
        />
        {result && (
          <pre className="mt-4 p-3 bg-gray-50 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
