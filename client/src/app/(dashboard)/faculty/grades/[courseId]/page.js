"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

export default function FacultyCourseGradesPage() {
  const { user: authUser, role } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseAssignmentId = params.courseId;

  const [students, setStudents] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [grades, setGrades] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await apiService.request(`/grades/faculty/course/${courseAssignmentId}/students`);
        
        if (response.success && response.data) {
          setStudents(response.data.students || []);
          setCourse(response.data.course);
          
          // Initialize grades from existing data
          const initialGrades = {};
          response.data.students.forEach(student => {
            if (student.currentGrade) {
              initialGrades[student._id] = {
                internal: student.currentGrade.internal || 0,
                external: student.currentGrade.external || 0
              };
            } else {
              initialGrades[student._id] = {
                internal: 0,
                external: 0
              };
            }
          });
          setGrades(initialGrades);
        } else {
          setError('Failed to fetch students');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    if (courseAssignmentId && role === 'faculty') {
      fetchStudents();
    }
  }, [courseAssignmentId, role]);

  const updateGrade = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: Math.max(0, Math.min(100, parseInt(value) || 0))
      }
    }));
  };

  const calculateTotal = (studentId) => {
    const grade = grades[studentId];
    if (!grade) return 0;
    return (grade.internal || 0) + (grade.external || 0);
  };

  const getGradeLetter = (total) => {
    if (total >= 90) return { grade: 'A+', point: 10, color: 'text-green-600' };
    if (total >= 80) return { grade: 'A', point: 9, color: 'text-green-600' };
    if (total >= 70) return { grade: 'B+', point: 8, color: 'text-blue-600' };
    if (total >= 60) return { grade: 'B', point: 7, color: 'text-blue-600' };
    if (total >= 50) return { grade: 'C+', point: 6, color: 'text-yellow-600' };
    if (total >= 40) return { grade: 'C', point: 5, color: 'text-yellow-600' };
    if (total >= 35) return { grade: 'D', point: 4, color: 'text-orange-600' };
    return { grade: 'F', point: 0, color: 'text-red-600' };
  };

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toString().includes(searchTerm) ||
    student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveGrades = async () => {
    try {
      setSaving(true);
      
      const studentGrades = Object.entries(grades).map(([studentId, gradeData]) => ({
        studentId,
        internal: gradeData.internal || 0,
        external: gradeData.external || 0
      }));

      const payload = {
        studentGrades,
        academicYear: course?.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
      };

      const response = await apiService.request(`/grades/faculty/course/${courseAssignmentId}/grades`, {
        method: 'POST',
        body: payload
      });

      if (response.success) {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
        
        // Refresh data to show updated grades
        const refreshResponse = await apiService.request(`/grades/faculty/course/${courseAssignmentId}/students`);
        if (refreshResponse.success && refreshResponse.data) {
          setStudents(refreshResponse.data.students || []);
        }
      } else {
        throw new Error(response.message || 'Failed to save grades');
      }
    } catch (err) {
      console.error('Error saving grades:', err);
      alert(err.message || 'Failed to save grades');
    } finally {
      setSaving(false);
    }
  };

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
          <p className="mt-2 text-gray-600">Loading students...</p>
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
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {course?.name} ({course?.code})
          </h1>
          <p className="text-gray-600">
            Semester {course?.semester} • Credits: {course?.credits} • 
            {course?.section && ` Section: ${course.section}`}
            {course?.batch && ` • Batch: ${course.batch}`}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Academic Year: {course?.academicYear || 'Current'}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Back to Courses
        </button>
      </div>

      {/* Success Message */}
      {showSaveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Grades saved successfully!
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students by name, roll no, or enrollment no..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="ml-4 text-sm text-gray-600">
            {filteredStudents.length} of {students.length} students
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Internal (0-40)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  External (0-60)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const total = calculateTotal(student._id);
                const gradeInfo = getGradeLetter(total);
                return (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10">
                          <Image
                            className="h-10 w-10 rounded-full object-cover"
                            src={student.imageUrl || "/student.png"}
                            alt=""
                            width={40}
                            height={40}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.enrollmentNo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.rollNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={grades[student._id]?.internal || 0}
                        onChange={(e) => updateGrade(student._id, 'internal', e.target.value)}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={grades[student._id]?.external || 0}
                        onChange={(e) => updateGrade(student._id, 'external', e.target.value)}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold">{total}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-semibold ${gradeInfo.color}`}>
                        {gradeInfo.grade} ({gradeInfo.point})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        total >= 35 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {total >= 35 ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSaveGrades}
          disabled={saving}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
        >
          {saving ? 'Saving Grades...' : 'Save All Grades'}
        </button>
      </div>

      {/* Statistics */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Grade Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredStudents.length}
            </div>
            <div className="text-sm text-gray-500">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredStudents.filter(s => calculateTotal(s._id) >= 35).length}
            </div>
            <div className="text-sm text-gray-500">Pass</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredStudents.filter(s => calculateTotal(s._id) < 35).length}
            </div>
            <div className="text-sm text-gray-500">Fail</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredStudents.length > 0 
                ? Math.round(filteredStudents.reduce((sum, s) => sum + calculateTotal(s._id), 0) / filteredStudents.length)
                : 0}
            </div>
            <div className="text-sm text-gray-500">Avg Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}