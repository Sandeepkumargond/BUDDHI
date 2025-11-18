export function matchRowsToStudents(parsedRows = [], students = []) {
  const studentMap = {};
  students.forEach(s => studentMap[String(s.rollNo)] = s);
  const matched = [];
  const unmatched = [];
  parsedRows.forEach(r => {
    if (studentMap[r.rollNo]) matched.push({ ...r, student: studentMap[r.rollNo] });
    else unmatched.push(r);
  });
  return { matched, unmatched };
}
