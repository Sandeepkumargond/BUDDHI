import { Router } from "express";
import {
    getStudentGradeCards,
    getStudentSemesterGradeCard,
    getMyGradeCards,
    createOrUpdateGradeCard,
    deleteGradeCard,
    getAllStudentsWithGrades,
    getFacultyAssignedCourses,
    getStudentsForFacultyCourse,
    updateSubjectGradesByFaculty
} from "../controllers/gradeCard.controller.js";
import { authenticateStudent } from "../middlewares/student.middleware.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";
import { authenticateFaculty } from "../middlewares/faculty.middleware.js";

const router = Router();

// Student routes - authenticated
router.route("/my-grades").get(authenticateStudent, getMyGradeCards);

// Faculty routes - for managing grades of their assigned courses
router.route("/faculty/courses").get(authenticateFaculty, getFacultyAssignedCourses);
router.route("/faculty/course/:courseAssignmentId/students").get(authenticateFaculty, getStudentsForFacultyCourse);
router.route("/faculty/course/:courseAssignmentId/grades").post(authenticateFaculty, updateSubjectGradesByFaculty);

// Admin routes - for managing student grades
router.route("/admin/students").get(authenticateAdmin, getAllStudentsWithGrades);
router.route("/admin/student/:studentId").get(authenticateAdmin, getStudentGradeCards);
router.route("/admin/student/:studentId/semester/:semester").get(authenticateAdmin, getStudentSemesterGradeCard);
router.route("/admin/student/:studentId/grades").post(authenticateAdmin, createOrUpdateGradeCard);
router.route("/admin/gradecard/:gradeCardId").delete(authenticateAdmin, deleteGradeCard);

export default router;