"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from "@/lib/toast";

export default function CreateDepartmentPage() {
  const router = useRouter();

  // Local form state (no react-hook-form)
  const [form, setForm] = useState({
    name: "",
    code: "",
    established: "",
    status: "Active",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    showToast.success("Department created successfully");

    router.push("/admin/departments");
  };

  return (
    <div className="m-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-4xl">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Create New Department</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details below to add a department.
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Department Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Computer Science"
              className="p-2 rounded-md bg-[#F5F9FF] ring-1 ring-[#DCE7FF]"
              required
            />
          </div>

          {/* Code */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Department Code</label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="CSE"
              className="p-2 rounded-md bg-[#F5F9FF] ring-1 ring-[#DCE7FF]"
              required
            />
          </div>

          {/* Established */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Established Year</label>
            <input
              name="established"
              type="number"
              value={form.established}
              onChange={handleChange}
              placeholder="2001"
              className="p-2 rounded-md bg-[#F5F9FF] ring-1 ring-[#DCE7FF]"
              required
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="p-2 rounded-md bg-[#F5F9FF] ring-1 ring-[#DCE7FF]"
            >
              <option>Active</option>
              <option>In-Active</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Enter department details..."
            className="p-2 rounded-md bg-[#F5F9FF] ring-1 ring-[#DCE7FF]"
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 text-sm"
          >
            Create
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/departments")}
            className="px-6 py-2 text-gray-600 rounded-md border text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}
