"use client";

import { useState, useEffect } from "react";
import { showToast } from "@/lib/toast";
import { apiService } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MonthlyAttendancePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeDaysInput, setActiveDaysInput] = useState("");
  const [editingActiveDays, setEditingActiveDays] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await apiService.getMyAssignedCourses();
      const assignedCourses = response.data?.assignedCourses || [];
      setCourses(assignedCourses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      showToast.error("Failed to load courses");
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setAttendance(null);
  };

  const loadAttendance = async () => {
    if (!selectedCourse) {
      showToast.error("Please select a course");
      return;
    }

    setLoading(true);
    try {
      const params = {
        courseId: selectedCourse.courseId._id,
        semester: selectedCourse.semester,
        section: selectedCourse.section || '',
        batch: selectedCourse.batch || '',
        month: selectedMonth,
        year: selectedYear
      };

      const response = await apiService.getMonthlyAttendance(params);
      const attendanceData = response.data?.attendance;
      setAttendance(attendanceData);
      setActiveDaysInput(attendanceData.totalActiveDays.toString());
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      showToast.error(error.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateActiveDays = async () => {
    const days = parseInt(activeDaysInput);
    if (isNaN(days) || days < 0) {
      showToast.error("Please enter a valid number of active days");
      return;
    }

    try {
      const response = await apiService.updateActiveDays(attendance._id, days);
      setAttendance(response.data?.attendance);
      setEditingActiveDays(false);
      showToast.success("Active days updated successfully");
    } catch (error) {
      console.error("Failed to update active days:", error);
      showToast.error(error.response?.data?.message || "Failed to update active days");
    }
  };

  const handleIncrementAttendance = async (studentId, currentDays) => {
    if (attendance.totalActiveDays === 0) {
      showToast.error("Please set total active days first");
      return;
    }

    if (currentDays >= attendance.totalActiveDays) {
      showToast.error("Days present cannot exceed total active days");
      return;
    }

    try {
      const response = await apiService.updateStudentAttendance(
        attendance._id,
        studentId,
        currentDays + 1
      );
      setAttendance(response.data?.attendance);
    } catch (error) {
      console.error("Failed to update attendance:", error);
      showToast.error(error.response?.data?.message || "Failed to update attendance");
    }
  };

  const handleDecrementAttendance = async (studentId, currentDays) => {
    if (currentDays <= 0) {
      return;
    }

    try {
      const response = await apiService.updateStudentAttendance(
        attendance._id,
        studentId,
        currentDays - 1
      );
      setAttendance(response.data?.attendance);
    } catch (error) {
      console.error("Failed to update attendance:", error);
      showToast.error(error.response?.data?.message || "Failed to update attendance");
    }
  };

  const handleDirectInput = async (studentId, value) => {
    const days = parseInt(value);
    if (isNaN(days) || days < 0) {
      return;
    }

    if (days > attendance.totalActiveDays) {
      showToast.error("Days present cannot exceed total active days");
      return;
    }

    try {
      const response = await apiService.updateStudentAttendance(
        attendance._id,
        studentId,
        days
      );
      setAttendance(response.data?.attendance);
    } catch (error) {
      console.error("Failed to update attendance:", error);
      showToast.error(error.response?.data?.message || "Failed to update attendance");
    }
  };

  const handleFinalizeAttendance = async () => {
    if (!confirm("Are you sure you want to finalize this attendance? You won't be able to edit it after finalization.")) {
      return;
    }

    try {
      const response = await apiService.finalizeMonthlyAttendance(attendance._id);
      setAttendance(response.data?.attendance);
      showToast.success("Attendance finalized successfully");
    } catch (error) {
      console.error("Failed to finalize attendance:", error);
      showToast.error(error.response?.data?.message || "Failed to finalize attendance");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Monthly Attendance Management</h1>
        <p className="text-gray-600">Track and manage student attendance on a monthly basis with automatic percentage calculations.</p>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">📋 How to use:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>Select a course, month, and year from the dropdowns below</li>
          <li>Click "Load Attendance" to fetch or create the attendance record</li>
          <li><strong>First, set the Total Active Days</strong> for the selected month</li>
          <li>Use the + and - buttons or type directly to mark student attendance</li>
          <li>Attendance percentage is calculated automatically</li>
          <li>Click "Finalize Attendance" when done to lock the record</li>
        </ol>
      </div>

      {/* Course Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Course & Month</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Course</label>
            <select
              value={selectedCourse ? JSON.stringify(selectedCourse) : ""}
              onChange={(e) => handleCourseSelect(e.target.value ? JSON.parse(e.target.value) : null)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Course</option>
              {courses.filter(c => c.isActive).map((course, idx) => (
                <option key={idx} value={JSON.stringify(course)}>
                  {course.courseId?.name} (Sem {course.semester}
                  {course.section && `, Sec ${course.section}`}
                  {course.batch && `, Batch ${course.batch}`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              {MONTHS.map((month, idx) => (
                <option key={idx} value={idx + 1}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadAttendance}
              disabled={!selectedCourse || loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Load Attendance"}
            </button>
          </div>
        </div>

        {selectedCourse && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm">
              <span className="font-medium">Selected:</span> {selectedCourse.courseId?.name} ({selectedCourse.courseId?.code})
              - Semester {selectedCourse.semester}
              {selectedCourse.section && ` - Section ${selectedCourse.section}`}
              {selectedCourse.batch && ` - Batch ${selectedCourse.batch}`}
            </p>
          </div>
        )}
      </div>

      {/* Attendance Management */}
      {attendance && (
        <div className="bg-white rounded-lg shadow p-6">
          {/* Active Days Section - More Prominent */}
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-bold text-xl mb-2 text-blue-900">
                  📅 Total Active Days: <span className="text-2xl">{attendance.totalActiveDays}</span>
                </h3>
                <p className="text-sm text-gray-700 font-medium">
                  {MONTHS[selectedMonth - 1]} {selectedYear}
                </p>
                {attendance.totalActiveDays === 0 && (
                  <p className="text-red-600 text-sm mt-2 font-semibold">
                    ⚠️ Please set the total active days before marking attendance!
                  </p>
                )}
              </div>
              
              {!attendance.isFinalized && (
                <div className="flex items-center gap-2">
                  {editingActiveDays ? (
                    <>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Enter Active Days:</label>
                        <input
                          type="number"
                          min="0"
                          value={activeDaysInput}
                          onChange={(e) => setActiveDaysInput(e.target.value)}
                          placeholder="e.g., 25"
                          className="w-28 border-2 border-blue-400 rounded px-3 py-2 text-lg font-semibold focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1 mt-5">
                        <button
                          onClick={handleUpdateActiveDays}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingActiveDays(false);
                            setActiveDaysInput(attendance.totalActiveDays.toString());
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingActiveDays(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {attendance.totalActiveDays === 0 ? "➕ Set Active Days" : "✏️ Edit Active Days"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          {attendance.isFinalized && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              ✓ This attendance has been finalized and cannot be edited.
            </div>
          )}

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolment No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Days Present</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance %</th>
                  {!attendance.isFinalized && (
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendance.students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{student.rollNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{student.enrolmentNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={student.studentId?.imageUrl || "/avatar.png"}
                          alt={student.name}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <span className="text-sm font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {!attendance.isFinalized ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={attendance.totalActiveDays}
                            value={student.daysPresent}
                            onChange={(e) => handleDirectInput(student.studentId._id, e.target.value)}
                            disabled={attendance.totalActiveDays === 0}
                            className="w-16 border-2 border-blue-300 rounded px-2 py-1 text-center font-bold text-lg disabled:bg-gray-100"
                          />
                          <span className="text-sm text-gray-500 font-medium">/ {attendance.totalActiveDays}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-sm font-semibold">{student.daysPresent}</span>
                          <span className="text-sm text-gray-500"> / {attendance.totalActiveDays}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        student.percentage >= 75 ? 'bg-green-100 text-green-800' :
                        student.percentage >= 65 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.percentage.toFixed(2)}%
                      </span>
                    </td>
                    {!attendance.isFinalized && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleDecrementAttendance(student.studentId._id, student.daysPresent)}
                            disabled={student.daysPresent <= 0 || attendance.totalActiveDays === 0}
                            title="Decrease attendance"
                            className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-bold text-xl shadow-md hover:shadow-lg transition-all"
                          >
                            −
                          </button>
                          <button
                            onClick={() => handleIncrementAttendance(student.studentId._id, student.daysPresent)}
                            disabled={student.daysPresent >= attendance.totalActiveDays || attendance.totalActiveDays === 0}
                            title="Increase attendance"
                            className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-bold text-xl shadow-md hover:shadow-lg transition-all"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Finalize Button */}
          {!attendance.isFinalized && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <p><strong>Total Students:</strong> {attendance.students.length}</p>
                <p><strong>Average Attendance:</strong> {
                  attendance.students.length > 0 
                    ? (attendance.students.reduce((sum, s) => sum + s.percentage, 0) / attendance.students.length).toFixed(2)
                    : 0
                }%</p>
              </div>
              <button
                onClick={handleFinalizeAttendance}
                disabled={attendance.totalActiveDays === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                🔒 Finalize Attendance
              </button>
            </div>
          )}

          {/* Summary for finalized */}
          {attendance.isFinalized && (
            <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 font-semibold">✓ This attendance has been finalized</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Total Students: {attendance.students.length} | 
                    Average Attendance: {
                      attendance.students.length > 0 
                        ? (attendance.students.reduce((sum, s) => sum + s.percentage, 0) / attendance.students.length).toFixed(2)
                        : 0
                    }%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
