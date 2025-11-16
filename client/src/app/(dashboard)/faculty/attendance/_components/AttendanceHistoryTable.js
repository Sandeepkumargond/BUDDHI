"use client";

export default function AttendanceHistoryTable({ snapshots = [], onUpdate }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <table className="w-full text-sm">
        <thead className="text-gray-500">
          <tr>
            <th>Date</th>
            <th>Subject</th>
            <th>Period</th>
            <th>Mode</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {snapshots.map(s => (
            <tr key={s.id} className="border-t">
              <td>{s.classInfo.date}</td>
              <td>{s.classInfo.subject}</td>
              <td>{s.classInfo.period}</td>
              <td>{s.classInfo.mode}</td>
              <td>
                <button onClick={() => onUpdate(s.id, s)} className="px-3 py-1 rounded bg-[#C3EBFA]">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
