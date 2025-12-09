import { Router } from "express";
import {
    uploadPYQ,
    getAllPYQs,
    getPYQFilters,
    deletePYQ,
    getPYQById
} from "../controllers/pyq.controller.js";
import { authenticateSubAdmin } from "../middlewares/subAdmin.middleware.js";
import { authenticateStudent } from "../middlewares/student.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// SubAdmin routes - Upload and manage PYQs
router.route('/upload').post(
    authenticateSubAdmin,
    upload.single('pdf'),
    uploadPYQ
);

router.route('/delete/:id').delete(
    authenticateSubAdmin,
    deletePYQ
);

// Student and SubAdmin routes - View PYQs
router.route('/all').get(
    authenticateStudent,
    getAllPYQs
);

router.route('/filters').get(
    authenticateStudent,
    getPYQFilters
);

router.route('/:id').get(
    authenticateStudent,
    getPYQById
);

// SubAdmin can also view PYQs
router.route('/subadmin/all').get(
    authenticateSubAdmin,
    getAllPYQs
);

router.route('/subadmin/filters').get(
    authenticateSubAdmin,
    getPYQFilters
);

export default router;
