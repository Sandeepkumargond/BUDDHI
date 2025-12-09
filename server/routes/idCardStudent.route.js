import { Router } from "express";
import {
    getActiveFormForStudent,
    submitIdCardApplication,
    getMyApplications,
    getMyApplicationById,
    updatePaymentStatus,
} from "../controllers/idCard.controller.js";
import { authenticateStudent } from "../middlewares/student.middleware.js";

const router = Router();

// Student routes
router.route("/form/active").get(authenticateStudent, getActiveFormForStudent);
router.route("/apply").post(authenticateStudent, submitIdCardApplication);
router.route("/my-applications").get(authenticateStudent, getMyApplications);
router.route("/my-applications/:applicationId").get(authenticateStudent, getMyApplicationById);
router.route("/applications/:applicationId/payment").patch(authenticateStudent, updatePaymentStatus);

export default router;
