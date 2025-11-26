"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiService } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function SubAdminProfile({ params }) {
  // Prefer params passed to the page component, but fall back to client-side router params
  const routeParams = useParams ? useParams() : null;
  const subAdminId = params?.subAdminId || routeParams?.subAdminId;

  const [subadmin, setSubadmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subAdminId) {
      // nothing to fetch — avoid leaving the page stuck in loading state
      setLoading(false);
      setError('No subAdmin id provided');
      return;
    }
    const fetchSubAdmin = async () => {
      try {
        setLoading(true);
        const res = await apiService.request(`/admin/sub-admins/${encodeURIComponent(subAdminId)}`, { method: 'GET' });
        const s = res?.data?.subAdmin || res?.data?.user || res?.data || null;
        if (!s) throw new Error('SubAdmin not found');
        const normalized = {
          subAdminId: s._id || s.subAdminId,
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.personalMail || s.email,
          photo: s.imageUrl || '/avatar.png',
          department: s.department || s.collegeName || '',
          phone: s.mobile || s.phone || '',
          email: s.personalMail || s.email || '',
          dob: s.dateOfBirth || s.dob || '',
          gender: s.gender || '',
          city: s.city || '',
          state: s.state || '',
          pincode: s.pincode || s.pin || '',
          dateOfJoining: s.joiningDate || s.dateOfJoining || '',
          reportingTo: s.reportingTo || '',
          shift: s.shift || '',
          officeRoom: s.officeRoom || '',
          status: s.status || 'active',
          lastLogin: s.lastLogin || '',
          twoFactorEnabled: s.twoFactorEnabled || false,
          loginAttempts: s.loginAttempts || 0,
          createdBy: s.createdBy || '',
          createdAt: s.createdAt || s.created_at || '',
          updatedAt: s.updatedAt || s.updated_at || '',
          lastPasswordChange: s.lastPasswordChange || ''
        };
        setSubadmin(normalized);
      } catch (err) {
        console.error('Failed to fetch subadmin', err);
        setError(err.message || 'Failed to load subadmin');
      } finally {
        setLoading(false);
      }
    };

    fetchSubAdmin();
  }, [subAdminId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-red-600">Error</h1>
      <p className="text-red-600">{error}</p>
      <Link href="/list/subadmins" className="underline text-blue-600 mt-2 block">Back</Link>
    </div>
  );

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
