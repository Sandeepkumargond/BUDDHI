import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Scholarship } from "../models/scholarship.model.js";
import { Student } from "../models/student.model.js";
import mongoose from "mongoose";

// Student: Apply for scholarship
export const applyScholarship = asyncHandler(async (req, res) => {
  const { scholarshipName, scholarshipType, amount, duration, statement } = req.body;
  const studentId = req.user._id;

  if (!scholarshipName || !amount) {
    throw new ApiError(400, "Scholarship name and amount are required");
  }

  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount) || numericAmount < 0) {
    throw new ApiError(400, "Amount must be a non-negative number");
  }

  const documentUrl = req.file?.path || req.body.documentUrl || "";

  const scholarship = await Scholarship.create({
    student: studentId,
    scholarshipName,
    scholarshipType: scholarshipType || "merit",
    amount: numericAmount,
    duration,
    statement,
    documentUrl,
    status: "pending",
  });

  return res.status(201).json(new ApiResponse(201, { scholarship }, "Scholarship application submitted"));
});

// Student: List my scholarships
export const getMyScholarships = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { status, page = 1, limit = 20 } = req.query;

  const query = { student: studentId };
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query.status = status;
  }

  const scholarships = await Scholarship.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Scholarship.countDocuments(query);

  return res
    .status(200)
    .json(new ApiResponse(200, { scholarships, total, page: parseInt(page), limit: parseInt(limit) }, "Scholarships fetched"));
});

// Admin: List all scholarships
export const getAllScholarships = asyncHandler(async (req, res) => {
  const { status, search = "", page = 1, limit = 20 } = req.query;
  const query = {};
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query.status = status;
  }

  const searchRegex = search ? new RegExp(search, "i") : null;
  if (searchRegex) {
    query.$or = [
      { scholarshipName: searchRegex },
      { statement: searchRegex },
    ];
  }

  const scholarships = await Scholarship.find(query)
    .populate({ path: "student", select: "firstName lastName email enrolmentNo isScholarshipHolder scholarshipDetails" })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Scholarship.countDocuments(query);

  return res
    .status(200)
    .json(new ApiResponse(200, { scholarships, total, page: parseInt(page), limit: parseInt(limit) }, "Scholarships fetched"));
});

// Admin: Review scholarship application
export const reviewScholarship = asyncHandler(async (req, res) => {
  const { scholarshipId } = req.params;
  const { status, adminRemarks } = req.body;
  const adminId = req.user?._id;

  if (!mongoose.isValidObjectId(scholarshipId)) {
    throw new ApiError(400, "Invalid scholarship id");
  }

  if (!status || !["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be approved or rejected");
  }

  const scholarship = await Scholarship.findById(scholarshipId);
  if (!scholarship) {
    throw new ApiError(404, "Scholarship not found");
  }

  if (scholarship.status !== "pending") {
    throw new ApiError(400, "Only pending scholarships can be reviewed");
  }

  if (status === "approved") {
    const approvedExists = await Scholarship.findOne({
      student: scholarship.student,
      status: "approved",
      _id: { $ne: scholarshipId },
    });
    if (approvedExists) {
      throw new ApiError(400, "Student already has an approved scholarship");
    }
  }

  scholarship.status = status;
  scholarship.adminRemarks = adminRemarks;
  scholarship.reviewedBy = adminId;
  scholarship.reviewedAt = new Date();
  await scholarship.save();

  if (status === "approved") {
    await Student.findByIdAndUpdate(scholarship.student, {
      isScholarshipHolder: true,
      scholarshipDetails: scholarship._id,
    });
  } else if (status === "rejected") {
    const student = await Student.findById(scholarship.student);
    if (student && student.scholarshipDetails?.toString() === scholarship._id.toString()) {
      student.isScholarshipHolder = false;
      student.scholarshipDetails = null;
      await student.save();
    }
  }

  return res.status(200).json(new ApiResponse(200, { scholarship }, "Scholarship review updated"));
});
