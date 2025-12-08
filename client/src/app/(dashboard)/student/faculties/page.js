"use client";

import { useEffect, useMemo, useState } from "react";
import { apiService } from "@/lib/api";
import Image from "next/image";

export default function StudentFacultiesPage() {
  const [faculties, setFaculties] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({ branch: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.listPublicFaculties({
        branch: filters.branch,
        search: filters.search,
        limit: 100,
      });
      const data = res?.data || {};
      setFaculties(data.faculties || []);
      setBranches(data.branches || []);
    } catch (e) {
      setError(e?.message || "Failed to load faculties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.branch]);

  const filteredFaculties = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    if (!term) return faculties;
    return faculties.filter((f) => {
      const haystack = [
        f.firstName,
        f.lastName,
        f.email,
        f.department,
        Array.isArray(f.specialization) ? f.specialization.join(" ") : f.specialization,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [faculties, filters.search]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculties</h1>
          <p className="text-gray-600 mt-1">Browse faculty by branch and search.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filters.branch}
            onChange={(e) => setFilters((prev) => ({ ...prev, branch: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <input
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search by name, email, specialization"
            className="border rounded-lg px-3 py-2 text-sm w-64"
          />
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : filteredFaculties.length === 0 ? (
        <p className="text-gray-600 text-sm">No faculties found.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredFaculties.map((f) => (
            <div key={f._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {f.imageUrl ? (
                    <Image src={f.imageUrl} alt={`${f.firstName}`} width={48} height={48} className="object-cover" />
                  ) : (
                    <span className="text-sm text-gray-500 font-semibold">
                      {`${f.firstName?.[0] || ""}${f.lastName?.[0] || ""}`.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{f.firstName} {f.lastName}</div>
                  <div className="text-xs text-gray-600">{f.department}</div>
                  {f.specialization?.length ? (
                    <div className="text-xs text-gray-500 line-clamp-1">{Array.isArray(f.specialization) ? f.specialization.join(", ") : f.specialization}</div>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600 break-all">{f.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
