"use client";

import dynamic from "next/dynamic";

const MarksheetDownloader = dynamic(
  () => import("@/components/MarksheetDownloader.js"),
  { ssr: false }
);

export default function ProfileClientSection({ student }) {
  return (
    <div className="bg-white p-4 rounded-md mt-4">
      <h2 className="text-lg font-semibold mb-2">Downloads</h2>

      <MarksheetDownloader student={student} />

      <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
        Download Transcript (Dummy)
      </button>

      <button className="bg-purple-600 text-white px-4 py-2 rounded mt-2">
        Download Bonafide Certificate (Dummy)
      </button>

      <button className="bg-orange-600 text-white px-4 py-2 rounded mt-2">
        Download Attendance Report (Dummy)
      </button>
    </div>
  );
}
