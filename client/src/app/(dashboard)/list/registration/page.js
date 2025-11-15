"use client";

import { useState } from "react";
import {
  studentProfileData,
  registeredSemesters,
  semesterCourses,
} from "@/lib/roushaniData";
import Image from "next/image";
import Link from "next/link";

export default function RegistrationPage() {
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courses, setCourses] = useState([]);

  const handleSemesterChange = (sem) => {
    setSelectedSemester(sem);
    setCourses(semesterCourses[sem] || []);
  };

  return (
    <div className="p-6 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">

      {/* ============================
          STUDENT HEADER CARD
         ============================ */}
      <div className="flex items-center gap-4 p-5 rounded-xl bg-[#F5F9FF] border border-[#DCE7FF] shadow-sm mb-6">
        <Image
          src={studentProfileData.photo}
          alt="Profile"
          width={65}
          height={65}
          className="rounded-full border border-gray-200"
        />
        <div>
          <h2 className="text-xl font-semibold text-gray-700">
            {studentProfileData.name}
          </h2>
          <p className="text-sm text-gray-500">Roll: {studentProfileData.roll}</p>
          <p className="text-sm text-gray-500">
            Department: {studentProfileData.department}
          </p>
        </div>
      </div>

      {/* ============================
          PAGE TITLES
         ============================ */}
      <h1 className="text-2xl font-semibold text-gray-700 mb-1">
        Semester Registration
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Complete your semester registration by selecting the semester and reviewing the course list.
      </p>

      {/* ============================
          REGISTRATION STATUS
         ============================ */}
    {/* ============================
    REGISTRATION STATUS
   ============================ */}
<div className="p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7FF] shadow-sm mb-6">
  <h3 className="text-sm font-medium text-gray-600 mb-2">
    Registration Status
  </h3>

  {selectedSemester ? (
    <div className="flex items-center gap-3">

      <p className="text-base font-semibold text-gray-700">
        Semester {selectedSemester}
      </p>

      {/* STATUS BADGE */}
      {registeredSemesters.some(
        (s) => s.value === selectedSemester && s.status === "completed"
      ) ? (
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          Completed
        </span>
      ) : (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
          Pending
        </span>
      )}
    </div>
  ) : (
    <p className="text-sm text-gray-500">No semester selected.</p>
  )}
</div>


      {/* ============================
          SEMESTER SELECTION
         ============================ */}
      <div className="bg-[#F5F9FF] border border-[#DCE7FF] p-4 rounded-xl shadow-sm mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Select Semester
        </label>

        <select
          value={selectedSemester}
          onChange={(e) => handleSemesterChange(e.target.value)}
          className="w-full p-3 rounded-md bg-white ring-1 ring-gray-300 text-sm focus:ring-blue-400"
        >
          <option value="">-- Choose Semester --</option>
          {registeredSemesters.map((sem) => (
            <option key={sem.id} value={sem.value}>
              {sem.label}
            </option>
          ))}
        </select>
      </div>

      {/* ============================
          COURSE TABLE
         ============================ */}
      {selectedSemester && (
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Courses for Semester {selectedSemester}
          </h2>

          {courses.length === 0 ? (
            <p className="text-sm text-gray-500">No courses found.</p>
          ) : (
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-[#E9F2FF] text-gray-700">
                <tr>
                  <th className="p-3 text-left">Course Code</th>
                  <th className="p-3 text-left">Course Name</th>
                  <th className="p-3 text-left">Credits</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-gray-200 hover:bg-[#F7FBFF]"
                  >
                    <td className="p-3">{c.code}</td>
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ============================
          FEE PAYMENT BUTTON
         ============================ */}
      {selectedSemester && (
        <div className="flex justify-end">
          <Link
            href="/list/fee/payment"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shadow-sm"
          >
            Proceed to Fee Payment
          </Link>
        </div>
      )}
    </div>
  );
}
