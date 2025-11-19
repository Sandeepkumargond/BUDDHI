"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { apiService } from "@/lib/api";

// Validation schema
const schema = z.object({
  name: z.string().min(3, "Course name is required"),
  code: z.string().min(2, "Course code is required"),
  credits: z.union([z.string(), z.number()]).refine((v) => Number(v) >= 0, {
    message: "Credits must be a positive number",
  }),
  semester: z.union([z.string(), z.number()]).refine((v) => Number(v) >= 1, {
    message: "Semester is required",
  }),
});

const CourseForm = ({ type, data, departmentId, onCreate }) => {
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
      credits: data?.credits || "",
      semester: data?.semester || "",
    },
  });

  const onSubmit = async (formData) => {
    const payload = {
      departmentId,
      name: formData.name,
      code: formData.code,
      credits: Number(formData.credits),
      semester: Number(formData.semester),
    };

    try {
      const res = await apiService.adminCreateCourse(payload);
      const created = res?.data?.course || res?.course || null;
      if (onCreate && created) onCreate(created);
      toast.success("Course added successfully");
      reset();
    } catch (e) {
      toast.error(e.message || "Failed to create course");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Add New Course" : "Update Course"}
      </h1>

      <div className="flex flex-wrap gap-4">
        
        {/* Course Name */}
        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-600">Course Name</label>
          <input
            {...register("name")}
            className="p-2 ring-1 ring-gray-300 bg-[#F8FBFF] rounded-md text-sm"
            type="text"
            placeholder="e.g. Data Structures"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Course Code */}
        <div className="flex flex-col gap-2 w-full md:w-[22%]">
          <label className="text-xs text-gray-600">Course Code</label>
          <input
            {...register("code")}
            className="p-2 ring-1 ring-gray-300 bg-[#F8FBFF] rounded-md text-sm"
            type="text"
            placeholder="CS201"
          />
          {errors.code && (
            <p className="text-xs text-red-500">{errors.code.message}</p>
          )}
        </div>

        {/* Credits */}
        <div className="flex flex-col gap-2 w-full md:w-[22%]">
          <label className="text-xs text-gray-600">Credits</label>
          <input
            {...register("credits")}
            className="p-2 ring-1 ring-gray-300 bg-[#F8FBFF] rounded-md text-sm"
            type="number"
            placeholder="3"
          />
          {errors.credits && (
            <p className="text-xs text-red-500">{errors.credits.message}</p>
          )}
        </div>

        {/* Semester */}
        <div className="flex flex-col gap-2 w-full md:w-[22%]">
          <label className="text-xs text-gray-600">Semester</label>
          <input
            {...register("semester")}
            className="p-2 ring-1 ring-gray-300 bg-[#F8FBFF] rounded-md text-sm"
            type="number"
            placeholder="1"
          />
          {errors.semester && (
            <p className="text-xs text-red-500">{errors.semester.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-sm shadow-md"
      >
        {type === "create" ? "Add Course" : "Update Course"}
      </button>
    </form>
  );
};

export default CourseForm;
