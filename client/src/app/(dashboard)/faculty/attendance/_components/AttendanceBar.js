"use client";

export default function AttendanceBar({ percent = 0 }) {
  const color = percent >= 75 ? "bg-green-400" : percent >= 60 ? "bg-orange-400" : "bg-red-400";
  return (
    <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
      <div style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} className={`${color} h-full rounded-full`} />
    </div>
  );
}
