"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MarksheetDownloader = dynamic(
  () => import("@/components/MarksheetDownloader"),
  { ssr: false }
);

export default function ProfileClientSection({ student }) {
  const currentSem = Number(student.semester) || 1;
  const availableSems = [];
  for (let i = 1; i < currentSem; i++) availableSems.push(i);

  const [selectedSem, setSelectedSem] = useState(
    availableSems.length ? availableSems[availableSems.length - 1] : ""
  );

  return (
    <div className="bg-white p-4 rounded-md shadow">
      <h2 className="text-lg font-semibold mb-2">Download Grade Card</h2>

      {!availableSems.length ? (
        <div className="text-sm text-gray-500">
          No previous semester grade cards available.
        </div>
      ) : (
        <>
          <select
            className="border p-2 rounded w-full mb-3"
            value={selectedSem}
            onChange={(e) => setSelectedSem(Number(e.target.value))}
          >
            {availableSems.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          <MarksheetDownloader student={student} semester={selectedSem} />
        </>
      )}
    </div>
  );
}
