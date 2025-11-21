"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AddGradeCardPage() {
  const { user: authUser, role } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    branch: '',
    semester: ''
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await apiService.request('/grades/admin/students?limit=1000');
        
        if (response.success && response.data) {
          setStudents(response.data.students || []);
          setFilteredStudents(response.data.students || []);
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

    if (role === 'admin' || role === 'sub-admin') {
      fetchStudents();
    }
  }, [role]);

  // Filter students based on search and filters
  useEffect(() => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(search) ||
        student.lastName.toLowerCase().includes(search) ||
        student.rollNo.toString().includes(search) ||
        student.enrollmentNo.toLowerCase().includes(search)
      );
    }

    // Apply branch filter
    if (filters.branch) {
      filtered = filtered.filter(student => student.branch === filters.branch);
    }

    // Apply semester filter
    if (filters.semester) {
      filtered = filtered.filter(student => student.semester === parseInt(filters.semester));
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, filters]);

  const handleStudentSelect = (studentId) => {
    router.push(`/list/students/grades/${studentId}/edit`);
  };

  if (role !== 'admin' && role !== 'sub-admin') {
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
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Grade Card</h1>
        <p className="text-gray-600">Select a student to add or edit their grade card</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Students
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, roll no, or enrollment no..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              value={filters.branch}
              onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Branches</option>
              <option value="CSE">Computer Science & Engineering</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="ME">Mechanical Engineering</option>
              <option value="CE">Civil Engineering</option>
              <option value="EE">Electrical Engineering</option>
              <option value="IT">Information Technology</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Semester
            </label>
            <select
              value={filters.semester}
              onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Clear filters */}
        {(searchTerm || filters.branch || filters.semester) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ branch: '', semester: '' });
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredStudents.length} of {students.length} students
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student._id}
              onClick={() => handleStudentSelect(student._id)}
              className="bg-white rounded-lg border hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-6"
            >
              <div className="flex items-center space-x-4">
                <div className="shrink-0">
                  <Image
                    className="h-12 w-12 rounded-full object-cover"
                    src={student.imageUrl || "/student.png"}
                    alt=""
                    width={48}
                    height={48}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    Roll: {student.rollNo}
                  </div>
                  <div className="text-xs text-gray-400">
                    {student.enrollmentNo}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Program:</span>
                  <span className="font-medium">{student.program}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Branch:</span>
                  <span className="font-medium">{student.branch}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Semester:</span>
                  <span className="font-medium">{student.semester}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">CGPA:</span>
                  <span className={`font-medium ${
                    student.cgpa >= 8.5 ? 'text-green-600' :
                    student.cgpa >= 7.0 ? 'text-blue-600' :
                    student.cgpa >= 6.0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {student.cgpa || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{student.semestersCompleted || 0} semesters completed</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Add Grades
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}