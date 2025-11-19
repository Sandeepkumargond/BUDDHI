"use client";

import { useState, useMemo } from "react";
import { studentCoursesAttendance, studentMarksDetails, studentStudyMaterials } from "@/lib/roushaniData";
import ProtectedRoute from "@/components/ProtectedRoute";
import CourseDetailView from "@/components/CourseDetailView";

const StudentAttendance = () => {
  const courses = studentCoursesAttendance;
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState(null); // "marks" or "materials"

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const avgTheoryAttendance = (
      courses.reduce((sum, course) => sum + course.theoryAttendance, 0) / courses.length
    ).toFixed(2);
    const avgLabAttendance = (
      courses
        .filter((c) => c.labAttendance !== null)
        .reduce((sum, course) => sum + course.labAttendance, 0) / 
      courses.filter((c) => c.labAttendance !== null).length
    ).toFixed(2);

    return {
      totalCourses,
      avgTheoryAttendance,
      avgLabAttendance,
    };
  }, [courses]);

  const handleOpenDetail = (course, tab) => {
    setSelectedCourse(course);
    setActiveTab(tab);
  };

  const handleCloseDetail = () => {
    setSelectedCourse(null);
    setActiveTab(null);
  };

  // If a course is selected, show the detail view
  if (selectedCourse && activeTab) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <CourseDetailView 
          course={selectedCourse}
          marksData={studentMarksDetails[selectedCourse.id]}
          materialsData={studentStudyMaterials[selectedCourse.id]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={handleCloseDetail}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Courses</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Courses</p>
            <p className="text-3xl font-bold text-blue-900">{stats.totalCourses}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Avg Theory Attendance</p>
            <p className="text-3xl font-bold text-purple-900">{stats.avgTheoryAttendance}%</p>
          </div>
          <div className="bg-cyan-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Avg Lab Attendance</p>
            <p className="text-3xl font-bold text-cyan-900">{stats.avgLabAttendance}%</p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border-t-4 border-blue-500">
              {/* Course Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-blue-600 mb-1">{course.courseName}</h2>
                  <p className="text-sm text-gray-500">{course.courseCode}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Course</span>
              </div>

              {/* Faculty */}
              <p className="text-sm text-gray-600 mb-4">
                <span className="text-gray-400">👨‍🏫 Faculty:</span> {course.faculty}
              </p>

              {/* Attendance Status Indicator */}
              <div className="mb-4 space-y-2">
                {/* Theory Attendance */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-500 font-medium">Theory</p>
                    <p className="text-sm font-bold text-gray-900">{course.theoryAttendance.toFixed(0)}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                    <div
                      className={`h-full rounded transition-all ${
                        course.theoryAttendance < 60 ? 'bg-red-600' :
                        course.theoryAttendance < 75 ? 'bg-orange-400' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${course.theoryAttendance}%` }}
                    ></div>
                  </div>
                </div>

                {/* Lab Attendance */}
                {course.labAttendance !== null && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-gray-500 font-medium">Lab</p>
                      <p className="text-sm font-bold text-gray-900">{course.labAttendance}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                      <div
                        className={`h-full rounded transition-all ${
                          course.labAttendance < 60 ? 'bg-red-600' :
                          course.labAttendance < 75 ? 'bg-orange-400' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${course.labAttendance}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                <div className="bg-blue-50 rounded p-2">
                  <p className="text-xs text-gray-500">🕐 Theory</p>
                  <p className="text-sm font-bold text-blue-700">{course.theoryTotal}/{course.theoryPresent}</p>
                </div>
                <div className="bg-cyan-50 rounded p-2">
                  <p className="text-xs text-gray-500">💻 Lab</p>
                  <p className="text-sm font-bold text-cyan-700">{course.labTotal}/{course.labPresent}</p>
                </div>
                <div className="bg-yellow-50 rounded p-2">
                  <p className="text-xs text-gray-500">📄 Materials</p>
                  <p className="text-sm font-bold text-yellow-700">{course.materials}</p>
                </div>
                <div className="bg-purple-50 rounded p-2">
                  <p className="text-xs text-gray-500">📊 Marks</p>
                  <p className="text-sm font-bold text-purple-700">{course.marks}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleOpenDetail(course, "marks")}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium text-sm rounded-lg transition duration-200 flex items-center justify-center gap-1"
                >
                  📊 Marks
                </button>
                <button 
                  onClick={() => handleOpenDetail(course, "materials")}
                  className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium text-sm rounded-lg transition duration-200 flex items-center justify-center gap-1"
                >
                  📄 Materials
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StudentAttendance;
