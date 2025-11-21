"use client"

import { use, useState, useEffect } from "react";
import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import FormModal from "@/components/FormModal";
import Performance from "@/components/Performance";
import Image from "next/image";
import Link from "next/link";
import { apiService } from '@/lib/api';
import { deptartmentMap } from '@/lib/maps';
import { role } from "@/lib/data";

export default function SinglefacultyPage({ params }) {
  const resolved = use(params);
  const id = resolved?.id || resolved?._id || resolved?.facultyId;
  console.log(id)

  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchFaculty = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.request(`/faculty/${id}`);
        const f = res && res.data ? res.data : null;
        if (!f) {
          setFaculty(null);
          return;
        }

        const mapped = {
          id: f._id,
          facultyId: f.facultyId || '',
          firstName: f.firstName || '',
          lastName: f.lastName || '',
          name: `${f.firstName || ''} ${f.lastName || ''}`.trim() || f.name || '',
          img: f.imageUrl || f.image || '/default-avatar.png',
          photo: f.imageUrl || f.image || '/default-avatar.png',
          email: f.email || f.personalMail || '',
          phone: f.mobile || '',
          department: f.department || '',
          departmentName: deptartmentMap[f.department] ? `${deptartmentMap[f.department]} (${f.department})` : (f.department || ''),
          bloodType: f.bloodGroup || '',
          dateOfBirth: f.dateOfBirth ? new Date(f.dateOfBirth).toLocaleDateString() : '',
          address: f.address || '',
          joiningDate: f.joiningDate ? new Date(f.joiningDate).toLocaleDateString() : '',
        };

        setFaculty(mapped);
      } catch (err) {
        console.error('Failed to fetch faculty:', err);
        setError(err.message || 'Failed to fetch faculty');
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <p className="text-gray-600">Loading faculty...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4">
        <h1 className="text-xl font-semibold text-red-600">Error</h1>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="flex-1 p-4">
        <h1 className="text-xl font-semibold">Faculty not found</h1>
      </div>
    );
  }

  const firstName = faculty.firstName || (faculty.name || "").split(" ")[0] || "";
  const lastName = faculty.lastName || (faculty.name || "").split(" ").slice(1).join(" ") || "";

  const formData = {
    id: faculty.id,
    username: faculty.facultyId || (faculty.name || "").toLowerCase().replace(/\s+/g, "") || `user${faculty.id}`,
    email: faculty.email || "",
    password: "",
    firstName,
    lastName,
    phone: faculty.phone || "",
    address: faculty.address || "",
    bloodType: faculty.bloodType || "A+",
    dateOfBirth: faculty.dateOfBirth || "",
    sex: "",
    img: faculty.img || faculty.photo || "",
    departments: faculty.department || "",
  };

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
                src={faculty.img || faculty.photo}
                alt={faculty.name}
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{`${firstName} ${lastName}`.trim() || faculty.name}</h1>
                {role === "admin" && (
                  <FormModal table="faculty" type="update" data={formData} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {faculty.departmentName}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>{faculty.bloodType || "—"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>{faculty.dateOfBirth || "—"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{faculty.email}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{faculty.phone}</span>
                </div>
                
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">90%</h1>
                <span className="text-sm text-gray-400">Attendance</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">2</h1>
                <span className="text-sm text-gray-400">Branches</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">6</h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">6</h1>
                <span className="text-sm text-gray-400">Classes</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1>faculty&apos;s Schedule</h1>
          <BigCalendar />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link className="p-3 rounded-md bg-[#C3EBFA]Light" href="/">
              faculty&apos;s Classes
            </Link>
            <Link className="p-3 rounded-md bg-[#CFCEFF]Light" href="/">
              faculty&apos;s Students
            </Link>
            <Link className="p-3 rounded-md bg-[#FAE27C]Light" href="/">
              faculty&apos;s Lessons
            </Link>
            <Link className="p-3 rounded-md bg-pink-50" href="/">
              faculty&apos;s Exams
            </Link>
            <Link className="p-3 rounded-md bg-[#C3EBFA]Light" href="/">
              faculty&apos;s Assignments
            </Link>
          </div>
        </div>
        <Performance />
        <Announcements />
      </div>
    </div>
  );
}
