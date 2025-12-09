import { Router } from "express";
import {
    // Admin routes
    createIdCardForm,
    getAllIdCardForms,
    getActiveIdCardForm,
    updateIdCardForm,
    toggleFormStatus,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    getIdCardStatistics,
} from "../controllers/idCard.controller.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Admin routes
router.route("/forms/create").post(authenticateAdmin, createIdCardForm);
router.route("/forms").get(authenticateAdmin, getAllIdCardForms);
router.route("/forms/active").get(authenticateAdmin, getActiveIdCardForm);
router.route("/forms/:formId").patch(authenticateAdmin, updateIdCardForm);
router.route("/forms/:formId/toggle").patch(authenticateAdmin, toggleFormStatus);

router.route("/applications").get(authenticateAdmin, getAllApplications);
router.route("/applications/:applicationId").get(authenticateAdmin, getApplicationById);
router.route("/applications/:applicationId/status").patch(authenticateAdmin, updateApplicationStatus);

router.route("/statistics").get(authenticateAdmin, getIdCardStatistics);

export default router;
