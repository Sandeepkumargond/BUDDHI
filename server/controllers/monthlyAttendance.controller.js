import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { MonthlyAttendance } from "../models/monthlyAttendance.model.js";
import { Student } from "../models/student.model.js";
import { Course } from "../models/course.model.js";
import { Faculty } from "../models/faculty.model.js";

// Get or create monthly attendance record
export const getMonthlyAttendance = asyncHandler(async (req, res) => {
  const facultyId = req.user._id;
  const { courseId, semester, section, batch, month, year } = req.query;

  if (!courseId || !semester || !month || !year) {
    throw new ApiError(400, "Course, semester, month, and year are required");
  }

  // Verify faculty has this course assigned
  const faculty = await Faculty.findById(facultyId);
  const assignment = faculty.assignedCourses.find(
    ac => ac.courseId.toString() === courseId &&
          ac.semester === parseInt(semester) &&
          ac.section === (section || '') &&
          ac.batch === (batch || '') &&
          ac.isActive
  );

  if (!assignment) {
    throw new ApiError(403, "You are not assigned to this course with these parameters");
  }

  // Find or create monthly attendance
  const findQuery = {
    facultyId,
    courseId,
    semester: parseInt(semester),
    month: parseInt(month),
    year: parseInt(year)
  };

  // Add section/batch to query only if they have values
  if (section && section.trim() !== '') {
    findQuery.section = section;
  } else {
    findQuery.section = { $in: ['', null, undefined] };
  }

  if (batch && batch.trim() !== '') {
    findQuery.batch = batch;
  } else {
    findQuery.batch = { $in: ['', null, undefined] };
  }

  let monthlyAttendance = await MonthlyAttendance.findOne(findQuery).populate('students.studentId', 'firstName lastName imageUrl');

  if (!monthlyAttendance) {
    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    // Get students for this course
    const query = {
      semester: parseInt(semester)
    };

    // Only add section/batch to query if they have values
    if (section && section.trim() !== '') {
      query.section = section;
    }
    if (batch && batch.trim() !== '') {
      query.batch = batch;
    }

    const students = await Student.find(query).select('enrolmentNo rollNo firstName lastName');

    // Create new monthly attendance record
    monthlyAttendance = await MonthlyAttendance.create({
      facultyId,
      courseId,
      courseCode: course.code,
      courseName: course.name,
      semester: parseInt(semester),
      section: section || '',
      batch: batch || '',
      month: parseInt(month),
      year: parseInt(year),
      totalActiveDays: 0,
      students: students.map(s => ({
        studentId: s._id,
        enrolmentNo: s.enrolmentNo || 'N/A',
        rollNo: s.rollNo || 'N/A',
        name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
        daysPresent: 0,
        percentage: 0
      }))
    });

    monthlyAttendance = await MonthlyAttendance.findById(monthlyAttendance._id)
      .populate('students.studentId', 'firstName lastName imageUrl');
  }

  return res.status(200).json(
    new ApiResponse(200, { attendance: monthlyAttendance }, "Monthly attendance fetched successfully")
  );
});

// Update total active days
export const updateActiveDays = asyncHandler(async (req, res) => {
  const facultyId = req.user._id;
  const { attendanceId, totalActiveDays } = req.body;

  if (!attendanceId || totalActiveDays === undefined) {
    throw new ApiError(400, "Attendance ID and total active days are required");
  }

  if (totalActiveDays < 0) {
    throw new ApiError(400, "Total active days cannot be negative");
  }

  const monthlyAttendance = await MonthlyAttendance.findOne({
    _id: attendanceId,
    facultyId
  });

  if (!monthlyAttendance) {
    throw new ApiError(404, "Monthly attendance record not found");
  }

  if (monthlyAttendance.isFinalized) {
    throw new ApiError(400, "Cannot update finalized attendance");
  }

  // Check if any student has more days present than total active days
  const invalidStudents = monthlyAttendance.students.filter(s => s.daysPresent > totalActiveDays);
  if (invalidStudents.length > 0) {
    throw new ApiError(400, `Cannot set active days lower than existing attendance. ${invalidStudents.length} student(s) have more days present.`);
  }

  monthlyAttendance.totalActiveDays = totalActiveDays;
  await monthlyAttendance.save();

  // Re-fetch with populated studentId
  const updatedAttendance = await MonthlyAttendance.findById(monthlyAttendance._id)
    .populate('students.studentId', 'firstName lastName imageUrl');

  return res.status(200).json(
    new ApiResponse(200, { attendance: updatedAttendance }, "Active days updated successfully")
  );
});

