import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { departmentsData } from "@/lib/roushaniData.js";
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
  const renderRow = (item) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm transition-all hover:bg-[#E8F1FF]"
    >
      {/* Department Name */}
      <td className="p-4 font-medium text-blue-600 hover:underline">
        <Link href={`/list/departments/${item.id}`}>
          {item.name}
        </Link>
      </td>

      <td className="hidden md:table-cell">{item.code}</td>
      <td className="hidden md:table-cell">{item.hod}</td>
      <td className="hidden md:table-cell">{item.facultyCount}</td>
      <td className="hidden md:table-cell">{item.studentCount}</td>

      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="department" type="update" data={item} />
              <FormModal table="department" type="delete" id={item.id} />
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

          {/* SEARCH BAR */}
          <div className="w-full md:w-64">
            <TableSearch placeholder="Search department..." />
          </div>

          {/* FILTER, SORT, ADD */}
          <div className="flex items-center gap-3">
            {/* FILTER */}
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FAE27C] hover:bg-[#F7D85A] transition cursor-pointer">
              <Image src="/filter.png" alt="" width={16} height={16} />
            </button>

            {/* SORT */}
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FAE27C] hover:bg-[#F7D85A] transition cursor-pointer">
              <Image src="/sort.png" alt="" width={16} height={16} />
            </button>

            {/* ADD NEW */}
            {role === "admin" && (
              <FormModal table="department" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <Table columns={columns} renderRow={renderRow} data={departmentsData} />
      </div>

      {/* PAGINATION */}
      <div className="mt-6">
        <Pagination />
      </div>
    </div>
  );
};

export default DepartmentListPage;
