import { Feedback } from "../models/feedback.model.js";
import { Faculty } from "../models/faculty.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Submit feedback for a faculty member
export const submitFeedback = asyncHandler(async (req, res) => {
  const { studentId, facultyId, courseId, semester, academicYear, ratings, comments } = req.body;

  if (!studentId || !facultyId || !courseId || !semester || !academicYear || !ratings || ratings.length === 0) {
    throw new ApiError(400, "Missing required fields for feedback submission");
  }

  // Calculate average rating
  const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

  const feedback = await Feedback.create({
    studentId,
    facultyId,
    courseId,
    semester,
    academicYear,
    ratings,
    averageRating,
    comments,
  });

  // Update faculty rating
  await updateFacultyRating(facultyId, academicYear);

  res.status(201).json(new ApiResponse(201, feedback, "Feedback submitted successfully"));
});

// Get feedback for a specific faculty member
export const getFacultyFeedback = asyncHandler(async (req, res) => {
  const { facultyId, academicYear } = req.query;

  if (!facultyId) {
    throw new ApiError(400, "Faculty ID is required");
  }

  const query = { facultyId };
  if (academicYear) {
    query.academicYear = academicYear;
  }

  const feedback = await Feedback.find(query)
    .populate("studentId", "firstName lastName email")
    .populate("courseId", "name code");

  res.status(200).json(new ApiResponse(200, feedback, "Faculty feedback retrieved successfully"));
});

// Get all feedback
export const getAllFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const feedback = await Feedback.find()
    .populate("studentId", "firstName lastName email")
    .populate("facultyId", "firstName lastName")
    .populate("courseId", "name code")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Feedback.countDocuments();

  res.status(200).json(new ApiResponse(200, { feedback, total, page, limit }, "All feedback retrieved successfully"));
});

// Delete feedback
export const deleteFeedback = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;

  const feedback = await Feedback.findByIdAndDelete(feedbackId);

  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  // Recalculate faculty rating
  if (feedback.facultyId) {
    await updateFacultyRating(feedback.facultyId, feedback.academicYear);
  }

  res.status(200).json(new ApiResponse(200, {}, "Feedback deleted successfully"));
});

// Helper function to update faculty rating
async function updateFacultyRating(facultyId, academicYear) {
  try {
    const feedbackList = await Feedback.find({
      facultyId,
      academicYear: academicYear || { $exists: true },
    });

    if (feedbackList.length === 0) {
      // No feedback available, set rating to null
      await Faculty.findByIdAndUpdate(facultyId, { rating: null });
      return;
    }

    const averageRating =
      feedbackList.reduce((sum, f) => sum + (f.averageRating || 0), 0) / feedbackList.length;

    await Faculty.findByIdAndUpdate(facultyId, { rating: parseFloat(averageRating.toFixed(2)) });
  } catch (error) {
    console.error("Error updating faculty rating:", error);
  }
}

// Get faculty rating
export const getFacultyRating = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;

  const faculty = await Faculty.findById(facultyId).select("rating firstName lastName email");

  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  res.status(200).json(new ApiResponse(200, faculty, "Faculty rating retrieved successfully"));
});

// Get average rating for all faculty (for admin dashboard)
export const getFacultyRatings = asyncHandler(async (req, res) => {
  const faculties = await Faculty.find().select("firstName lastName rating department email").sort({ rating: -1 });

  res.status(200).json(new ApiResponse(200, faculties, "Faculty ratings retrieved successfully"));
});
