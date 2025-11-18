"use client";

export default function ExcelPreviewModal({ parsed = [], onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-4 max-w-2xl w-full">
        <h3 className="font-semibold mb-2">Preview Parsed Attendance</h3>
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500"><tr><th>Roll</th><th>Status</th><th>Remark</th></tr></thead>
            <tbody>
              {parsed.map((r,i)=>(<tr key={i}><td>{r.rollNo}</td><td>{r.status}</td><td>{r.remark}</td></tr>))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100">Close</button>
          <button onClick={() => onConfirm(parsed)} className="px-3 py-1 rounded bg-[#C3EBFA]">Confirm & Apply</button>
        </div>
      </div>
    </div>
  );
}
