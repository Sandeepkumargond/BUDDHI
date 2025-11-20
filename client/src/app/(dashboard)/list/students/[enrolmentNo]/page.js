// src/app/(dashboard)/list/students/[enrolmentNo]/page.js
"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProfileClientSection from "./ProfileClientSection";
import { apiService } from '@/lib/api';

export default function SingleStudentPage({ params }) {
  const resolved = use(params);
  const enrolmentNo = resolved?.enrolmentNo;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enrolmentNo) return;

    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      try {
        // server route: GET /api/v1/student/:id
        const res = await apiService.request(`/student/${enrolmentNo}`);
        console.log('Fetched student data:', res);
        // res.data is the student document
        const s = res && res.data ? res.data : null;
        if (!s) {
          setStudent(null);
          return;
        }

        // Map server fields to the client shape used in this page
        const mapped = {
          _id: s._id,
          photo: s.imageUrl || '/student.png',
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          department: s.branch || s.department || '',
          semester: s.semester || '',
          class: s.section || s.class || '',
          rollNo: s.rollNo || '',
          enrolmentNo: s.enrollmentNo || s.enrolmentNo || '',
          status: s.accountStatus || s.status || '',
          dob: s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : '',
          gender: s.gender || '',
          bloodGroup: s.bloodGroup || '',
          category: s.category || '',
          nationality: s.nationality || '',
          phone: s.mobile || s.fatherMobile || '',
          email: s.email || s.personalMail || '',
          alternatePhone: s.alternatePhone || '',
          city: s.city || '',
          state: s.state || '',
          currentAddress: s.address || s.currentAddress || '',
          permanentAddress: s.permanentAddress || '',
          postalCode: s.postalCode || s.pincode || '',
          course: s.program || s.course || '',
          mentor: s.mentor || '',
          cgpa: s.cgpa || '',
          backlogs: s.backlogs || '',
          feeStatus: s.feeStatus || '',
          idCardNo: s.idCardNo || '',
          libraryCardNo: s.libraryCardNo || '',
          hostel: s.hostelAlloted || s.hostel || '',
          scholarship: s.scholarshipDetails || s.scholarship || '',
          parentName: s.fatherName || '',
          parentPhone: s.fatherMobile || s.parentPhone || '',
          parentEmail: s.parentEmail || s.personalMail || '',
          parentOccupation: s.fatherOccupation || s.parentOccupation || '',
          aadhar: s.aadharNo || s.aadhar || '',
          healthIssues: s.healthIssues || '',
          insurance: s.insurance || '',
        };

        setStudent(mapped);
      } catch (err) {
        console.error('Failed to fetch student:', err);
        setError(err.message || 'Failed to fetch student');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [enrolmentNo]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading student...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-red-600">Error</h1>
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/list/students" className="text-blue-600 underline mt-4 block">
          Back to Students
        </Link>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-red-600">Student Not Found</h1>
        <Link href="/list/students" className="text-blue-600 underline mt-4 block">
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 bg-gray-50">
      {/* TOP HEADER CARD */}
      <div className="p-6 bg-white rounded-xl shadow-md border flex gap-6 items-center">
        <Image
          src={student.photo}
          alt={student.name}
          width={140}
          height={140}
          className="rounded-full border-2 shadow object-cover"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600 text-sm mt-1">
            {student.department} • Sem {student.semester} • Class {student.class}
          </p>

          <div className="mt-3 flex gap-3 flex-wrap text-xs">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              Roll: {student.rollNo}
            </span>
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
              Enrol: {student.enrolmentNo}
            </span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
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

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="md:col-span-2 flex flex-col gap-6">

          {/* BASIC INFO */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="font-semibold mb-4 text-lg text-gray-800 border-b pb-2 drop-shadow-[0_0_8px_rgba(255,182,193,0.45)]">
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>DOB: {student.dob}</div>
              <div>Gender: {student.gender}</div>
              <div>Blood Group: {student.bloodGroup}</div>
              <div>Category: {student.category}</div>
              <div>Nationality: {student.nationality}</div>
            </div>
          </div>

          {/* CONTACT */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="font-semibold mb-4 text-lg text-gray-800 border-b pb-2 drop-shadow-[0_0_8px_rgba(255,182,193,0.45)]">
              Contact
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
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
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="font-semibold mb-4 text-lg text-gray-800 border-b pb-2 drop-shadow-[0_0_8px_rgba(255,182,193,0.45)]">
              Academic Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
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

          {/* ADMIN DETAILS */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="font-semibold mb-4 text-lg text-gray-800 border-b pb-2 drop-shadow-[0_0_8px_rgba(255,182,193,0.45)]">
              Admin Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>ID Card: {student.idCardNo}</div>
              <div>Library Card: {student.libraryCardNo}</div>
              <div>Hostel: {student.hostel}</div>
              <div>Scholarship: {student.scholarship}</div>
            </div>
          </div>

          {/* PARENT DETAILS */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="font-semibold mb-4 text-lg text-gray-800 border-b pb-2 drop-shadow-[0_0_8px_rgba(255,182,193,0.45)]">
              Parent / Guardian
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>Name: {student.parentName}</div>
              <div>Phone: {student.parentPhone}</div>
              <div>Email: {student.parentEmail}</div>
              <div>Occupation: {student.parentOccupation}</div>
            </div>
          </div>

          {/* MISC */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="font-semibold mb-4 text-lg text-gray-800 border-b pb-2 drop-shadow-[0_0_8px_rgba(255,182,193,0.45)]">
              Miscellaneous
            </h2>
            <div className="text-sm text-gray-700 space-y-3">
              <div>Aadhar: {student.aadhar}</div>
              <div>Health Issues: {student.healthIssues}</div>
              <div>Insurance: {student.insurance}</div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div>
          <ProfileClientSection student={student} />
        </div>

      </div>
    </div>
  );
}
