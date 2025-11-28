import { Router } from "express";
import {
    uploadMaterial,
    getFacultyMaterials,
    getFacultyCourses,
    getMaterialById,
    updateMaterial,
    deleteMaterial,
    downloadMaterial,
    getPublicMaterials,
    getMaterialStats
} from "../controllers/studyMaterial.controller.js";
import { authenticateFaculty } from "../middlewares/faculty.middleware.js";
import { authenticateStudent } from "../middlewares/student.middleware.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes (for students to access materials)
router.route('/public').get(getPublicMaterials);
router.route('/public/:materialId').get(getMaterialById);
router.route('/public/:materialId/download').post(downloadMaterial);

// Faculty routes
router.route('/faculty').get(
    authenticateFaculty,
    getFacultyMaterials
);

router.route('/faculty/courses').get(
    authenticateFaculty,
    getFacultyCourses
);

router.route('/faculty/upload').post(
    authenticateFaculty,
    upload.single('material'),
    uploadMaterial
);

router.route('/faculty/stats').get(
    authenticateFaculty,
    getMaterialStats
);

router.route('/faculty/:materialId').get(
    authenticateFaculty,
    getMaterialById
);

router.route('/faculty/:materialId').put(
    authenticateFaculty,
    upload.single('material'),
    updateMaterial
);

router.route('/faculty/:materialId').delete(
    authenticateFaculty,
    deleteMaterial
);

router.route('/faculty/:materialId/download').post(
    authenticateFaculty,
    downloadMaterial
);

// Student routes (authenticated access)
router.route('/student').get(
    authenticateStudent,
    getPublicMaterials
);

router.route('/student/:materialId').get(
    authenticateStudent,
    getMaterialById
);

router.route('/student/:materialId/download').post(
    authenticateStudent,
    downloadMaterial
);

// Admin routes (for viewing all materials)
router.route('/admin').get(
    authenticateAdmin,
    getPublicMaterials
);

router.route('/admin/:materialId').get(
    authenticateAdmin,
    getMaterialById
);

export default router;