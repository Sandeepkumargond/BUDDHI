"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiService } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";
import { MdAccessTime, MdCheckCircle } from "react-icons/md";

export default function StudentFeedbackPage() {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedForms, setCompletedForms] = useState(new Set());
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    fetchStudentProfile();
    fetchFeedbackForms();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const res = await apiService.getProfile('student');
      const profileData = res.data?.student || res.data?.user || {};
      setStudentData(profileData);
    } catch (error) {
      console.error('Failed to fetch student profile:', error);
    }
  };

  const fetchFeedbackForms = async () => {
    setLoading(true);
    try {
      // Pass student's enrollment details to filter forms
      const filters = {
        department: user?.branch || user?.department,
        batch: user?.batch,
        semester: user?.semester,
        section: user?.section,
      };

      const res = await apiService.getFeedbackFormsForStudent(filters);
      const availableFormsGrouped = res.data?.forms || [];
      setForms(availableFormsGrouped);

      // Check which forms the student has already completed
      const completed = new Set();
      availableFormsGrouped.forEach(group => {
        group.forms?.forEach(form => {
          if (form.completed) {
            completed.add(form._id);
          }
        });
      });
      setCompletedForms(completed);
    } catch (error) {
      showToast.error("Failed to fetch feedback forms");
    } finally {
      setLoading(false);
    }
  };

  const isFormExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="p-6 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* STUDENT CARD */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7FF] shadow-sm mb-6">
        <div className="w-16 h-16 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {(studentData?.firstName || user?.name || 'S')?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            {studentData?.firstName && studentData?.lastName 
              ? `${studentData.firstName} ${studentData.lastName}`
              : user?.name || "Student"}
          </h2>
          <p className="text-sm text-gray-500">
            Roll: {studentData?.rollNumber || studentData?.roll || user?.roll || "N/A"}
          </p>
          <p className="text-sm text-gray-500">
            Department: {studentData?.department || studentData?.branch || user?.department || "N/A"}
          </p>
        </div>
      </div>

      {/* PAGE HEADER */}
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">
        Feedback Forms
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Fill out feedback forms for your courses below.
      </p>

      {/* LOADING STATE */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading feedback forms...
        </div>
      ) : forms.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-gray-700">
            No feedback forms available at the moment.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Check back later for upcoming feedback opportunities.
          </p>
        </div>
      ) : (
        /* FEEDBACK FORMS LIST - GROUPED BY FACULTY */
        <div className="space-y-8">
          {forms.map((facultyGroup) => (
            <div key={facultyGroup.facultyId}>
              {/* Faculty Header Section */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-linear-to-r from-indigo-50 to-blue-50 border border-indigo-200 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-indigo-400 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {facultyGroup.facultyName?.charAt(0)?.toUpperCase() || 'F'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {facultyGroup.facultyName || 'Unknown Faculty'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {facultyGroup.forms?.length || 0} subject{facultyGroup.forms?.length !== 1 ? 's' : ''} to evaluate
                  </p>
                </div>
              </div>

              {/* Forms Grid for this Faculty */}
              <div className="grid grid-cols-3 gap-5">
                {facultyGroup.forms.map((form) => {
                  const isExpired = isFormExpired(form.endDate);
                  const daysRemaining = getDaysRemaining(form.endDate);
                  const isCompleted = completedForms.has(form._id);

                  return (
                    <div
                      key={form._id}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      {/* Card Header with Status Badge */}
                      <div className="relative bg-linear-to-r from-blue-500 to-indigo-600 text-white p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold">
                              {form.title}
                            </h3>
                            <p className="text-blue-100 text-xs mt-1">
                              Feedback Form
                            </p>
                          </div>
                          <div>
                            {isCompleted ? (
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-400 text-white">
                                <MdCheckCircle className="text-xl" />
                              </div>
                            ) : isExpired ? (
                              <span className="px-3 py-1 bg-red-400 text-white text-xs rounded-full font-semibold">
                                Expired
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-orange-400 text-white text-xs rounded-full font-semibold flex items-center gap-1">
                                <MdAccessTime className="text-sm" /> {daysRemaining}d
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subject/Course Information Inside Card Header */}
                        <div className="border-t border-blue-300 pt-3 mt-3">
                          <p className="text-base font-bold text-white mb-2">
                            {form.courseName}
                          </p>
                          {form.courseCode && (
                            <p className="text-xs text-blue-100 mb-1">
                              <span className="font-semibold">Code:</span> {form.courseCode}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 grow flex flex-col">
                        {/* Description */}
                        {form.description && (
                          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                            {form.description}
                          </p>
                        )}

                        {/* Form Meta Information */}
                        <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">📚 Questions</span>
                            <span className="font-semibold text-gray-900">
                              {form.questions?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">📅 Semester</span>
                            <span className="font-semibold text-gray-900">
                              {form.semester}
                            </span>
                          </div>
                          {form.section && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">🏫 Section</span>
                              <span className="font-semibold text-gray-900">
                                {form.section}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Deadline - Always show, even if expired */}
                        <div className="mt-auto p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          {isExpired ? (
                            <p className="text-sm text-red-600 font-semibold">
                              Form Expired
                            </p>
                          ) : (
                            <>
                              <p className="text-xs text-gray-600 mb-1">
                                <span className="font-semibold">Deadline:</span>
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(form.endDate).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-orange-600 font-semibold mt-1">
                                {daysRemaining} days remaining
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Card Footer - Action Button */}
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        {isCompleted ? (
                          <button
                            disabled
                            className="w-full py-3 bg-green-100 text-green-700 rounded-lg font-semibold cursor-default text-sm transition-colors"
                          >
                            ✓ Completed
                          </button>
                        ) : isExpired ? (
                          <button
                            disabled
                            className="w-full py-3 bg-gray-200 text-gray-600 rounded-lg font-semibold cursor-default text-sm"
                          >
                            Form Expired
                          </button>
                        ) : (
                          <Link
                            href={`/student/feedback/${form._id}`}
                            className="w-full block text-center px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm hover:shadow-lg font-semibold transition-all duration-300 transform hover:scale-105"
                          >
                            Start Feedback
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
