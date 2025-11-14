// src/app/(dashboard)/list/students/[enrolmentNo]/page.js
"use client";

import { use, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { studentsData } from "@/lib/aryandata";
import ProfileClientSection from "./ProfileClientSection";

export default function SingleStudentPage({ params }) {
  // params is a Promise in Next.js 13+ (App Router)
  const resolved = use(params);
  const enrolmentNo = resolved?.enrolmentNo;

  const student = useMemo(() => {
    return studentsData.find(
      (s) => String(s.enrolmentNo) === String(enrolmentNo)
    );
  }, [enrolmentNo]);

  if (!student) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">Student Not Found</h1>
        <Link href="/list/students" className="text-blue-600 underline mt-4 block">
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 flex flex-col gap-4">
      {/* TOP HEADER CARD */}
      <div className="p-6 bg-white rounded-lg shadow flex gap-6 items-center">
        <Image
          src={student.photo}
          alt={student.name}
          width={140}
          height={140}
          className="rounded-full border shadow object-cover"
        />

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-gray-600 text-sm mt-1">
            {student.department} • Sem {student.semester} • Class {student.class}
          </p>

          <div className="mt-2 flex gap-3 flex-wrap text-xs">
            <span className="bg-gray-100 px-3 py-1 rounded-full border">
              Roll: {student.rollNo}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full border">
              Enrol: {student.enrolmentNo}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full border">
              Status: {student.status}
            </span>
          </div>
        </div>

        <Link
          href="/list/students"
          className="text-sm text-slate-600 hover:text-black"
        >
          ← Back
        </Link>
      </div>

      {/* 2 COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LEFT SIDE (INFO SECTIONS) */}
        <div className="md:col-span-2 flex flex-col gap-4">

          {/* BASIC INFORMATION */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="font-semibold mb-3 text-lg">Basic Information</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>DOB: {student.dob}</div>
              <div>Gender: {student.gender}</div>
              <div>Blood Group: {student.bloodGroup}</div>
              <div>Category: {student.category}</div>
              <div>Nationality: {student.nationality}</div>
            </div>
          </div>

          {/* CONTACT */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="font-semibold mb-3 text-lg">Contact</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>Phone: {student.phone}</div>
              <div>Email: {student.email}</div>
              <div>Alternate Phone: {student.alternatePhone}</div>
              <div>City: {student.city}, {student.state}</div>
              <div className="col-span-2">Current Address: {student.currentAddress}</div>
              <div className="col-span-2">Permanent Address: {student.permanentAddress}</div>
              <div>Pincode: {student.postalCode}</div>
            </div>
          </div>

          {/* ACADEMIC */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="font-semibold mb-3 text-lg">Academic Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>Course: {student.course}</div>
              <div>Department: {student.department}</div>
              <div>Semester: {student.semester}</div>
              <div>Class: {student.class}</div>
              <div>Mentor: {student.mentor}</div>
              <div>CGPA: {student.cgpa}</div>
              <div>Backlogs: {student.backlogs}</div>
              <div>Fee Status: {student.feeStatus}</div>
            </div>
          </div>

          {/* ADMIN + PARENT */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="font-semibold mb-3 text-lg">Admin & Parent</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>ID Card: {student.idCardNo}</div>
              <div>Library Card: {student.libraryCardNo}</div>
              <div>Hostel: {student.hostel}</div>
              <div>Scholarship: {student.scholarship}</div>

              <div className="col-span-2 mt-3 font-semibold">
                Parent / Guardian
              </div>
              <div>Name: {student.parentName}</div>
              <div>Phone: {student.parentPhone}</div>
              <div>Email: {student.parentEmail}</div>
              <div>Occupation: {student.parentOccupation}</div>
            </div>
          </div>

          {/* MISC */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="font-semibold mb-3 text-lg">Miscellaneous</h2>
            <div className="text-sm space-y-2">
              <div>Aadhar: {student.aadhar}</div>
              <div>Health Issues: {student.healthIssues}</div>
              <div>Insurance: {student.insurance}</div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — DOWNLOADS */}
        <div>
          <ProfileClientSection student={student} />
        </div>
      </div>
    </div>
  );
}
