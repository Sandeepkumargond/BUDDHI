import { Router } from "express";
import { availableMail, changeFacultyPassword, getFacultyById, getMyProfile, loginFaculty, logoutFaculty, refreshFacultyAccessToken, updateFacultyAccountDetails, updateFacultyImage } from "../controllers/faculty.controller.js";
import { authenticateFaculty } from "../middlewares/faculty.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { saveAttendance, listMyAttendance, getAttendanceById, getStudentsForAttendance, getMyAssignedCourses, deleteAttendance, getCourseStudents } from "../controllers/attendance.controller.js";
import { getMonthlyAttendance, updateActiveDays, updateStudentAttendance, bulkUpdateAttendance, finalizeAttendance, unfinalizeAttendance, getMyMonthlyAttendances, deleteMonthlyAttendance, syncStudents } from "../controllers/monthlyAttendance.controller.js";

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

// Monthly attendance routes
router.route('/monthly-attendance').get(
    authenticateFaculty,
    getMonthlyAttendance
);

router.route('/monthly-attendance/list').get(
    authenticateFaculty,
    getMyMonthlyAttendances
);

router.route('/monthly-attendance/active-days').patch(
    authenticateFaculty,
    updateActiveDays
);

router.route('/monthly-attendance/student').patch(
    authenticateFaculty,
    updateStudentAttendance
);

router.route('/monthly-attendance/bulk-update').patch(
    authenticateFaculty,
    bulkUpdateAttendance
);

router.route('/monthly-attendance/finalize').patch(
    authenticateFaculty,
    finalizeAttendance
);

router.route('/monthly-attendance/unfinalize').patch(
    authenticateFaculty,
    unfinalizeAttendance
);

router.route('/monthly-attendance/sync-students').patch(
    authenticateFaculty,
    syncStudents
);

router.route('/monthly-attendance/:attendanceId').delete(
    authenticateFaculty,
    deleteMonthlyAttendance
);

// Parametric route MUST come last to avoid catching specific route names
router.route("/:id").get(getFacultyById);

export default router;