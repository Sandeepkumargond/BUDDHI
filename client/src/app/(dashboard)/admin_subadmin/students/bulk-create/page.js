"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { showToast } from "@/lib/toast";
import * as XLSX from "xlsx";
import Link from "next/link";
import { FiDownload, FiUpload, FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function BulkCreateStudentsPage() {
  const { role } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const generateSampleExcel = () => {
    const sampleData = [
      {
        firstName: "John",
        lastName: "Doe",
        personalMail: "john.personal@gmail.com",
        gender: "Male",
        program: "B.Tech",
        branch: "CSE",
        semester: 1,
        section: "A",
        batch: "2024",
        mobile: "9876543210",
        registrationNumber: "REG001",
        dateOfAdmission: "2024-08-01",
        dateOfBirth: "2005-05-15"
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        personalMail: "jane.personal@gmail.com",
        gender: "Female",
        program: "B.Tech",
        branch: "ECE",
        semester: 1,
        section: "B",
        batch: "2024",
        mobile: "9876543211",
        registrationNumber: "REG002",
        dateOfAdmission: "2024-08-01",
        dateOfBirth: "2005-07-20"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Auto-size columns
    const maxWidth = sampleData.reduce((w, r) => Math.max(w, r.firstName.length), 10);
    ws['!cols'] = Object.keys(sampleData[0]).map(() => ({ wch: 20 }));

    XLSX.writeFile(wb, "student_bulk_upload_template.xlsx");
    showToast.success("Sample template downloaded");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        showToast.error("Please upload a valid Excel file (.xlsx or .xls)");
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
      setResults(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResults(null);
    document.getElementById("fileInput").value = "";
  };

  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      showToast.error("Please select a file");
      return;
    }

    try {
      setLoading(true);
      setResults(null);

      // Parse Excel file
      const studentsData = await parseExcelFile(file);

      if (studentsData.length === 0) {
        showToast.error("Excel file is empty");
        setLoading(false);
        return;
      }

      // Convert dates to proper format
      const formattedStudents = studentsData.map((student) => ({
        ...student,
        semester: parseInt(student.semester),
        dateOfAdmission: student.dateOfAdmission
          ? new Date(student.dateOfAdmission).toISOString().split("T")[0]
          : undefined,
        dateOfBirth: student.dateOfBirth
          ? new Date(student.dateOfBirth).toISOString().split("T")[0]
          : undefined,
      }));

      let data;
      if (role === "admin") {
        data = await apiService.request("/admin/bulk-create-students", {
          method: "POST",
          body: { students: formattedStudents },
        });
      } else if (role === "subadmin") {
        data = await apiService.request("/sub-admin/bulk-create-students", {
          method: "POST",
          body: { students: formattedStudents },
        });
      } else {
        showToast.error("Unauthorized role");
        setLoading(false);
        return;
      }

      setLoading(false);

      if (!data || !data.success) {
        showToast.error(data?.message || "Bulk upload failed");
        return;
      }

      setResults(data.data);
      showToast.success(data.message || "Bulk upload completed");

      // Clear file after successful upload
      if (data.data.failedCount === 0) {
        handleRemoveFile();
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err?.message || err?.data?.message || "Server error";
      showToast.error(errorMessage);
    }
  };

  return (
    <div className="p-6 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-700">Bulk Student Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Upload Excel file to create multiple students at once</p>
        </div>
        <Link
          href="/admin_subadmin/students"
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Back to Students
        </Link>
      </div>

      {/* Instructions & Download Template */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Download the sample template and fill in student details</li>
          <li>All fields marked in the template are required</li>
          <li><strong>Email and Password will be auto-generated</strong> and sent to personal email</li>
          <li>Date format: YYYY-MM-DD (e.g., 2024-08-01)</li>
          <li>Gender: Male, Female, or Other</li>
          <li>Program: B.Tech, M.Tech, or PhD</li>
          <li>Branch: CSE, ECE, EEE, ME, or CE</li>
          <li>Semester: 1-8</li>
        </ul>
        <button
          onClick={generateSampleExcel}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiDownload />
          Download Sample Template
        </button>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Excel File <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="fileInput"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          {file && (
            <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded border">
              <span className="text-sm text-gray-700">{file.name}</span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700"
                disabled={loading}
              >
                <FiX />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !file}
            className={`flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md font-medium transition-colors ${
              loading || !file ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
            }`}
          >
            <FiUpload />
            {loading ? "Uploading..." : "Upload & Create Students"}
          </button>
        </div>
      </form>

      {/* Results */}
      {results && (
        <div className="mt-8 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total Processed</div>
              <div className="text-2xl font-bold text-blue-900">{results.total}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Successfully Created</div>
              <div className="text-2xl font-bold text-green-900">{results.successCount}</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 font-medium">Failed</div>
              <div className="text-2xl font-bold text-red-900">{results.failedCount}</div>
            </div>
          </div>

          {/* Success List */}
          {results.success && results.success.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <FiCheckCircle />
                Successfully Created ({results.success.length})
              </h3>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-100 sticky top-0">
                    <tr>
                      <th className="text-left p-2">Row</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Roll No</th>
                      <th className="text-left p-2">Reg No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.success.map((item, idx) => (
                      <tr key={idx} className="border-t border-green-200">
                        <td className="p-2">{item.row}</td>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.email}</td>
                        <td className="p-2">{item.rollNo}</td>
                        <td className="p-2">{item.registrationNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Failed List */}
          {results.failed && results.failed.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <FiAlertCircle />
                Failed ({results.failed.length})
              </h3>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-red-100 sticky top-0">
                    <tr>
                      <th className="text-left p-2">Row</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.failed.map((item, idx) => (
                      <tr key={idx} className="border-t border-red-200">
                        <td className="p-2">{item.row}</td>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.email}</td>
                        <td className="p-2 text-red-700">{item.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
