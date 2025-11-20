"use client";

import { useState, useMemo, useEffect } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const columns = [
  { header: "Info", accessor: "info" },
  { header: "Roll No", accessor: "rollNo", className: "hidden md:table-cell" },
  { header: "Enrollment No", accessor: "enrollmentNo", className: "hidden md:table-cell" },
  { header: "Phone", accessor: "mobile", className: "hidden lg:table-cell" },
  { header: "Email", accessor: "email", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

export default function StudentListPage() {
  const { role } = useAuth();

  /* -------------------------
     STATE — Real Students
  -------------------------- */
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------
     FETCH STUDENTS FROM BACKEND
  ---------------------------------- */
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch(
          "http://localhost:5000/api/v1/sub-admin/students",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error("Error fetching students:", data.message);
          return;
        }

        // Backend returns: { students: [...] }
        setStudents(data.data.students || []);

      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  /* ----------------------------
        FILTERS & SEARCH
  ----------------------------- */
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    class: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOpen, setSortOpen] = useState(false);

  const handleSearch = (term) => setSearchTerm(term);

  /* ----------------------------
      FILTERING BACKEND DATA
  ----------------------------- */
  const filtered = useMemo(() => {
    return students
      .filter((s) =>
        filters.department ? s.branch === filters.department : true
      )
      .filter((s) =>
        filters.semester ? String(s.semester) === filters.semester : true
      )
      .filter((s) =>
        filters.class ? s.section === filters.class : true
      )
      .filter((s) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          s.firstName.toLowerCase().includes(term) ||
          s.lastName.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term) ||
          s.enrollmentNo.toLowerCase().includes(term) ||
          s.rollNo.toLowerCase().includes(term) ||
          s.mobile.includes(term)
        );
      });
  }, [students, filters, searchTerm]);

  /* ----------------------------
        SORTING
  ----------------------------- */
  const [sortConfig, setSortConfig] = useState({ key: "", order: "asc" });

  const sorted = useMemo(() => {
    let sortedArray = [...filtered];

    if (!sortConfig.key) return sortedArray;

    const { key, order } = sortConfig;

    sortedArray.sort((a, b) => {
      const A = String(a[key] || "");
      const B = String(b[key] || "");

      return order === "asc"
        ? A.localeCompare(B, undefined, { numeric: true })
        : B.localeCompare(A, undefined, { numeric: true });
    });

    return sortedArray;
  }, [filtered, sortConfig]);


  /* ----------------------------
        DELETE (Future)
  ----------------------------- */
  const handleDelete = (id) => {
    alert("Deletion will be implemented later");
  };


  /* ----------------------------
        TABLE ROW UI
  ----------------------------- */
  const renderRow = (item) => (
    <tr key={item._id} className="border-b border-gray-200 even:bg-slate-50 text-sm">
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.imageUrl || "/student.png"}
          width={40}
          height={40}
          className="rounded-full"
          alt={item.firstName}
        />
        <div>
          <h3 className="font-semibold">
            {item.firstName} {item.lastName}
          </h3>
          <p className="text-xs text-gray-500">
            {item.branch} | Sem {item.semester}
          </p>
        </div>
      </td>

      <td className="hidden md:table-cell">{item.rollNo}</td>
      <td className="hidden md:table-cell">{item.enrollmentNo}</td>
      <td className="hidden md:table-cell">{item.mobile}</td>
      <td className="hidden md:table-cell">{item.email}</td>

      <td>
        <div className="flex items-center gap-2">
         <Link href={`/list/students/${item._id}`}>
            <button className="w-7 h-7 bg-[#C3EBFA] rounded-full flex items-center justify-center">
              <Image src="/view.png" width={16} height={16} alt="view" />
            </button>
          </Link>

          {(role === "subadmin" || role === "admin") && (
            <button
              onClick={() => handleDelete(item._id)}
              className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
            >
              <Image src="/delete.png" width={16} height={16} alt="delete" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );


  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4">

      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>

        <div className="flex items-center gap-4">
          <TableSearch onSearch={handleSearch} />

          {/* Department Filter */}
          <select
            className="border p-2 rounded text-sm"
            value={filters.department}
            onChange={(e) =>
              setFilters((p) => ({ ...p, department: e.target.value }))
            }
          >
            <option value="">All Dept</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>

          {/* Semester Filter */}
          <select
            className="border p-2 rounded text-sm"
            value={filters.semester}
            onChange={(e) =>
              setFilters((p) => ({ ...p, semester: e.target.value }))
            }
          >
            <option value="">All Sem</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Reset */}
          <button
            onClick={() => {
              setFilters({ department: "", semester: "", class: "" });
              setSearchTerm("");
            }}
            className="px-3 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            Reset
          </button>

          <Link href="/list/students/create">
            <button className="w-8 h-8 rounded-full bg-[#C3EBFA] flex items-center justify-center">
              <Image src="/create.png" width={16} height={16} alt="add" />
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10 text-gray-500">Loading students...</p>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={sorted} />
      )}

      <Pagination />
    </div>
  );
}
