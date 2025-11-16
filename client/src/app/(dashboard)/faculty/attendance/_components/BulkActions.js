"use client";

export default function BulkActions({ students = [], selection = {}, mode = "theory", onApply }) {
  const applyMarkSelected = (status) => {
    onApply(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k] = { ...next[k], [mode]: { ...next[k][mode], status } };
      });
      return next;
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Bulk Actions</h3>
      <div className="flex gap-2">
        <button onClick={() => applyMarkSelected("present")} className="px-3 py-1 rounded bg-green-100">Mark Present</button>
        <button onClick={() => applyMarkSelected("absent")} className="px-3 py-1 rounded bg-red-100">Mark Absent</button>
        <button onClick={() => applyMarkSelected("leave")} className="px-3 py-1 rounded bg-yellow-100">Mark Leave</button>
      </div>
    </div>
  );
}
