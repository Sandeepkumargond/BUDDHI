"use client";
import { useState, useEffect } from "react";

const MarksFilter = ({
  departments,
  semesters,
  sections,
  subjects,
  onFilterChange,
  onLoadStudents,
  loadingStudents,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Filter available semesters based on selected department
  const availableSemesters =
    selectedDepartment && semesters ? semesters : [];

  // Filter available sections based on selected semester
  const availableSections =
    selectedDepartment && selectedSemester && sections ? sections : [];

  // Filter available subjects
  const availableSubjects = subjects || [];

  const handleDepartmentChange = (e) => {
    const dept = e.target.value;
    setSelectedDepartment(dept);
    setSelectedSemester("");
    setSelectedSection("");
    onFilterChange({
      department: dept,
      semester: "",
      section: "",
      subject: selectedSubject,
    });
  };

  const handleSemesterChange = (e) => {
    const sem = e.target.value;
    setSelectedSemester(sem);
    setSelectedSection("");
    onFilterChange({
      department: selectedDepartment,
      semester: sem,
      section: "",
      subject: selectedSubject,
    });
  };

  const handleSectionChange = (e) => {
    const sec = e.target.value;
    setSelectedSection(sec);
    onFilterChange({
      department: selectedDepartment,
      semester: selectedSemester,
      section: sec,
      subject: selectedSubject,
    });
  };

  const handleSubjectChange = (e) => {
    const subj = e.target.value;
    setSelectedSubject(subj);
    onFilterChange({
      department: selectedDepartment,
      semester: selectedSemester,
      section: selectedSection,
      subject: subj,
    });
  };

  const isFormComplete =
    selectedDepartment &&
    selectedSemester &&
    selectedSection &&
    selectedSubject;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Filter Options</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Department */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Department
          </label>
          <select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Semester
          </label>
          <select
            value={selectedSemester}
            onChange={handleSemesterChange}
            disabled={!selectedDepartment}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
          >
            <option value="">Select Semester</option>
            {availableSemesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Section
          </label>
          <select
            value={selectedSection}
            onChange={handleSectionChange}
            disabled={!selectedSemester}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
          >
            <option value="">Select Section</option>
            {availableSections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={handleSubjectChange}
            disabled={!selectedSection}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
          >
            <option value="">Select Subject</option>
            {availableSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Load Button */}
        <div className="flex items-end">
          <button
            onClick={onLoadStudents}
            disabled={!isFormComplete || loadingStudents}
            className="w-full px-4 py-2 bg-[#C3EBFA] hover:bg-cyan-200 text-gray-800 font-semibold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
          >
            {loadingStudents ? (
              <>
                <span className="animate-spin">⟳</span> Loading...
              </>
            ) : (
              <>
                <span>🔍</span> Load Students
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Text */}
      <p className="text-sm text-gray-500 mt-4">
        Select all filters and click "Load Students" to view and edit marks
      </p>
    </div>
  );
};

export default MarksFilter;
