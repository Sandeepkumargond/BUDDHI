import { Router } from "express";
import {
    applyLeave,
    getMyLeaves,
    getLeaveById,
    cancelLeave,
    getAllLeaves,
    reviewLeave,
    deleteLeave,
} from "../controllers/leave.controller.js";
import { authenticateStudent } from "../middlewares/student.middleware.js";
import { authenticateFaculty } from "../middlewares/faculty.middleware.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Admin routes
router.route("/admin/all").get(authenticateAdmin, getAllLeaves);
router.route("/admin/:leaveId/review").patch(authenticateAdmin, reviewLeave);
router.route("/admin/:leaveId").delete(authenticateAdmin, deleteLeave);

// Student routes
router.route("/student/apply").post(authenticateStudent, upload.single('proofDocument'), applyLeave);
router.route("/student/my-leaves").get(authenticateStudent, getMyLeaves);
router.route("/student/:leaveId").get(authenticateStudent, getLeaveById);
router.route("/student/:leaveId/cancel").delete(authenticateStudent, cancelLeave);

// Faculty routes
router.route("/faculty/apply").post(authenticateFaculty, upload.single('proofDocument'), applyLeave);
router.route("/faculty/my-leaves").get(authenticateFaculty, getMyLeaves);
router.route("/faculty/:leaveId").get(authenticateFaculty, getLeaveById);
router.route("/faculty/:leaveId/cancel").delete(authenticateFaculty, cancelLeave);

export default router;
