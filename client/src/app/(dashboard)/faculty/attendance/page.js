"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/lib/toast";
import { apiService } from "@/lib/api";
import { getMyAssignedCourses } from "./utils/attendanceAPI";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AttendancePage() {
  const [classInfo, setClassInfo] = useState({
    courseId: "",
    courseCode: "",
    courseName: "",
    subject: "",
    semester: "",
    section: "",
    batch: ""
  });

  const [assignedCourses, setAssignedCourses] = useState([]);

  // Monthly attendance states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyAttendance, setMonthlyAttendance] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [activeDaysInput, setActiveDaysInput] = useState("");
  const [editingActiveDays, setEditingActiveDays] = useState(false);
  const [attendanceLoaded, setAttendanceLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceMode, setAttendanceMode] = useState("manual"); // 'manual' or 'bulk'
  const [excelFile, setExcelFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Fetch assigned courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getMyAssignedCourses();
        setAssignedCourses(courses);
        if (courses.length > 0) {
          const firstCourse = courses[0];
          setClassInfo(prev => ({
            ...prev,
            courseId: firstCourse.course._id,
            courseCode: firstCourse.course.code,
            courseName: firstCourse.course.name,
            subject: firstCourse.course.code,
            semester: firstCourse.semester,
            section: firstCourse.section,
            batch: firstCourse.batch
          }));
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        showToast.error('Failed to load assigned courses');
      }
    };
    fetchCourses();
  }, []);

  const handleCourseChange = (courseId) => {
    const course = assignedCourses.find(c => c.course._id === courseId);
    if (course) {
      setClassInfo(prev => ({
        ...prev,
        courseId: course.course._id,
        courseCode: course.course.code,
        courseName: course.course.name,
        subject: course.course.code,
        semester: course.semester,
        section: course.section,
        batch: course.batch
      }));
      // Reset attendance loaded state when course changes
      setAttendanceLoaded(false);
      setMonthlyAttendance(null);
    }
  };

  // Load monthly attendance when course, month, and year are selected
  const loadMonthlyAttendance = async () => {
    if (!classInfo.courseId) {
      showToast.error("Please select a course");
      return;
    }

    setMonthlyLoading(true);
    try {
      const params = {
        courseId: classInfo.courseId,
        semester: classInfo.semester,
        section: classInfo.section || '',
        batch: classInfo.batch || '',
        month: selectedMonth,
        year: selectedYear
      };


      const response = await apiService.getMonthlyAttendance(params);
      const attendanceData = response.data?.attendance;
      console.log("📥 Received attendance data:", {
        studentCount: attendanceData?.students?.length,
        course: attendanceData?.courseName,
        semester: attendanceData?.semester,
        section: attendanceData?.section,
        batch: attendanceData?.batch
      });
      setMonthlyAttendance(attendanceData);
      setActiveDaysInput(attendanceData.totalActiveDays.toString());
      setAttendanceLoaded(true);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      showToast.error(error.response?.data?.message || "Failed to load attendance");
    } finally {
      setMonthlyLoading(false);
    }
  };

  const handleUpdateActiveDays = async () => {
    const days = parseInt(activeDaysInput);
    if (isNaN(days) || days < 0) {
      showToast.error("Please enter a valid number of active days");
      return;
    }

    try {
      const response = await apiService.updateActiveDays(monthlyAttendance._id, days);
      setMonthlyAttendance(response.data?.attendance);
      setEditingActiveDays(false);
      showToast.success("Active days updated successfully");
    } catch (error) {
      console.error("Failed to update active days:", error);
      showToast.error(error.response?.data?.message || "Failed to update active days");
    }
  };

  const handleMarkPresent = async (studentId, currentDays) => {
    console.log("handleMarkPresent called with:", { studentId, currentDays, attendanceId: monthlyAttendance._id });
    
    if (monthlyAttendance.totalActiveDays === 0) {
      showToast.error("Please set total active days first");
      return;
    }

    if (currentDays >= monthlyAttendance.totalActiveDays) {
      showToast.error("Days present cannot exceed total active days");
      return;
    }

    try {
      const response = await apiService.updateStudentAttendance(
        monthlyAttendance._id,
        studentId,
        currentDays + 1
      );
      setMonthlyAttendance(response.data?.attendance);
    } catch (error) {
      console.error("Failed to update attendance:", error);
      showToast.error(error.response?.data?.message || "Failed to update attendance");
    }
  };

  const handleMarkAbsent = async (studentId, currentDays) => {
    if (currentDays <= 0) {
      showToast.error("Student already has 0 days present");
      return;
    }

    try {
      const response = await apiService.updateStudentAttendance(
        monthlyAttendance._id,
        studentId,
        currentDays - 1
      );
      setMonthlyAttendance(response.data?.attendance);
    } catch (error) {
      console.error("Failed to update attendance:", error);
      showToast.error(error.response?.data?.message || "Failed to update attendance");
    }
  };

  const handleMarkAllPresent = async () => {
    if (monthlyAttendance.totalActiveDays === 0) {
      showToast.error("Please set total active days first");
      return;
    }

    try {
      const updates = monthlyAttendance.students.map(s => ({
        studentId: s.studentId._id,
        daysPresent: Math.min(s.daysPresent + 1, monthlyAttendance.totalActiveDays)
      }));

      const response = await apiService.bulkUpdateAttendance(monthlyAttendance._id, updates);
      setMonthlyAttendance(response.data?.attendance);
      showToast.success("Marked all students present");
    } catch (error) {
      console.error("Failed to update attendance:", error);
      showToast.error(error.response?.data?.message || "Failed to mark all present");
    }
  };

  const handleMarkAllAbsent = async () => {
    try {
      const updates = monthlyAttendance.students.map(s => ({
        studentId: s.studentId._id,
        daysPresent: Math.max(s.daysPresent - 1, 0)
      }));

      const response = await apiService.bulkUpdateAttendance(monthlyAttendance._id, updates);
      setMonthlyAttendance(response.data?.attendance);
      showToast.success("Marked all students absent");
    } catch (error) {
      console.error("Failed to update attendance:", error);
      showToast.error(error.response?.data?.message || "Failed to mark all absent");
    }
  };

  const handleFinalizeAttendance = async () => {
    if (!confirm("Are you sure you want to finalize this attendance? You won't be able to edit it after finalization.")) {
      return;
    }

    try {
      const response = await apiService.finalizeMonthlyAttendance(monthlyAttendance._id);
      setMonthlyAttendance(response.data?.attendance);
      showToast.success("Attendance finalized successfully");
    } catch (error) {
      console.error("Failed to finalize attendance:", error);
      showToast.error(error.response?.data?.message || "Failed to finalize attendance");
    }
  };

  const handleUnfinalizeAttendance = async () => {
    if (!confirm("Are you sure you want to reopen this attendance for editing?")) {
      return;
    }

    try {
      const response = await apiService.unfinalizeMonthlyAttendance(monthlyAttendance._id);
      setMonthlyAttendance(response.data?.attendance);
      showToast.success("Attendance reopened for editing");
    } catch (error) {
      console.error("Failed to reopen attendance:", error);
      showToast.error(error.message || "Failed to reopen attendance");
    }
  };

  const handleRefreshStudents = async () => {
    if (!confirm("This will sync the student list with the database and add any missing students. Existing attendance data will be preserved. Continue?")) {
      return;
    }

    try {
      const response = await apiService.syncStudents(monthlyAttendance._id);
      setMonthlyAttendance(response.data?.attendance);
      showToast.success(response.message || "Student list refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh students:", error);
      showToast.error(error.response?.data?.message || "Failed to refresh student list");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        showToast.error("Please upload an Excel file (.xlsx or .xls)");
        return;
      }
      setExcelFile(file);
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      showToast.error("Please select an Excel file first");
      return;
    }

    setUploadLoading(true);
    try {
      // Import XLSX library dynamically
      const XLSX = await import('xlsx');
      
      // Read the file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with default empty values
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          console.log("📊 Excel Data Parsed:", jsonData.length, "rows");
          if (jsonData.length > 0) {
            console.log("📋 First row sample:", jsonData[0]);
            console.log("🔑 Column headers:", Object.keys(jsonData[0]));
          }

          if (jsonData.length === 0) {
            showToast.error("Excel file is empty");
            setUploadLoading(false);
            return;
          }

          // Process the Excel data
          const attendanceUpdates = [];
          const notFoundStudents = [];
          let processedCount = 0;
          
          for (const row of jsonData) {
            processedCount++;
            
            // Get roll number from first column (supports various column names)
            const rollNo = (
              row['Roll no'] || 
              row['Roll No'] || 
              row['RollNo'] || 
              row['Roll Number'] || 
              row['roll_no'] ||
              row['ROLL NO'] ||
              Object.values(row)[0] // Fallback to first column value
            )?.toString().trim();
            
            console.log(`Row ${processedCount}: Roll No = "${rollNo}"`);
            
            if (!rollNo) {
              console.log("⚠️ Skipping row - no roll number found");
              continue;
            }

            // Find the student in monthlyAttendance by roll number or enrollment number
            const student = monthlyAttendance.students.find(s => 
              (s.rollNo && s.rollNo.toString().trim() === rollNo) ||
              (s.enrolmentNo && s.enrolmentNo.toString().trim() === rollNo)
            );

            if (!student) {
              notFoundStudents.push(rollNo);
              console.warn(`❌ Student with roll/enrollment number ${rollNo} not found`);
              console.log("Available roll numbers:", monthlyAttendance.students.map(s => s.rollNo));
              continue;
            }

            console.log(`✅ Found student: ${student.name} (${student.rollNo})`);

            // Count P's (Present) in all day columns
            // Skip first 2 columns (Roll No and Student Name)
            let presentCount = 0;
            const keys = Object.keys(row);
            
            console.log(`Checking ${keys.length - 2} day columns for roll ${rollNo}...`);
            
            for (let i = 2; i < keys.length; i++) {
              const key = keys[i];
              const value = row[key]?.toString().trim().toUpperCase();
              
              // Count P as present
              if (value === 'P' || value === 'PRESENT') {
                presentCount++;
              }
            }

            console.log(`📊 Roll ${rollNo}: ${presentCount} days present out of ${keys.length - 2} days`);

            // Get student ID - handle both populated and non-populated cases
            let studentIdToUse;
            if (typeof student.studentId === 'object' && student.studentId !== null) {
              studentIdToUse = student.studentId._id;
            } else {
              studentIdToUse = student.studentId;
            }

            console.log(`Student ID for ${rollNo}:`, studentIdToUse);

            // Always add to updates (even if 0 present days)
            attendanceUpdates.push({
              studentId: studentIdToUse,
              daysPresent: presentCount
            });
          }

          console.log("📤 Attendance updates to send:", attendanceUpdates);

          console.log("📤 Attendance updates to send:", attendanceUpdates);

          if (attendanceUpdates.length === 0) {
            showToast.error("No valid attendance data found in Excel file");
            setUploadLoading(false);
            return;
          }

          // Show warning if some students were not found
          if (notFoundStudents.length > 0) {
            console.warn("Students not found:", notFoundStudents);
            showToast.warning(
              `${notFoundStudents.length} student(s) not found: ${notFoundStudents.slice(0, 3).join(', ')}${notFoundStudents.length > 3 ? '...' : ''}`
            );
          }

          console.log("🚀 Calling API with:", {
            attendanceId: monthlyAttendance._id,
            updatesCount: attendanceUpdates.length
          });

          // Send bulk update to backend
          const response = await apiService.bulkUpdateAttendance(
            monthlyAttendance._id,
            attendanceUpdates
          );

          console.log("✅ API Response:", response);

          if (response?.data?.attendance) {
            setMonthlyAttendance(response.data.attendance);
            showToast.success(`✅ Successfully updated attendance for ${attendanceUpdates.length} student(s)`);
          } else {
            console.error("Unexpected response format:", response);
            showToast.error("Attendance updated but response format unexpected");
          }
          
          setExcelFile(null);
          
          // Reset file input
          const fileInput = document.getElementById('excel-upload-input');
          if (fileInput) fileInput.value = '';
          
        } catch (parseError) {
          console.error("Error parsing Excel:", parseError);
          showToast.error("Failed to parse Excel file. Please check the format.");
        } finally {
          setUploadLoading(false);
        }
      };

      reader.onerror = () => {
        showToast.error("Failed to read file");
        setUploadLoading(false);
      };

      reader.readAsArrayBuffer(excelFile);

    } catch (error) {
      console.error("Failed to process Excel:", error);
      showToast.error("Failed to upload attendance");
      setUploadLoading(false);
    }
  };

  // Download example Excel template matching current active days
  const handleDownloadTemplate = async () => {
    try {
      const XLSX = await import('xlsx');
      const days = Math.max(1, monthlyAttendance?.totalActiveDays || 30);
      const headers = ['Roll no', 'Student Name', ...Array.from({ length: days }, (_, i) => `Day ${i + 1}`)];

      const makeDays = (marks) => {
        const arr = new Array(days).fill('');
        marks.forEach((m, idx) => { if (idx < arr.length) arr[idx] = m; });
        return arr;
      };

      const aoa = [
        headers,
        ['20230001', 'Sandeep K P', ...makeDays(['P', 'P', 'A'])],
        ['20230002', 'Aryan Bansal', ...makeDays(['P', 'P', 'P'])],
      ];

      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_template_${days}_days.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to generate template:', e);
      showToast.error('Failed to download template');
    }
  };

  return (
    <div className="p-6">
      {!attendanceLoaded ? (
        // Selection Screen - Choose Course, Month, Year
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Monthly Attendance</h1>
            <p className="text-gray-600">Select course and month to view and manage attendance</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6">Select Course & Period</h2>
            
            <div className="space-y-6">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Course *</label>
                {assignedCourses.length > 0 ? (
                  <select 
                    value={classInfo.courseId || ""} 
                    onChange={e => handleCourseChange(e.target.value)} 
                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  >
                    <option value="">Select Assigned Course</option>
                    {assignedCourses.map(ac => (
                      <option key={ac._id} value={ac.course._id}>
                        {ac.course.code} - {ac.course.name} (Sem {ac.semester}, Sec {ac.section || 'All'}, Batch {ac.batch || 'All'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
                    No courses assigned. Please contact admin.
                  </div>
                )}
              </div>

              {/* Selected Course Info */}
              {classInfo.courseId && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Selected:</strong> {classInfo.courseName} ({classInfo.courseCode})
                    <br />
                    <strong>Details:</strong> Semester {classInfo.semester} | Section {classInfo.section || 'All'} | Batch {classInfo.batch || 'All'}
                  </p>
                </div>
              )}

              {/* Month and Year Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Month *</label>
                  <select 
                    value={selectedMonth} 
                    onChange={e => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    {MONTHS.map((month, idx) => (
                      <option key={idx} value={idx + 1}>{month}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Year *</label>
                  <select 
                    value={selectedYear} 
                    onChange={e => setSelectedYear(parseInt(e.target.value))}
                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Load Button */}
              <div className="pt-4">
                <button
                  onClick={loadMonthlyAttendance}
                  disabled={!classInfo.courseId || monthlyLoading}
                  className="w-full px-6 py-4 bg-[#C3EBFA] text-gray-600 rounded-lg hover:bg-[#A8DBF2] disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {monthlyLoading ? "Loading Attendance..." : "Load Monthly Attendance →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Monthly Attendance View
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">📅 {MONTHS[selectedMonth - 1]} {selectedYear} - {classInfo.courseName}</h2>
              <p className="text-gray-600">Semester {classInfo.semester} | Section {classInfo.section || 'All'} | Batch {classInfo.batch || 'All'}</p>
            </div>
            <button
              onClick={() => {
                setAttendanceLoaded(false);
                setMonthlyAttendance(null);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ← Change Selection
            </button>
          </div>

          {/* Monthly Attendance Management */}
          {monthlyLoading ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p>Loading monthly attendance...</p>
            </div>
          ) : monthlyAttendance ? (
            <div className="bg-white rounded-lg shadow p-6">
              {/* Mode Tabs */}
              <div className="mb-6 bg-gray-100 rounded-lg p-2 flex gap-2">
                <button
                  onClick={() => setAttendanceMode("manual")}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    attendanceMode === "manual"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  📝 Manual Attendance
                </button>
                <button
                  onClick={() => setAttendanceMode("bulk")}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    attendanceMode === "bulk"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  📊 Bulk Upload (Excel)
                </button>
              </div>

              {attendanceMode === "manual" ? (
                // Manual Attendance Mode
                <>
              {/* Active Days Section */}
              <div className="mb-6 p-6 bg-linear-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-blue-900">
                      📅 Total Active Days: <span className="text-2xl">{monthlyAttendance.totalActiveDays}</span>
                    </h3>
                    <p className="text-sm text-gray-700 font-medium">
                      {MONTHS[selectedMonth - 1]} {selectedYear}
                    </p>
                    {monthlyAttendance.totalActiveDays === 0 && (
                      <p className="text-red-600 text-sm mt-2 font-semibold">
                        ⚠️ Please set the total active days before marking attendance!
                      </p>
                    )}
                  </div>
                  
                  {!monthlyAttendance.isFinalized && (
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
                                setActiveDaysInput(monthlyAttendance.totalActiveDays.toString());
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
                          {monthlyAttendance.totalActiveDays === 0 ? "➕ Set Active Days" : "✏️ Edit Active Days"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              {monthlyAttendance.isFinalized && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  ✓ This attendance has been finalized and cannot be edited.
                </div>
              )}

              {/* Student Count and Refresh Option */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-700">
                    👥 Students: {monthlyAttendance.students.length}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    (Semester {monthlyAttendance.semester} | Section {monthlyAttendance.section || 'All'} | Batch {monthlyAttendance.batch || 'All'})
                  </span>
                </div>
                {!monthlyAttendance.isFinalized && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleRefreshStudents}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold text-sm shadow transition-all"
                      title="Reload attendance with updated student list from database"
                    >
                      🔄 Refresh Students
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this attendance record? This action cannot be undone.")) {
                          try {
                            await apiService.deleteMonthlyAttendance(monthlyAttendance._id);
                            showToast.success("Attendance record deleted successfully");
                            setAttendanceLoaded(false);
                            setMonthlyAttendance(null);
                          } catch (error) {
                            showToast.error(error.response?.data?.message || "Failed to delete attendance");
                          }
                        }
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm shadow transition-all"
                      title="Delete this attendance record permanently"
                    >
                      🗑️ Delete Record
                    </button>
                  </div>
                )}
              </div>

              {/* Bulk Actions and Search */}
              <div className="mb-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  {/* Search Bar */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by Roll No, Enrolment No, or Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {!monthlyAttendance.isFinalized && monthlyAttendance.totalActiveDays > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 font-medium hidden lg:inline">
                        <strong>💡 Bulk Actions:</strong>
                      </span>
                      <button
                        onClick={handleMarkAllPresent}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        ✓ Mark All Present
                      </button>
                      <button
                        onClick={handleMarkAllAbsent}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        ✗ Mark All Absent
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolment No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Days Present</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance %</th>
                        {!monthlyAttendance.isFinalized && (
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mark Attendance</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {monthlyAttendance.students
                        .filter((student) => {
                          if (!searchQuery.trim()) return true;
                          const query = searchQuery.toLowerCase();
                          const rollNo = (student.rollNo || '').toString().toLowerCase();
                          const enrolmentNo = (student.enrolmentNo || '').toLowerCase();
                          const name = (student.name || '').toLowerCase();
                          return rollNo.includes(query) || enrolmentNo.includes(query) || name.includes(query);
                        })
                        .map((student, index) => {
                      if (index === 0) {
                        console.log("First student object structure:", student);
                        console.log("student.studentId:", student.studentId);
                        console.log("student.studentId?._id:", student.studentId?._id);
                      }
                      
                      return (
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
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-bold text-gray-900">{student.daysPresent}</span>
                            <span className="text-xs text-gray-500">out of {monthlyAttendance.totalActiveDays}</span>
                          </div>
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
                        {!monthlyAttendance.isFinalized && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => handleMarkPresent(student.studentId._id, student.daysPresent)}
                                disabled={student.daysPresent >= monthlyAttendance.totalActiveDays || monthlyAttendance.totalActiveDays === 0}
                                className="px-8 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all"
                              >
                                ✓ Present
                              </button>
                              <button
                                onClick={() => handleMarkAbsent(student.studentId._id, student.daysPresent)}
                                disabled={student.daysPresent <= 0 || monthlyAttendance.totalActiveDays === 0}
                                className="px-8 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all"
                              >
                                ✗ Absent
                              </button>
                            </div>
                          </td>
                        )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              </div>

              {/* Finalize/Unfinalize Button */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p><strong>Total Students:</strong> {monthlyAttendance.students.length}</p>
                  <p><strong>Average Attendance:</strong> {
                    monthlyAttendance.students.length > 0 
                      ? (monthlyAttendance.students.reduce((sum, s) => sum + s.percentage, 0) / monthlyAttendance.students.length).toFixed(2)
                      : 0
                  }%</p>
                </div>
                {!monthlyAttendance.isFinalized ? (
                  <button
                    onClick={handleFinalizeAttendance}
                    disabled={monthlyAttendance.totalActiveDays === 0}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    🔒 Finalize Attendance
                  </button>
                ) : (
                  <button
                    onClick={handleUnfinalizeAttendance}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    ✏️ Edit Attendance
                  </button>
                )}
              </div>
                </>
              ) : (
                // Bulk Upload Mode
                <div className="space-y-6">
                  {/* Active Days Section */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-xl text-blue-900">
                          📅 Total Active Days: <span className="text-2xl">{monthlyAttendance.totalActiveDays}</span>
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                          {MONTHS[selectedMonth - 1]} {selectedYear}
                        </p>
                      </div>
                      {!monthlyAttendance.isFinalized && (
                        <div className="flex items-center gap-2">
                          {editingActiveDays ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                value={activeDaysInput}
                                onChange={(e) => setActiveDaysInput(e.target.value)}
                                placeholder="e.g., 25"
                                className="w-28 border-2 border-blue-400 rounded px-3 py-2 text-lg font-semibold"
                              />
                              <button
                                onClick={handleUpdateActiveDays}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
                              >
                                ✓ Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingActiveDays(false);
                                  setActiveDaysInput(monthlyAttendance.totalActiveDays.toString());
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setEditingActiveDays(true)}
                              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                            >
                              {monthlyAttendance.totalActiveDays === 0 ? "➕ Set Active Days" : "✏️ Edit Active Days"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <h4 className="font-bold text-yellow-800 mb-2">📋 Excel Format Instructions:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                      <li><strong>Column A (Roll no):</strong> Student roll numbers (must match exactly)</li>
                      <li><strong>Column B (Student Name):</strong> Student names (optional, for reference)</li>
                      <li><strong>Columns C onwards (Day 1, Day 2, Day 3...):</strong> Daily attendance</li>
                      <li>Mark <strong>P</strong> for Present and <strong>A</strong> for Absent</li>
                      <li>Example format:</li>
                    </ul>
                    <div className="mt-2 text-xs bg-white p-2 rounded border border-yellow-300 overflow-x-auto">
                      <table className="text-left">
                        <thead>
                          <tr className="border-b">
                            <th className="pr-4">Roll no</th>
                            <th className="pr-4">Student Name</th>
                            <th className="pr-2">Day 1</th>
                            <th className="pr-2">Day 2</th>
                            <th className="pr-2">Day 3</th>
                            <th className="pr-2">...</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="pr-4">20230001</td>
                            <td className="pr-4">Sandeep K P</td>
                            <td className="pr-2">P</td>
                            <td className="pr-2">P</td>
                            <td className="pr-2">A</td>
                            <td className="pr-2">...</td>
                          </tr>
                          <tr>
                            <td className="pr-4">20230002</td>
                            <td className="pr-4">Aryan Bansal</td>
                            <td className="pr-2">P</td>
                            <td className="pr-2">P</td>
                            <td className="pr-2">P</td>
                            <td className="pr-2">...</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      💡 <strong>Tip:</strong> The system will count all P's for each student and update their attendance accordingly.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={handleDownloadTemplate}
                        className="px-4 py-2 bg-[#C3EBFA] hover:bg-[#A8DBF2] text-gray-700 rounded-lg font-medium"
                      >
                        ⬇ Download example Excel sheet
                      </button>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="space-y-4">
                      <div className="text-6xl">📤</div>
                      <h3 className="text-xl font-semibold text-gray-700">Upload Attendance Excel</h3>
                      <p className="text-sm text-gray-500">
                        Select an Excel file (.xlsx or .xls) containing attendance data
                      </p>
                      
                      <div className="flex flex-col items-center gap-4">
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileChange}
                          disabled={monthlyAttendance.isFinalized || uploadLoading}
                          id="excel-upload-input"
                          style={{ display: 'none' }}
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById('excel-upload-input');
                            if (input) input.click();
                          }}
                          disabled={monthlyAttendance.isFinalized || uploadLoading}
                          className={`px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all ${
                            monthlyAttendance.isFinalized || uploadLoading
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                          }`}
                        >
                          Choose Excel File
                        </button>

                        {excelFile && (
                          <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                            <span className="text-green-700 font-medium">📄 {excelFile.name}</span>
                            <button
                              onClick={() => setExcelFile(null)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        {excelFile && (
                          <button
                            onClick={handleExcelUpload}
                            disabled={uploadLoading || monthlyAttendance.isFinalized}
                            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all"
                          >
                            {uploadLoading ? "Processing..." : "📊 Process & Update Attendance"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Current Attendance Summary */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h4 className="font-bold text-lg mb-4">📊 Current Attendance Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-blue-600">{monthlyAttendance.students.length}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Average Attendance</p>
                        <p className="text-2xl font-bold text-green-600">
                          {monthlyAttendance.students.length > 0
                            ? (monthlyAttendance.students.reduce((sum, s) => sum + s.percentage, 0) / monthlyAttendance.students.length).toFixed(1)
                            : 0}%
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Active Days</p>
                        <p className="text-2xl font-bold text-purple-600">{monthlyAttendance.totalActiveDays}</p>
                      </div>
                    </div>
                  </div>

                  {/* Finalize Button */}
                  <div className="flex justify-center">
                    {!monthlyAttendance.isFinalized ? (
                      <button
                        onClick={handleFinalizeAttendance}
                        disabled={monthlyAttendance.totalActiveDays === 0}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        🔒 Finalize Attendance
                      </button>
                    ) : (
                      <button
                        onClick={handleUnfinalizeAttendance}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        ✏️ Edit Attendance
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
