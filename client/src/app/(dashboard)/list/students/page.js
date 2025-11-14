// app/list/students/page.js
"use client";

import { useState, useMemo } from "react";
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
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [tempFilters, setTempFilters] = useState({
    department: "",
    semester: "",
    class: "",
  });

  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    class: "",
  });

  const [sortConfig, setSortConfig] = useState({
    key: "",
    order: "asc",
  });

  /* ------------------------------------
    FILTERED LIST (string-safe comparisons)
  -------------------------------------*/
  const filtered = useMemo(() => {
    return studentsData
      .filter((s) =>
        filters.department ? String(s.department) === String(filters.department) : true
      )
      .filter((s) =>
        filters.semester ? String(s.semester) === String(filters.semester) : true
      )
      .filter((s) =>
        filters.class ? String(s.class) === String(filters.class) : true
      );
  }, [filters]);

  /* ------------------------------------
    SORTED LIST (string-safe)
  -------------------------------------*/
  const sorted = useMemo(() => {
    const arr = [...filtered];

    if (!sortConfig.key) return arr;

    return arr.sort((a, b) => {
      const A = String(a[sortConfig.key] ?? "");
      const B = String(b[sortConfig.key] ?? "");

      // numeric compare if both values are numeric strings
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
          <Link href={`/list/students/${item.enrolmentNo}`}>
            <button className="w-7 h-7 bg-[#C3EBFA] rounded-full flex items-center justify-center">
              <Image src="/view.png" width={16} height={16} alt="view" />
            </button>
          </Link>

          {(role === "admin" || role === "subadmin") && (
            <FormModal table="student" type="delete" id={item.enrolmentNo} />
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4">
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>

        <div className="flex items-center gap-4">
          <TableSearch />

          {/* FILTER */}
          <button
            onClick={() => {
              setTempFilters(filters);
              setFilterOpen(true);
            }}
            className="w-8 h-8 rounded-full bg-[#FAE27C] flex items-center justify-center"
          >
            <Image src="/filter.png" width={14} height={14} alt="filter" />
          </button>

          {/* SORT */}
          <button
            onClick={() => setSortOpen(true)}
            className="w-8 h-8 rounded-full bg-[#FAE27C] flex items-center justify-center"
          >
            <Image src="/sort.png" width={14} height={14} alt="sort" />
          </button>

          {(role === "admin" || role === "subadmin") && <FormModal table="student" type="create" />}
        </div>
      </div>

      {/* FILTER MODAL */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-80 p-6 rounded relative">
            <h2 className="text-lg font-semibold mb-4">Filter Students</h2>

            {/* Department */}
            <select
              className="border p-2 rounded w-full mb-3"
              value={tempFilters.department}
              onChange={(e) => setTempFilters({ ...tempFilters, department: e.target.value })}
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
            </select>

            {/* Semester */}
            <select
              className="border p-2 rounded w-full mb-3"
              value={tempFilters.semester}
              onChange={(e) => setTempFilters({ ...tempFilters, semester: e.target.value })}
            >
              <option value="">All Semesters</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>

            {/* Class */}
            <select
              className="border p-2 rounded w-full mb-3"
              value={tempFilters.class}
              onChange={(e) => setTempFilters({ ...tempFilters, class: e.target.value })}
            >
              <option value="">All Classes</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>

            {/* Apply button */}
            <button
              className="bg-blue-500 text-white p-2 rounded w-full mb-2"
              onClick={() => {
                setFilters(tempFilters);
                setFilterOpen(false);
              }}
            >
              Apply
            </button>

            {/* Deselect / Reset options */}
            <div className="flex gap-2 mb-2">
              <button
                className="flex-1 bg-gray-100 p-2 rounded"
                onClick={() => setTempFilters({ ...tempFilters, department: "" })}
              >
                Deselect Dept
              </button>
              <button
                className="flex-1 bg-gray-100 p-2 rounded"
                onClick={() => setTempFilters({ ...tempFilters, semester: "" })}
              >
                Deselect Sem
              </button>
              <button
                className="flex-1 bg-gray-100 p-2 rounded"
                onClick={() => setTempFilters({ ...tempFilters, class: "" })}
              >
                Deselect Class
              </button>
            </div>

            {/* Reset All */}
            <button
              className="bg-gray-200 p-2 rounded w-full mb-2"
              onClick={() => {
                setTempFilters({ department: "", semester: "", class: "" });
                setFilters({ department: "", semester: "", class: "" });
              }}
            >
              Reset All
            </button>

            <button className="absolute top-4 right-4" onClick={() => setFilterOpen(false)}>
              <Image src="/close.png" width={16} height={16} alt="close" />
            </button>
          </div>
        </div>
      )}

      {/* SORT MODAL */}
      {sortOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-80 p-6 rounded relative">
            <h2 className="text-lg font-semibold mb-4">Sort Students</h2>

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

            <button className="absolute top-4 right-4" onClick={() => setSortOpen(false)}>
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
