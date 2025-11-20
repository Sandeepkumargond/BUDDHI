"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/lib/toast";
import AttendanceHeader from "./_components/AttendanceHeader";
import StudentList from "./_components/StudentList";
import ManualMarking from "./_components/ManualMarking";
import ExcelUploadBox from "./_components/ExcelUploadBox";
import RightStatsPanel from "./_components/RightStatsPanel";
import BulkActions from "./_components/BulkActions";
import { loadStudentsForClass, saveAttendanceSnapshot } from "./utils/attendanceAPI";

export default function AttendancePage() {
  const [classInfo, setClassInfo] = useState({
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

  useEffect(() => {
    if (classInfo.subject && classInfo.semester) {
      const s = loadStudentsForClass(classInfo);
      setStudents(s);
      const init = {};
      s.forEach(st => {
        init[st.rollNo] = {
          theory: { status: "absent", remark: "" },
          lab: { status: "absent", remark: "" }
        };
      });
      setSelection(init);
    }
  }, [classInfo]);

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

  const handleSave = () => {
    const payload = {
      classInfo,
      timestamp: new Date().toISOString(),
      attendance: selection
    };
    saveAttendanceSnapshot(classInfo, payload);
    showToast.success("Attendance saved locally");
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
        />
      </div>

      <div className="col-span-8 space-y-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Mark Attendance — {classInfo.mode?.toUpperCase()}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => markAll(classInfo.mode, "present")} className="px-3 py-1 rounded bg-green-100">Mark All Present</button>
              <button onClick={() => markAll(classInfo.mode, "absent")} className="px-3 py-1 rounded bg-red-100">Mark All Absent</button>
              <button onClick={() => markAll(classInfo.mode, "leave")} className="px-3 py-1 rounded bg-yellow-100">Mark All Leave</button>
            </div>
          </div>

          {view === "manual" ? (
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
            <button onClick={handleSave} className="px-4 py-2 rounded bg-[#C3EBFA]">Save Attendance</button>
            <button onClick={() => {
              navigator.clipboard.writeText(JSON.stringify({ classInfo, attendance: selection }));
              alert("Attendance copied to clipboard");
            }} className="px-4 py-2 rounded bg-gray-100">Export JSON</button>
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
