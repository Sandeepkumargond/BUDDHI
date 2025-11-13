// app/list/students/[enrolmentNo]/page.js
import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import Performance from "@/components/Performance";
import Image from "next/image";
import Link from "next/link";
import { studentsData } from "@/lib/data";

export default function SingleStudentPage({ params }) {
  const { enrolmentNo } = params;
  const student = studentsData.find((s) => s.enrolmentNo === enrolmentNo);

  if (!student) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">Student not found</h1>
        <p>No student with enrolment number {enrolmentNo} was found.</p>
        <Link href="/list/students" className="text-blue-600 underline mt-4 block">
          Back to students
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
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
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <h1 className="text-xl font-semibold">{student.name}</h1>
              <p className="text-sm text-gray-500">
                {student.department} — {student.semester} — Class {student.className}
              </p>

              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="flex items-center gap-2">
                  <Image src="/mail.png" alt="email" width={14} height={14} />
                  <span>{student.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Image src="/phone.png" alt="phone" width={14} height={14} />
                  <span>{student.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Image src="/id.png" alt="roll" width={14} height={14} />
                  <span>Roll: {student.rollNo}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Image src="/id.png" alt="enrol" width={14} height={14} />
                  <span>Enrol: {student.enrolmentNo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%]">
              <Image src="/singleAttendance.png" alt="" width={24} height={24} />
              <div>
                <h1 className="text-xl font-semibold">90%</h1>
                <span className="text-sm text-gray-400">Attendance</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%]">
              <Image src="/singleBranch.png" alt="" width={24} height={24} />
              <div>
                <h1 className="text-xl font-semibold">{student.department}</h1>
                <span className="text-sm text-gray-400">Department</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%]">
              <Image src="/singleLesson.png" alt="" width={24} height={24} />
              <div>
                <h1 className="text-xl font-semibold">18</h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%]">
              <Image src="/singleClass.png" alt="" width={24} height={24} />
              <div>
                <h1 className="text-xl font-semibold">{student.className}</h1>
                <span className="text-sm text-gray-400">Class</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[600px]">
          <h1 className="text-lg font-semibold mb-2">Student's Schedule</h1>
          <BigCalendar />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Contact & Address</h1>
          <div className="mt-3 text-sm text-gray-600">
            <div>
              <strong>Email:</strong> {student.email}
            </div>
            <div className="mt-2">
              <strong>Phone:</strong> {student.phone}
            </div>
            <div className="mt-2">
              <strong>Address:</strong> {student.address}
            </div>
            <div className="mt-2">
              <strong>Roll No:</strong> {student.rollNo}
            </div>
            <div className="mt-2">
              <strong>Enrolment No:</strong> {student.enrolmentNo}
            </div>
          </div>
        </div>

        <Performance />
        <Announcements />
      </div>
    </div>
  );
}
