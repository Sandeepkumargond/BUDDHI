"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { role } from "@/lib/subadmindata";
import { apiService } from '@/lib/api';

export default function SubAdminListPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubAdmins = async () => {
      try {
        setLoading(true);
        const res = await apiService.request('/admin/sub-admins', { method: 'GET' });
        const list = res?.data?.subAdmins || [];
        // Normalize to the UI shape used in this page (photo, name, department, subAdminId, phone, email)
        const normalized = list.map(s => ({
          subAdminId: s._id || s.subAdminId || s._doc?._id,
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.personalMail || s.email,
          department: s.department || s.collegeName || '',
          phone: s.mobile || s.phone || '',
          email: s.personalMail || s.email || '',
          photo: s.imageUrl || '/avatar.png'
        }));
        setData(normalized);
      } catch (err) {
        console.error('Failed to fetch subadmins', err);
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchSubAdmins();
  }, []);

  const [filters, setFilters] = useState({
    department: "",
  });

  const [sortOpen, setSortOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "", order: "asc" });

  /* FILTER */
  const filtered = useMemo(() => {
    return data.filter((s) =>
      filters.department ? s.department === filters.department : true
    );
  }, [filters, data]);

  /* SORT */
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (!sortConfig.key) return arr;

    return arr.sort((a, b) => {
      const A = String(a[sortConfig.key]);
      const B = String(b[sortConfig.key]);

      if (!Number.isNaN(Number(A)) && !Number.isNaN(Number(B))) {
        return sortConfig.order === "asc" ? A - B : B - A;
      }
      return sortConfig.order === "asc"
        ? A.localeCompare(B)
        : B.localeCompare(A);
    });
  }, [filtered, sortConfig]);

  /* DELETE */
  const handleDelete = (subAdminId) => {
    const yes = window.confirm("Delete this Sub Admin?");
    if (!yes) return;
    setData((prev) => prev.filter((s) => s.subAdminId !== subAdminId));
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 text-center">Loading sub admins...</div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 text-center text-red-600">Error: {error}</div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4">
      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">All Sub Admins</h1>

        <div className="flex items-center gap-4">
          {/* FILTER */}
          <select
            className="border p-2 rounded text-sm"
            value={filters.department}
            onChange={(e) =>
              setFilters({ ...filters, department: e.target.value })
            }
          >
            <option value="">All Dept</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
          </select>

          <button
            onClick={() => setFilters({ department: "" })}
            className="px-3 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            Reset
          </button>

          {/* SORT */}
          <button
            onClick={() => setSortOpen(true)}
            className="w-8 h-8 bg-[#FAE27C] rounded-full flex items-center justify-center"
          >
            <Image src="/sort.png" width={14} height={14} alt="sort" />
          </button>

          {/* CREATE */}
          <Link href="/admin/subadmins/create">
            <button className="w-8 h-8 bg-[#AEE7F7] hover:bg-[#8DD4E8] rounded-full flex items-center justify-center transition">
              <Image src="/create.png" width={16} height={16} alt="add" />
            </button>
          </Link>
        </div>
      </div>

      {/* SORT MODAL */}
      {sortOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-72 relative">
            <h2 className="text-lg font-semibold mb-4">Sort Sub Admins</h2>

            {/* NAME */}
            <button
              className="p-2 border rounded w-full mb-2"
              onClick={() => {
                setSortConfig({ key: "name", order: "asc" });
                setSortOpen(false);
              }}
            >
              Name (A→Z)
            </button>
            <button
              className="p-2 border rounded w-full mb-4"
              onClick={() => {
                setSortConfig({ key: "name", order: "desc" });
                setSortOpen(false);
              }}
            >
              Name (Z→A)
            </button>

            {/* ID */}
            <button
              className="p-2 border rounded w-full mb-2"
              onClick={() => {
                setSortConfig({ key: "subAdminId", order: "asc" });
                setSortOpen(false);
              }}
            >
              ID (Asc)
            </button>
            <button
              className="p-2 border rounded w-full mb-4"
              onClick={() => {
                setSortConfig({ key: "subAdminId", order: "desc" });
                setSortOpen(false);
              }}
            >
              ID (Desc)
            </button>

            <button
              className="absolute top-4 right-4"
              onClick={() => setSortOpen(false)}
            >
              <Image src="/close.png" width={16} height={16} alt="close" />
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <table className="w-full mt-3">
        <thead>
          <tr className="border-b bg-gray-100 text-left">
            <th className="p-3">Info</th>
            <th className="p-3">SubAdmin ID</th>
            <th className="p-3 hidden md:table-cell">Phone</th>
            <th className="p-3 hidden md:table-cell">Email</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((item) => (
            <tr key={item.subAdminId} className="border-b even:bg-gray-50">
              <td className="p-3 flex gap-3 items-center">
                <Image
                  src={item.photo}
                  width={40}
                  height={40}
                  className="rounded-full"
                  alt={item.name}
                />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.department}</p>
                </div>
              </td>

              <td className="p-3">{item.subAdminId}</td>

              <td className="p-3 hidden md:table-cell">{item.phone}</td>
              <td className="p-3 hidden md:table-cell">{item.email}</td>

              <td className="p-3">
                <div className="flex gap-2 items-center">
                  {/* VIEW */}
                  <Link href={`/admin/subadmins/${item.subAdminId}`}>
                    <button className="w-7 h-7 bg-[#C3EBFA] rounded-full flex justify-center items-center">
                      <Image src="/view.png" width={16} height={16} alt="view" />
                    </button>
                  </Link>

                  {/* DELETE */}
                  {role === "admin" && (
                    <button
                      onClick={() => handleDelete(item.subAdminId)}
                      className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                    >
                      <Image src="/delete.png" width={15} height={15} alt="delete" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
