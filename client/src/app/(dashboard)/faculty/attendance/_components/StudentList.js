"use client";

import Image from "next/image";
import AttendanceBar from "./AttendanceBar";

export default function StudentList({ students = [], selection = {}, mode = "theory", onToggle, onRemark }) {
  return (
    <table className="w-full table-auto">
      <thead>
        <tr className="text-left text-sm text-gray-500">
          <th className="py-2">#</th>
          <th>Name</th>
          <th>Roll</th>
          <th>Photo</th>
          <th className="hidden md:table-cell">Overall</th>
          <th>Status</th>
          <th>Remark</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s, idx) => {
          const sel = selection[s.rollNo] || { theory: { status: "absent" }, lab: { status: "absent" } };
          const status = sel[mode]?.status || "absent";
          const percent = s.attendancePercent ?? 0;
          return (
            <tr key={s.rollNo} className="border-t">
              <td className="py-3">{idx + 1}</td>
              <td>{s.name}</td>
              <td>{s.rollNo}</td>
              <td className="py-1">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image src={s.photo} width={40} height={40} alt={s.name} className="object-cover" />
                </div>
              </td>
              <td className="hidden md:table-cell">
                <AttendanceBar percent={percent} />
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <button onClick={() => onToggle(s.rollNo, mode, "present")} className={`px-2 py-1 rounded ${status === "present" ? "bg-green-200" : "bg-gray-100"}`}>Present</button>
                  <button onClick={() => onToggle(s.rollNo, mode, "absent")} className={`px-2 py-1 rounded ${status === "absent" ? "bg-red-200" : "bg-gray-100"}`}>Absent</button>
                  <button onClick={() => onToggle(s.rollNo, mode, "leave")} className={`px-2 py-1 rounded ${status === "leave" ? "bg-yellow-200" : "bg-gray-100"}`}>Leave</button>
                </div>
              </td>
              <td>
                <input value={sel[mode]?.remark || ""} onChange={(e) => onRemark(s.rollNo, mode, e.target.value)} placeholder="remark" className="border p-1 rounded w-36" />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
