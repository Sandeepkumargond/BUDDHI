"use client";

import { useState } from "react";
import { apiService } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function SubAdminUploadPYQ() {
  const [formData, setFormData] = useState({
    department: "",
    semester: "",
    year: "",
    subject: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AIDS"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  
  // Generate years from 2010 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2009 }, (_, i) => (currentYear - i).toString());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        e.target.value = "";
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        e.target.value = "";
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!formData.department || !formData.semester || !formData.year || !formData.subject) {
      toast.error("All fields are required");
      return;
    }

    if (!pdfFile) {
      toast.error("Please select a PDF file");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("department", formData.department);
      formDataToSend.append("semester", formData.semester);
      formDataToSend.append("year", formData.year);
      formDataToSend.append("subject", formData.subject.trim());
      formDataToSend.append("pdf", pdfFile);

      await apiService.request("/pyq/upload", {
        method: "POST",
        body: formDataToSend,
      });

      toast.success("PYQ uploaded successfully!");

      // Reset form
      setFormData({
        department: "",
        semester: "",
        year: "",
        subject: "",
      });
      setPdfFile(null);
      // Reset file input
      document.getElementById("pdfInput").value = "";
    } catch (error) {
      console.error("Error uploading PYQ:", error);
      toast.error(error?.message || "Failed to upload PYQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-xl font-semibold mb-6">Upload PYQ (Previous Year Question Paper)</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
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
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
            Semester <span className="text-red-500">*</span>
          </label>
          <select
            id="semester"
            name="semester"
            value={formData.semester}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          >
            <option value="">Select Semester</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
            Year <span className="text-red-500">*</span>
          </label>
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          >
            <option value="">Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="e.g., Data Structures and Algorithms"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
            maxLength={200}
          />
        </div>

        {/* PDF Upload */}
        <div>
          <label htmlFor="pdfInput" className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="pdfInput"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Only PDF files are allowed. Max size: 10MB
          </p>
          {pdfFile && (
            <p className="text-sm text-green-600 mt-2">
              Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md font-medium transition-colors ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-600"
            }`}
          >
            {loading ? "Uploading..." : "Upload PYQ"}
          </button>
        </div>
      </form>
    </div>
  );
}
