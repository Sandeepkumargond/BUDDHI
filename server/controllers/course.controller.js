import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Course } from "../models/course.model.js";

export const adminCreateCourse = asyncHandler(async (req, res) => {
  const { name, code, credits, semester, departmentId } = req.body || {};

  if (!name) throw new ApiError(400, "Course name is required");
  if (!code) throw new ApiError(400, "Course code is required");
  if (credits === undefined) throw new ApiError(400, "Credits are required");
  if (!semester) throw new ApiError(400, "Semester is required");
  if (!departmentId && departmentId !== 0) throw new ApiError(400, "departmentId is required");

  const course = await Course.create({
    name,
    code,
    credits: Number(credits),
    semester: Number(semester),
    departmentId: Number(departmentId),
  });

  return res.status(201).json(
    new ApiResponse(201, { course }, "Course created successfully")
  );
});

export const adminListDepartmentCourses = asyncHandler(async (req, res) => {
  const deptId = Number(req.params.departmentId);
  if (!deptId) throw new ApiError(400, "departmentId is required in path");

  const courses = await Course.find({ departmentId: deptId }).sort({ semester: 1, code: 1 });
  return res.status(200).json(new ApiResponse(200, { courses }, "Courses fetched"));
});

export const adminDeleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Course id is required");

  const deleted = await Course.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Course not found");

  return res.status(200).json(new ApiResponse(200, {}, "Course deleted"));
});
