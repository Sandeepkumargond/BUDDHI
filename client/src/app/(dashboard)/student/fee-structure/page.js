"use client";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

export default function StudentFeeStructurePage() {
  const [session, setSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.getMyFeeStructure(session || undefined);
      setData(res?.data || res);
    } catch (e) {
      setError(e?.message || "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heads = data?.structure?.feeHeads || [];
  const total = data?.total || 0;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">My Fee Structure</h1>
      <div className="flex gap-2 items-end">
        <div>
          <label className="block text-sm font-medium">Session (optional)</label>
          <input value={session} onChange={(e) => setSession(e.target.value)} className="border rounded p-2" placeholder="2025-26" />
        </div>
        <button onClick={load} className="px-3 py-2 bg-blue-600 text-white rounded">Reload</button>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {data && (
        <div className="bg-white p-4 rounded-md space-y-2">
          <div className="text-sm text-gray-600">
            <div>Session: <b>{data?.structure?.session}</b></div>
            <div>Branch: <b>{data?.structure?.branch}</b></div>
            <div>Semester: <b>{data?.structure?.semester}</b></div>
            <div>Category: <b>{data?.structure?.category}</b></div>
          </div>
          <div className="border-t pt-2">
            {heads.map((h, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>{h.name}</span>
                <span>₹ {Number(h.amount).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 mt-2 border-t font-semibold">
              <span>Total</span>
              <span>₹ {Number(total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
