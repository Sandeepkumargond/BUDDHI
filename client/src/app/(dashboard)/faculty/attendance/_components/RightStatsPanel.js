"use client";

export default function RightStatsPanel({ students = [], selection = {}, mode = "theory" }) {
  const total = students.length;
  let present = 0, absent = 0, leave = 0;
  students.forEach(s => {
    const st = selection[s.rollNo]?.[mode]?.status || "absent";
    if (st === "present") present++;
    else if (st === "absent") absent++;
    else if (st === "leave") leave++;
  });

  const pct = total ? Math.round((present / total) * 100) : 0;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Class Summary</h3>
      <div className="mb-3">
        <div className="text-sm text-gray-500">Total Students</div>
        <div className="text-xl font-bold">{total}</div>
      </div>
      <div className="mb-3">
        <div className="text-sm text-gray-500">Present</div>
        <div className="text-lg text-green-600 font-semibold">{present} ({pct}%)</div>
      </div>
      <div className="mb-3 flex gap-2">
        <div className="text-sm text-gray-500">Absent</div>
        <div className="ml-auto text-sm text-red-600">{absent}</div>
      </div>
      <div className="mb-3 flex gap-2">
        <div className="text-sm text-gray-500">Leave</div>
        <div className="ml-auto text-sm text-yellow-600">{leave}</div>
      </div>
    </div>
  );
}
