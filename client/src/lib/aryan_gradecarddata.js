// src/lib/aryan_gradecarddata.js
// Minimal academic dataset for grade-card UI (10 students, each has semester data).
export const gradeCardStudents = [
  {
    id: 1,
    name: "Arjun Mehta",
    rollNo: 18349201,
    enrolmentNo: "2025110001",
    course: "B.Tech",
    branch: "CSE",
    currentSemester: 4,
    academicYear: "2024-2025",
    photo:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1200",
    semesters: [
      {
        sem: 1,
        sgpa: 8.2,
        creditsAttempted: 22,
        creditsEarned: 22,
        status: "Pass",
        subjects: [
          { code: "CS101", name: "Intro to CS", type: "Theory", credits: 4, internal: 18, external: 58, total: 76, grade: "A", gradePoint: 8.0, status: "Pass" },
          { code: "MA101", name: "Calculus", type: "Theory", credits: 4, internal: 16, external: 50, total: 66, grade: "B+", gradePoint: 7.0, status: "Pass" },
          { code: "PH101", name: "Physics", type: "Theory", credits: 3, internal: 14, external: 45, total: 59, grade: "B", gradePoint: 6.0, status: "Pass" },
          { code: "CSL101", name: "Programming Lab", type: "Lab", credits: 2, internal: 20, external: 28, total: 48, grade: "A", gradePoint: 8.0, status: "Pass" },
          { code: "EL101", name: "Engineering Drawing", type: "Practical", credits: 3, internal: 15, external: 42, total: 57, grade: "B", gradePoint: 6.0, status: "Pass" },
          { code: "HS101", name: "Communication", type: "Theory", credits: 3, internal: 17, external: 50, total: 67, grade: "B+", gradePoint: 7.0, status: "Pass" }
        ]
      },
      {
        sem: 2,
        sgpa: 8.5,
        creditsAttempted: 24,
        creditsEarned: 24,
        status: "Pass",
        subjects: [
          { code: "CS102", name: "Data Structures", type: "Theory", credits: 4, internal: 19, external: 60, total: 79, grade: "A+", gradePoint: 9.0, status: "Pass" },
          { code: "MA102", name: "Linear Algebra", type: "Theory", credits: 4, internal: 17, external: 56, total: 73, grade: "A", gradePoint: 8.0, status: "Pass" },
          { code: "CSL102", name: "DS Lab", type: "Lab", credits: 2, internal: 20, external: 29, total: 49, grade: "A", gradePoint: 8.0, status: "Pass" },
          { code: "EL102", name: "Circuits", type: "Theory", credits: 3, internal: 15, external: 48, total: 63, grade: "B+", gradePoint: 7.0, status: "Pass" },
          { code: "HS102", name: "Economics", type: "Theory", credits: 3, internal: 16, external: 50, total: 66, grade: "B+", gradePoint: 7.0, status: "Pass" },
          { code: "CS103", name: "Discrete Maths", type: "Theory", credits: 4, internal: 18, external: 58, total: 76, grade: "A", gradePoint: 8.0, status: "Pass" }
        ]
      },
      {
        sem: 3,
        sgpa: 8.0,
        creditsAttempted: 24,
        creditsEarned: 24,
        status: "Pass",
        subjects: [
          { code: "CS201", name: "Algorithms", type: "Theory", credits: 4, internal: 16, external: 55, total: 71, grade: "A", gradePoint: 8.0, status: "Pass" },
          { code: "CS202", name: "DBMS", type: "Theory", credits: 4, internal: 18, external: 50, total: 68, grade: "A", gradePoint: 8.0, status: "Pass" },
          { code: "CSL201", name: "DB Lab", type: "Lab", credits: 2, internal: 20, external: 30, total: 50, grade: "A", gradePoint: 8.0, status: "Pass" },
          { code: "CS203", name: "OS", type: "Theory", credits: 4, internal: 15, external: 46, total: 61, grade: "B+", gradePoint: 7.0, status: "Pass" },
          { code: "CS204", name: "Networks", type: "Theory", credits: 3, internal: 16, external: 50, total: 66, grade: "B+", gradePoint: 7.0, status: "Pass" },
          { code: "EL201", name: "Signals", type: "Theory", credits: 3, internal: 14, external: 44, total: 58, grade: "B", gradePoint: 6.0, status: "Pass" }
        ]
      },
      {
        sem: 4,
        sgpa: 8.7,
        creditsAttempted: 24,
        creditsEarned: 24,
        status: "Pass",
        subjects: [
          { code: "CS301", name: "Machine Learning", type: "Theory", credits: 4, internal: 19, external: 62, total: 81, grade: "A+", gradePoint: 9.0, status: "Pass" },
          { code: "CS302", name: "Compiler Design", type: "Theory", credits: 4, internal: 18, external: 60, total: 78, grade: "A+", gradePoint: 9.0, status: "Pass" },
          { code: "CS303", name: "Parallel Computing", type: "Theory", credits: 3, internal: 17, external: 50, total: 67, grade: "A", gradePoint: 8.0, status: "Pass" },
          { code: "CSL301", name: "AI Lab", type: "Lab", credits: 2, internal: 20, external: 30, total: 50, grade: "A", gradePoint: 8.0, status: "Pass" },
          { code: "CS304", name: "Software Engineering", type: "Theory", credits: 4, internal: 17, external: 58, total: 75, grade: "A", gradePoint: 8.0, status: "Pass" },
          { code: "HU301", name: "Professional Ethics", type: "Theory", credits: 3, internal: 16, external: 50, total: 66, grade: "B+", gradePoint: 7.0, status: "Pass" }
        ]
      }
    ]
  },

  // 9 more students with minimal details and sample semesters (kept short)
  {
    id: 2,
    name: "Neha Singh",
    rollNo: 18349202,
    enrolmentNo: "2025110002",
    course: "B.Tech",
    branch: "CSE",
    currentSemester: 3,
    academicYear: "2024-2025",
    photo: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
    semesters: [
      { sem:1, sgpa:8.0, creditsAttempted:22, creditsEarned:22, status:"Pass", subjects: [ { code:"CS101", name:"Intro to CS", type:"Theory", credits:4, internal:18, external:55, total:73, grade:"A", gradePoint:8, status:"Pass" } ] },
      { sem:2, sgpa:8.3, creditsAttempted:24, creditsEarned:24, status:"Pass", subjects: [ { code:"CS102", name:"DS", type:"Theory", credits:4, internal:19, external:57, total:76, grade:"A", gradePoint:8.5, status:"Pass" } ] },
      { sem:3, sgpa:8.1, creditsAttempted:24, creditsEarned:24, status:"Pass", subjects: [ { code:"CS201", name:"Algo", type:"Theory", credits:4, internal:17, external:53, total:70, grade:"A", gradePoint:8, status:"Pass" } ] }
    ]
  },
  {
    id: 3,
    name: "Rohit Verma",
    rollNo: 18349203,
    enrolmentNo: "2025110003",
    course: "B.Tech",
    branch: "CSE",
    currentSemester: 2,
    academicYear: "2024-2025",
    photo: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
    semesters: [
      { sem:1, sgpa:7.8, creditsAttempted:22, creditsEarned:22, status:"Pass", subjects: [] },
      { sem:2, sgpa:7.6, creditsAttempted:24, creditsEarned:24, status:"Pass", subjects: [] }
    ]
  },
  {
    id: 4,
    name: "Simran Kaur",
    rollNo: 18349204,
    enrolmentNo: "2025110004",
    course: "B.Tech",
    branch: "CSE",
    currentSemester: 1,
    academicYear: "2024-2025",
    photo: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
    semesters: [ { sem:1, sgpa:8.1, creditsAttempted:22, creditsEarned:22, status:"Pass", subjects: [] } ]
  },
  {
    id: 5,
    name: "Aditya Kumar",
    rollNo: 18349205,
    enrolmentNo: "2025110005",
    course: "B.Tech",
    branch: "CSE",
    currentSemester: 4,
    academicYear: "2024-2025",
    photo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
    semesters: [
      { sem:1, sgpa:7.9, creditsAttempted:22, creditsEarned:22, status:"Pass", subjects: [] },
      { sem:2, sgpa:8.0, creditsAttempted:24, creditsEarned:24, status:"Pass", subjects: [] },
      { sem:3, sgpa:7.7, creditsAttempted:24, creditsEarned:24, status:"Pass", subjects: [] },
      { sem:4, sgpa:8.2, creditsAttempted:24, creditsEarned:24, status:"Pass", subjects: [] }
    ]
  },
  { id:6, name:"Shruti Sharma", rollNo:28457201, enrolmentNo:"2025110006", course:"B.Tech", branch:"ECE", currentSemester:4, academicYear:"2024-2025", photo:"https://images.pexels.com/photos/3769712/pexels-photo-3769712.jpeg", semesters:[ {sem:1, sgpa:8.4}, {sem:2, sgpa:8.6}, {sem:3, sgpa:8.5}, {sem:4, sgpa:8.8} ] },
  { id:7, name:"Kunal Joshi", rollNo:28457202, enrolmentNo:"2025110007", course:"B.Tech", branch:"ECE", currentSemester:3, academicYear:"2024-2025", photo:"https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg", semesters:[ {sem:1, sgpa:7.6}, {sem:2, sgpa:7.8}, {sem:3, sgpa:7.9} ] },
  { id:8, name:"Priya Nair", rollNo:28457203, enrolmentNo:"2025110008", course:"B.Tech", branch:"ECE", currentSemester:1, academicYear:"2024-2025", photo:"https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg", semesters:[ {sem:1, sgpa:8.2} ] },
  { id:9, name:"Sahil Khan", rollNo:28457204, enrolmentNo:"2025110009", course:"B.Tech", branch:"ECE", currentSemester:3, academicYear:"2024-2025", photo:"https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg", semesters:[ {sem:1, sgpa:7.9}, {sem:2, sgpa:8.0}, {sem:3, sgpa:8.1} ] },
  { id:10, name:"Ishita Roy", rollNo:28457205, enrolmentNo:"2025110010", course:"B.Tech", branch:"ECE", currentSemester:4, academicYear:"2024-2025", photo:"https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg", semesters:[ {sem:1, sgpa:8.6}, {sem:2, sgpa:8.4}, {sem:3, sgpa:8.7}, {sem:4, sgpa:8.9} ] }
];

// helper to compute CGPA from semester s gpas (weighted equally by creditsAttempted if present)
export function computeCGPA(student) {
  if (!student || !Array.isArray(student.semesters) || student.semesters.length === 0) return 0;
  const sems = student.semesters;
  let totalWeighted = 0;
  let totalCredits = 0;
  for (const s of sems) {
    const weight = s.creditsAttempted ?? 1;
    const sgpa = s.sgpa ?? 0;
    totalWeighted += sgpa * weight;
    totalCredits += weight;
  }
  return totalCredits ? +(totalWeighted / totalCredits).toFixed(2) : 0;
}
