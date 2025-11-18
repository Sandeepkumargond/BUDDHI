// src/components/MarksheetDownloader.js
"use client";

export default function MarksheetDownloader({ student, semester }) {
  if (!student || !semester) return null;

  const downloadGradeCard = () => {
    const width = 1200;
    const height = 1600;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Header
    ctx.fillStyle = "#0f172a";
    ctx.font = "28px Arial";
    ctx.fillText("Demo College — Grade Card", 50, 60);

    ctx.font = "18px Arial";
    ctx.fillStyle = "#334155";
    ctx.fillText(`Name: ${student.name}`, 50, 110);
    ctx.fillText(`Enrollment No: ${student.enrolmentNo}`, 50, 140);
    ctx.fillText(`Roll No: ${student.rollNo}`, 50, 170);
    ctx.fillText(`Department: ${student.department}`, 50, 200);
    ctx.fillText(`Class: ${student.class}`, 50, 230);
    ctx.fillText(`Semester: ${semester}`, 50, 260);
    ctx.fillText(`Admission Year: ${student.admissionYear || "-"}`, 50, 290);

    // Divider
    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.moveTo(40, 330);
    ctx.lineTo(width - 40, 330);
    ctx.stroke();

    // Table Header
    ctx.fillStyle = "#0f172a";
    ctx.font = "20px Arial";
    ctx.fillText("Subject", 60, 380);
    ctx.fillText("Max Marks", 420, 380);
    ctx.fillText("Marks Obtained", 630, 380);
    ctx.fillText("Grade", 900, 380);

    // Subjects based on semester
    const subjectsBySem = {
      1: ["Math-I", "Physics", "English", "CS Basics", "Workshop"],
      2: ["Math-II", "Chemistry", "Programming", "ED Graphics", "EVS"],
      3: ["Data Structures", "Digital Logic", "Electronics", "Mechanics", "Economics"],
      4: ["Algorithms", "Database Systems", "Signals", "Elective-1", "Communication"],
    };

    const subjects = subjectsBySem[semester] || ["Subject A", "Subject B", "Subject C"];

    let totalObtained = 0;
    const totalMax = subjects.length * 100;

    ctx.font = "18px Arial";
    subjects.forEach((sub, i) => {
      const y = 430 + i * 50;

      // pseudo-random mark from cgpa
      const base = student.cgpa ? Math.round(student.cgpa * 10) : 75;
      const mark = Math.max(45, Math.min(100, base + (i * 2) - 5));
      totalObtained += mark;

      ctx.fillStyle = "#0f172a";
      ctx.fillText(sub, 60, y);
      ctx.fillText("100", 420, y);
      ctx.fillText(String(mark), 650, y);

      // grade logic
      const grade =
        mark >= 90 ? "A+" :
        mark >= 80 ? "A" :
        mark >= 70 ? "B" :
        mark >= 60 ? "C" :
        mark >= 50 ? "D" :
        "F";

      ctx.fillText(grade, 900, y);
    });

    // Totals
    ctx.font = "20px Arial";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(`Total: ${totalObtained} / ${totalMax}`, 60, 430 + subjects.length * 50 + 40);

    const percent = Math.round((totalObtained / totalMax) * 100);
    ctx.fillText(`Percentage: ${percent}%`, 60, 430 + subjects.length * 50 + 80);

    // Footer
    ctx.font = "16px Arial";
    ctx.fillStyle = "#475569";
    ctx.fillText("This is a dummy grade card generated for demo purposes.", 50, height - 80);

    const maskedAadhar = student.aadhar
      ? "XXXX-XXXX-" + String(student.aadhar).slice(-4)
      : "-";

    ctx.fillText(`Aadhar: ${maskedAadhar}`, 50, height - 50);

    // Download
    const link = document.createElement("a");
    link.download = `${student.enrolmentNo}_sem${semester}_gradecard.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="mt-3">
      <button
        onClick={downloadGradeCard}
        className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
      >
        Download Grade Card (Sem {semester})
      </button>
    </div>
  );
}
