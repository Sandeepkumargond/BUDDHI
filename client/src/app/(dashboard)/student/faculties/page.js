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
    <div className="p-6 max-w-full mx-auto px-2">
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
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {filteredFaculties.map((f) => {
            const totalPublications = (f.journalPapers?.length || 0) + (f.conferencePapers?.length || 0);
            const totalProjects = (f.sponsoredProjects?.length || 0) + (f.consultancyProjects?.length || 0);
            const websiteLink = f.social?.find(s => s.name === 'website')?.url;
            
            return (
              <div key={f._id} className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow min-h-[280px]">
                {/* Left section with image and basic info */}
                <div className="flex h-full">
                  <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-8 flex flex-col items-center justify-center" style={{ minWidth: '200px' }}>
                    <div className="w-32 h-32 rounded-full bg-white overflow-hidden flex items-center justify-center mb-4 shadow-sm">
                      {f.imageUrl ? (
                        <Image src={f.imageUrl} alt={`${f.firstName} ${f.lastName}`} width={128} height={128} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-3xl text-gray-500 font-semibold">
                          {`${f.firstName?.[0] || ""}${f.lastName?.[0] || ""}`.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900 text-base mb-1">{f.firstName} {f.lastName}</div>
                      {f.designation && f.designation.length > 0 && (
                        <div className="text-xs text-orange-700 font-medium">
                          {Array.isArray(f.designation) ? f.designation.join(", ") : f.designation}
                        </div>
                      )}
                      {f.department && (
                        <div className="text-xs text-gray-600 mt-1">{f.department}</div>
                      )}
                    </div>
                  </div>

                  {/* Right section with details */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      {/* Email */}
                      {f.email && (
                        <div className="flex items-start gap-2 text-xs">
                          <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-700 break-all">{f.email}</span>
                        </div>
                      )}

                      {/* Mobile */}
                      {f.mobile && (
                        <div className="flex items-start gap-2 text-xs">
                          <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-gray-700">{f.mobile}</span>
                        </div>
                      )}

                      {/* Personal Webpage */}
                      {websiteLink && (
                        <div className="flex items-start gap-2 text-xs">
                          <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <a href={websiteLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Personal Webpage</a>
                        </div>
                      )}
                    </div>

                    {/* Specialization */}
                    {f.specialization && f.specialization.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-semibold text-gray-800 mb-1.5">Specialization</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(f.specialization) ? f.specialization : [f.specialization]).map((spec, idx) => (
                            <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {totalPublications > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded text-xs">
                          <svg className="w-4 h-4 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-orange-900 font-medium">{totalPublications} Publication{totalPublications !== 1 ? 's' : ''}</span>
                        </div>
                      )}

                      {totalProjects > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded text-xs">
                          <svg className="w-4 h-4 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-orange-900 font-medium">{totalProjects} Project{totalProjects !== 1 ? 's' : ''}</span>
                        </div>
                      )}

                      {f.patents && f.patents.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded text-xs">
                          <svg className="w-4 h-4 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-orange-900 font-medium">{f.patents.length} Patent{f.patents.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
