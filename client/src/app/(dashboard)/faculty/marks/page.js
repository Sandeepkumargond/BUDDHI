"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import MarksFilter from "@/components/MarksFilter";
import MarksTable from "@/components/MarksTable";
import {
  marksFilterDepartments,
  marksFilterSemesters,
  marksFilterSections,
  marksFilterSubjects,
  marksStudentsData,
  marksDataTable,
} from "@/lib/roushaniData";

const MarksPage = () => {
  const { role, loading } = useAuth();
  const [selectedFilters, setSelectedFilters] = useState({
    department: "",
    semester: "",
    section: "",
    subject: "",
  });

  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  // Handle filter changes
  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
  };

  // Load students based on filters
  const handleLoadStudents = () => {
    setLoadingStudents(true);

    // Simulate API call delay
    setTimeout(() => {
      // Filter students based on selected criteria
      const filteredStudents = marksStudentsData.filter(
        (student) =>
          student.branch === selectedFilters.department &&
          student.semester === parseInt(selectedFilters.semester) &&
          student.section === selectedFilters.section
      );

      // Get marks for filtered students
      const filteredMarks = marksDataTable.filter(
        (mark) =>
          filteredStudents.some((s) => s._id === mark.studentId) &&
          mark.subject === selectedFilters.subject
      );

      // Create complete marks map with all students
      const completeMarksData = filteredStudents.map((student) => {
        const existingMark = filteredMarks.find(
          (m) => m.studentId === student._id
        );
        return (
          existingMark || {
            studentId: student._id,
            subject: selectedFilters.subject,
            semester: selectedFilters.semester,
            section: selectedFilters.section,
            branch: selectedFilters.department,
            internalMarks: "",
            externalMarks: "",
            grade: "",
            remarks: "",
            academicYear: new Date().getFullYear().toString(),
          }
        );
      });

      setStudents(filteredStudents);
      setMarksData(completeMarksData);
      setStudentsLoaded(true);
      setLoadingStudents(false);
    }, 500);
  };

  // Handle marks change
  const handleMarksChange = (studentId, field, value) => {
    setMarksData((prevMarks) =>
      prevMarks.map((mark) => {
        if (mark.studentId === studentId) {
          return {
            ...mark,
            [field]: value,
          };
        }
        return mark;
      })
    );
  };

  return (
    <ProtectedRoute allowedRoles={["faculty"]}>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📊 Marks Management
            </h1>
            <p className="text-gray-600">
              Upload, edit, and manage student marks for your subjects
            </p>
          </div>

          {/* Filter Section */}
          <MarksFilter
            departments={marksFilterDepartments}
            semesters={marksFilterSemesters}
            sections={marksFilterSections}
            subjects={marksFilterSubjects}
            onFilterChange={handleFilterChange}
            onLoadStudents={handleLoadStudents}
            loadingStudents={loadingStudents}
          />

          {/* Loading State */}
          {loadingStudents && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading students...</p>
              </div>
            </div>
          )}

          {/* Students Loaded State */}
          {studentsLoaded && !loadingStudents && (
            <>
              {students.length > 0 ? (
                <>
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm font-medium">
                      📚 <strong>{students.length} students</strong> found for{" "}
                      <strong>{selectedFilters.subject}</strong> in{" "}
                      <strong>
                        {selectedFilters.department} - Semester{" "}
                        {selectedFilters.semester} - Section{" "}
                        {selectedFilters.section}
                      </strong>
                    </p>
                  </div>
                  <MarksTable
                    students={students}
                    marksData={marksData}
                    selectedSubject={selectedFilters.subject}
                    selectedSemester={selectedFilters.semester}
                    selectedSection={selectedFilters.section}
                    selectedDepartment={selectedFilters.department}
                    onMarksChange={handleMarksChange}
                  />
                </>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-500 text-lg mb-2">
                    ℹ️ No students found
                  </p>
                  <p className="text-gray-400 text-sm">
                    Try selecting different filter options
                  </p>
                </div>
              )}
            </>
          )}

          {/* Initial State */}
          {!studentsLoaded && !loadingStudents && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg mb-2">
                🎯 Get Started
              </p>
              <p className="text-gray-400 text-sm">
                Select filters above and click "Load Students" to begin entering
                marks
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MarksPage;
