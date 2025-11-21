// src/app/student/grade-card/page.js
"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";

// color tokens used for headers
const H1 = "#CFCEFF";
const H2 = "#FAE27C";
const H3 = "#C3EBFA";

// helper small components
function Card({ title, headerColor = H1, children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div style={{ background: headerColor }} className="px-4 py-2 rounded-t-lg">
        <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// mini SVG line chart for SGPA trend (no external libs)
function SGPATrend({ sgpas = [] }) {
  if (!sgpas.length) return <div className="text-sm text-gray-500">No trend data</div>;

  const width = 300;
  const height = 80;
  const padding = 10;
  const vals = sgpas.map((s) => s.sgpa ?? 0);
  const min = Math.min(...vals, 0);
  const max = Math.max(...vals, 10);
  const points = vals.map((v, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(1, vals.length - 1);
    const y = padding + (1 - (v - min) / (max - min || 1)) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} className="block">
      <polyline points={points} fill="none" stroke="#2563EB" strokeWidth="2" />
      {vals.map((v, i) => {
        const x = padding + (i * (width - padding * 2)) / Math.max(1, vals.length - 1);
        const y = padding + (1 - (v - min) / (max - min || 1)) * (height - padding * 2);
        return <circle key={i} cx={x} cy={y} r="3" fill="#1D4ED8" />;
      })}
    </svg>
  );
}

// subject marks bar chart (simple)
function SubjectBarChart({ subjects = [] }) {
  if (!subjects.length) return <div className="text-sm text-gray-500">No subject data</div>;
  const width = 360;
  const height = 140;
  const padding = 20;
  const totals = subjects.map((s) => s.total ?? 0);
  const max = Math.max(...totals, 1);
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      {subjects.map((s, i) => {
        const barW = (width - padding * 2) / subjects.length - 8;
        const x = padding + i * (barW + 8);
        const barH = ((s.total ?? 0) / max) * (height - padding * 2);
        const y = height - padding - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill="#60A5FA" />
            <text x={x + barW / 2} y={height - padding + 14} fontSize="10" fill="#374151" textAnchor="middle">
              {s.code}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function GradeCardPage() {
  const { user: authUser } = useAuth();
  const [gradeCards, setGradeCards] = useState([]);
  const [cgpa, setCgpa] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const semOptions = gradeCards.map((s) => s.semester).sort((a, b) => a - b);
  const [selectedSem, setSelectedSem] = useState(semOptions.length ? semOptions[semOptions.length - 1] : 1);

  const semData = useMemo(() => {
    return gradeCards.find((s) => Number(s.semester) === Number(selectedSem)) || null;
  }, [gradeCards, selectedSem]);

  const sgpaList = gradeCards.map((s) => ({ sem: s.semester, sgpa: s.sgpa ?? 0 }));

  // Fetch grade cards data
  useEffect(() => {
    const fetchGradeCards = async () => {
      try {
        setLoading(true);
        const response = await apiService.request('/grades/my-grades');
        
        if (response.success && response.data) {
          setGradeCards(response.data.gradeCards || []);
          setCgpa(response.data.cgpa || 0);
          setTotalCredits(response.data.totalCreditsEarned || 0);
          
          // Set initial selected semester to latest
          const cards = response.data.gradeCards || [];
          if (cards.length > 0) {
            const latestSem = Math.max(...cards.map(c => c.semester));
            setSelectedSem(latestSem);
          }
        } else {
          setError('Failed to fetch grade cards');
        }
      } catch (err) {
        console.error('Error fetching grade cards:', err);
        setError(err.message || 'Failed to fetch grade cards');
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchGradeCards();
    }
  }, [authUser]);

  // Handle loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading grade cards...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Grade Cards</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!gradeCards || gradeCards.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Grade Cards Available</h3>
          <p className="text-gray-600">Your grade cards will appear here once they are published by your institution.</p>
        </div>
      </div>
    );
  }

  const student = {
    name: `${authUser?.firstName || ''} ${authUser?.lastName || ''}`.trim() || 'Student',
    rollNo: authUser?.rollNo || 'N/A',
    enrolmentNo: authUser?.enrollmentNo || 'N/A',
    course: authUser?.program || 'B.Tech',
    branch: authUser?.branch || 'N/A',
    currentSemester: authUser?.semester || 1,
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    photo: authUser?.imageUrl || "/student.png",
    semesters: gradeCards
  };

  // summary values
  const lastSGPA = sgpaList.length ? sgpaList[sgpaList.length - 1].sgpa : 0;
  const bestSGPA = Math.max(...sgpaList.map((s) => s.sgpa ?? 0), 0);
  const worstSGPA = Math.min(...sgpaList.map((s) => s.sgpa ?? 0), 0);

  // helpers for download/print
  const printGradeCard = () => {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    const html = `
      <html>
      <head>
        <title>Grade Card - ${student.name} - Semester ${selectedSem}</title>
        <style>
          body{font-family: Arial, Helvetica, sans-serif; padding:20px;}
          h1,h2,h3{margin:0 0 8px 0}
          table{width:100%;border-collapse:collapse;margin-top:10px}
          th,td{padding:8px;border:1px solid #ddd;text-align:left}
          .muted{color:#666;font-size:13px}
        </style>
      </head>
      <body>
        <h1>Grade Card - Semester ${selectedSem}</h1>
        <h3>${student.name} — ${student.rollNo} / ${student.enrolmentNo}</h3>
        <p class="muted">${student.course} • ${student.branch} • Academic Year: ${student.academicYear}</p>
        <hr />
        ${generateSemesterHTML(semData)}
        <hr />
        <p>CGPA: ${cgpa}</p>
      </body></html>
    `;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  function generateSemesterHTML(sd) {
    if (!sd) return "<p>No semester data</p>";
    const subjects = sd.subjects || [];
    let rows = subjects.map((sub) => {
      return `<tr>
        <td>${sub.code}</td><td>${sub.name}</td><td>${sub.type}</td><td>${sub.credits}</td>
        <td>${sub.internal ?? ""}</td><td>${sub.external ?? ""}</td><td>${sub.total ?? ""}</td>
        <td>${sub.grade ?? ""}</td><td>${sub.gradePoint ?? ""}</td><td>${sub.status ?? ""}</td>
      </tr>`;
    }).join("");
    return `
      <h2>Semester ${sd.sem} — Summary</h2>
      <p>SGPA: ${sd.sgpa ?? "-"} • Credits Attempted: ${sd.creditsAttempted ?? "-"} • Credits Earned: ${sd.creditsEarned ?? "-"} • Status: ${sd.status ?? "-"}</p>
      <table>
        <thead>
          <tr><th>Code</th><th>Subject</th><th>Type</th><th>Credits</th><th>Internal</th><th>External</th><th>Total</th><th>Grade</th><th>G.P.</th><th>Status</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  const downloadGradeCardPDF = () => {
    // fallback: open print window (user can save as PDF). For now same as print.
    printGradeCard();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header - Student Academic Overview (full width) */}
      <div className="flex gap-6 items-center">
        <div className="w-28 h-28 rounded-full border overflow-hidden bg-white">
          <Image src={student.photo} alt={student.name} width={112} height={112} className="object-cover w-full h-full" />
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-sm text-gray-600">
            {student.rollNo} • {student.enrolmentNo}
          </p>
          <p className="text-sm text-gray-600 mt-2">{student.course} • {student.branch} • Semester {student.currentSemester}</p>

          <div className="mt-3 flex gap-4 items-center">
            <div className="bg-white px-3 py-2 rounded-lg border">
              <div className="text-xs text-gray-500">CGPA</div>
              <div className="text-lg font-semibold">{cgpa}</div>
            </div>

            <div className="bg-white px-3 py-2 rounded-lg border">
              <div className="text-xs text-gray-500">Total Credits</div>
              <div className="text-lg font-semibold">
                {totalCredits}
              </div>
            </div>

            <div className="bg-white px-3 py-2 rounded-lg border">
              <div className="text-xs text-gray-500">Academic Status</div>
              <div className="text-lg font-semibold">{gradeCards.some(s => s.status !== "Pass") ? "Backlogs" : "Regular"}</div>
            </div>

            <div className="ml-6">
              <SGPATrend sgpas={sgpaList} />
            </div>
          </div>
        </div>

        {/* Semester selector */}
        <div className="w-56">
          <label className="text-sm text-gray-600">Select Semester</label>
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(Number(e.target.value))}
            className="w-full border p-2 rounded mt-1"
          >
            {semOptions.map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          <div className="mt-3 flex gap-2">
            <button onClick={downloadGradeCardPDF} className="flex-1 bg-[#C3EBFA] hover:bg-[#A9DDF0] py-2 rounded text-black font-medium">Download (PDF)</button>
            <button onClick={printGradeCard} className="px-3 py-2 bg-gray-100 rounded border">Print</button>
          </div>
        </div>
      </div>

      {/* Summary cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Last SGPA" headerColor={H1}>
          <div className="text-2xl font-semibold">{lastSGPA ?? "-"}</div>
          <div className="text-xs text-gray-500 mt-1">Semester {sgpaList.length ? sgpaList[sgpaList.length - 1].sem : "-"}</div>
        </Card>

        <Card title="Best SGPA" headerColor={H2}>
          <div className="text-2xl font-semibold">{bestSGPA ?? "-"}</div>
          <div className="text-xs text-gray-500 mt-1">Best across all semesters</div>
        </Card>

        <Card title="Worst SGPA" headerColor={H3}>
          <div className="text-2xl font-semibold">{worstSGPA ?? "-"}</div>
          <div className="text-xs text-gray-500 mt-1">Lowest across all semesters</div>
        </Card>
      </div>

      {/* Main: Grade table (full width) */}
      <div>
        <Card title={`Semester ${selectedSem} — Detailed Grade Card`} headerColor={H1} className="mb-4">
          {!semData ? (
            <div className="text-sm text-gray-600">No data for this semester.</div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Academic Year</div>
                  <div className="font-semibold">{student.academicYear}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Semester SGPA</div>
                  <div className="font-semibold">{semData.sgpa ?? "-"}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Credits Earned</div>
                  <div className="font-semibold">{semData.creditsEarned ?? "-"}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Result Status</div>
                  <div className="font-semibold">{semData.status ?? "-"}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2 border-b">Code</th>
                      <th className="p-2 border-b">Subject</th>
                      <th className="p-2 border-b">Type</th>
                      <th className="p-2 border-b">Credits</th>
                      <th className="p-2 border-b">Internal</th>
                      <th className="p-2 border-b">External</th>
                      <th className="p-2 border-b">Total</th>
                      <th className="p-2 border-b">Grade</th>
                      <th className="p-2 border-b">G.P.</th>
                      <th className="p-2 border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(semData.subjects ?? []).map((sub) => (
                      <tr key={sub.code} className="even:bg-slate-50">
                        <td className="p-2 border-b">{sub.code}</td>
                        <td className="p-2 border-b">{sub.name}</td>
                        <td className="p-2 border-b">{sub.type}</td>
                        <td className="p-2 border-b">{sub.credits}</td>
                        <td className="p-2 border-b">{sub.internal ?? "-"}</td>
                        <td className="p-2 border-b">{sub.external ?? "-"}</td>
                        <td className="p-2 border-b">{sub.total ?? "-"}</td>
                        <td className="p-2 border-b">{sub.grade ?? "-"}</td>
                        <td className="p-2 border-b">{sub.gradePoint ?? "-"}</td>
                        <td className="p-2 border-b">{sub.status ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Two-column row: Semester Summary + Cumulative / Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Semester Summary" headerColor={H2}>
          {semData ? (
            <div className="space-y-2">
              <div><strong>SGPA:</strong> {semData.sgpa ?? "-"}</div>
              <div><strong>Credits Attempted:</strong> {semData.creditsAttempted ?? "-"}</div>
              <div><strong>Credits Earned:</strong> {semData.creditsEarned ?? "-"}</div>
              <div><strong>Result Status:</strong> {semData.status ?? "-"}</div>
            </div>
          ) : <div className="text-sm text-gray-600">No semester data</div>}
        </Card>

        <Card title="Cumulative Performance & Subject Analysis" headerColor={H3}>
          <div className="mb-4">
            <div className="text-xs text-gray-500">CGPA</div>
            <div className="text-2xl font-semibold">{cgpa}</div>
            <div className="text-sm text-gray-600 mt-1">Total Credits Earned: {totalCredits}</div>
          </div>

          <div className="mb-3 text-sm text-gray-600">Subject-wise analysis (Total marks)</div>
          <div className="overflow-hidden">
            <SubjectBarChart subjects={semData?.subjects ?? []} />
          </div>
        </Card>
      </div>

      {/* Additional Notes */}
      <Card title="Additional Notes & Grading Scale" headerColor={H1}>
        <div className="text-sm text-gray-700 space-y-2">
          <div><strong>Grading scale:</strong> A+ = 9, A = 8, B+ = 7, B = 6, C = 5, F = 0</div>
          <div><strong>Credits:</strong> Theory (3-4), Lab (1-2). SGPA computed as weighted average of grade points.</div>
          <div><strong>Remarks:</strong> Reappear / ATKT rules as per institute (not displayed here).</div>
        </div>
      </Card>
    </div>
  );
}
