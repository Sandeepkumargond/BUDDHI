"use client";

import { useEffect, useState } from "react";
import AttendanceHistoryTable from "../_components/AttendanceHistoryTable";
import { listAttendanceSnapshots, loadStudentsForClass, updateAttendanceSnapshot } from "../utils/attendanceAPI";
import AttendanceHeader from "../_components/AttendanceHeader";

export default function AttendanceHistoryPage() {
  const [snapshots, setSnapshots] = useState([]);
  const [classInfo, setClassInfo] = useState({
    subject: "",
    semester: "",
    section: "",
    date: "",
    period: "1",
    mode: "theory"
  });

  useEffect(() => {
    setSnapshots(listAttendanceSnapshots());
  }, []);

  useEffect(() => {
    if (classInfo.subject && classInfo.date) {
      const s = listAttendanceSnapshots(classInfo);
      setSnapshots(s);
    }
  }, [classInfo]);

  const handleUpdate = (snapshotId, updatedPayload) => {
    updateAttendanceSnapshot(snapshotId, updatedPayload);
    setSnapshots(listAttendanceSnapshots(classInfo));
    alert("Snapshot updated");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Attendance History</h1>
      <AttendanceHeader classInfo={classInfo} setClassInfo={setClassInfo} mode={classInfo.mode} setMode={(m)=>setClassInfo(prev=>({...prev,mode:m}))} />
      <div className="mt-4">
        <AttendanceHistoryTable snapshots={snapshots} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}
