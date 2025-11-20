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

    console.log("📚 Creating attendance for course:", course.name, course.code);
    console.log("📋 Parameters:", { semester, section, batch });

    // Build query for students
    const query = {
      semester: parseInt(semester)
      // Temporarily removed accountStatus filter to see all students
      // accountStatus: 'approved'
    };

    // Add section to query if provided (case-insensitive, trim whitespace)
    if (section && section.trim() !== '') {
      query.section = { $regex: new RegExp(`^${section.trim()}$`, 'i') };
    }
    
    // Add batch to query if provided (case-insensitive, trim whitespace)
    if (batch && batch.trim() !== '') {
      query.batch = { $regex: new RegExp(`^${batch.trim()}$`, 'i') };
    }

    console.log("🔍 Student query:", JSON.stringify(query, null, 2));

    const students = await Student.find(query).select('enrollmentNo rollNo firstName lastName section batch');

    console.log(`✅ Found ${students.length} students for semester ${semester}`);
    
    // Debug: Show all students in this semester
    const allSemesterStudents = await Student.find({ 
      semester: parseInt(semester)
      // Removed accountStatus filter to see all students
    }).select('enrollmentNo rollNo firstName lastName section batch accountStatus');
    console.log(`📊 Total students in semester ${semester}: ${allSemesterStudents.length}`);
    
    // Group students by section and batch to see distribution
    const groupedStudents = {};
    allSemesterStudents.forEach(s => {
      const key = `Section: "${s.section || 'NULL'}" | Batch: "${s.batch || 'NULL'}" | Status: ${s.accountStatus || 'NULL'}`;
      if (!groupedStudents[key]) groupedStudents[key] = [];
      groupedStudents[key].push(`${s.firstName} ${s.lastName} (${s.rollNo})`);
    });
    
    console.log(`\n📊 Student distribution in semester ${semester}:`);
    Object.keys(groupedStudents).forEach(key => {
      console.log(`  ${key}: ${groupedStudents[key].length} students`);
      if (groupedStudents[key].length <= 5) {
        console.log(`    - ${groupedStudents[key].join(', ')}`);
      }
    });
    
    console.log(`\n🔍 Searching for: Section="${section || 'NULL'}" | Batch="${batch || 'NULL'}"\n`);
    
    if (students.length > 0) {
      console.log("👥 Matched students:", students.map(s => 
        `${s.firstName} ${s.lastName} (${s.rollNo})`
      ).join(', '));
    }

    if (students.length === 0) {
      console.warn("⚠️ No students found matching criteria");
      console.log("📋 ALL students in semester", semester, ":");
      allSemesterStudents.forEach((s, index) => {
        console.log(`  ${index + 1}. ${s.firstName} ${s.lastName} (Roll: ${s.rollNo}) | Section: "${s.section || 'NULL'}" | Batch: "${s.batch || 'NULL'}"`);
      });
      console.log("\n🔍 Check if the section/batch values match what you're searching for!");
    } else {
      console.log("✅ Successfully found and will create attendance for", students.length, "students");
    }

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
        enrolmentNo: s.enrollmentNo || 'N/A',
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

  console.log("📥 Bulk Update Request:", {
    facultyId,
    attendanceId,
    updatesCount: updates?.length
  });

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

  console.log("📊 Current totalActiveDays:", monthlyAttendance.totalActiveDays);
  console.log("📋 Updates to apply:", updates);

  // Validate all updates
  for (const update of updates) {
    if (update.daysPresent < 0) {
      throw new ApiError(400, "Days present cannot be negative");
    }
    // Only validate against totalActiveDays if it's set (> 0)
    if (monthlyAttendance.totalActiveDays > 0 && update.daysPresent > monthlyAttendance.totalActiveDays) {
      throw new ApiError(400, `Days present (${update.daysPresent}) cannot exceed total active days (${monthlyAttendance.totalActiveDays})`);
    }
  }

  // Apply updates
  let updatedCount = 0;
  updates.forEach(update => {
    const studentIndex = monthlyAttendance.students.findIndex(
      s => s.studentId.toString() === update.studentId
    );
    if (studentIndex !== -1) {
      console.log(`Updating student at index ${studentIndex}: ${monthlyAttendance.students[studentIndex].name} - ${update.daysPresent} days`);
      monthlyAttendance.students[studentIndex].daysPresent = update.daysPresent;
      updatedCount++;
    } else {
      console.warn(`Student ID ${update.studentId} not found in attendance record`);
    }
  });

  console.log(`✅ Updated ${updatedCount} students out of ${updates.length} updates`);

  await monthlyAttendance.save();

  // Re-fetch with populated studentId
  const updatedAttendance = await MonthlyAttendance.findById(monthlyAttendance._id)
    .populate('students.studentId', 'firstName lastName imageUrl');

  console.log("📤 Sending response with updated attendance");

  return res.status(200).json(
    new ApiResponse(200, { attendance: updatedAttendance }, `Bulk attendance updated successfully (${updatedCount} students)`)
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

// Delete monthly attendance record (to recreate with updated student list)
export const deleteMonthlyAttendance = asyncHandler(async (req, res) => {
  const facultyId = req.user._id;
  const { attendanceId } = req.params;

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

  if (monthlyAttendance.isFinalized) {
    throw new ApiError(400, "Cannot delete finalized attendance. Unfinalize it first.");
  }

  await MonthlyAttendance.findByIdAndDelete(attendanceId);

  return res.status(200).json(
    new ApiResponse(200, {}, "Attendance record deleted successfully. You can now reload to create a fresh record.")
  );
});

// Sync/Refresh students in existing attendance record
export const syncStudents = asyncHandler(async (req, res) => {
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

  if (monthlyAttendance.isFinalized) {
    throw new ApiError(400, "Cannot sync students in finalized attendance");
  }

  console.log("🔄 Syncing students for attendance:", attendanceId);
  console.log("Current students count:", monthlyAttendance.students.length);

  // Get current student IDs in the attendance
  const existingStudentIds = monthlyAttendance.students.map(s => s.studentId.toString());

  // Build query for all students that should be in this attendance
  const query = {
    semester: monthlyAttendance.semester
  };

  if (monthlyAttendance.section && monthlyAttendance.section.trim() !== '') {
    query.section = { $regex: new RegExp(`^${monthlyAttendance.section.trim()}$`, 'i') };
  }
  
  if (monthlyAttendance.batch && monthlyAttendance.batch.trim() !== '') {
    query.batch = { $regex: new RegExp(`^${monthlyAttendance.batch.trim()}$`, 'i') };
  }

  console.log("🔍 Querying students with:", JSON.stringify(query, null, 2));

  const allStudents = await Student.find(query).select('enrollmentNo rollNo firstName lastName');

  console.log("📊 Found", allStudents.length, "students in database");

  // Find students that are missing from the attendance
  const missingStudents = allStudents.filter(s => !existingStudentIds.includes(s._id.toString()));

  console.log("➕ Adding", missingStudents.length, "missing students");

  if (missingStudents.length > 0) {
    // Add missing students to the attendance
    const newStudentEntries = missingStudents.map(s => ({
      studentId: s._id,
      enrolmentNo: s.enrollmentNo || 'N/A',
      rollNo: s.rollNo || 'N/A',
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
      daysPresent: 0,
      percentage: 0
    }));

    monthlyAttendance.students.push(...newStudentEntries);
    await monthlyAttendance.save();

    console.log("✅ Successfully added", missingStudents.length, "students");
  } else {
    console.log("✅ No missing students, attendance is up to date");
  }

  // Re-fetch with populated studentId
  const updatedAttendance = await MonthlyAttendance.findById(monthlyAttendance._id)
    .populate('students.studentId', 'firstName lastName imageUrl');

  return res.status(200).json(
    new ApiResponse(200, { attendance: updatedAttendance }, `Student list synced successfully. Added ${missingStudents.length} new student(s).`)
  );
});
