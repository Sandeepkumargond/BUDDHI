"use client";

import { useEffect, useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AttendanceHeader({ 
  classInfo, 
  setClassInfo, 
  mode, 
  setMode, 
  view, 
  setView, 
  assignedCourses = [], 
  onCourseChange,
  onMonthYearChange 
}) {
  const [local, setLocal] = useState(classInfo);
  const [showMonthlyOption, setShowMonthlyOption] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => setLocal(classInfo), [classInfo]);

  const onChange = (k, v) => {
    setLocal(prev => ({ ...prev, [k]: v }));
    setClassInfo(prev => ({ ...prev, [k]: v }));
  };

  const handleLoadMonthly = () => {
    if (local.courseId && selectedMonth && selectedYear) {
      onMonthYearChange?.(selectedMonth, selectedYear);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-3">
      <div className="flex gap-3 items-center">
        {assignedCourses.length > 0 ? (
          <>
            <select 
              value={local.courseId || ""} 
              onChange={e => onCourseChange?.(e.target.value)} 
              className="border p-2 rounded flex-1"
              required
            >
              <option value="">Select Assigned Course</option>
              {assignedCourses.map(ac => (
                <option key={ac._id} value={ac.course._id}>
                  {ac.course.code} - {ac.course.name} (Sem {ac.semester}, Sec {ac.section || 'All'}, Batch {ac.batch || 'All'})
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              Sem: {local.semester || '-'} | Sec: {local.section || 'All'} | Batch: {local.batch || 'All'}
            </div>
          </>
        ) : (
          <div className="flex-1 text-center text-gray-500 py-2">
            No courses assigned. Please contact admin to assign courses.
          </div>
        )}
        
        {!showMonthlyOption ? (
          <>
            <input type="date" value={local.date} onChange={e=>onChange("date", e.target.value)} className="border p-2 rounded" />
            <input value={local.period} onChange={e=>onChange("period", e.target.value)} placeholder="Period" className="w-20 border p-2 rounded" />
          </>
        ) : (
          <>
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
              className="border p-2 rounded"
            >
              {MONTHS.map((month, idx) => (
                <option key={idx} value={idx + 1}>{month}</option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="border p-2 rounded"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={handleLoadMonthly}
              disabled={!local.courseId}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 whitespace-nowrap"
            >
              Load Monthly
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <label className="text-sm">Type</label>
            <select 
              value={showMonthlyOption ? "monthly" : "daily"} 
              onChange={e => setShowMonthlyOption(e.target.value === "monthly")} 
              className="border p-2 rounded ml-2"
            >
              <option value="daily">Daily Attendance</option>
              <option value="monthly">Monthly Attendance</option>
            </select>
          </div>

          {!showMonthlyOption && (
            <>
              <div className="flex items-center gap-1">
                <label className="text-sm">Mode</label>
                <select value={local.mode} onChange={e => { onChange("mode", e.target.value); setMode?.(e.target.value); }} className="border p-2 rounded ml-2">
                  <option value="theory">Theory</option>
                  <option value="lab">Lab</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <label className="text-sm">View</label>
                <select value={view} onChange={e => setView?.(e.target.value)} className="border p-2 rounded ml-2" disabled={!local.courseId}>
                  <option value="manual">Manual</option>
                  <option value="excel">Excel Upload</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {assignedCourses.length > 0 ? `${assignedCourses.length} course(s) assigned` : "No courses assigned"}
        </div>
      </div>
    </div>
  );
}
