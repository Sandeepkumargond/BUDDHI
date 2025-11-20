"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/lib/toast";
import AttendanceHeader from "./_components/AttendanceHeader";
import StudentList from "./_components/StudentList";
import ManualMarking from "./_components/ManualMarking";
import ExcelUploadBox from "./_components/ExcelUploadBox";
import RightStatsPanel from "./_components/RightStatsPanel";
import BulkActions from "./_components/BulkActions";
import { loadStudentsForClass, saveAttendanceSnapshot, getMyAssignedCourses } from "./utils/attendanceAPI";

export default function AttendancePage() {
  const [classInfo, setClassInfo] = useState({
    courseId: "",
    courseCode: "",
    courseName: "",
    subject: "",
    semester: "",
    section: "",
    batch: "",
    date: new Date().toISOString().slice(0, 10),
    period: "1",
    mode: "theory"
  });

  const [students, setStudents] = useState([]);
  const [selection, setSelection] = useState({});
  const [mode, setMode] = useState("theory");
  const [view, setView] = useState("manual");
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch assigned courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getMyAssignedCourses();
        setAssignedCourses(courses);
        if (courses.length > 0) {
          const firstCourse = courses[0];
          setClassInfo(prev => ({
            ...prev,
            courseId: firstCourse.course._id,
            courseCode: firstCourse.course.code,
            courseName: firstCourse.course.name,
            subject: firstCourse.course.code,
            semester: firstCourse.semester,
            section: firstCourse.section,
            batch: firstCourse.batch
          }));
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        showToast.error('Failed to load assigned courses');
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (classInfo.courseId && classInfo.semester) {
        setLoading(true);
        try {
          const s = await loadStudentsForClass(classInfo);
          setStudents(s);
          const init = {};
          s.forEach(st => {
            init[st.rollNo] = {
              theory: { status: "absent", remark: "" },
              lab: { status: "absent", remark: "" }
            };
          });
          setSelection(init);
        } catch (error) {
          console.error('Failed to load students:', error);
          showToast.error('Failed to load students');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStudents();
  }, [classInfo.courseId, classInfo.semester, classInfo.section, classInfo.batch]);

  const updateStudentStatus = (rollNo, type, status) => {
    setSelection(prev => {
      const next = { ...prev, [rollNo]: { ...prev[rollNo], [type]: { ...prev[rollNo][type], status } } };
      return next;
    });
  };

  const updateStudentRemark = (rollNo, type, remark) => {
    setSelection(prev => {
      const next = { ...prev, [rollNo]: { ...prev[rollNo], [type]: { ...prev[rollNo][type], remark } } };
      return next;
    });
  };

  const markAll = (type, status) => {
    setSelection(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k] = { ...next[k], [type]: { ...next[k][type], status } };
      });
      return next;
    });
  };

  const handleSave = async () => {
    if (!classInfo.courseId) {
      showToast.error("Please select a course first");
      return;
    }

    if (students.length === 0) {
      showToast.error("No students found for this course");
      return;
    }

    // Verify this is an assigned course
    const isAssigned = assignedCourses.some(ac => ac.course._id === classInfo.courseId);
    if (!isAssigned) {
      showToast.error("You can only mark attendance for your assigned courses");
      return;
    }

    try {
      const payload = {
        classInfo,
        timestamp: new Date().toISOString(),
        attendance: selection
      };
      await saveAttendanceSnapshot(classInfo, payload);
      showToast.success("Attendance saved successfully!");
    } catch (error) {
      showToast.error("Failed to save attendance: " + error.message);
    }
  };

  const handleCourseChange = (courseId) => {
    const course = assignedCourses.find(c => c.course._id === courseId);
    if (course) {
      setClassInfo(prev => ({
        ...prev,
        courseId: course.course._id,
        courseCode: course.course.code,
        courseName: course.course.name,
        subject: course.course.code,
        semester: course.semester,
        section: course.section,
        batch: course.batch
      }));
    }
  };

  return (
    <div className="p-6 grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <AttendanceHeader
          classInfo={classInfo}
          setClassInfo={setClassInfo}
          mode={mode}
          setMode={(m) => { setMode(m); setClassInfo(prev => ({ ...prev, mode: m })); }}
          view={view}
          setView={setView}
          assignedCourses={assignedCourses}
          onCourseChange={handleCourseChange}
        />
      </div>

      <div className="col-span-8 space-y-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Mark Attendance — {classInfo.mode?.toUpperCase()}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => markAll(classInfo.mode, "present")} className="px-3 py-1 rounded bg-green-100 hover:bg-green-200">Mark All Present</button>
              <button onClick={() => markAll(classInfo.mode, "absent")} className="px-3 py-1 rounded bg-red-100 hover:bg-red-200">Mark All Absent</button>
              <button onClick={() => markAll(classInfo.mode, "leave")} className="px-3 py-1 rounded bg-yellow-100 hover:bg-yellow-200">Mark All Leave</button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading students...</div>
          ) : !classInfo.courseId ? (
            <div className="text-center py-8 text-gray-500">
              Please select a course from your assigned courses to mark attendance.
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students found for {classInfo.courseName} (Sem {classInfo.semester}, Section {classInfo.section || 'All'}).
            </div>
          ) : view === "manual" ? (
            <ManualMarking
              students={students}
              selection={selection}
              mode={classInfo.mode}
              onToggle={updateStudentStatus}
              onRemark={updateStudentRemark}
            />
          ) : (
            <ExcelUploadBox
              classInfo={classInfo}
              students={students}
              onApply={(parsed) => {
                setSelection(prev => {
                  const next = { ...prev };
                  parsed.forEach(row => {
                    if (next[row.rollNo]) {
                      next[row.rollNo] = {
                        ...next[row.rollNo],
                        [classInfo.mode]: { status: row.status || "present", remark: row.remark || "" }
                      };
                    }
                  });
                  return next;
                });
              }}
            />
          )}

          <div className="mt-4 flex gap-3">
            <button onClick={handleSave} className="px-4 py-2 rounded bg-[#C3EBFA] hover:bg-[#a3d5f5] font-medium">Save Attendance</button>
            <button onClick={() => {
              navigator.clipboard.writeText(JSON.stringify({ classInfo, attendance: selection }));
              showToast.success("Attendance copied to clipboard");
            }} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Export JSON</button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <StudentList
            students={students}
            selection={selection}
            mode={classInfo.mode}
            onToggle={updateStudentStatus}
            onRemark={updateStudentRemark}
          />
        </div>
      </div>

      <div className="col-span-4 space-y-4">
        <RightStatsPanel students={students} selection={selection} mode={classInfo.mode} />
        <BulkActions
          students={students}
          selection={selection}
          mode={classInfo.mode}
          onApply={(fn) => setSelection(prev => fn(prev))}
        />
      </div>
    </div>
  );
}
