"use client";

export default function MarksheetDownloader({ student }) {
  const downloadMarksheet = () => {
    const width = 1000;
    const height = 1400;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#111827";
    ctx.font = "28px Arial";
    ctx.fillText("College Name — Marksheet (Dummy)", 40, 60);

    ctx.font = "18px Arial";
    ctx.fillStyle = "#374151";
    ctx.fillText(`Name: ${student.name}`, 40, 110);
    ctx.fillText(`Enroll No: ${student.enrolmentNo}`, 40, 140);
    ctx.fillText(`Roll No: ${student.rollNo}`, 40, 170);
    ctx.fillText(`Department: ${student.department}`, 40, 200);
    ctx.fillText(`Semester: ${student.semester}`, 40, 230);
    ctx.fillText(`Class: ${student.class}`, 40, 260);

    const startY = 320;
    ctx.font = "16px Arial";
    ctx.fillStyle = "#111827";
    ctx.fillText("Subject", 60, startY);
    ctx.fillText("Max", 400, startY);
    ctx.fillText("Marks Obtained", 520, startY);

    const subjects = ["Math", "Physics", "Chemistry", "English", "Computer"];
    subjects.forEach((sub, i) => {
      const y = startY + 40 + i * 36;
      ctx.fillText(sub, 60, y);
      ctx.fillText("100", 400, y);

      const base = Math.round(((student.cgpa ?? 7.5) / 10) * 100);
      const mark = Math.max(45, Math.min(100, base + (i - 2) * 3));

      ctx.fillText(String(mark), 520, y);
    });

    const link = document.createElement("a");
    link.download = `${student.enrolmentNo}_marksheet.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="mt-2">
      <button
        onClick={downloadMarksheet}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Download Dummy Marksheet
      </button>
    </div>
  );
}
