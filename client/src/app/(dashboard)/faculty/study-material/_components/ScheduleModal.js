// src/app/(dashboard)/faculty/study-material/_components/ScheduleModal.js
"use client";

import { useState } from "react";

export default function ScheduleModal({ onClose = () => {}, onApply = () => {} }) {
  const [releaseOn, setReleaseOn] = useState("");
  const [expireOn, setExpireOn] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Schedule Publish</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Release on</label>
            <input type="datetime-local" value={releaseOn} onChange={(e)=>setReleaseOn(e.target.value)} className="border p-2 rounded w-full" />
          </div>

          <div>
            <label className="block text-sm mb-1">Expire on (optional)</label>
            <input type="datetime-local" value={expireOn} onChange={(e)=>setExpireOn(e.target.value)} className="border p-2 rounded w-full" />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => onApply(releaseOn || null, expireOn || null)} className="px-4 py-2 bg-[#C3EBFA] rounded">Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}
