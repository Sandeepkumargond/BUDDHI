"use client";

import { showToast } from "@/lib/toast";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function CreateSubadminPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    department: "",
    email: "",
    phone: "",
    password: "",
  });

  const [autoEmail, setAutoEmail] = useState(true);
  const [autoPassword, setAutoPassword] = useState(true);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [createdSubadmin, setCreatedSubadmin] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setUploadedPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // build payload
    const firstName = form.firstname.trim();
    const lastName = form.lastname.trim();
    const department = form.department;

    if (!firstName || !lastName || !department) {
      showToast.error('First name, last name and department are required');
      return;
    }

  // generate email if requested
  let emailToUse = form.email.trim();
  // use authUser from the component scope (hooks can only be called at top-level of the component)
  const abbreviation = authUser?.abbreviation || 'college';

    if (autoEmail) {
      const localPart = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9\.]/g, '');
      emailToUse = `${localPart}@${abbreviation.toLowerCase()}.edu`;
    }

    // generate password if requested
    let passwordToUse = form.password;
    if (autoPassword || !passwordToUse) {
      // simple random password generator
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
      passwordToUse = Array.from({ length: 10 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    // call backend
    (async () => {
      try {
        const payload = {
          firstName,
          lastName,
          email: emailToUse,
          personalMail: emailToUse,
          department,
          password: passwordToUse,
        };

        const res = await apiService.request('/admin/create-subAdmin', {
          method: 'POST',
          body: payload,
        });

        const created = res?.data || res;
        setCreatedSubadmin(created);
        setCreatedCredentials({ email: emailToUse, password: passwordToUse });
        showToast.success('Sub Admin created successfully');
        // optionally navigate to list after a short delay
        setTimeout(() => router.push('/list/subadmins'), 1200);
      } catch (err) {
        console.error('Failed to create subadmin', err);
        showToast.error('Failed to create subadmin: ' + (err.message || err));
      }
    })();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded-lg mt-6">
      <h1 className="text-xl font-bold mb-4">Create Sub Admin</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* UPLOAD PHOTO */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 rounded-full border-2 overflow-hidden mb-3">
            <Image
              src={uploadedPhoto || "/upload2.png"}
              alt="Profile"
              width={112}
              height={112}
              className="object-cover p-2 w-full h-full"
            />
          </div>

          <label className="cursor-pointer bg-gray-200 px-3 py-1 rounded">
            Upload Photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          
          <input
            required
            type="text"
            placeholder="First Name"
            className="border p-2 rounded w-full"
            value={form.firstname}
            onChange={(e) => setForm({ ...form, firstname: e.target.value })}
          />
          <input
            required
            type="text"
            placeholder="Last Name"
            className="border p-2 rounded w-full"
            value={form.lastname}
            onChange={(e) => setForm({ ...form, lastname: e.target.value })}
          />
        </div>

        <select
          required
          className="border p-2 rounded w-full"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        >
          <option value="">Select Department</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="ME">ME</option>
          <option value="CE">CE</option>
          <option value="EE">EE</option>
          <option value="Architecture">Architecture</option>
          <option value="Chemical">Chemical</option>
          <option value="Biotech">Biotech</option>
          <option value="IT">IT</option>
        </select>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center">
            <input type="checkbox" checked={autoEmail} onChange={(e) => setAutoEmail(e.target.checked)} className="mr-2" />
            Auto-generate email
          </label>
        </div>

        <input
          required={!autoEmail}
          disabled={autoEmail}
          type="email"
          placeholder="Email"
          className="border p-2 rounded w-full"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          required
          type="text"
          placeholder="Phone No."
          className="border p-2 rounded w-full"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center">
            <input type="checkbox" checked={autoPassword} onChange={(e) => setAutoPassword(e.target.checked)} className="mr-2" />
            Auto-generate password
          </label>
        </div>

        <input
          required={!autoPassword}
          disabled={autoPassword}
          type="password"
          placeholder="Password"
          className="border p-2 rounded w-full"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {createdCredentials && (
          <div className="bg-green-50 border-green-200 p-3 rounded">
            <p className="font-semibold">Generated Credentials</p>
            <p>Email: <span className="font-mono">{createdCredentials.email}</span></p>
            <p>Password: <span className="font-mono">{createdCredentials.password}</span></p>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Create
        </button>
      </form>
    </div>
  );
}
