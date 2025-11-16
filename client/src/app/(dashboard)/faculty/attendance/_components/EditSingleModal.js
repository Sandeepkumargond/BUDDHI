"use client";

import { useState } from "react";

export default function EditSingleModal({ student, initial, mode = "theory", onClose, onSave }) {
  const [status, setStatus] = useState(initial?.status || "absent");
  const [remark, setRemark] = useState(initial?.remark || "");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-4 w-96">
        <h3 className="font-semibold mb-2">Edit Attendance - {student.name}</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <button onClick={()=>setStatus("present")} className={`px-3 py-1 rounded ${status==="present"?"bg-green-200":"bg-gray-100"}`}>Present</button>
            <button onClick={()=>setStatus("absent")} className={`px-3 py-1 rounded ${status==="absent"?"bg-red-200":"bg-gray-100"}`}>Absent</button>
            <button onClick={()=>setStatus("leave")} className={`px-3 py-1 rounded ${status==="leave"?"bg-yellow-200":"bg-gray-100"}`}>Leave</button>
          </div>
          <input value={remark} onChange={e=>setRemark(e.target.value)} className="border p-2 rounded w-full" placeholder="Remark" />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100">Cancel</button>
          <button onClick={() => onSave({ status, remark })} className="px-3 py-1 rounded bg-[#C3EBFA]">Save</button>
        </div>
      </div>
    </div>
  );
}
