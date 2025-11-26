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

// New: list courses by department code (e.g., CSE, EE) with optional semester filter
export const adminListDepartmentCoursesByCode = asyncHandler(async (req, res) => {
  const { code } = req.params || {};
  if (!code) throw new ApiError(400, "department code is required in path");

  // Centralized mapping to align with numeric departmentId used in Course documents
  const deptCodeToId = { CSE: 1, EE: 2, ME: 3, CE: 4, ECE: 5 };
  const deptId = deptCodeToId[code];
  if (!deptId) throw new ApiError(400, `Unknown department code: ${code}`);

  const semesterParam = req.query?.semester;
  const query = { departmentId: Number(deptId) };
  if (semesterParam !== undefined) {
    query.semester = Number(semesterParam);
  }

  const courses = await Course.find(query).sort({ semester: 1, code: 1 });
  return res.status(200).json(new ApiResponse(200, { courses }, "Courses fetched"));
});

export const adminDeleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Course id is required");

  const deleted = await Course.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Course not found");

  return res.status(200).json(new ApiResponse(200, {}, "Course deleted"));
});

export const adminListAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({}).sort({ departmentId: 1, semester: 1, code: 1 });
  return res.status(200).json(new ApiResponse(200, { courses }, "All courses fetched"));
});

// Get courses for dropdown selection (formatted for grade card)
export const getCoursesForGradeCard = asyncHandler(async (req, res) => {
  const { semester } = req.query;

  let query = {};
  if (semester) {
    query.semester = parseInt(semester);
  }

  const courses = await Course.find(query)
    .select('name code credits semester departmentId')
    .sort({ semester: 1, code: 1 });

  // Format courses for dropdown display
  const formattedCourses = courses.map(course => ({
    _id: course._id,
    code: course.code,
    name: course.name,
    credits: course.credits,
    semester: course.semester,
    departmentId: course.departmentId,
    displayText: `${course.code} - ${course.name}`,
    value: `${course.code}|${course.name}|${course.credits}`
  }));

  return res.status(200).json(
    new ApiResponse(200, { courses: formattedCourses }, "Courses for grade card retrieved successfully")
  );
});
