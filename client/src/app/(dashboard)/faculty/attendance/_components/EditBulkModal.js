"use client";

import { useState } from "react";

export default function EditBulkModal({ onClose, onApply }) {
  const [status, setStatus] = useState("present");
  const [remark, setRemark] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-4 w-96">
        <h3 className="font-semibold mb-2">Bulk Update</h3>
        <div className="space-y-2">
          <select value={status} onChange={e=>setStatus(e.target.value)} className="border p-2 rounded w-full">
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="leave">Leave</option>
          </select>
          <input value={remark} onChange={e=>setRemark(e.target.value)} placeholder="Remark (optional)" className="border p-2 rounded w-full" />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100">Cancel</button>
          <button onClick={() => onApply({ status, remark })} className="px-3 py-1 rounded bg-[#C3EBFA]">Apply</button>
        </div>
      </div>
    </div>
  );
}
