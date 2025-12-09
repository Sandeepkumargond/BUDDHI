import { Router } from "express";
import {
  submitFeedback,
  getFacultyFeedback,
  getAllFeedback,
  deleteFeedback,
  getFacultyRating,
  getFacultyRatings,
} from "../controllers/feedback.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Student routes
router.post("/student/submit-feedback", verifyToken, submitFeedback);

// Admin routes
router.get("/admin/feedback", verifyToken, getAllFeedback);
router.get("/admin/faculty-ratings", verifyToken, getFacultyRatings);
router.get("/faculty/:facultyId/feedback", verifyToken, getFacultyFeedback);
router.get("/faculty/:facultyId/rating", verifyToken, getFacultyRating);
router.delete("/admin/feedback/:feedbackId", verifyToken, deleteFeedback);

export default router;
