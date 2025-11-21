"use client";

import { useState, useMemo, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiService } from "@/lib/api";
import { showToast } from "@/lib/toast";

const StudentAttendance = () => {
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch monthly attendance
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedSemester) params.semester = selectedSemester;
        if (selectedMonth) params.month = selectedMonth;
        if (selectedYear) params.year = selectedYear;

        const response = await apiService.getMyMonthlyAttendance(params);
        setMonthlyAttendance(response.data?.attendance || []);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        showToast.error("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedSemester, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    if (monthlyAttendance.length === 0) {
      return {
        totalCourses: 0,
        avgAttendance: "0.00",
        totalPresent: 0,
        totalDays: 0,
        uniqueCourses: 0
      };
    }

    // Group records by course to count unique courses
    const courseGroups = {};
    monthlyAttendance.forEach(record => {
      const courseKey = record.course._id;
      if (!courseGroups[courseKey]) {
        courseGroups[courseKey] = {
          courseName: record.course.name,
          records: []
        };
      }
      courseGroups[courseKey].records.push(record);
    });

    const uniqueCourses = Object.keys(courseGroups).length;
    const totalPresent = monthlyAttendance.reduce((sum, record) => sum + record.daysPresent, 0);
    const totalDays = monthlyAttendance.reduce((sum, record) => sum + record.totalActiveDays, 0);
    
    // Calculate overall attendance percentage from total present/total days
    const avgAttendance = totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(2) : "0.00";

    return {
      totalCourses: monthlyAttendance.length,
      uniqueCourses,
      avgAttendance,
      totalPresent,
      totalDays
    };
  }, [monthlyAttendance]);

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Monthly Attendance</h1>
          <p className="text-gray-600">View your finalized monthly attendance for all courses</p>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Months</option>
                {MONTHS.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Attendance Records</p>
            <p className="text-3xl font-bold text-blue-900">{stats.totalCourses}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.uniqueCourses} unique course{stats.uniqueCourses !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Overall Attendance</p>
            <p className="text-3xl font-bold text-purple-900">{stats.avgAttendance}%</p>
            <p className="text-xs text-gray-500 mt-1">Across all records</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Present</p>
            <p className="text-3xl font-bold text-green-900">{stats.totalPresent}</p>
            <p className="text-xs text-gray-500 mt-1">Days attended</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Active Days</p>
            <p className="text-3xl font-bold text-orange-900">{stats.totalDays}</p>
            <p className="text-xs text-gray-500 mt-1">Total class days</p>
          </div>
          <div className="bg-cyan-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Days Missed</p>
            <p className="text-3xl font-bold text-cyan-900">{stats.totalDays - stats.totalPresent}</p>
            <p className="text-xs text-gray-500 mt-1">Absent days</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading attendance data...</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && monthlyAttendance.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-600">No finalized attendance records found</p>
            <p className="text-sm text-gray-500 mt-2">Attendance records will appear here once your faculty finalizes them</p>
          </div>
        )}

        {/* Attendance Records Grid */}
        {!loading && monthlyAttendance.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monthlyAttendance.map((record) => (
              <div key={record._id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border-t-4 border-blue-500">
                {/* Course Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-blue-600 mb-1">{record.course.name}</h2>
                    <p className="text-sm text-gray-500">{record.course.code}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Finalized</span>
                </div>

                {/* Faculty */}
                {record.faculty && (
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="text-gray-400">👨‍🏫 Faculty:</span> {record.faculty.name}
                  </p>
                )}

                {/* Period Info */}
                <p className="text-sm text-gray-600 mb-4">
                  <span className="text-gray-400">📅 Period:</span> {MONTHS[record.month - 1]} {record.year}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="text-gray-400">📚 Semester:</span> {record.semester} | Section: {record.section || 'N/A'} | Batch: {record.batch || 'N/A'}
                </p>

                {/* Attendance Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500 font-medium">Attendance</p>
                    <p className="text-2xl font-bold text-gray-900">{record.percentage.toFixed(0)}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        record.percentage < 60 ? 'bg-red-600' :
                        record.percentage < 75 ? 'bg-orange-400' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${record.percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Days Present</p>
                    <p className="text-xl font-bold text-green-600">{record.daysPresent}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Total Days</p>
                    <p className="text-xl font-bold text-blue-600">{record.totalActiveDays}</p>
                  </div>
                </div>

                {/* Status Badge */}
                {record.percentage < 75 && (
                  <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-center">
                    <p className="text-xs text-red-600 font-semibold">⚠️ Below 75% attendance</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default StudentAttendance;
