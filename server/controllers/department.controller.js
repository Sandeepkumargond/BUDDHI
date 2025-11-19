import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Department } from "../models/department.model.js";
import { Faculty } from "../models/faculty.model.js";
import { Student } from "../models/student.model.js";

export const adminGetDepartmentByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;
  if (!code) throw new ApiError(400, "Department code is required");
  const dept = await Department.findOne({ code }).populate("hod", "firstName lastName email mobile imageUrl department designation");
  if (!dept) throw new ApiError(404, "Department not found");

  const facultyCount = await Faculty.countDocuments({ department: code });
  const studentCount = await Student.countDocuments({ branch: code });

  return res.status(200).json(
    new ApiResponse(200, { department: dept, stats: { facultyCount, studentCount } }, "Department fetched successfully")
  );
});

export const adminUpdateDepartmentHod = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { facultyId } = req.body || {};
  if (!code) throw new ApiError(400, "Department code is required");
  if (!facultyId) throw new ApiError(400, "facultyId is required");

  const dept = await Department.findOne({ code });
  if (!dept) throw new ApiError(404, "Department not found");

  const faculty = await Faculty.findById(facultyId).select("_id department firstName lastName email mobile imageUrl designation");
  if (!faculty) throw new ApiError(404, "Faculty not found");
  if (faculty.department !== code) throw new ApiError(400, "Faculty does not belong to this department");

  dept.hod = faculty._id;
  await dept.save();
  const updated = await Department.findById(dept._id).populate("hod", "firstName lastName email mobile imageUrl department designation");

  return res.status(200).json(new ApiResponse(200, { department: updated }, "Department HOD updated"));
});

export const adminListDepartments = asyncHandler(async (_req, res) => {
  const departments = await Department.find({}).populate("hod", "firstName lastName email mobile imageUrl department designation");
  return res.status(200).json(new ApiResponse(200, { departments }, "Departments fetched"));
});