// Update student attendance (increment/decrement)
export const updateStudentAttendance = asyncHandler(async (req, res) => {
  const facultyId = req.user._id;
  console.log("Update student attendance - req.body:", req.body);
  const { attendanceId, studentId, daysPresent } = req.body;

  if (!attendanceId || !studentId || daysPresent === undefined) {
    throw new ApiError(400, "Attendance ID, student ID, and days present are required");
  }

  if (daysPresent < 0) {
    throw new ApiError(400, "Days present cannot be negative");
  }

  const monthlyAttendance = await MonthlyAttendance.findOne({
    _id: attendanceId,
    facultyId
  });

  if (!monthlyAttendance) {
    throw new ApiError(404, "Monthly attendance record not found");
  }

  if (monthlyAttendance.isFinalized) {
    throw new ApiError(400, "Cannot update finalized attendance");
  }

  if (daysPresent > monthlyAttendance.totalActiveDays) {
    throw new ApiError(400, `Days present cannot exceed total active days (${monthlyAttendance.totalActiveDays})`);
  }

  const studentIndex = monthlyAttendance.students.findIndex(
    s => s.studentId.toString() === studentId
  );

  if (studentIndex === -1) {
    throw new ApiError(404, "Student not found in this attendance record");
  }

  monthlyAttendance.students[studentIndex].daysPresent = daysPresent;
  await monthlyAttendance.save();

  // Re-fetch with populated studentId
  const updatedAttendance = await MonthlyAttendance.findById(monthlyAttendance._id)
    .populate('students.studentId', 'firstName lastName imageUrl');

  return res.status(200).json(
    new ApiResponse(200, { attendance: updatedAttendance }, "Student attendance updated successfully")
  );
});

// Bulk update student attendance
export const bulkUpdateAttendance = asyncHandler(async (req, res) => {
  const facultyId = req.user._id;
  const { attendanceId, updates } = req.body;

  if (!attendanceId || !updates || !Array.isArray(updates)) {
    throw new ApiError(400, "Attendance ID and updates array are required");
  }

  const monthlyAttendance = await MonthlyAttendance.findOne({
    _id: attendanceId,
    facultyId
  });

  if (!monthlyAttendance) {
    throw new ApiError(404, "Monthly attendance record not found");
  }

  if (monthlyAttendance.isFinalized) {
    throw new ApiError(400, "Cannot update finalized attendance");
  }

  // Validate all updates
  for (const update of updates) {
    if (update.daysPresent < 0) {
      throw new ApiError(400, "Days present cannot be negative");
    }
    if (update.daysPresent > monthlyAttendance.totalActiveDays) {
      throw new ApiError(400, `Days present cannot exceed total active days (${monthlyAttendance.totalActiveDays})`);
    }
  }

  // Apply updates
  updates.forEach(update => {
    const studentIndex = monthlyAttendance.students.findIndex(
      s => s.studentId.toString() === update.studentId
    );
    if (studentIndex !== -1) {
      monthlyAttendance.students[studentIndex].daysPresent = update.daysPresent;
    }
  });

  await monthlyAttendance.save();

  // Re-fetch with populated studentId
  const updatedAttendance = await MonthlyAttendance.findById(monthlyAttendance._id)
    .populate('students.studentId', 'firstName lastName imageUrl');

  return res.status(200).json(
    new ApiResponse(200, { attendance: updatedAttendance }, "Bulk attendance updated successfully")
  );
});

// Finalize monthly attendance
export const finalizeAttendance = asyncHandler(async (req, res) => {
  const facultyId = req.user._id;
  const { attendanceId } = req.body;

  if (!attendanceId) {
    throw new ApiError(400, "Attendance ID is required");
  }

  const monthlyAttendance = await MonthlyAttendance.findOne({
    _id: attendanceId,
    facultyId
  });

  if (!monthlyAttendance) {
    throw new ApiError(404, "Monthly attendance record not found");
  }

  if (monthlyAttendance.totalActiveDays === 0) {
    throw new ApiError(400, "Please set total active days before finalizing");
  }

  monthlyAttendance.isFinalized = true;
  await monthlyAttendance.save();

  // Re-fetch with populated studentId
  const updatedAttendance = await MonthlyAttendance.findById(monthlyAttendance._id)
    .populate('students.studentId', 'firstName lastName imageUrl');

  return res.status(200).json(
    new ApiResponse(200, { attendance: updatedAttendance }, "Attendance finalized successfully")
  );
});

// Unfinalize (reopen) monthly attendance for editing
export const unfinalizeAttendance = asyncHandler(async (req, res) => {
  const facultyId = req.user._id;
  const { attendanceId } = req.body;

  if (!attendanceId) {
    throw new ApiError(400, "Attendance ID is required");
  }

  const monthlyAttendance = await MonthlyAttendance.findOne({
    _id: attendanceId,
    facultyId
  });

  if (!monthlyAttendance) {
    throw new ApiError(404, "Monthly attendance record not found");
  }

  if (!monthlyAttendance.isFinalized) {
    throw new ApiError(400, "Attendance is not finalized");
  }

  monthlyAttendance.isFinalized = false;
  await monthlyAttendance.save();

  // Re-fetch with populated studentId
  const updatedAttendance = await MonthlyAttendance.findById(monthlyAttendance._id)
    .populate('students.studentId', 'firstName lastName imageUrl');

  return res.status(200).json(
    new ApiResponse(200, { attendance: updatedAttendance }, "Attendance reopened for editing")
  );
});

// Get all monthly attendance for faculty
export const getMyMonthlyAttendances = asyncHandler(async (req, res) => {
  const facultyId = req.user._id;
  const { year, month } = req.query;

  const filter = { facultyId };
  if (year) filter.year = parseInt(year);
  if (month) filter.month = parseInt(month);

  const attendances = await MonthlyAttendance.find(filter)
    .populate('courseId', 'name code')
    .sort({ year: -1, month: -1 });

  return res.status(200).json(
    new ApiResponse(200, { attendances }, "Monthly attendances fetched successfully")
  );
});
