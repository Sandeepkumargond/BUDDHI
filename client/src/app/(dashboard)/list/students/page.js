// app/list/students/page.js
"use client";

import { useState, useMemo, useEffect } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role, studentsData } from "@/lib/aryandata";
import Image from "next/image";
import Link from "next/link";

const columns = [
  { header: "Info", accessor: "info" },
  { header: "Roll No", accessor: "rollNo", className: "hidden md:table-cell" },
  { header: "Enrollment No", accessor: "enrolmentNo", className: "hidden md:table-cell" },
  { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Email", accessor: "email", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

export default function StudentListPage() {
  /* ----------------------------
       LOCAL STATE FOR STUDENTS
  -----------------------------*/
  const [students, setStudents] = useState(studentsData);

  // Load students from localStorage on component mount
  useEffect(() => {
    const savedStudents = localStorage.getItem("students");
    if (savedStudents) {
      try {
        const parsedStudents = JSON.parse(savedStudents);
        // Merge with existing data, avoiding duplicates based on enrolmentNo
        const existingEnrollments = studentsData.map(s => s.enrolmentNo);
        const newStudents = parsedStudents.filter(s => !existingEnrollments.includes(s.enrolmentNo));
        setStudents([...studentsData, ...newStudents]);
      } catch (error) {
        console.error("Error loading students from localStorage:", error);
      }
    }
  }, []);

  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    class: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOpen, setSortOpen] = useState(false);

  /* -----------------------------
        DELETE HANDLER
  ------------------------------*/
  const handleDelete = (enrolmentNo) => {
    const ok = window.confirm("Are you sure you want to delete this student?");
    if (!ok) return;

    setStudents((prev) =>
      prev.filter((s) => String(s.enrolmentNo) !== String(enrolmentNo))
    );
  };

  /* ------------------------------------
    SEARCH HANDLER
  -------------------------------------*/
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  /* ------------------------------------
    FILTERED LIST
  -------------------------------------*/
  const filtered = useMemo(() => {
    return students
      .filter((s) =>
        filters.department ? String(s.department) === String(filters.department) : true
      )
      .filter((s) =>
        filters.semester ? String(s.semester) === String(filters.semester) : true
      )
      .filter((s) =>
        filters.class ? String(s.class) === String(filters.class) : true
      )
      .filter((s) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          s.name.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term) ||
          String(s.rollNo).toLowerCase().includes(term) ||
          String(s.enrolmentNo).toLowerCase().includes(term) ||
          s.phone.includes(term) ||
          s.department.toLowerCase().includes(term) ||
          String(s.semester).includes(term) ||
          s.class.toLowerCase().includes(term)
        );
      });
  }, [filters, students, searchTerm]);

  /* ------------------------------------
    SORTED LIST
  -------------------------------------*/
  const [sortConfig, setSortConfig] = useState({ key: "", order: "asc" });

  const sorted = useMemo(() => {
    const arr = [...filtered];

    if (!sortConfig.key) return arr;

    return arr.sort((a, b) => {
      const A = String(a[sortConfig.key] ?? "");
      const B = String(b[sortConfig.key] ?? "");

      if (!Number.isNaN(Number(A)) && !Number.isNaN(Number(B))) {
        return sortConfig.order === "asc" ? Number(A) - Number(B) : Number(B) - Number(A);
      }

      return sortConfig.order === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });
  }, [filtered, sortConfig]);

  /* ------------------------------------
    RENDER ROW
  -------------------------------------*/
  const renderRow = (item) => (
    <tr key={String(item.enrolmentNo)} className="border-b border-gray-200 even:bg-slate-50 text-sm">
      <td className="flex items-center gap-4 p-4">
        <Image src={item.photo} width={40} height={40} className="rounded-full" alt={item.name} />
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">
            {item.department} | Sem {item.semester} | {item.class}
          </p>
        </div>
      </td>

      <td className="hidden md:table-cell">{item.rollNo}</td>
      <td className="hidden md:table-cell">{item.enrolmentNo}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.email}</td>

      <td>
        <div className="flex items-center gap-2">
          {/* VIEW BUTTON */}
          <Link href={`/list/students/${item.enrolmentNo}`}>
            <button className="w-7 h-7 bg-[#C3EBFA] rounded-full flex items-center justify-center">
              <Image src="/view.png" width={16} height={16} alt="view" />
            </button>
          </Link>

          {/* DELETE BUTTON */}
          {(role === "admin" || role === "subadmin") && (
            <button
              onClick={() => handleDelete(item.enrolmentNo)}
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

          {/* INLINE FILTERS */}
          <select
            className="border p-2 rounded text-sm"
            value={filters.department}
            onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
          >
            <option value="">All Dept</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
          </select>

          <select
            className="border p-2 rounded text-sm"
            value={filters.semester}
            onChange={(e) => setFilters((prev) => ({ ...prev, semester: e.target.value }))}
          >
            <option value="">All Sem</option>
            {[1, 2, 3, 4].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className="border p-2 rounded text-sm"
            value={filters.class}
            onChange={(e) => setFilters((prev) => ({ ...prev, class: e.target.value }))}
          >
            <option value="">All Class</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>

          {/* RESET FILTERS */}
          <button
            onClick={() => {
              setFilters({ department: "", semester: "", class: "" });
              setSearchTerm("");
            }}
            className="px-3 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            Reset
          </button>

          {/* SORT BUTTON */}
          <button
            onClick={() => setSortOpen(true)}
            className="w-8 h-8 rounded-full bg-[#FAE27C] flex items-center justify-center"
          >
            <Image src="/sort.png" width={14} height={14} alt="sort" />
          </button>

          {(role === "admin" || role === "subadmin") && (
  <Link href="/list/students/create">
    <button className="w-8 h-8 rounded-full bg-[#C3EBFA] flex items-center justify-center">
      <Image src="/create.png" width={16} height={16} alt="add" />
    </button>
  </Link>
)}

        </div>
      </div>

      {/* SORT MODAL */}
      {sortOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-80 p-6 rounded relative">
            <h2 className="text-lg font-semibold mb-4">Sort Students</h2>

            {/* Name */}
            <button
              className="p-2 border rounded w-full mb-2"
              onClick={() => {
                setSortConfig({ key: "name", order: "asc" });
                setSortOpen(false);
              }}
            >
              Name (A → Z)
            </button>

            <button
              className="p-2 border rounded w-full mb-3"
              onClick={() => {
                setSortConfig({ key: "name", order: "desc" });
                setSortOpen(false);
              }}
            >
              Name (Z → A)
            </button>

            {/* Roll No */}
            <button
              className="p-2 border rounded w-full mb-2"
              onClick={() => {
                setSortConfig({ key: "rollNo", order: "asc" });
                setSortOpen(false);
              }}
            >
              Roll No (Asc)
            </button>

            <button
              className="p-2 border rounded w-full mb-3"
              onClick={() => {
                setSortConfig({ key: "rollNo", order: "desc" });
                setSortOpen(false);
              }}
            >
              Roll No (Desc)
            </button>

            {/* NEW — Enrollment No */}
            <button
              className="p-2 border rounded w-full mb-2"
              onClick={() => {
                setSortConfig({ key: "enrolmentNo", order: "asc" });
                setSortOpen(false);
              }}
            >
              Enrollment No (Asc)
            </button>

            <button
              className="p-2 border rounded w-full mb-3"
              onClick={() => {
                setSortConfig({ key: "enrolmentNo", order: "desc" });
                setSortOpen(false);
              }}
            >
              Enrollment No (Desc)
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

      <Table columns={columns} renderRow={renderRow} data={sorted} />
      <Pagination />
    </div>
  );
}
