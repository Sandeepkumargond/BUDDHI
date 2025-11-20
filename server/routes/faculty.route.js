import { Router } from "express";
import { availableMail, changeFacultyPassword, getFacultyById, getMyProfile, loginFaculty, logoutFaculty, refreshFacultyAccessToken, updateFacultyAccountDetails, updateFacultyImage } from "../controllers/faculty.controller.js";
import { authenticateFaculty } from "../middlewares/faculty.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { saveAttendance, listMyAttendance, getAttendanceById, getStudentsForAttendance, getMyAssignedCourses, deleteAttendance, getCourseStudents } from "../controllers/attendance.controller.js";

const router = Router();

// Specific routes MUST come before parametric routes like /:id
router.route('/login').post(loginFaculty);

router.route('/profile').get(
    authenticateFaculty,
    getMyProfile
);

router.route('/logout').post(
    authenticateFaculty,
    logoutFaculty
);

router.route('/refresh-access-token').post(refreshFacultyAccessToken);

router.route('/change-password').post(
    authenticateFaculty,
    changeFacultyPassword
);

router.route('/update-account').patch(
    authenticateFaculty,
    updateFacultyAccountDetails
);

router.route('/update-image').patch(
    authenticateFaculty
    , upload.single("image"),
    updateFacultyImage
);

router.route('/available-mail').post(
    availableMail
);

// Attendance routes
router.route('/attendance').post(
    authenticateFaculty,
    saveAttendance
);

router.route('/attendance').get(
    authenticateFaculty,
    listMyAttendance
);

router.route('/attendance/:id').get(
    authenticateFaculty,
    getAttendanceById
);

router.route('/attendance/:id').delete(
    authenticateFaculty,
    deleteAttendance
);

router.route('/attendance/students').get(
    authenticateFaculty,
    getStudentsForAttendance
);

router.route('/my-courses').get(
    authenticateFaculty,
    getMyAssignedCourses
);

router.route('/courses/:courseId/students').get(
    authenticateFaculty,
    getCourseStudents
);

// Parametric route MUST come last to avoid catching specific route names
router.route("/:id").get(getFacultyById);

export default router;