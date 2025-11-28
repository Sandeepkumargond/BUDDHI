"use client";

import Image from "next/image";
import Link from "next/link";
import { studentProfileData, currentSemesterSubjects } from "@/lib/roushaniData";

export default function SubjectListPage() {
  return (
    <div className="p-6 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">

      {/* STUDENT CARD */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7FF] shadow-sm mb-6">
        <Image
          src={studentProfileData.photo}
          alt="Profile"
          width={60}
          height={60}
          className="rounded-full border"
        />
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            {studentProfileData.name}
          </h2>
          <p className="text-sm text-gray-500">Roll: {studentProfileData.roll}</p>
          <p className="text-sm text-gray-500">
            Department: {studentProfileData.department}
          </p>
        </div>
      </div>

      {/* PAGE HEADER */}
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">
        Subject Feedback
      </h1>
      <p className="text-gray-500 text-sm mb-4">
        Select a subject to provide feedback for the current semester.
      </p>

      {/* SUBJECT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
        {currentSemesterSubjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-[#F5F9FF] border border-[#DCE7FF] p-5 rounded-xl shadow-sm hover:shadow-md transition"
          >
            {/* Subject Name */}
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              {subject.name}
            </h2>
            <p className="text-sm text-gray-500 mb-3">{subject.code}</p>

            {/* Faculty */}
            <div className="flex items-center gap-2 mb-3">
              <Image
                src={subject.facultyPhoto}
                alt={subject.faculty}
                width={35}
                height={35}
                className="rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">{subject.faculty}</p>
                <p className="text-xs text-gray-500">Faculty</p>
              </div>
            </div>

            {/* Credits */}
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Credits:</span> {subject.credits}
            </p>

            {/* Feedback Status */}
            <p className="text-sm mb-4">
              Status:{" "}
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  subject.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {subject.status}
              </span>
            </p>

            {/* Button */}
            <Link
              href={`/student/feedback/${subject.id}`}
              className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Give Feedback
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
