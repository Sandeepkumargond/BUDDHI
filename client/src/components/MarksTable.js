"use client";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const MarksTable = ({
  students,
  marksData,
  selectedSubject,
  selectedSemester,
  selectedSection,
  selectedDepartment,
  onMarksChange,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const fileInputRef = useRef(null);

  // Create a map of marks by studentId for easy lookup
  const marksMap = {};
  marksData.forEach((mark) => {
    marksMap[mark.studentId] = mark;
  });

  const handleMarkChange = (studentId, field, value) => {
    onMarksChange(studentId, field, value);
  };

  const calculateTotalMarks = (internalMarks, externalMarks) => {
    const internal = parseFloat(internalMarks) || 0;
    const external = parseFloat(externalMarks) || 0;
    return internal + external;
  };

  const validateMarks = () => {
    const studentsWithMarks = students.filter((student) => {
      const marks = marksMap[student._id];
      return marks && (marks.internalMarks !== "" || marks.externalMarks !== "");
    });

    for (const student of studentsWithMarks) {
      const marks = marksMap[student._id];
      const internal = parseFloat(marks.internalMarks) || 0;
      const external = parseFloat(marks.externalMarks) || 0;

      if (marks.internalMarks !== "" && (isNaN(internal) || internal < 0 || internal > 40)) {
        alert(`Invalid internal marks for ${student.firstName}. Internal marks must be between 0 and 40.`);
        return false;
      }
      if (marks.externalMarks !== "" && (isNaN(external) || external < 0 || external > 60)) {
        alert(`Invalid external marks for ${student.firstName}. External marks must be between 0 and 60.`);
        return false;
      }
    }
    return true;
  };

  const handleSaveMarks = async () => {
    if (!validateMarks()) {
      return;
    }

    setSaving(true);
    setSaveMessage("");

    try {
      // Simulate saving to localStorage
      const savedMarks = students
        .filter((student) => marksMap[student._id])
        .map((student) => marksMap[student._id]);

      localStorage.setItem(
        `marks_${selectedDepartment}_${selectedSemester}_${selectedSection}_${selectedSubject}`,
        JSON.stringify(savedMarks)
      );

      setSaveMessage(`✓ Success! ${savedMarks.length} marks saved`);
      setEditMode(false);
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving marks:", error);
      setSaveMessage("Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const handleExportToExcel = () => {
    const data = students.map((student) => {
      const mark = marksMap[student._id];
      const internal = mark?.internalMarks || 0;
      const external = mark?.externalMarks || 0;
      return {
        "Roll No": student.rollNo,
        "First Name": student.firstName,
        "Last Name": student.lastName,
        "Internal Marks": internal,
        "External Marks": external,
        "Total Marks": internal && external ? internal + external : "",
        Grade: mark?.grade || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Marks");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 10 },
    ];

    const fileName = `marks_${selectedSubject}_${selectedSemester}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleImportFromExcel = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        let importedCount = 0;
        data.forEach((row) => {
          const student = students.find(
            (s) => s.rollNo === row["Roll No"]
          );
          if (student) {
            if (row["Internal Marks"] !== undefined) {
              handleMarkChange(student._id, "internalMarks", row["Internal Marks"].toString());
            }
            if (row["External Marks"] !== undefined) {
              handleMarkChange(student._id, "externalMarks", row["External Marks"].toString());
            }
            if (row["Grade"] !== undefined) {
              handleMarkChange(student._id, "grade", row["Grade"] || "");
            }
            importedCount++;
          }
        });

        setSaveMessage(`✓ Imported ${importedCount} student marks successfully`);
        setEditMode(true);
        setTimeout(() => setSaveMessage(""), 3000);
      } catch (error) {
        console.error("Error importing Excel:", error);
        setSaveMessage("Failed to import Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-[#FAE27C] hover:bg-yellow-300 text-gray-800 font-semibold rounded-lg transition duration-200 flex items-center gap-2"
            >
              <span>✎</span> Edit Marks
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveMarks}
                disabled={saving}
                className="px-4 py-2 bg-[#C3EBFA] hover:bg-cyan-200 text-gray-800 font-semibold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 flex items-center gap-2"
              >
                <span>💾</span> {saving ? "Saving..." : "Save Marks"}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-[#CFCEFF] hover:bg-purple-200 text-gray-800 font-semibold rounded-lg transition duration-200"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportToExcel}
            className="px-4 py-2 bg-[#FAE27C] hover:bg-yellow-300 text-gray-800 font-semibold rounded-lg transition duration-200 flex items-center gap-2"
          >
            <span>📥</span> Export to Excel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-[#CFCEFF] hover:bg-purple-200 text-gray-800 font-semibold rounded-lg transition duration-200 flex items-center gap-2"
          >
            <span>📤</span> Import from Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportFromExcel}
            className="hidden"
          />
        </div>
      </div>

      {/* Status Messages */}
      {saveMessage && (
        <div
          className={`px-4 py-3 border-b text-sm font-medium ${
            saveMessage.includes("Success") || saveMessage.includes("Imported")
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {saveMessage}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Roll No
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Name
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Internal (40)
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                External (60)
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Total (100)
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Grade
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => {
              const mark = marksMap[student._id] || {
                marks: "",
                grade: "",
                remarks: "",
              };
              return (
                <tr
                  key={student._id}
                  className={`border-b border-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-4 py-3 text-gray-800">{student.rollNo}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editMode ? (
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={mark.internalMarks}
                        onChange={(e) =>
                          handleMarkChange(student._id, "internalMarks", e.target.value)
                        }
                        className="w-14 px-2 py-1 border border-blue-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                        placeholder="0-40"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">
                        {mark.internalMarks || "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editMode ? (
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={mark.externalMarks}
                        onChange={(e) =>
                          handleMarkChange(student._id, "externalMarks", e.target.value)
                        }
                        className="w-14 px-2 py-1 border border-blue-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                        placeholder="0-60"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">
                        {mark.externalMarks || "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-gray-800 font-bold bg-gray-100 px-2 py-1 rounded">
                      {calculateTotalMarks(mark.internalMarks, mark.externalMarks) || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editMode ? (
                      <input
                        type="text"
                        value={mark.grade}
                        onChange={(e) =>
                          handleMarkChange(student._id, "grade", e.target.value)
                        }
                        className="w-12 px-2 py-1 border border-blue-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                        placeholder="A+"
                        maxLength="2"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">
                        {mark.grade || "-"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-700">
              <span className="font-semibold">Total Students:</span>{" "}
              <span className="text-blue-600 font-bold">{students.length}</span>
            </p>
          </div>
          <div>
            <p className="text-gray-700">
              <span className="font-semibold">Marks Entered:</span>{" "}
              <span className="text-green-600 font-bold">
                {Object.values(marksMap).filter((m) => m.internalMarks !== "" || m.externalMarks !== "").length}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-700">
              <span className="font-semibold">Average Total:</span>{" "}
              <span className="text-purple-600 font-bold">
                {Object.values(marksMap).filter((m) => m.internalMarks !== "" && m.externalMarks !== "").length >
                0
                  ? (
                      Object.values(marksMap)
                        .filter((m) => m.internalMarks !== "" && m.externalMarks !== "")
                        .reduce((sum, m) => sum + calculateTotalMarks(m.internalMarks, m.externalMarks), 0) /
                      Object.values(marksMap).filter((m) => m.internalMarks !== "" && m.externalMarks !== "")
                        .length
                    ).toFixed(2)
                  : "0"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksTable;
