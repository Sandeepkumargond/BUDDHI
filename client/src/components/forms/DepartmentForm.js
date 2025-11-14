"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Department name is required"),
  code: z.string().min(1, "Department code is required"),
  established: z.string().min(4, "Enter a valid year"),
  status: z.string().min(1, "Status is required"),
  description: z.string().min(5, "Description is required"),
});

const DepartmentForm = ({ type, data }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data?.name || "",
      code: data?.code || "",
      established: data?.established || "",
      status: data?.status || "Active",
      description: data?.description || "",
    },
  });

  const onSubmit = (formData) => {
    console.log("Department Form Submitted:", formData);
    alert("Department submitted (check console)");
    reset();
  };

  return (
    <form
      className="flex flex-col gap-8 bg-[#F5F9FF] border border-[#DCE7FF] p-6 rounded-md shadow-sm"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-xl font-semibold text-gray-800">
        {type === "create" ? "Create a New Department" : "Update Department"}
      </h1>

      <span className="text-xs text-gray-500 font-medium tracking-wide">
        DEPARTMENT INFORMATION
      </span>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Name */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-600">Department Name</label>
          <input
            {...register("name")}
            className="p-2 rounded-md bg-white ring-1 ring-[#DCE7FF] text-sm focus:ring-blue-400"
            type="text"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Code */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-600">Department Code</label>
          <input
            {...register("code")}
            className="p-2 rounded-md bg-white ring-1 ring-[#DCE7FF] text-sm focus:ring-blue-400"
            type="text"
          />
          {errors.code && (
            <p className="text-xs text-red-500">{errors.code.message}</p>
          )}
        </div>

        {/* Established */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-600">Established Year</label>
          <input
            {...register("established")}
            className="p-2 rounded-md bg-white ring-1 ring-[#DCE7FF] text-sm focus:ring-blue-400"
            type="text"
            placeholder="e.g. 2001"
          />
          {errors.established && (
            <p className="text-xs text-red-500">{errors.established.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-600">Status</label>
          <select
            {...register("status")}
            className="p-2 rounded-md bg-white ring-1 ring-[#DCE7FF] text-sm focus:ring-blue-400"
          >
            <option value="Active">Active</option>
            <option value="In-Active">In-Active</option>
          </select>
          {errors.status && (
            <p className="text-xs text-red-500">{errors.status.message}</p>
          )}
        </div>

        {/* Description (Full Width) */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
          <label className="text-xs text-gray-600">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="p-2 rounded-md bg-white ring-1 ring-[#DCE7FF] text-sm focus:ring-blue-400"
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md shadow-md transition"
      >
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default DepartmentForm;
