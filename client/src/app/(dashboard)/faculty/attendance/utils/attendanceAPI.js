import { apiService } from "@/lib/api";

// Fetch assigned courses for the logged-in faculty
export async function getMyAssignedCourses() {
  try {
    const response = await apiService.facultyListMyCourses();
    return response.data?.courses || [];
  } catch (error) {
    console.error("Failed to fetch assigned courses:", error);
    throw error;
  }
}

// Fetch students for a specific class from backend
export async function loadStudentsForClass(classInfo) {
  try {
    const { courseId, semester, section, batch } = classInfo;
    
    if (!courseId) {
      console.warn('No courseId provided for loadStudentsForClass');
      return [];
    }

    const response = await apiService.facultyGetCourseStudents(courseId, { semester, section, batch });
    const students = response.data?.students || [];
    
    return students.map(s => ({
      id: s._id,
      name: `${s.firstName} ${s.lastName}`,
      rollNo: s.rollNo,
      enrollmentNo: s.enrollmentNo,
      photo: s.imageUrl || "/avatar.png",
      email: s.email,
      attendancePercent: 0 // Calculate dynamically if needed
    }));
  } catch (error) {
    console.error('Failed to load students:', error);
    return [];
  }
}

// Save attendance to backend
export async function saveAttendanceSnapshot(classInfo, payload) {
  try {
    const response = await apiService.saveAttendance({
      courseId: classInfo.courseId,
      courseCode: classInfo.courseCode || classInfo.subject,
      courseName: classInfo.courseName || classInfo.subject,
      semester: classInfo.semester,
      section: classInfo.section,
      batch: classInfo.batch,
      date: classInfo.date,
      period: classInfo.period,
      mode: classInfo.mode,
      attendance: payload.attendance
    });
    return response.data?.attendance?._id;
  } catch (error) {
    console.error('Failed to save attendance:', error);
    throw error;
  }
}

// List attendance snapshots
export async function listAttendanceSnapshots(filter) {
  try {
    const params = {};
    if (filter?.courseId) params.courseId = filter.courseId;
    if (filter?.semester) params.semester = filter.semester;
    if (filter?.date) params.date = filter.date;

    const response = await apiService.listMyAttendance(params);
    return response.data?.attendance || [];
  } catch (error) {
    console.error('Failed to list attendance:', error);
    return [];
  }
}

// Update attendance snapshot
export async function updateAttendanceSnapshot(id, updated) {
  try {
    await apiService.saveAttendance({ ...updated, _id: id });
    return true;
  } catch (error) {
    console.error('Failed to update attendance:', error);
    return false;
  }
}
