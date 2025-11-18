"use client";

import { useEffect, useState } from "react";

export default function AttendanceHeader({ classInfo, setClassInfo, mode, setMode, view, setView }) {
  const [local, setLocal] = useState(classInfo);

  useEffect(() => setLocal(classInfo), [classInfo]);

  const onChange = (k, v) => {
    setLocal(prev => ({ ...prev, [k]: v }));
    setClassInfo(prev => ({ ...prev, [k]: v }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-3">
      <div className="flex gap-3 items-center">
        <input value={local.subject} onChange={e=>onChange("subject", e.target.value)} placeholder="Subject (CS201)" className="border p-2 rounded flex-1" />
        <input value={local.semester} onChange={e=>onChange("semester", e.target.value)} placeholder="Semester" className="w-28 border p-2 rounded" />
        <input value={local.section} onChange={e=>onChange("section", e.target.value)} placeholder="Section" className="w-28 border p-2 rounded" />
        <input value={local.batch || ""} onChange={e=>onChange("batch", e.target.value)} placeholder="Batch" className="w-28 border p-2 rounded" />
        <input type="date" value={local.date} onChange={e=>onChange("date", e.target.value)} className="border p-2 rounded" />
        <input value={local.period} onChange={e=>onChange("period", e.target.value)} placeholder="Period" className="w-20 border p-2 rounded" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <label className="text-sm">Mode</label>
            <select value={local.mode} onChange={e => { onChange("mode", e.target.value); setMode?.(e.target.value); }} className="border p-2 rounded ml-2">
              <option value="theory">Theory</option>
              <option value="lab">Lab</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <label className="text-sm">View</label>
            <select value={view} onChange={e => setView?.(e.target.value)} className="border p-2 rounded ml-2">
              <option value="manual">Manual</option>
              <option value="excel">Excel Upload</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500">Tip: use Excel upload for bulk marking</div>
      </div>
    </div>
  );
}
