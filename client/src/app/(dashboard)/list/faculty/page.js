"use client"

import { useState } from "react"
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role, facultysData } from "@/lib/data";
import { departmentsData } from "@/lib/roushaniData.js";
import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "faculty ID",
    accessor: "facultyId",
    className: "hidden md:table-cell",
  },
  {
    header: "Departments",
    accessor: "Departments",
    className: "hidden md:table-cell",
  },
  {
    header: "Email",
    accessor: "classes",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const facultyListPage = () => {
  const [data, setData] = useState([...facultysData])
  const [selectedDept, setSelectedDept] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const handleDepartmentChange = (e) => {
    const code = e.target.value
    setSelectedDept(code)
    filterData(searchTerm, code)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    filterData(term, selectedDept)
  }

  const filterData = (searchTerm, departmentCode) => {
    let filtered = [...facultysData]

    // Filter by department
    if (departmentCode) {
      filtered = filtered.filter((f) => String(f.department) === String(departmentCode))
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((f) => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.facultyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.phone.includes(searchTerm) ||
        f.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setData(filtered)
  }
  const renderRow = (item) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#CFCEFF]Light"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.photo}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      </td> 
      <td className="hidden md:table-cell">{item.facultyId}</td>
      <td className="hidden md:table-cell">{item.department}</td>
      <td className="hidden md:table-cell">{item.email}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/faculty/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#C3EBFA]">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormModal table="faculty" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="hidden md:flex items-center gap-3">
          <h1 className="text-lg font-semibold">All Faculty</h1>
          <select
            value={selectedDept}
            onChange={handleDepartmentChange}
            className="text-sm border rounded px-2 py-1 bg-white"
            aria-label="Filter by department"
          >
            <option value="">All Departments</option>
            {departmentsData.map((d) => (
              <option key={d.id} value={d.code}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={handleSearch} />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormModal table="faculty" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default facultyListPage;
