import { Router } from "express";
import {
    createAgreement,
    getAgreements,
    updateAgreementStatus,
    createInventoryItem,
    getInventory,
    updateInventoryItem,
    updateInventoryShareable,
    deleteInventoryItem,
    globalSearch,
    generateAccessToken,
    getAdminInventory,
} from "../controllers/library.controller.js";
import { authenticateSuperAdmin } from "../middlewares/superAdmin.middleware.js";
import { authenticateSubAdmin } from "../middlewares/subAdmin.middleware.js";
import { authenticateStudent } from "../middlewares/student.middleware.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// ==================== SUPER ADMIN ROUTES ====================
router.post("/agreement", authenticateSuperAdmin, createAgreement);
router.get("/agreement", authenticateSuperAdmin, getAgreements);
router.put("/agreement/:agreementId/status", authenticateSuperAdmin, updateAgreementStatus);

// ==================== ADMIN ROUTES ====================
router.get("/admin/inventory", authenticateAdmin, getAdminInventory);

// ==================== SUB ADMIN ROUTES ====================
router.post("/inventory", authenticateSubAdmin, createInventoryItem);
router.get("/inventory", authenticateSubAdmin, getInventory);
router.put("/inventory/:bookId", authenticateSubAdmin, updateInventoryItem);
router.delete("/inventory/:bookId", authenticateSubAdmin, deleteInventoryItem);
router.put("/inventory/:bookId/shareable", authenticateSubAdmin, updateInventoryShareable);

// ==================== STUDENT ROUTES ====================
router.post("/search/global", authenticateStudent, globalSearch);
router.post("/access/token", authenticateStudent, generateAccessToken);

export default router;
