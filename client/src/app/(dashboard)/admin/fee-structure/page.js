"use client";
import { useState } from "react";
import { apiService } from "@/lib/api";

const initialHead = { name: "", amount: "" };

export default function AdminFeeStructurePage() {
  const [program, setProgram] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState(1);
  const [session, setSession] = useState("");
  const [category, setCategory] = useState("general");
  const [published, setPublished] = useState(false);
  const [feeHeads, setFeeHeads] = useState([{ ...initialHead }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const addHead = () => setFeeHeads((h) => [...h, { ...initialHead }]);
  const rmHead = (i) => setFeeHeads((h) => h.filter((_, idx) => idx !== i));

  const updateHead = (i, key, val) => {
    setFeeHeads((h) => h.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload = {
        ...(program ? { program } : {}),
        branch,
        semester: Number(semester),
        session,
        category,
        published,
        feeHeads: feeHeads.map((h) => ({ name: h.name, amount: Number(h.amount) })),
      };
      const res = await apiService.adminCreateFeeStructure(payload);
      setMessage(`Created: ${res?.message || "Success"}`);
      setFeeHeads([{ ...initialHead }]);
    } catch (err) {
      setMessage(err?.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Create Fee Structure</h1>
      {message ? <div className="text-sm text-blue-600">{message}</div> : null}
      <form onSubmit={onSubmit} className="space-y-4 bg-white p-4 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Program (optional)</label>
            <input className="w-full border rounded p-2" value={program} onChange={(e) => setProgram(e.target.value)} placeholder="B.Tech" />
          </div>
          <div>
            <label className="block text-sm font-medium">Branch</label>
            <input className="w-full border rounded p-2" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="CSE" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Semester</label>
            <input type="number" min={1} className="w-full border rounded p-2" value={semester} onChange={(e) => setSemester(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Session</label>
            <input className="w-full border rounded p-2" value={session} onChange={(e) => setSession(e.target.value)} placeholder="2025-26" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select className="w-full border rounded p-2" value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="general">General</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
              <option value="obc">OBC</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="pub" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            <label htmlFor="pub" className="text-sm">Publish now</label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fee Heads</h2>
            <button type="button" onClick={addHead} className="px-3 py-1 bg-blue-600 text-white rounded">Add Head</button>
          </div>
          {feeHeads.map((h, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input className="col-span-7 border rounded p-2" placeholder="Head name" value={h.name} onChange={(e) => updateHead(i, 'name', e.target.value)} required />
              <input type="number" min={0} className="col-span-4 border rounded p-2" placeholder="Amount" value={h.amount} onChange={(e) => updateHead(i, 'amount', e.target.value)} required />
              <button type="button" onClick={() => rmHead(i)} className="col-span-1 px-2 py-1 bg-red-500 text-white rounded">X</button>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
          {loading ? 'Saving…' : 'Create Structure'}
        </button>
      </form>
    </div>
  );
}
