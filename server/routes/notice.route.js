import { Router } from "express";
import {
    createNotice,
    getAllNotices,
    getActiveNotices,
    getNoticeById,
    updateNotice,
    deleteNotice,
    toggleNoticeStatus,
    toggleNoticePin,
    getNoticeStats
} from "../controllers/notice.controller.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";
import { authenticateSubAdmin } from "../middlewares/subAdmin.middleware.js";
import { authenticateStudent } from "../middlewares/student.middleware.js";
import { authenticateFaculty } from "../middlewares/faculty.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes (for students/faculty to view notices)
router.route('/public').get(getActiveNotices);
router.route('/public/:noticeId').get(getNoticeById);

// Admin/SubAdmin routes
router.route('/').get(
    authenticateAdmin,
    getAllNotices
);

router.route('/').post(
    authenticateAdmin,
    upload.single('attachment'),
    createNotice
);

router.route('/stats').get(
    authenticateAdmin,
    getNoticeStats
);

router.route('/:noticeId').get(
    authenticateAdmin,
    getNoticeById
);

router.route('/:noticeId').put(
    authenticateAdmin,
    upload.single('attachment'),
    updateNotice
);

router.route('/:noticeId').delete(
    authenticateAdmin,
    deleteNotice
);

router.route('/:noticeId/toggle-status').patch(
    authenticateAdmin,
    toggleNoticeStatus
);

router.route('/:noticeId/toggle-pin').patch(
    authenticateAdmin,
    toggleNoticePin
);

// SubAdmin routes (same as admin routes but with subAdmin authentication)
router.route('/subadmin').get(
    authenticateSubAdmin,
    getAllNotices
);

router.route('/subadmin').post(
    authenticateSubAdmin,
    upload.single('attachment'),
    createNotice
);

router.route('/subadmin/:noticeId').put(
    authenticateSubAdmin,
    upload.single('attachment'),
    updateNotice
);

router.route('/subadmin/:noticeId').delete(
    authenticateSubAdmin,
    deleteNotice
);

router.route('/subadmin/:noticeId/toggle-status').patch(
    authenticateSubAdmin,
    toggleNoticeStatus
);

router.route('/subadmin/:noticeId/toggle-pin').patch(
    authenticateSubAdmin,
    toggleNoticePin
);

// Student routes (read-only)
router.route('/student').get(
    authenticateStudent,
    getActiveNotices
);

router.route('/student/:noticeId').get(
    authenticateStudent,
    getNoticeById
);

// Faculty routes (read-only)
router.route('/faculty').get(
    authenticateFaculty,
    getActiveNotices
);

router.route('/faculty/:noticeId').get(
    authenticateFaculty,
    getNoticeById
);

export default router;