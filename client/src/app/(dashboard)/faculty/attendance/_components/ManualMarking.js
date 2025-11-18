"use client";

import { useState } from "react";

export default function ManualMarking({ students = [], selection = {}, mode = "theory", onToggle, onRemark }) {
  const [filter, setFilter] = useState("");

  const list = students.filter(s => `${s.name} ${s.rollNo}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <input placeholder="Filter by name or roll" value={filter} onChange={e=>setFilter(e.target.value)} className="border p-2 rounded flex-1" />
      </div>
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="text-sm text-gray-500 text-left">
              <th className="py-2">Roll</th>
              <th>Name</th>
              <th>Status</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {list.map(s => {
              const cur = selection[s.rollNo]?.[mode]?.status || "absent";
              return (
                <tr key={s.rollNo} className="border-t">
                  <td className="py-2">{s.rollNo}</td>
                  <td>{s.name}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => onToggle(s.rollNo, mode, "present")} className={`px-2 py-1 rounded ${cur==="present" ? "bg-green-200": "bg-gray-100"}`}>P</button>
                      <button onClick={() => onToggle(s.rollNo, mode, "absent")} className={`px-2 py-1 rounded ${cur==="absent" ? "bg-red-200": "bg-gray-100"}`}>A</button>
                      <button onClick={() => onToggle(s.rollNo, mode, "leave")} className={`px-2 py-1 rounded ${cur==="leave" ? "bg-yellow-200": "bg-gray-100"}`}>L</button>
                    </div>
                  </td>
                  <td>
                    <input placeholder="remark" defaultValue={selection[s.rollNo]?.[mode]?.remark || ""} onBlur={(e)=>onRemark(s.rollNo, mode, e.target.value)} className="border p-1 rounded w-44" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
