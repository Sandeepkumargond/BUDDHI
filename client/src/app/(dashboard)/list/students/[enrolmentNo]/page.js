import Image from "next/image";
import Link from "next/link";
import Announcements from "@/components/Announcements";
import Performance from "@/components/Performance";
import BigCalendar from "@/components/BigCalender";
import { studentsData } from "@/lib/aryandata";
import ProfileClientSection from "./ProfileClientSection";

export default async function SingleStudentPage({ params }) {
  const resolvedParams = await params;
  const enrolmentNo = resolvedParams.enrolmentNo;

  const student = studentsData.find(
    (s) => String(s.enrolmentNo) === String(enrolmentNo)
  );

  if (!student) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">Student not found</h1>
        <p>No student with enrolment number {enrolmentNo} exists.</p>
        <Link href="/list/students" className="text-blue-600 underline mt-4 block">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP PROFILE CARD */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="bg-[#C3EBFA] py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={student.photo}
                alt={student.name}
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>

            <div className="w-2/3 flex flex-col gap-2">
              <h1 className="text-2xl font-semibold">{student.name}</h1>

              <p className="text-sm text-gray-500">
                {student.department} — Semester {student.semester} — Class {student.class}
              </p>

              <p className="text-sm">
                <strong>Roll:</strong> {student.rollNo} •
                <strong> Enrol:</strong> {student.enrolmentNo}
              </p>

              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Image src="/mail.png" width={14} height={14} alt="" />
                  {student.email}
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/phone.png" width={14} height={14} alt="" />
                  {student.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/id.png" width={14} height={14} alt="" />
                  {student.idCardNo}
                </div>
              </div>
            </div>
          </div>

          {/* Small cards */}
          <div className="flex-1 flex flex-wrap gap-4">
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%]">
              <Image src="/singleAttendance.png" width={24} height={24} alt="" />
              <div>
                <h1 className="text-xl font-semibold">{student.attendancePercent}%</h1>
                <span className="text-sm text-gray-400">Attendance</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%]">
              <Image src="/singleLesson.png" width={24} height={24} alt="" />
              <div>
                <h1 className="text-xl font-semibold">{student.sgpa?.length || 0}</h1>
                <span className="text-sm text-gray-400">Semesters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic section */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h2 className="font-semibold text-lg mb-3">Academic Details</h2>

          <p><strong>Course:</strong> {student.course}</p>
          <p><strong>Admission Year:</strong> {student.admissionYear}</p>
          <p><strong>Status:</strong> {student.status}</p>
          <p><strong>Mentor:</strong> {student.mentor}</p>
          <p><strong>CGPA:</strong> {student.cgpa}</p>
          <p><strong>Backlogs:</strong> {student.backlogs}</p>

          <div className="mt-3">
            <p className="font-medium">SGPA Records:</p>
            <div className="flex gap-2 flex-wrap text-sm mt-2">
              {student.sgpa?.map((s, i) => (
                <div key={i} className="p-2 bg-gray-100 rounded">
                  Sem {i + 1}: {s}
                </div>
              ))}
            </div>
          </div>

          {/* Client-only downloads section */}
          <ProfileClientSection student={student} />
        </div>

        {/* Schedule */}
        <div className="mt-4 bg-white rounded-md p-4 h-[520px]">
          <h1 className="text-lg font-semibold mb-2">Student's Schedule</h1>
          <BigCalendar />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        {/* Contact */}
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Contact</h1>

          <p className="mt-2"><strong>Email:</strong> {student.email}</p>
          <p className="mt-2"><strong>Phone:</strong> {student.phone}</p>
          <p className="mt-2"><strong>Alternate:</strong> {student.alternatePhone}</p>
          <p className="mt-2"><strong>City:</strong> {student.city}</p>
        </div>

        {/* Admin */}
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Admin Records</h1>

          <p className="mt-2"><strong>ID Card No:</strong> {student.idCardNo}</p>
          <p className="mt-2"><strong>Library Card:</strong> {student.libraryCardNo}</p>
          <p className="mt-2"><strong>Hostel:</strong> {student.hostel}</p>
          <p className="mt-2"><strong>Fee Status:</strong> {student.feeStatus}</p>
        </div>

        {/* Parent */}
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Parent Details</h1>

          <p className="mt-2"><strong>Name:</strong> {student.parentName}</p>
          <p className="mt-2"><strong>Phone:</strong> {student.parentPhone}</p>
          <p className="mt-2"><strong>Email:</strong> {student.parentEmail}</p>
        </div>

        <Performance />
        <Announcements />
      </div>
    </div>
  );
}
