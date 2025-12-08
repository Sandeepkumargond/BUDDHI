"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import Link from "next/link";

export default function FacultyCoursesPage() {
  const { user: authUser, role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await apiService.request('/grades/faculty/courses');
        
        if (response.success && response.data) {
          setCourses(response.data.courses || []);
        } else {
          setError('Failed to fetch assigned courses');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Failed to fetch assigned courses');
      } finally {
        setLoading(false);
      }
    };

    if (role === 'faculty') {
      fetchCourses();
    }
  }, [role]);

  if (role !== 'faculty') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses - Grade Management</h1>
        <p className="text-gray-600">
          Welcome {authUser?.firstName} {authUser?.lastName}, manage grades for your assigned courses
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Courses Assigned</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any courses assigned yet. Contact your admin to get courses assigned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg border hover:border-blue-300 hover:shadow-md transition-all">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{course.courseName}</h3>
                      <p className="text-sm text-gray-500">Code: {course.courseCode}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Credits:</span>
                    <span className="font-medium">{course.credits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Semester:</span>
                    <span className="font-medium">{course.semester}</span>
                  </div>
                  {course.section && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Section:</span>
                      <span className="font-medium">{course.section}</span>
                    </div>
                  )}
                  {course.batch && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Batch:</span>
                      <span className="font-medium">{course.batch}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Academic Year:</span>
                    <span className="font-medium">{course.academicYear || 'Current'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link
                    href={`/faculty/grades/${course._id}`}
                    className="w-full bg-[#C3EBFA] text-gray-600 px-4 py-2 rounded-lg hover:bg-[#A8DBF2] transition-colors text-center block"
                  >
                    Manage Grades
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {courses.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Quick Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
              <div className="text-sm text-gray-500">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {[...new Set(courses.map(c => c.semester))].length}
              </div>
              <div className="text-sm text-gray-500">Semesters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {courses.reduce((sum, c) => sum + c.credits, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Credits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {[...new Set(courses.map(c => c.academicYear))].length}
              </div>
              <div className="text-sm text-gray-500">Academic Years</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}