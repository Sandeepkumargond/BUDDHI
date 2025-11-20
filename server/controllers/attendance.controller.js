import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Attendance } from "../models/attendance.model.js";
import { Student } from "../models/student.model.js";
import { Course } from "../models/course.model.js";
import { Faculty } from "../models/faculty.model.js";

// Save or update attendance
export const saveAttendance = asyncHandler(async (req, res) => {
  const facultyId = req.user?._id;
  const {
    courseId,
    courseCode,
    courseName,
    semester,
    section,
    batch,
    date,
    period,
    mode,
    attendance // { rollNo: { status, remark }, ... }
  } = req.body || {};

  if (!courseId) throw new ApiError(400, "courseId is required");
  if (!semester) throw new ApiError(400, "semester is required");
  if (!date) throw new ApiError(400, "date is required");
  if (!period) throw new ApiError(400, "period is required");
  if (!mode) throw new ApiError(400, "mode is required (theory or lab)");
  if (!attendance || typeof attendance !== 'object') throw new ApiError(400, "attendance data is required");

  // Verify faculty has this course assigned
  const faculty = await Faculty.findById(facultyId);
  if (!faculty) throw new ApiError(404, "Faculty not found");

  const isAssigned = faculty.assignedCourses.some(
    ac => ac.courseId.toString() === courseId &&
          ac.semester === Number(semester) &&
          ac.section === (section || '') &&
          ac.batch === (batch || '') &&
          ac.isActive
  );

  if (!isAssigned) {
    throw new ApiError(403, "You are not authorized to mark attendance for this course. Please contact admin.");
  }

  // Fetch course details if not provided
  let cCode = courseCode;
  let cName = courseName;
  if (!cCode || !cName) {
    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, "Course not found");
    cCode = course.code;
    cName = course.name;
  }

  // Build records array from attendance object
  const records = [];
  for (const [rollNo, data] of Object.entries(attendance)) {
    const student = await Student.findOne({ rollNo }).select('_id rollNo');
    if (student) {
      records.push({
        studentId: student._id,
        rollNo: student.rollNo,
        status: data[mode]?.status || data.status || 'absent',
        remark: data[mode]?.remark || data.remark || ''
      });
    }
  }

  if (records.length === 0) {
    throw new ApiError(400, "No valid student records found in attendance data");
  }

  // Check if attendance for this session already exists
  const existing = await Attendance.findOne({
    facultyId,
    courseId,
    date: new Date(date),
    period,
    mode
  });

  let result;
  if (existing) {
    // Update existing
    existing.records = records;
    existing.section = section || existing.section;
    existing.batch = batch || existing.batch;
    result = await existing.save();
  } else {
    // Create new
    result = await Attendance.create({
      facultyId,
      courseId,
      courseCode: cCode,
      courseName: cName,
      semester: Number(semester),
      section: section || '',
      batch: batch || '',
      date: new Date(date),
      period,
      mode,
      records
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { attendance: result }, existing ? "Attendance updated successfully" : "Attendance saved successfully")
  );
});

// List attendance for faculty with filters
export const listMyAttendance = asyncHandler(async (req, res) => {
  const facultyId = req.user?._id;
  const { courseId, semester, date, startDate, endDate } = req.query || {};

  const query = { facultyId };
  if (courseId) query.courseId = courseId;
  if (semester) query.semester = Number(semester);
  if (date) query.date = new Date(date);
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (startDate) {
    query.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    query.date = { $lte: new Date(endDate) };
  }

  const attendanceList = await Attendance.find(query)
    .sort({ date: -1, period: 1 })
    .select('-records'); // Exclude detailed records for list view

  return res.status(200).json(
    new ApiResponse(200, { attendance: attendanceList }, "Attendance list fetched successfully")
  );
});

// Get single attendance with full records
export const getAttendanceById = asyncHandler(async (req, res) => {
  const facultyId = req.user?._id;
  const { id } = req.params;

  const attendance = await Attendance.findOne({ _id: id, facultyId })
    .populate('courseId', 'name code credits')
    .populate('records.studentId', 'firstName lastName rollNo imageUrl');

  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { attendance }, "Attendance fetched successfully")
  );
});

