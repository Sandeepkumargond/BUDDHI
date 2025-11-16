const KEY_SNAP = "attendance_snapshots";
const KEY_STUD = "attendance_students_sample";

export function loadStudentsForClass(classInfo) {
  const sample = JSON.parse(localStorage.getItem(KEY_STUD) || "null");
  if (sample && sample.classInfo && sample.classInfo.subject === classInfo.subject && sample.classInfo.semester === classInfo.semester) {
    return sample.students;
  }
  const students = [];
  for (let i = 1; i <= 30; i++) {
    const r = `${String(classInfo.semester || 1)}${String(i).padStart(3, "0")}`;
    students.push({
      name: `Student ${i}`,
      rollNo: `20${String(classInfo.semester || 1)}${String(i).padStart(3,"0")}`,
      photo: "/upload2.png",
      attendancePercent: Math.floor(Math.random() * 30) + 70
    });
  }
  localStorage.setItem(KEY_STUD, JSON.stringify({ classInfo, students }));
  return students;
}

export function listAttendanceSnapshots(filter) {
  const all = JSON.parse(localStorage.getItem(KEY_SNAP) || "[]");
  if (!filter || !filter.subject) return all;
  return all.filter(s => {
    const c = s.classInfo || {};
    return c.subject === filter.subject && (!filter.date || c.date === filter.date);
  });
}

export function saveAttendanceSnapshot(classInfo, payload) {
  const all = JSON.parse(localStorage.getItem(KEY_SNAP) || "[]");
  const id = `snap_${Date.now()}`;
  all.unshift({ id, ...payload });
  localStorage.setItem(KEY_SNAP, JSON.stringify(all));
  return id;
}

export function updateAttendanceSnapshot(id, updated) {
  const all = JSON.parse(localStorage.getItem(KEY_SNAP) || "[]");
  const idx = all.findIndex(s => s.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updated };
    localStorage.setItem(KEY_SNAP, JSON.stringify(all));
    return true;
  }
  return false;
}
