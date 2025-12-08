import { Router } from "express";
import { authenticateStudent } from "../middlewares/student.middleware.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { applyBonafide, getAllBonafides, getMyBonafideById, getMyBonafides, reviewBonafide } from "../controllers/bonafide.controller.js";

const router = Router();

// Student
router.post("/student/apply", authenticateStudent, upload.single("document"), applyBonafide);
router.get("/student/my", authenticateStudent, getMyBonafides);
router.get("/student/:bonafideId", authenticateStudent, getMyBonafideById);

// Admin
router.get("/admin/all", authenticateAdmin, getAllBonafides);
router.patch("/admin/:bonafideId/review", authenticateAdmin, reviewBonafide);

export default router;
