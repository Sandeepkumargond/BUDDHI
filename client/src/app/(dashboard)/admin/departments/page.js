"use client";

import { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { apiService } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";

const columns = [
  { header: "Department Name", accessor: "name" },
  { header: "Code", accessor: "code", className: "hidden md:table-cell" },
  { header: "HOD", accessor: "hod", className: "hidden md:table-cell" },
  { header: "Faculty", accessor: "facultyCount", className: "hidden md:table-cell" },
  { header: "Students", accessor: "studentCount", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "action" },
];

const DepartmentListPage = () => {
  const { role } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState(null); // null / Active / In-Active
  const [sortAsc, setSortAsc] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    established: new Date().getFullYear(),
    status: "Active"
  });

  /* -----------------------------
        FETCH DEPARTMENTS
  ------------------------------*/
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiService.adminListDepartments();
      if (response.success) {
        const depts = response.data.departments.map(dept => ({
          id: dept._id,
          code: dept.code,
          name: dept.name,
          description: dept.description,
          hod: dept.hod ? `${dept.hod.firstName} ${dept.hod.lastName}` : "Not Assigned",
          hodId: dept.hod?._id,
          established: dept.established,
          status: dept.status || "Active",
          facultyCount: 0,
          studentCount: 0
        }));
        
        // Fetch counts for each department
        const deptsWithCounts = await Promise.all(
          depts.map(async (dept) => {
            try {
              const detailResponse = await apiService.adminGetDepartmentByCode(dept.code);
              if (detailResponse.success) {
                return {
                  ...dept,
                  facultyCount: detailResponse.data.stats.facultyCount || 0,
                  studentCount: detailResponse.data.stats.studentCount || 0
                };
              }
            } catch (err) {
              console.error(`Error fetching stats for ${dept.code}:`, err);
            }
            return dept;
          })
        );
        
        setDepartments(deptsWithCounts);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      showToast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
        ADD DEPARTMENT
  ------------------------------*/
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.request('/admin/departments', {
        method: 'POST',
        body: formData
      });
      
      if (response.success) {
        showToast.success("Department added successfully");
        setShowAddModal(false);
        setFormData({
          code: "",
          name: "",
          description: "",
          established: new Date().getFullYear(),
          status: "Active"
        });
        fetchDepartments();
      }
    } catch (error) {
      console.error("Error adding department:", error);
      showToast.error(error.message || "Failed to add department");
    }
  };

  /* -----------------------------
        EDIT DEPARTMENT
  ------------------------------*/
  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      description: dept.description || "",
      established: dept.established || new Date().getFullYear(),
      status: dept.status || "Active"
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.request(`/admin/departments/${editingDept.code}`, {
        method: 'PATCH',
        body: formData
      });
      
      if (response.success) {
        showToast.success("Department updated successfully");
        setShowEditModal(false);
        setEditingDept(null);
        setFormData({
          code: "",
          name: "",
          description: "",
          established: new Date().getFullYear(),
          status: "Active"
        });
        fetchDepartments();
      }
    } catch (error) {
      console.error("Error updating department:", error);
      showToast.error(error.message || "Failed to update department");
    }
  };

  /* -----------------------------
        DELETE HANDLER
  ------------------------------*/
  const handleDelete = async (dept) => {
    const ok = window.confirm(`Are you sure you want to delete ${dept.name} department?`);
    if (!ok) return;

    try {
      const response = await apiService.request(`/admin/departments/${dept.code}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        showToast.success("Department deleted successfully");
        fetchDepartments();
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      showToast.error(error.message || "Failed to delete department");
    }
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
      className="border-b border-gray-200 even:bg-slate-50 text-sm transition-all hover:bg-[#E8F1FF] cursor-pointer"
    >
      <td className="p-4 font-medium text-gray-800">
        <Link href={`/admin/departments/${item.code}`} className="block">
          {item.name}
        </Link>
      </td>

      <td className="hidden md:table-cell">
        <Link href={`/admin/departments/${item.code}`} className="block">
          {item.code}
        </Link>
      </td>
      <td className="hidden md:table-cell">
        <Link href={`/admin/departments/${item.code}`} className="block">
          {item.hod}
        </Link>
      </td>
      <td className="hidden md:table-cell">
        <Link href={`/admin/departments/${item.code}`} className="block">
          {item.facultyCount}
        </Link>
      </td>
      <td className="hidden md:table-cell">
        <Link href={`/admin/departments/${item.code}`} className="block">
          {item.studentCount}
        </Link>
      </td>

      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              {/* EDIT */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEdit(item);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#C3EBFA] hover:bg-[#A8DBF2] transition"
                title="Edit Department"
              >
                <Image src="/update.png" alt="edit" width={14} height={14} />
              </button>

              {/* DELETE */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(item);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-red-200 hover:bg-red-300 transition"
                title="Delete Department"
              >
                <Image src="/delete.png" alt="delete" width={14} height={14} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm flex-1 m-4 mt-0 border border-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading departments...</p>
          </div>
        </div>
      </div>
    );
  }

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
              <button
                onClick={() => setShowAddModal(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#C3EBFA] hover:bg-[#A8DBF2] transition cursor-pointer"
                title="Add Department"
              >
                <Image src="/create.png" alt="add" width={16} height={16} />
              </button>
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

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Department</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CSE, ECE, ME"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Computer Science & Engineering"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Established Year
                </label>
                <input
                  type="number"
                  value={formData.established}
                  onChange={(e) => setFormData({...formData, established: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="In-Active">In-Active</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#C3EBFA] text-gray-600 px-4 py-2 rounded-lg hover:bg-[#A8DBF2] transition"
                >
                  Add Department
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      code: "",
                      name: "",
                      description: "",
                      established: new Date().getFullYear(),
                      status: "Active"
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingDept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Department</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Established Year
                </label>
                <input
                  type="number"
                  value={formData.established}
                  onChange={(e) => setFormData({...formData, established: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="In-Active">In-Active</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#C3EBFA] text-gray-600 px-4 py-2 rounded-lg hover:bg-[#A8DBF2] transition"
                >
                  Update Department
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDept(null);
                    setFormData({
                      code: "",
                      name: "",
                      description: "",
                      established: new Date().getFullYear(),
                      status: "Active"
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentListPage;
