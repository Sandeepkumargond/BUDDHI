"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from "@/lib/toast";
import { departmentsData } from "@/lib/roushaniData";

export default function EditDepartmentPage() {
  const router = useRouter();
  const { id } = useParams();

  const department = departmentsData.find((d) => String(d.id) === id);

  const [form, setForm] = useState({
    name: department?.name || "",
    code: department?.code || "",
    established: department?.established || "",
    status: department?.status || "Active",
    description: department?.description || "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    showToast.success("Department updated successfully");
    router.push("/list/departments");
  };

  return (
    <div className="m-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-4xl">

      <h1 className="text-2xl font-semibold text-gray-700 mb-4">
        Edit Department
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="p-2 bg-[#F5F9FF] rounded-md ring-1 ring-[#DCE7FF]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Code</label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              className="p-2 bg-[#F5F9FF] rounded-md ring-1 ring-[#DCE7FF]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Established</label>
            <input
              name="established"
              type="number"
              value={form.established}
              onChange={handleChange}
              className="p-2 bg-[#F5F9FF] rounded-md ring-1 ring-[#DCE7FF]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="p-2 bg-[#F5F9FF] rounded-md ring-1 ring-[#DCE7FF]"
            >
              <option>Active</option>
              <option>In-Active</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="p-2 bg-[#F5F9FF] rounded-md ring-1 ring-[#DCE7FF]"
            
          />
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm">
            Update
          </button>

          <button
            type="button"
            onClick={() => router.push("/list/departments")}
            className="px-6 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}
