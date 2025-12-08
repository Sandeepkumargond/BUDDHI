"use client";

import { useState } from "react";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { departmentsData as allDepartments } from "@/lib/roushaniData.js";
import { role } from "@/lib/data";

const columns = [
  { header: "Department Name", accessor: "name" },
  { header: "Code", accessor: "code", className: "hidden md:table-cell" },
  { header: "HOD", accessor: "hod", className: "hidden md:table-cell" },
  { header: "Faculty", accessor: "facultyCount", className: "hidden md:table-cell" },
  { header: "Students", accessor: "studentCount", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "action" },
];

const DepartmentListPage = () => {
  const [departments, setDepartments] = useState(allDepartments);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState(null); // null / Active / In-Active
  const [sortAsc, setSortAsc] = useState(true);

  /* -----------------------------
        DELETE HANDLER
  ------------------------------*/
  const handleDelete = (id) => {
    const ok = window.confirm("Are you sure you want to delete this Department?");
    if (!ok) return;

    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  /* -----------------------------
        SEARCH HANDLER
  ------------------------------*/
  const filtered = departments.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterActive === null ? true : d.status === filterActive;

    return matchesSearch && matchesFilter;
  });

  /* -----------------------------
        SORT HANDLER
  ------------------------------*/
  const sortedData = [...filtered].sort((a, b) =>
    sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );

  /* -----------------------------
        ROW RENDERER
  ------------------------------*/
  const renderRow = (item) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm transition-all hover:bg-[#E8F1FF]"
    >
      <td className="p-4 font-medium text-blue-600 hover:underline">
        <Link href={`/admin/departments/${item.id}`}>{item.name}</Link>
      </td>

      <td className="hidden md:table-cell">{item.code}</td>
      <td className="hidden md:table-cell">{item.hod}</td>
      <td className="hidden md:table-cell">{item.facultyCount}</td>
      <td className="hidden md:table-cell">{item.studentCount}</td>

      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              {/* EDIT → route page */}
              <Link
                href={`/admin/departments/${item.id}/edit`}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#C3EBFA] hover:bg-[#A8DBF2] transition"
              >
                <Image src="/update.png" alt="edit" width={14} height={14} />
              </Link>

              {/* DELETE → confirm() */}
              <button
                onClick={() => handleDelete(item.id)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#CFCEFF] hover:bg-[#BEBBFF] transition"
              >
                <Image src="/delete.png" alt="delete" width={14} height={14} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex-1 m-4 mt-0 border border-gray-100">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-700">
          Department Management
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* SEARCH */}
          <div className="w-full md:w-64">
            <TableSearch
              placeholder="Search department..."
              onSearch={(value) => setSearch(value)}
            />
          </div>

          {/* FILTER • SORT • ADD */}
          <div className="flex items-center gap-3">
            {/* FILTER */}
            <button
              onClick={() =>
                setFilterActive((prev) =>
                  prev === "Active" ? "In-Active" : prev === "In-Active" ? null : "Active"
                )
              }
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FAE27C] hover:bg-[#F7D85A] transition cursor-pointer"
            >
              <Image src="/filter.png" alt="" width={16} height={16} />
            </button>

            {/* SORT */}
            <button
              onClick={() => setSortAsc((prev) => !prev)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FAE27C] hover:bg-[#F7D85A] transition cursor-pointer"
            >
              <Image src="/sort.png" alt="" width={16} height={16} />
            </button>

            {/* ADD NEW */}
            {role === "admin" && (
              <Link
                href="/admin/departments/create"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#C3EBFA] hover:bg-[#A8DBF2] transition cursor-pointer"
              >
                <Image src="/create.png" alt="add" width={16} height={16} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <Table columns={columns} renderRow={renderRow} data={sortedData} />
      </div>

      <div className="mt-6">
        <Pagination />
      </div>
    </div>
  );
};

export default DepartmentListPage;
