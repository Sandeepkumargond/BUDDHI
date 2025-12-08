import express from 'express';
import { authenticateFaculty } from '../middlewares/faculty.middleware.js';
import { authenticateAdmin } from '../middlewares/admin.middleware.js';
import { authenticateStudent } from '../middlewares/student.middleware.js';
import { createSlot, listStudentSchedule, listFacultySchedule, updateSlot, deleteSlot } from '../controllers/schedule.controller.js';

const router = express.Router();

// Creation and modifications by faculty/admin
router.post('/', authenticateFaculty, createSlot);
router.put('/:id', authenticateFaculty, updateSlot);
router.delete('/:id', authenticateFaculty, deleteSlot);

// Views
router.get('/student', authenticateStudent, listStudentSchedule);
router.get('/faculty/:facultyId', authenticateFaculty, listFacultySchedule);

export default router;
