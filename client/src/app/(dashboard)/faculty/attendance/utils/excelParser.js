export async function parseExcelFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    const text = await file.text();
    return parseCSV(text);
  }
  try {
    const { default: XLSX } = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
    return normalizeRows(json);
  } catch (e) {
    try {
      const text = await file.text();
      return parseCSV(text);
    } catch {
      return [];
    }
  }
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  const rows = lines.slice(1).map(l => {
    const cols = l.split(",");
    const obj = {};
    headers.forEach((h, i) => obj[h] = (cols[i] || "").trim());
    return obj;
  });
  return normalizeRows(rows);
}

function normalizeRows(rows) {
  return rows.map(r => {
    const rollNo = r.roll || r["roll no"] || r["rollno"] || r.rollno || r.Roll || r["Roll No"] || r["RollNo"] || r.RN || "";
    const status = (r.status || r.Status || r.present || r.attendance || "present").toString().toLowerCase();
    const normalizedStatus = status.includes("a") || status.includes("abs") ? "absent" : status.includes("l") ? "leave" : "present";
    return { rollNo: String(rollNo).trim(), status: normalizedStatus, remark: r.remark || r.note || "" };
  });
}
