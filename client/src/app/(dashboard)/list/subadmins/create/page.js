"use client";

import { showToast } from "@/lib/toast";

import { useState } from "react";
import { subAdmins } from "@/lib/subadmindata";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CreateSubadminPage() {
  const router = useRouter();

  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    department: "",
    email: "",
    phone: "",
    password: "",
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setUploadedPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextId = `SA${String(subAdmins.length + 1).padStart(3, "0")}`;

    const newSubadmin = {
      subAdminId: nextId,
      name: `${form.firstname} ${form.lastname}`,
      email: form.email,
      phone: form.phone,
      department: form.department,

      photo:
        uploadedPhoto ||
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1200",

      status: "active",
      dob: "",
      gender: "",
      city: "",
      state: "",
      address: "",
      pincode: "",
      permissions: [],
      createdAt: new Date().toISOString(),
    };

    subAdmins.push(newSubadmin);

    showToast.success("Sub Admin Created!");
    router.push("/list/subadmins");
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
        <input
          required
          type="text"
          placeholder="Sub Admin ID"
          className="border p-2 rounded w-full"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <select
          required
          className="border p-2 rounded w-full"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        >
          <option value="">Select Department</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="MECH">MECH</option>
        </select>

        <input
          required
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

        <input
          required
          type="password"
          placeholder="Password"
          className="border p-2 rounded w-full"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

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
