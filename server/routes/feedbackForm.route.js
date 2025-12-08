import { Router } from "express";
import {
  createFeedbackForm,
  getAllFeedbackForms,
  getFeedbackFormById,
  getFeedbackFormsForStudent,
  getFeedbackFormForStudent,
  updateFeedbackForm,
  deleteFeedbackForm,
  activateFeedbackForm,
  closeFeedbackForm,
  submitFeedbackForm,
  getFacultyFeedbackAnalytics,
  getFacultyFeedbackDetails,
} from "../controllers/feedbackForm.controller.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";
import { authenticateStudent } from "../middlewares/student.middleware.js";

const router = Router();

// Admin routes
router.post("/admin/feedback-forms", authenticateAdmin, createFeedbackForm);
router.get("/admin/feedback-forms", authenticateAdmin, getAllFeedbackForms);
router.get("/admin/feedback-forms/:formId", authenticateAdmin, getFeedbackFormById);
router.patch("/admin/feedback-forms/:formId", authenticateAdmin, updateFeedbackForm);
router.delete("/admin/feedback-forms/:formId", authenticateAdmin, deleteFeedbackForm);
router.patch("/admin/feedback-forms/:formId/activate", authenticateAdmin, activateFeedbackForm);
router.patch("/admin/feedback-forms/:formId/close", authenticateAdmin, closeFeedbackForm);

// Student routes
router.get("/student/feedback-forms", authenticateStudent, getFeedbackFormsForStudent);
router.get("/student/feedback-forms/:formId", authenticateStudent, getFeedbackFormForStudent);
router.post("/student/feedback-forms/submit", authenticateStudent, submitFeedbackForm);

// Admin analytics routes
router.get("/admin/faculty-analytics", authenticateAdmin, getFacultyFeedbackAnalytics);
router.get("/admin/faculty/:facultyId/feedback", authenticateAdmin, getFacultyFeedbackDetails);

// Debug endpoint - remove in production
router.get("/debug/all-forms", async (req, res) => {
  const { FeedbackForm } = await import("../models/feedbackForm.model.js");
  const forms = await FeedbackForm.find().lean();
  res.json({ count: forms.length, forms });
});

export default router;