// Get students for a course/semester/section for attendance marking
export const getStudentsForAttendance = asyncHandler(async (req, res) => {
  const { semester, section, batch, program, branch } = req.query || {};

  if (!semester) throw new ApiError(400, "semester is required");

  const query = { semester: Number(semester) };
  if (section) query.section = section;
  if (batch) query.batch = batch;
  if (program) query.program = program;
  if (branch) query.branch = branch;

  const students = await Student.find(query)
    .select('firstName lastName rollNo enrollmentNo imageUrl email')
    .sort({ rollNo: 1 });

  return res.status(200).json(
    new ApiResponse(200, { students }, "Students fetched successfully")
  );
});

// Get students for a specific course (based on course assignment)
export const getCourseStudents = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { semester, section, batch } = req.query || {};

  if (!courseId) throw new ApiError(400, "courseId is required");

  // Get the course assignment to verify faculty has access
  const facultyId = req.user?._id;
  const faculty = await Faculty.findById(facultyId).populate('assignedCourses.courseId');
  
  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  const assignment = faculty.assignedCourses?.find(
    ac => ac.courseId._id.toString() === courseId && ac.isActive
  );
  
  if (!assignment) {
    throw new ApiError(403, "You don't have access to this course");
  }

  // Use assignment details
  const querySemester = semester || assignment.semester;
  const querySection = section || assignment.section;
  const queryBatch = batch || assignment.batch;

  // Build query to fetch students
  const query = { 
    semester: Number(querySemester),
    accountStatus: 'approved' // Only fetch active students
  };
  
  // Add section filter if specified
  if (querySection) {
    query.section = querySection;
  }
  
  // Add batch filter if specified
  if (queryBatch) {
    query.batch = queryBatch;
  }

  const students = await Student.find(query)
    .select('firstName lastName rollNo enrollmentNo imageUrl email semester section batch branch')
    .sort({ rollNo: 1 });

  return res.status(200).json(
    new ApiResponse(200, { students }, "Students fetched successfully")
  );
});


// Get courses assigned to logged-in faculty
export const getMyAssignedCourses = asyncHandler(async (req, res) => {
  const facultyId = req.user?._id;

  const faculty = await Faculty.findById(facultyId)
    .populate('assignedCourses.courseId', 'name code credits semester departmentId');

  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  const courses = faculty.assignedCourses
    .filter(a => a.isActive)
    .map(a => ({
      _id: a._id,
      course: a.courseId,
      semester: a.semester,
      section: a.section,
      batch: a.batch,
      academicYear: a.academicYear
    }))
    .sort((a, b) => a.semester - b.semester);

  return res.status(200).json(
    new ApiResponse(200, { courses }, "Assigned courses fetched successfully")
  );
});

// Assign course to faculty (admin function)
export const assignCourseToFaculty = asyncHandler(async (req, res) => {
  const { facultyId, courseId, semester, section, batch, academicYear } = req.body || {};

  if (!facultyId) throw new ApiError(400, "facultyId is required");
  if (!courseId) throw new ApiError(400, "courseId is required");
  if (!semester) throw new ApiError(400, "semester is required");

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) throw new ApiError(404, "Faculty not found");

  // Get course details to check department
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  // Check if exact same course + semester + section + batch combination already exists
  const duplicateIndex = faculty.assignedCourses.findIndex(
    ac => ac.courseId.toString() === courseId && 
          ac.semester === Number(semester) &&
          ac.section === (section || '') &&
          ac.batch === (batch || '') &&
          ac.isActive
  );

  if (duplicateIndex !== -1) {
    throw new ApiError(400, "This course is already assigned to this faculty for the same semester, section, and batch");
  }

  // Add new assignment
  faculty.assignedCourses.push({
    courseId,
    semester: Number(semester),
    section: section || '',
    batch: batch || '',
    academicYear: academicYear || new Date().getFullYear().toString(),
    isActive: true
  });

  await faculty.save();

  return res.status(201).json(
    new ApiResponse(201, { faculty: faculty.assignedCourses }, "Course assigned to faculty successfully")
  );
});

// Delete attendance record
export const deleteAttendance = asyncHandler(async (req, res) => {
  const facultyId = req.user?._id;
  const { id } = req.params;

  const deleted = await Attendance.findOneAndDelete({ _id: id, facultyId });

  if (!deleted) {
    throw new ApiError(404, "Attendance record not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Attendance deleted successfully")
  );
});
