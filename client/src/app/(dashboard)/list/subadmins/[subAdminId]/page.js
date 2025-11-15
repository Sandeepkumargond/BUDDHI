"use client";

import { use, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { subAdmins } from "@/lib/subadmindata";

export default function SubAdminProfile({ params }) {
  const resolved = use(params);
  const subAdminId = resolved?.subAdminId;

  const subadmin = useMemo(() => {
    return subAdmins.find((s) => s.subAdminId === subAdminId);
  }, [subAdminId]);

  if (!subadmin) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold text-red-600">Sub Admin Not Found</h1>
        <Link href="/list/subadmins" className="underline text-blue-600 mt-2 block">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 flex flex-col gap-6">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow flex items-center gap-6">
        <Image
          src={subadmin.photo}
          width={140}
          height={140}
          className="rounded-full border"
          alt={subadmin.name}
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{subadmin.name}</h1>
          <p className="text-gray-600">
            {subadmin.department} • SubAdmin ID: {subadmin.subAdminId}
          </p>

          <div className="mt-3 flex gap-3 flex-wrap text-xs">
            <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full border">
              Phone: {subadmin.phone}
            </span>
            <span className="bg-green-50 text-green-800 px-3 py-1 rounded-full border">
              Email: {subadmin.email}
            </span>
            <span className="bg-purple-50 text-purple-800 px-3 py-1 rounded-full border">
              Status: {subadmin.status}
            </span>
          </div>
        </div>

        <Link href="/list/subadmins" className="text-sm hover:underline">
          ← Back
        </Link>
      </div>

      {/* INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* BASIC */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-3 border-b pb-2">Basic Info</h2>
          <p>DOB: {subadmin.dob}</p>
          <p>Gender: {subadmin.gender}</p>
          <p>City: {subadmin.city}</p>
          <p>State: {subadmin.state}</p>
          <p>Pincode: {subadmin.pincode}</p>
        </div>

        {/* OFFICE */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-3 border-b pb-2">Office Info</h2>
          <p>Date Of Joining: {subadmin.dateOfJoining}</p>
          <p>Reporting To: {subadmin.reportingTo}</p>
          <p>Shift: {subadmin.shift}</p>
          <p>Office Room: {subadmin.officeRoom}</p>
        </div>

        {/* ACCOUNT */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-3 border-b pb-2">Account Info</h2>
          <p>Password: *******</p>
          <p>Last Login: {subadmin.lastLogin}</p>
          <p>Two Factor: {String(subadmin.twoFactorEnabled)}</p>
          <p>Login Attempts: {subadmin.loginAttempts}</p>
        </div>

        {/* META */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-3 border-b pb-2">Meta Info</h2>
          <p>Created By: {subadmin.createdBy}</p>
          <p>Created At: {subadmin.createdAt}</p>
          <p>Updated At: {subadmin.updatedAt}</p>
          <p>Last Password Change: {subadmin.lastPasswordChange}</p>
        </div>
      </div>
    </div>
  );
}
