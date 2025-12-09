import { Router } from "express";
import {
    submitCollegeRequest,
    getAllCollegeRequests,
    getCollegeRequestById,
    approveCollegeRequest,
    rejectCollegeRequest
} from "../controllers/collegeRequest.controller.js";
import { authenticateSuperAdmin } from "../middlewares/superAdmin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public route - Submit college request with optional document uploads
router.route("/submit")
    .post(upload.array('documents', 10), submitCollegeRequest);

// SuperAdmin protected routes
router.route("/")
    .get(authenticateSuperAdmin, getAllCollegeRequests);

router.route("/:id")
    .get(authenticateSuperAdmin, getCollegeRequestById);

router.route("/:id/approve")
    .patch(authenticateSuperAdmin, approveCollegeRequest);

router.route("/:id/reject")
    .patch(authenticateSuperAdmin, rejectCollegeRequest);

export default router;
