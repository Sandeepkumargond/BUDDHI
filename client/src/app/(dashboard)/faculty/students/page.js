"use client";

import { useState, useMemo, useEffect } from "react";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiService } from '@/lib/api';
import { showToast } from '@/lib/toast';
import BuddhiTrendChart from "@/components/BuddhiTrendChart";
import ProtectedRoute from "@/components/ProtectedRoute";
import DonutProgress from "@/components/DonutProgress";

const columns = [
  { header: "No", accessor: "no" },
  { header: "Student", accessor: "student" },
  { header: "Roll No", accessor: "rollNo", className: "hidden md:table-cell" },
  { header: "Class", accessor: "class", className: "hidden lg:table-cell" },
  { header: "Attendance", accessor: "attendance", className: "hidden lg:table-cell" },
  { header: "CGPA", accessor: "cgpa", className: "hidden lg:table-cell" },
  { header: "Status", accessor: "status" },
];

function FacultyStudentsPage() {
  const { role, user } = useAuth();

  /* -------------------------
     STATE
  -------------------------- */
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  
  // BUDDHI Status stats
  const [statusStats, setStatusStats] = useState({
    atRisk: 0,
    onTheVerge: 0,
    normal: 0
  });

  // Faculty's assigned classes
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);

  /* ---------------------------------
     FETCH ASSIGNED CLASSES & ALL STUDENTS
  ---------------------------------- */
  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Fetch assigned courses using the same method as attendance
        const response = await apiService.facultyListMyCourses();
        const courses = response?.data?.courses || [];
        setAssignedClasses(courses);

        // Fetch all students across all courses for overall stats
        let allStudentsList = [];
        for (const course of courses) {
          try {
            const studentsRes = await apiService.facultyGetCourseStudents(
              course.course._id,
              {
                semester: course.semester,
                section: course.section || '',
                batch: course.batch || ''
              }
            );
            const courseStudents = studentsRes?.data?.students || [];
            allStudentsList = [...allStudentsList, ...courseStudents];
          } catch (err) {
            console.error(`Failed to fetch students for course ${course.course.code}:`, err);
          }
        }
        
        // Remove duplicates based on student _id
        const uniqueStudents = Array.from(
          new Map(allStudentsList.map(s => [s._id, s])).values()
        );
        
        // Calculate overall BUDDHI status distribution
        const atRisk = uniqueStudents.filter(s => (s.buddhiScore || 50) < 40).length;
        const onTheVerge = uniqueStudents.filter(s => {
          const score = s.buddhiScore || 50;
          return score >= 40 && score < 60;
        }).length;
        const normal = uniqueStudents.filter(s => (s.buddhiScore || 50) >= 60).length;
        
        setStatusStats({ atRisk, onTheVerge, normal });
      } catch (error) {
        console.error("Fetch data error:", error);
        showToast.error("Failed to load assigned courses");
      } finally {
        setClassesLoading(false);
      }
    }

    if (role === 'faculty') fetchInitialData();
  }, [role]);

  /* ---------------------------------
     FETCH STUDENTS FOR SELECTED CLASS
  ---------------------------------- */
  const loadStudentsForClass = async (courseData) => {
    setLoading(true);
    setSelectedClass(courseData);
    
    try {
      // Fetch students for the selected course using the same API as attendance
      const response = await apiService.facultyGetCourseStudents(
        courseData.course._id,
        {
          semester: courseData.semester,
          section: courseData.section || '',
          batch: courseData.batch || ''
        }
      );
      const studentList = response?.data?.students || [];
      setStudents(studentList);

      // Calculate BUDDHI status distribution for this class
      const atRisk = studentList.filter(s => (s.buddhiScore || 50) < 40).length;
      const onTheVerge = studentList.filter(s => {
        const score = s.buddhiScore || 50;
        return score >= 40 && score < 60;
      }).length;
      const normal = studentList.filter(s => (s.buddhiScore || 50) >= 60).length;
      
      setStatusStats({ atRisk, onTheVerge, normal });
      setStudentsLoaded(true);
    } catch (error) {
      console.error("Fetch students error:", error);
      showToast.error("Failed to load students for this course");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setStudents([]);
    setStudentsLoaded(false);
    setStatusStats({ atRisk: 0, onTheVerge: 0, normal: 0 });
  };

  /* ----------------------------
        FILTERS & SEARCH
  ----------------------------- */
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (term) => setSearchTerm(term);

  /* ----------------------------
      FILTERING
  ----------------------------- */
  const filtered = useMemo(() => {
    return students.filter((s) => {
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
  }, [students, searchTerm]);

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
    const buddhiScore = item.buddhiScore || 50;
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

        <td className="hidden lg:table-cell p-3 font-medium">{cgpa ? cgpa.toFixed(2) : '0.00'}</td>

        <td className="p-3">{getStatusBadge(buddhiScore)}</td>
      </tr>
    );
  };

  return (
    <div className="flex-1 p-4 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        {studentsLoaded && (
          <button
            onClick={handleBackToClasses}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            ← Back to Classes
          </button>
        )}
      </div>

      {classesLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : !studentsLoaded ? (
        // CLASS SELECTION VIEW
        <>
          {/* DASHBOARD CARDS - Overall Stats for All Students */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Status Distribution Donuts */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Overall Students Status</h2>
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
                <h2 className="text-lg font-semibold text-gray-900">Semester Wise Trend</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <Image src="/moreDark.png" alt="" width={20} height={20} />
                </button>
              </div>
              <div className="h-64">
                <BuddhiTrendChart />
              </div>
            </div>
          </div>

          {/* CLASS SELECTION CARDS */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Select a Class</h2>
              <p className="text-gray-600">Choose a class to view students and their BUDDHI status</p>
            </div>

            {assignedClasses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedClasses.map((courseData) => (
                  <button
                    key={courseData._id}
                    onClick={() => loadStudentsForClass(courseData)}
                    className="p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                  >
                    <div className="mb-3">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600">
                        {courseData.course.code}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{courseData.course.name}</p>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p><strong>Semester:</strong> {courseData.semester}</p>
                      <p><strong>Section:</strong> {courseData.section || 'All'}</p>
                      <p><strong>Batch:</strong> {courseData.batch || 'All'}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-medium">
                      View Students →
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg font-medium">No classes assigned</p>
                <p className="text-sm mt-2">Please contact admin to assign classes</p>
              </div>
            )}
          </div>
        </>
      ) : loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        // STUDENTS VIEW
        <>
          {/* DASHBOARD CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Status Distribution Donuts */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Students Status</h2>
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
                <h2 className="text-lg font-semibold text-gray-900">Semester Wise Trend</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <Image src="/moreDark.png" alt="" width={20} height={20} />
                </button>
              </div>
              <div className="h-64">
                <BuddhiTrendChart />
              </div>
            </div>
          </div>

          {/* Selected Class Info */}
          {selectedClass && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-xl text-gray-900">
                      {selectedClass.course.code}
                    </h3>
                    <span className="text-gray-400">|</span>
                    <h4 className="font-semibold text-lg text-gray-800">
                      {selectedClass.course.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <strong>Semester:</strong> {selectedClass.semester}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <strong>Section:</strong> {selectedClass.section || 'All'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <strong>Batch:</strong> {selectedClass.batch || 'All'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-bold text-gray-800">{students.length}</span>
                  <span className="text-sm text-gray-600">Students</span>
                </div>
              </div>
            </div>
          )}

          {/* STUDENTS LIST */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">Students List</h2>

                <div className="flex flex-wrap items-center gap-3">
                  <TableSearch onSearch={handleSearch} />

                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
                  >
                    Clear Search
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

export default function ProtectedFacultyStudentsPage() {
  return (
    <ProtectedRoute allowedRoles={["faculty"]}>
      <FacultyStudentsPage />
    </ProtectedRoute>
  );
}
