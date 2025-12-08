import { Router } from "express";
import { authenticateStudent } from "../middlewares/student.middleware.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { applyScholarship, getAllScholarships, getMyScholarships, reviewScholarship } from "../controllers/scholarship.controller.js";

const router = Router();

// Student endpoints
router.post("/student/apply", authenticateStudent, upload.single("document"), applyScholarship);
router.get("/student/my", authenticateStudent, getMyScholarships);

// Admin endpoints
router.get("/admin/all", authenticateAdmin, getAllScholarships);
router.patch("/admin/:scholarshipId/review", authenticateAdmin, reviewScholarship);

export default router;
