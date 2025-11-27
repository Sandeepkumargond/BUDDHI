"use client";

import { useState, useMemo, useEffect } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiService } from '@/lib/api';
import { showToast } from '@/lib/toast';
import BuddhiDonutChart from "@/components/BuddhiDonutChart";
import BuddhiTrendChart from "@/components/BuddhiTrendChart";
import DonutProgress from "@/components/DonutProgress";

const columns = [
  { header: "No", accessor: "no" },
  { header: "Student", accessor: "student" },
  { header: "Roll No", accessor: "rollNo", className: "hidden md:table-cell" },
  { header: "Class", accessor: "class", className: "hidden lg:table-cell" },
  { header: "Attendance", accessor: "attendance", className: "hidden lg:table-cell" },
  { header: "CGPA", accessor: "cgpa", className: "hidden lg:table-cell" },
  { header: "Fees", accessor: "fees", className: "hidden lg:table-cell" },
  { header: "Contact", accessor: "contact", className: "hidden xl:table-cell" },
  { header: "Status", accessor: "status" },
  { header: "Actions", accessor: "action" },
];

export default function StudentListPage() {
  const { role } = useAuth();

  /* -------------------------
     STATE — Real Students
  -------------------------- */
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  
  // BUDDHI Status stats
  const [statusStats, setStatusStats] = useState({
    atRisk: 0,
    onTheVerge: 0,
    normal: 0
  });

  // Batch data
  const [batches, setBatches] = useState([]);

  /* ---------------------------------
     FETCH STUDENTS FROM BACKEND
  ---------------------------------- */
  useEffect(() => {
    async function fetchStudents() {
      try {
        let data;
        
        if (role === "admin") {
          const res = await apiService.adminListStudents();
          data = res;
        } else if (role === "subadmin") {
          const res = await apiService.subAdminListStudents();
          data = res;
        } else {
          console.error("Unauthorized role for student list");
          return;
        }

        if (!data || !data.data) {
          console.error("Error fetching students:", data?.message || "No data returned");
          return;
        }

        const studentList = data.data.students || [];
        setStudents(studentList);

        // Calculate BUDDHI status distribution (use 50 as default if buddhiScore is missing)
        const atRisk = studentList.filter(s => (s.buddhiScore || 50) < 40).length;
        const onTheVerge = studentList.filter(s => {
          const score = s.buddhiScore || 50;
          return score >= 40 && score < 60;
        }).length;
        const normal = studentList.filter(s => (s.buddhiScore || 50) >= 60).length;
        
        setStatusStats({ atRisk, onTheVerge, normal });

        // Extract unique batches
        const uniqueBatches = [...new Set(studentList.map(s => s.batch).filter(Boolean))];
        const batchData = uniqueBatches.map(batch => {
          const batchStudents = studentList.filter(s => s.batch === batch);
          return {
            year: batch,
            count: batchStudents.length,
            atRisk: batchStudents.filter(s => (s.buddhiScore || 50) < 40).length,
            onTheVerge: batchStudents.filter(s => {
              const score = s.buddhiScore || 50;
              return score >= 40 && score < 60;
            }).length,
            normal: batchStudents.filter(s => (s.buddhiScore || 50) >= 60).length,
          };
        }).sort((a, b) => b.year.localeCompare(a.year));
        
        setBatches(batchData);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (role) fetchStudents();
  }, [role]);


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
      .filter((s) => selectedBatch ? s.batch === selectedBatch : true)
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
  }, [students, filters, searchTerm, selectedBatch]);

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
    showToast.error("Deletion feature coming soon");
  };


  /* ----------------------------
     HELPER: Get Status Badge
  ----------------------------- */
  const getStatusBadge = (score) => {
    if (score < 40) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">At-risk of dropping out</span>;
    } else if (score < 60) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">On the verge</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Normal</span>;
    }
  };

  /* ----------------------------
        TABLE ROW UI
  ----------------------------- */
  const renderRow = (item, index) => {
    const buddhiScore = item.buddhiScore || 50; // Default if not available
    const attendance = item.attendance || 0;
    const cgpa = item.cgpa || 0;
    const feesPaid = item.feesPaid !== undefined ? item.feesPaid : true;

    return (
      <tr key={item._id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-gray-50">
        <td className="p-3 text-center">{index + 1}</td>
        
        <td className="p-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {item.firstName} {item.lastName}
            </h3>
            <p className="text-xs text-gray-500">{item.enrollmentNo}</p>
          </div>
        </td>

        <td className="hidden md:table-cell p-3 font-medium">{item.rollNo}</td>
        
        <td className="hidden lg:table-cell p-3">
          <div className="text-xs">
            <div className="font-medium text-gray-900">{item.branch}</div>
            <div className="text-gray-500">Sem {item.semester}{item.section ? ` - ${item.section}` : ''}</div>
          </div>
        </td>

        <td className="hidden lg:table-cell p-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  attendance >= 75 ? 'bg-green-500' : attendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${attendance}%` }}
              />
            </div>
            <span className="text-xs font-medium">{attendance}%</span>
          </div>
        </td>

        <td className="hidden lg:table-cell p-3 font-medium">{cgpa.toFixed(2)}</td>

        <td className="hidden lg:table-cell p-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded ${
            feesPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {feesPaid ? 'Paid' : 'Not Paid'}
          </span>
        </td>

        <td className="hidden xl:table-cell p-3 text-xs text-gray-600">{item.mobile}</td>

        <td className="p-3">{getStatusBadge(buddhiScore)}</td>

        <td className="p-3">
          <div className="flex items-center gap-2">
            <Link href={`/admin_subadmin/students/${item._id}`}>
              <button className="w-7 h-7 bg-[#C3EBFA] rounded-full flex items-center justify-center hover:bg-[#A5D8F3]">
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
  };


  return (
    <div className="flex-1 p-4 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <Link href="/admin_subadmin/students/create">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#C3EBFA] hover:bg-[#A5D8F3] rounded-lg transition">
            <Image src="/create.png" width={16} height={16} alt="add" />
            <span className="font-medium">Add Student</span>
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* DASHBOARD CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Status Distribution Donuts */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Students</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <Image src="/moreDark.png" alt="" width={20} height={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* At-Risk */}
                <DonutProgress
                  size={112}
                  percentage={Math.round((statusStats.atRisk / (statusStats.atRisk + statusStats.onTheVerge + statusStats.normal) * 100) || 0)}
                  label="at-risk of dropping out"
                  count={statusStats.atRisk}
                />

                {/* On the Verge */}
                <DonutProgress
                  size={112}
                  percentage={Math.round((statusStats.onTheVerge / (statusStats.atRisk + statusStats.onTheVerge + statusStats.normal) * 100) || 0)}
                  label="on the verge"
                  count={statusStats.onTheVerge}
                />

                {/* Normal */}
                <DonutProgress
                  size={112}
                  percentage={Math.round((statusStats.normal / (statusStats.atRisk + statusStats.onTheVerge + statusStats.normal) * 100) || 0)}
                  label="normal"
                  count={statusStats.normal}
                />
              </div>
            </div>

            {/* RIGHT: Semester-wise Trend */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Semester Wise</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <Image src="/moreDark.png" alt="" width={20} height={20} />
                </button>
              </div>
              <div className="h-64">
                <BuddhiTrendChart />
              </div>
            </div>
          </div>

          {/* BATCH SELECTION */}
          {batches.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Batch</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <button
                  onClick={() => setSelectedBatch(null)}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedBatch === null
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">All</div>
                    <div className="text-sm text-gray-500 mt-1">{students.length} students</div>
                  </div>
                </button>

                {batches.map((batch) => (
                  <button
                    key={batch.year}
                    onClick={() => setSelectedBatch(batch.year)}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedBatch === batch.year
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{batch.year}</div>
                      <div className="text-sm text-gray-500 mt-1">{batch.count} students</div>
                      <div className="flex justify-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" title={`${batch.atRisk} at-risk`} />
                        <div className="w-2 h-2 rounded-full bg-yellow-500" title={`${batch.onTheVerge} on verge`} />
                        <div className="w-2 h-2 rounded-full bg-green-500" title={`${batch.normal} normal`} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ALL STUDENTS LIST */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Students List
                  {selectedBatch && ` - Batch ${selectedBatch}`}
                </h2>

                <div className="flex flex-wrap items-center gap-3">
                  <TableSearch onSearch={handleSearch} />

                  {/* Department Filter */}
                  <select
                    className="border border-gray-300 px-3 py-2 rounded-lg text-sm"
                    value={filters.department}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, department: e.target.value }))
                    }
                  >
                    <option value="">All Departments</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                  </select>

                  {/* Semester Filter */}
                  <select
                    className="border border-gray-300 px-3 py-2 rounded-lg text-sm"
                    value={filters.semester}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, semester: e.target.value }))
                    }
                  >
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>

                  {/* Reset */}
                  <button
                    onClick={() => {
                      setFilters({ department: "", semester: "", class: "" });
                      setSearchTerm("");
                      setSelectedBatch(null);
                    }}
                    className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table columns={columns} renderRow={renderRow} data={sorted} />
            </div>

            <div className="p-4 border-t">
              <Pagination />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
