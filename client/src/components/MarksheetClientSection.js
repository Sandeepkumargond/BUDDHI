"use client";

import dynamic from "next/dynamic";

// Dynamically import your marksheet component (client only)
const MarksheetDownloader = dynamic(
  () => import("./MarksheetDownloader"),
  { ssr: false }
);

export default function MarksheetClientSection({ student }) {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Marksheet & Downloads</h2>

      {/* Dummy Marksheet Download */}
      <MarksheetDownloader student={student} />

      {/* Dummy Transcript */}
      <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
        Download Transcript (Dummy)
      </button>

      {/* Dummy Bonafide */}
      <button className="bg-purple-600 text-white px-4 py-2 rounded mt-2">
        Download Bonafide Certificate (Dummy)
      </button>

      {/* Dummy Fees PDF */}
      <button className="bg-yellow-600 text-white px-4 py-2 rounded mt-2">
        Download Fee Receipt (Dummy)
      </button>

      {/* Dummy attendance report */}
      <button className="bg-orange-500 text-white px-4 py-2 rounded mt-2">
        Download Attendance Report (Dummy)
      </button>
    </div>
  );
}
