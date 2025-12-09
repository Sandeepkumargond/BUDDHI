"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { toast } from "react-hot-toast";
import { FiDownload, FiFilter, FiFileText, FiCalendar, FiBook, FiTrash2 } from "react-icons/fi";
import Link from "next/link";

export default function SubAdminManagePYQs() {
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    year: "",
    subject: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    semesters: [],
    years: [],
    subjects: [],
  });
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch PYQs on mount and when filters change
  useEffect(() => {
    fetchPYQs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const res = await apiService.request("/pyq/subadmin/filters");
      setFilterOptions({
        departments: res?.data?.departments || [],
        semesters: res?.data?.semesters || [],
        years: res?.data?.years || [],
        subjects: res?.data?.subjects || [],
      });
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchPYQs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.department) params.department = filters.department;
      if (filters.semester) params.semester = filters.semester;
      if (filters.year) params.year = filters.year;
      if (filters.subject) params.subject = filters.subject;

      const query = new URLSearchParams(params).toString();
      const res = await apiService.request(`/pyq/subadmin/all${query ? `?${query}` : ""}`);
      const list = res?.data?.pyqs || [];
      setPyqs(list);
    } catch (err) {
      setError(err?.message || "Failed to fetch PYQs");
      toast.error(err?.message || "Failed to fetch PYQs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: "",
      semester: "",
      year: "",
      subject: "",
    });
  };

  const handleDownload = (pyq) => {
    if (pyq.pdfUrl) {
      window.open(pyq.pdfUrl, "_blank");
      toast.success("Opening PDF in new tab");
    } else {
      toast.error("PDF URL not available");
    }
  };

  const handleDelete = async (pyq) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this PYQ?\n\nSubject: ${pyq.subject}\nDepartment: ${pyq.department}\nSemester: ${pyq.semester}\nYear: ${pyq.year}`
    );

    if (!confirmed) return;

    setDeletingId(pyq._id);

    try {
      await apiService.request(`/pyq/delete/${pyq._id}`, {
        method: "DELETE",
      });

      toast.success("PYQ deleted successfully!");
      
      // Remove from local state
      setPyqs((prev) => prev.filter((p) => p._id !== pyq._id));
      
      // Refresh filter options as they might have changed
      fetchFilterOptions();
    } catch (error) {
      console.error("Error deleting PYQ:", error);
      toast.error(error?.message || "Failed to delete PYQ");
    } finally {
      setDeletingId(null);
    }
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v).length;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Manage PYQs</h1>
          <p className="text-sm text-gray-500 mt-1">View and delete uploaded PYQs</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/subadmin/pyqs"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Upload New PYQ
          </Link>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <FiFilter />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {activeFiltersCount > 0 && (
              <span className="bg-white text-blue-500 rounded-full px-2 py-0.5 text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Department Filter */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Departments</option>
                {filterOptions.departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                id="semester"
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Semesters</option>
                {filterOptions.semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                id="year"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Years</option>
                {filterOptions.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Subjects</option>
                {filterOptions.subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {loading ? "Loading..." : `Found ${pyqs.length} PYQ${pyqs.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* PYQs List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : pyqs.length === 0 ? (
        <div className="text-center py-12">
          <FiFileText className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-500 text-lg">No PYQs found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your filters or upload new PYQs
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pyqs.map((pyq) => (
            <div
              key={pyq._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
            >
              {/* PYQ Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded">
                    <FiFileText className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                      {pyq.department}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                {pyq.subject}
              </h3>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiBook className="text-gray-400" />
                  <span>Semester {pyq.semester}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiCalendar className="text-gray-400" />
                  <span>Year {pyq.year}</span>
                </div>
                {pyq.uploadedByName && (
                  <div className="text-xs text-gray-500">
                    Uploaded by: {pyq.uploadedByName}
                  </div>
                )}
                {pyq.createdAt && (
                  <div className="text-xs text-gray-500">
                    Added: {new Date(pyq.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(pyq)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium"
                >
                  <FiDownload />
                  Download
                </button>
                <button
                  onClick={() => handleDelete(pyq)}
                  disabled={deletingId === pyq._id}
                  className={`flex items-center justify-center gap-2 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors font-medium ${
                    deletingId === pyq._id ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <FiTrash2 />
                  {deletingId === pyq._id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
