"use client";

import { useState } from "react";

const CourseDetailView = ({ course, marksData, materialsData, activeTab, onTabChange, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{course.courseName}</h1>
          <p className="text-gray-600">{course.courseCode} • {course.faculty}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => onTabChange("marks")}
            className={`flex-1 py-4 font-semibold transition ${
              activeTab === "marks"
                ? "border-b-4 border-blue-600 text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📊 Marks
          </button>
          <button
            onClick={() => onTabChange("materials")}
            className={`flex-1 py-4 font-semibold transition ${
              activeTab === "materials"
                ? "border-b-4 border-blue-600 text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📚 Study Materials
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* MARKS TAB */}
        {activeTab === "marks" && (
          <div>
            {marksData ? (
              <div>
                {/* Overall Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
                    <p className="text-gray-600 text-sm font-medium">Total Marks Obtained</p>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{marksData.totalObtained}/{marksData.totalMarks}</p>
                    <p className="text-sm text-gray-500 mt-1">{marksData.totalPercentage.toFixed(2)}%</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-600">
                    <p className="text-gray-600 text-sm font-medium">Percentage</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">{marksData.totalPercentage.toFixed(2)}%</p>
                    <p className={`text-sm font-semibold mt-1 ${marksData.totalObtained >= marksData.passingMarks ? 'text-green-600' : 'text-red-600'}`}>
                      {marksData.totalObtained >= marksData.passingMarks ? '✓ PASSED' : '✗ FAILED'}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-600">
                    <p className="text-gray-600 text-sm font-medium">Passing Marks</p>
                    <p className="text-4xl font-bold text-purple-600 mt-2">{marksData.passingMarks}</p>
                    <p className="text-sm text-gray-500 mt-1">Minimum Required</p>
                  </div>
                </div>

                {/* Marks Table */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assessment</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Internal Marks</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">External Marks</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Total</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Percentage</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marksData.data.map((assessment, index) => (
                          <tr key={assessment.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{assessment.assessmentName}</td>
                            <td className="px-4 py-3 text-center text-sm text-gray-700">{assessment.marksObtained}</td>
                            <td className="px-4 py-3 text-center text-sm text-gray-700">{assessment.totalMarks - assessment.marksObtained}</td>
                            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">{assessment.marksObtained}/{assessment.totalMarks}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                assessment.percentage >= 80 ? 'bg-green-100 text-green-700' :
                                assessment.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {assessment.percentage.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-500">{assessment.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Marks Uploaded</h3>
                <p className="text-gray-600 text-center max-w-md">
                  The faculty hasn't uploaded marks for this course yet. Please check back later.
                </p>
              </div>
            )}
          </div>
        )}

        {/* MATERIALS TAB */}
        {activeTab === "materials" && (
          <div>
            {materialsData && materialsData.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Study Materials ({materialsData.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {materialsData.map((material) => (
                    <div key={material.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      {/* Icon and Title */}
                      <div className="flex items-start gap-2 mb-3">
                        <div className="shrink-0 text-2xl">📄</div>
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">{material.title}</h4>
                      </div>

                      {/* Download Button */}
                      <button className="w-full px-3 py-2 bg-yellow-200 hover:bg-yellow-300 text-gray-800 font-medium text-xs rounded-lg transition flex items-center justify-center gap-2">
                        📥 Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Study Materials Available</h3>
                <p className="text-gray-600 text-center max-w-md">
                  The faculty hasn't uploaded any study materials for this course yet. Please check back later.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailView;
