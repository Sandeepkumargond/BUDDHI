  export const departmentsData = [
  {
    id: 1,
    name: "Computer Science & Engineering",
    code: "CSE",
    hod: 101, // facultyId
    facultyCount: 28,
    studentCount: 620,
    established: 1995,
    status: "Active",
  },
  {
    id: 2,
    name: "Electrical Engineering",
    code: "EE",
    hod: 201,
    facultyCount: 20,
    studentCount: 480,
    established: 1988,
    status: "Active",
  },
  {
    id: 3,
    name: "Mechanical Engineering",
    code: "ME",
    hod: 301,
    facultyCount: 25,
    studentCount: 540,
    established: 1975,
    status: "Active",
  },
  {
    id: 4,
    name: "Civil Engineering",
    code: "CE",
    hod: 401,
    facultyCount: 18,
    studentCount: 400,
    established: 1965,
    status: "Active",
  },
  {
    id: 5,
    name: "Electronics & Communication Engineering",
    code: "ECE",
    hod: 501,
    facultyCount: 22,
    studentCount: 510,
    established: 1992,
    status: "Active",
  }
];



// =============== FACULTY DATA ===============
export const facultyData = [
  // CSE Faculty (dept 1)
  {
    id: 101,
    name: "Dr. Amit Verma",
    email: "amit.verma@college.edu",
    phone: "9876543210",
    designation: "Professor & HOD",
    photo: "https://randomuser.me/api/portraits/men/11.jpg",
    departmentId: 1,
  },
  {
    id: 102,
    name: "Prof. Neha Singh",
    email: "neha.singh@college.edu",
    phone: "9876543211",
    designation: "Assistant Professor",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    departmentId: 1,
  },

  // EE Faculty (dept 2)
  {
    id: 201,
    name: "Dr. Priya Sharma",
    email: "priya.sharma@college.edu",
    phone: "8876543210",
    designation: "Professor & HOD",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    departmentId: 2,
  },

  // ME Faculty (dept 3)
  {
    id: 301,
    name: "Dr. Ravi Kumar",
    email: "ravi.kumar@college.edu",
    phone: "7776543210",
    designation: "Professor & HOD",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    departmentId: 3,
  },

  // CE Faculty (dept 4)
  {
    id: 401,
    name: "Dr. Sunita Pandey",
    email: "sunita.pandey@college.edu",
    phone: "6676543210",
    designation: "Professor & HOD",
    photo: "https://randomuser.me/api/portraits/women/90.jpg",
    departmentId: 4,
  },

  // ECE Faculty (dept 5)
  {
    id: 501,
    name: "Dr. N. Srivastava",
    email: "n.srivastava@college.edu",
    phone: "5576543210",
    designation: "Professor & HOD",
    photo: "https://randomuser.me/api/portraits/men/55.jpg",
    departmentId: 5,
  }
];



// =============== STUDENT DATA ===============
export const studentData = [
  // CSE Students (dept 1)
  {
    id: 1,
    name: "Rohan Kumar",
    roll: "CSE2023001",
    year: "2nd Year",
    semester: "4th",
    departmentId: 1,
  },
  {
    id: 2,
    name: "Ananya Gupta",
    roll: "CSE2023002",
    year: "2nd Year",
    semester: "4th",
    departmentId: 1,
  },

  // EE Students (dept 2)
  {
    id: 3,
    name: "Vikas Singh",
    roll: "EE2023001",
    year: "3rd Year",
    semester: "6th",
    departmentId: 2,
  },

  // ME Students (dept 3)
  {
    id: 4,
    name: "Harsh Sharma",
    roll: "ME2023001",
    year: "1st Year",
    semester: "2nd",
    departmentId: 3,
  },

  // CE Students (dept 4)
  {
    id: 5,
    name: "Kritika Pandey",
    roll: "CE2023001",
    year: "4th Year",
    semester: "8th",
    departmentId: 4,
  },

  // ECE Students (dept 5)
  {
    id: 6,
    name: "Arjun Verma",
    roll: "ECE2023001",
    year: "3rd Year",
    semester: "6th",
    departmentId: 5,
  }
];


export const coursesData = [
  // ===== DEPARTMENT 1: COMPUTER SCIENCE =====
  { id: 1, departmentId: 1, name: "Data Structures", code: "CS201", credits: 4 },
  { id: 2, departmentId: 1, name: "Algorithms", code: "CS301", credits: 4 },
  { id: 3, departmentId: 1, name: "Operating Systems", code: "CS302", credits: 3 },
  { id: 4, departmentId: 1, name: "Database Management Systems", code: "CS303", credits: 3 },
  { id: 5, departmentId: 1, name: "Computer Networks", code: "CS304", credits: 3 },
  { id: 6, departmentId: 1, name: "Software Engineering", code: "CS305", credits: 3 },
  { id: 7, departmentId: 1, name: "Artificial Intelligence", code: "CS401", credits: 4 },
  { id: 8, departmentId: 1, name: "Machine Learning", code: "CS402", credits: 4 },
  { id: 9, departmentId: 1, name: "Compiler Design", code: "CS403", credits: 3 },
  { id: 10, departmentId: 1, name: "Cloud Computing", code: "CS404", credits: 3 },

  // ===== DEPARTMENT 2: ELECTRICAL ENGINEERING =====
  { id: 11, departmentId: 2, name: "Circuits & Networks", code: "EE201", credits: 4 },
  { id: 12, departmentId: 2, name: "Analog Electronics", code: "EE202", credits: 3 },
  { id: 13, departmentId: 2, name: "Digital Electronics", code: "EE203", credits: 4 },
  { id: 14, departmentId: 2, name: "Power Electronics", code: "EE301", credits: 3 },
  { id: 15, departmentId: 2, name: "Control Systems", code: "EE302", credits: 4 },
  { id: 16, departmentId: 2, name: "Electrical Machines", code: "EE303", credits: 4 },

  // ===== DEPARTMENT 3: MECHANICAL ENGINEERING =====
  { id: 17, departmentId: 3, name: "Engineering Mechanics", code: "ME101", credits: 3 },
  { id: 18, departmentId: 3, name: "Thermodynamics", code: "ME201", credits: 4 },
  { id: 19, departmentId: 3, name: "Fluid Mechanics", code: "ME202", credits: 4 },
  { id: 20, departmentId: 3, name: "Heat Transfer", code: "ME301", credits: 3 },
  { id: 21, departmentId: 3, name: "Machine Design", code: "ME302", credits: 4 },

  // ===== DEPARTMENT 4: CIVIL ENGINEERING =====
  { id: 22, departmentId: 4, name: "Engineering Geology", code: "CE201", credits: 3 },
  { id: 23, departmentId: 4, name: "Structural Analysis", code: "CE301", credits: 4 },
  { id: 24, departmentId: 4, name: "Geotechnical Engineering", code: "CE302", credits: 4 },
  { id: 25, departmentId: 4, name: "Transportation Engineering", code: "CE303", credits: 3 },
  { id: 26, departmentId: 4, name: "Hydraulics & Water Resources", code: "CE304", credits: 4 },

  // ===== DEPARTMENT 5: CHEMISTRY =====
  { id: 27, departmentId: 5, name: "Organic Chemistry", code: "CH201", credits: 3 },
  { id: 28, departmentId: 5, name: "Physical Chemistry", code: "CH202", credits: 3 },
  { id: 29, departmentId: 5, name: "Inorganic Chemistry", code: "CH203", credits: 3 },

  // ===== DEPARTMENT 6: PHYSICS =====
  { id: 30, departmentId: 6, name: "Modern Physics", code: "PH201", credits: 3 },
  { id: 31, departmentId: 6, name: "Electromagnetism", code: "PH202", credits: 4 },
  { id: 32, departmentId: 6, name: "Quantum Mechanics", code: "PH301", credits: 4 },

  // ===== DEPARTMENT 7: MATHEMATICS =====
  { id: 33, departmentId: 7, name: "Linear Algebra", code: "MA101", credits: 3 },
  { id: 34, departmentId: 7, name: "Differential Calculus", code: "MA102", credits: 3 },
  { id: 35, departmentId: 7, name: "Probability & Statistics", code: "MA201", credits: 3 },
  { id: 36, departmentId: 7, name: "Discrete Mathematics", code: "MA202", credits: 3 },

  // ===== DEPARTMENT 8: ELECTRONICS & COMMUNICATION =====
  { id: 37, departmentId: 8, name: "Signal & Systems", code: "EC201", credits: 4 },
  { id: 38, departmentId: 8, name: "VLSI Design", code: "EC301", credits: 4 },
  { id: 39, departmentId: 8, name: "Microprocessors", code: "EC302", credits: 3 },
  { id: 40, departmentId: 8, name: "Digital Signal Processing", code: "EC303", credits: 4 }
];



// --------------- Registration Data----------- for student portal
// ---------------------------
// STUDENT PROFILE DETAILS
// ---------------------------
export const studentProfileData = {
  name: "Simaran Kaur",
  roll: "230C312",
  department: "Computer Science & Engineering",
  photo: "https://randomuser.me/api/portraits/women/68.jpg", // dummy image
};




// ---------------------------
// REGISTERED SEMESTER LIST
// ---------------------------
export const registeredSemesters = [
  { id: 1, label: "Semester 1", value: "1" },
  { id: 2, label: "Semester 2", value: "2" },
  { id: 3, label: "Semester 3", value: "3" },
  { id: 4, label: "Semester 4", value: "4" },
  { id: 5, label: "Semester 5", value: "5" },
];

// ---------------------------
// REGISTRATION STATUS
// ---------------------------
// status: Registered | Pending | Not Registered
export const semesterStatus = {
  "1": "Registered",
  "2": "Registered",
  "3": "Pending",
  "4": "Not Registered",
  "5": "Not Registered",
};

// ---------------------------
// SEMESTER–WISE COURSES
// ---------------------------
export const semesterCourses = {
  "1": [
    { id: 1, code: "CSE101", name: "Introduction to Programming", credits: 4 },
    { id: 2, code: "MTH101", name: "Engineering Mathematics I", credits: 3 },
  ],
  "2": [
    { id: 3, code: "CSE102", name: "Data Structures", credits: 4 },
    { id: 4, code: "PHY102", name: "Physics II", credits: 3 },
  ],
  "3": [
    { id: 5, code: "CSE201", name: "Algorithms", credits: 4 },
    { id: 6, code: "CSE202", name: "Computer Networks", credits: 3 },
  ],
  "4": [],
  "5": [],
};

export const instituteInfo = {
  name: "Buddhi Institute of Technology",
  logo: "/home.png", // dummy logo URL
  address: "Gandhi Nagar, Patna, Bihar – 800001",
};


// ----------------------------
// DUMMY REGISTRATION RECORDS
// ----------------------------
export const registrationRecords = [
  {
    id: 1,
    studentEnrollment: "CSE2023A001",
    studentName: "Aarav Mishra",
    department: "Computer Science & Engineering",
    semester: 3,
    academicYear: "2024-25",
    date: "12 Feb 2025",
    status: "Completed",
    instituteLogo:
     "/logo.png",

    registeredCourses: [
      { code: "CSE201", name: "Data Structures", credits: 4 },
      { code: "CSE202", name: "Operating Systems", credits: 4 },
      { code: "CSE203", name: "Computer Networks", credits: 3 },
      { code: "CSE204", name: "Discrete Mathematics", credits: 3 },
    ],

    totalCredits: 14,
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
  },

  {
    id: 2,
    studentEnrollment: "CSE2023A001",
    studentName: "Aarav Mishra",
    department: "Computer Science & Engineering",
    semester: 2,
    academicYear: "2023-24",
    date: "10 Aug 2024",
    status: "Completed",
    instituteLogo:
      "/logo.png",

    registeredCourses: [
      { code: "CSE101", name: "Programming in C", credits: 4 },
      { code: "CSE102", name: "Digital Logic", credits: 4 },
      { code: "MTH101", name: "Engineering Mathematics", credits: 3 },
    ],

    totalCredits: 11,
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
  },
];


//--------------Feedback questions----------------
export const studentFeedbackQuestions = [
  { id: 1, question: "The teacher is well prepared for the class." },
  { id: 2, question: "The teacher’s communication skills are clear and effective." },
  { id: 3, question: "The teacher explains concepts with appropriate examples." },
  { id: 4, question: "The teacher encourages students to ask questions." },
  { id: 5, question: "The teacher covers the syllabus as per the academic plan." },
  { id: 6, question: "The course enhances your understanding of the subject." },
  { id: 7, question: "The course objectives were clearly explained." },
  { id: 8, question: "Overall teaching quality of this course is excellent." },
];

/** ------------------------------
    CURRENT SEMESTER SUBJECT LIST
-------------------------------**/
export const currentSemesterSubjects = [
  {
    id: 101,
    name: "Data Structures & Algorithms",
    code: "CSE201",
    credits: 4,
    faculty: "Dr. Kavita Sharma",
    facultyPhoto: "https://randomuser.me/api/portraits/women/65.jpg",
    status: "Pending",
  },
  {
    id: 102,
    name: "Operating Systems",
    code: "CSE203",
    credits: 3,
    faculty: "Prof. Arvind Gupta",
    facultyPhoto: "https://randomuser.me/api/portraits/men/43.jpg",
    status: "Completed",
  },
  {
    id: 103,
    name: "Database Management Systems",
    code: "CSE205",
    credits: 4,
    faculty: "Dr. Neetu Joshi",
    facultyPhoto: "https://randomuser.me/api/portraits/women/12.jpg",
    status: "Pending",
  },
  {
    id: 104,
    name: "Computer Networks",
    code: "CSE207",
    credits: 3,
    faculty: "Prof. Vikas Mehra",
    facultyPhoto: "https://randomuser.me/api/portraits/men/78.jpg",
    status: "Completed",
  },
  {
    id: 105,
    name: "Discrete Mathematics",
    code: "CSE209",
    credits: 3,
    faculty: "Dr. Asha Verma",
    facultyPhoto: "https://randomuser.me/api/portraits/women/53.jpg",
    status: "Pending",
  }
];

// Audience List
export const noticeAudienceOptions = [
  { label: "All", value: "all" },
  { label: "Students", value: "students" },
  { label: "Faculty", value: "faculty" },
  { label: "Staff", value: "staff" },
  { label: "Department", value: "department" },
];

// Priority List
export const noticePriorityLevels = [
  { label: "Low", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "High", value: "high" },
];

// Sample saved notices
export const sampleNotices = [
  {
    id: 1,
    title: "Mid-Sem Exam Schedule",
    date: "2025-02-10",
    audience: "students",
    priority: "high",
    content: "Mid semester exams start from March 2. Download the schedule.",
    attachment: null,
  },
];

// Faculty – Class Notice Data Options
export const classNoticeDepartments = ["CSE", "ECE", "EEE", "ME", "CE"];

export const classNoticeSections = ["A", "B", "C"];

export const classNoticeSubjects = [
  "Mathematics",
  "Data Structures",
  "Operating Systems",
  "DBMS",
  "Computer Networks",
];

// ============================================
// MARKS DATA FOR FACULTY
// ============================================

// Students for Marks Management
export const marksStudentsData = [
  // CSE Semester 4 Section A
  {
    _id: "std001",
    enrollmentNo: 2301001,
    firstName: "Rohan",
    lastName: "Kumar",
    rollNo: 1,
    email: "rohan.kumar@student.edu",
    semester: 4,
    section: "A",
    branch: "CSE",
  },
  {
    _id: "std002",
    enrollmentNo: 2301002,
    firstName: "Ananya",
    lastName: "Gupta",
    rollNo: 2,
    email: "ananya.gupta@student.edu",
    semester: 4,
    section: "A",
    branch: "CSE",
  },
  {
    _id: "std003",
    enrollmentNo: 2301003,
    firstName: "Priya",
    lastName: "Singh",
    rollNo: 3,
    email: "priya.singh@student.edu",
    semester: 4,
    section: "A",
    branch: "CSE",
  },
  {
    _id: "std004",
    enrollmentNo: 2301004,
    firstName: "Rahul",
    lastName: "Sharma",
    rollNo: 4,
    email: "rahul.sharma@student.edu",
    semester: 4,
    section: "A",
    branch: "CSE",
  },
  {
    _id: "std005",
    enrollmentNo: 2301005,
    firstName: "Neha",
    lastName: "Patel",
    rollNo: 5,
    email: "neha.patel@student.edu",
    semester: 4,
    section: "A",
    branch: "CSE",
  },
  {
    _id: "std006",
    enrollmentNo: 2301006,
    firstName: "Akshay",
    lastName: "Verma",
    rollNo: 6,
    email: "akshay.verma@student.edu",
    semester: 4,
    section: "A",
    branch: "CSE",
  },
  // CSE Semester 4 Section B
  {
    _id: "std007",
    enrollmentNo: 2301007,
    firstName: "Divya",
    lastName: "Reddy",
    rollNo: 7,
    email: "divya.reddy@student.edu",
    semester: 4,
    section: "B",
    branch: "CSE",
  },
  {
    _id: "std008",
    enrollmentNo: 2301008,
    firstName: "Arjun",
    lastName: "Malik",
    rollNo: 8,
    email: "arjun.malik@student.edu",
    semester: 4,
    section: "B",
    branch: "CSE",
  },
  {
    _id: "std009",
    enrollmentNo: 2301009,
    firstName: "Simran",
    lastName: "Kaur",
    rollNo: 9,
    email: "simran.kaur@student.edu",
    semester: 4,
    section: "B",
    branch: "CSE",
  },
  {
    _id: "std010",
    enrollmentNo: 2301010,
    firstName: "Vivek",
    lastName: "Kumar",
    rollNo: 10,
    email: "vivek.kumar@student.edu",
    semester: 4,
    section: "B",
    branch: "CSE",
  },
];

// Marks Data - Existing marks for students (Internal + External)
export const marksDataTable = [
  {
    _id: "mark001",
    studentId: "std001",
    subject: "Data Structures",
    semester: 4,
    section: "A",
    branch: "CSE",
    internalMarks: 35,
    externalMarks: 50,
    grade: "A",
    remarks: "Excellent performance",
    academicYear: "2024-25",
  },
  {
    _id: "mark002",
    studentId: "std002",
    subject: "Data Structures",
    semester: 4,
    section: "A",
    branch: "CSE",
    internalMarks: 38,
    externalMarks: 54,
    grade: "A+",
    remarks: "Outstanding work",
    academicYear: "2024-25",
  },
  {
    _id: "mark003",
    studentId: "std003",
    subject: "Data Structures",
    semester: 4,
    section: "A",
    branch: "CSE",
    internalMarks: 32,
    externalMarks: 46,
    grade: "B+",
    remarks: "Good performance",
    academicYear: "2024-25",
  },
  {
    _id: "mark004",
    studentId: "std004",
    subject: "Data Structures",
    semester: 4,
    section: "A",
    branch: "CSE",
    internalMarks: 36,
    externalMarks: 52,
    grade: "A",
    remarks: "Very good",
    academicYear: "2024-25",
  },
  {
    _id: "mark005",
    studentId: "std005",
    subject: "Data Structures",
    semester: 4,
    section: "A",
    branch: "CSE",
    internalMarks: 30,
    externalMarks: 45,
    grade: "B",
    remarks: "Satisfactory",
    academicYear: "2024-25",
  },
  {
    _id: "mark006",
    studentId: "std006",
    subject: "Data Structures",
    semester: 4,
    section: "A",
    branch: "CSE",
    internalMarks: 39,
    externalMarks: 56,
    grade: "A+",
    remarks: "Exceptional",
    academicYear: "2024-25",
  },
];

// Departments for filter dropdown
export const marksFilterDepartments = ["CSE", "ECE", "EEE", "ME", "CE"];

// Semesters for filter dropdown
export const marksFilterSemesters = [1, 2, 3, 4, 5, 6, 7, 8];

// Sections for filter dropdown
export const marksFilterSections = ["A", "B", "C", "D"];

// Subjects for filter dropdown
export const marksFilterSubjects = [
  "Data Structures",
  "Algorithms",
  "Operating Systems",
  "Database Management",
  "Web Development",
  "Computer Networks",
  "Software Engineering",
  "Cloud Computing",
];

// ============================================
// ATTENDANCE DATA FOR STUDENTS
// ============================================

// Student courses/subjects with attendance data
export const studentCoursesAttendance = [
  {
    id: 1,
    courseName: "Software Engineering",
    courseCode: "CS54116",
    faculty: "Santosh Kumar Tripathy",
    theoryAttendance: 76.19,
    labAttendance: 86,
    theoryTotal: 21,
    theoryPresent: 16,
    labTotal: 7,
    labPresent: 6,
    materials: 0,
    marks: "-",
  },
  {
    id: 2,
    courseName: "Internet of Things",
    courseCode: "CS54117",
    faculty: "Bhaskar Mondal",
    theoryAttendance: 100,
    labAttendance: 89,
    theoryTotal: 23,
    theoryPresent: 23,
    labTotal: 18,
    labPresent: 16,
    materials: 7,
    marks: "-",
  },
  {
    id: 3,
    courseName: "Machine Learning",
    courseCode: "CS54118",
    faculty: "Mukesh Kumar",
    theoryAttendance: 91.3,
    labAttendance: 89,
    theoryTotal: 23,
    theoryPresent: 21,
    labTotal: 18,
    labPresent: 16,
    materials: 6,
    marks: "-",
  },
  {
    id: 4,
    courseName: "Information Security",
    courseCode: "CS54119",
    faculty: "Udai Pratap Rao",
    theoryAttendance: 74.07,
    labAttendance: null,
    theoryTotal: 27,
    theoryPresent: 20,
    labTotal: 0,
    labPresent: 0,
    materials: 0,
    marks: "-",
  },
  {
    id: 5,
    courseName: "Open Elective-1 (Communication Systems)",
    courseCode: "OE05101",
    faculty: "Richa Agarwal",
    theoryAttendance: 47.83,
    labAttendance: null,
    theoryTotal: 23,
    theoryPresent: 11,
    labTotal: 0,
    labPresent: 0,
    materials: 0,
    marks: "-",
  },
];

// ============================================
// MARKS DETAILS FOR STUDENTS (BY COURSE)
// ============================================

export const studentMarksDetails = {
  // Course ID 1: Software Engineering
  1: {
    courseName: "Software Engineering",
    courseCode: "CS54116",
    faculty: "Santosh Kumar Tripathy",
    totalMarks: 100,
    passingMarks: 40,
    data: [
      {
        id: 1,
        assessmentName: "Mid Semester Exam",
        marksObtained: 32,
        totalMarks: 40,
        percentage: 80,
        date: "2025-02-15",
      },
      {
        id: 2,
        assessmentName: "Assignment 1",
        marksObtained: 18,
        totalMarks: 20,
        percentage: 90,
        date: "2025-02-10",
      },
      {
        id: 3,
        assessmentName: "Class Test",
        marksObtained: 12,
        totalMarks: 15,
        percentage: 80,
        date: "2025-02-05",
      },
      {
        id: 4,
        assessmentName: "Lab Performance",
        marksObtained: 8,
        totalMarks: 10,
        percentage: 80,
        date: "2025-02-12",
      },
    ],
    totalObtained: 70,
    totalPercentage: 78.89,
  },
  // Course ID 2: Internet of Things
  2: {
    courseName: "Internet of Things",
    courseCode: "CS54117",
    faculty: "Bhaskar Mondal",
    totalMarks: 100,
    passingMarks: 40,
    data: [
      {
        id: 1,
        assessmentName: "Mid Semester Exam",
        marksObtained: 38,
        totalMarks: 40,
        percentage: 95,
        date: "2025-02-16",
      },
      {
        id: 2,
        assessmentName: "Assignment 1",
        marksObtained: 19,
        totalMarks: 20,
        percentage: 95,
        date: "2025-02-11",
      },
      {
        id: 3,
        assessmentName: "Project Work",
        marksObtained: 9,
        totalMarks: 10,
        percentage: 90,
        date: "2025-02-13",
      },
    ],
    totalObtained: 66,
    totalPercentage: 91.67,
  },
  // Course ID 3: Machine Learning
  3: {
    courseName: "Machine Learning",
    courseCode: "CS54118",
    faculty: "Mukesh Kumar",
    totalMarks: 100,
    passingMarks: 40,
    data: [
      {
        id: 1,
        assessmentName: "Mid Semester Exam",
        marksObtained: 35,
        totalMarks: 40,
        percentage: 87.5,
        date: "2025-02-17",
      },
      {
        id: 2,
        assessmentName: "Assignment 1",
        marksObtained: 17,
        totalMarks: 20,
        percentage: 85,
        date: "2025-02-12",
      },
      {
        id: 3,
        assessmentName: "Assignment 2",
        marksObtained: 19,
        totalMarks: 20,
        percentage: 95,
        date: "2025-02-14",
      },
    ],
    totalObtained: 71,
    totalPercentage: 88.75,
  },
  // Course ID 4: Information Security (No marks uploaded yet)
  4: null,
  // Course ID 5: Open Elective (No marks uploaded yet)
  5: null,
};

// ============================================
// STUDY MATERIALS FOR STUDENTS (BY COURSE)
// ============================================

export const studentStudyMaterials = {
  // Course ID 1: Software Engineering
  1: [
    {
      id: 1,
      title: "Software Development Life Cycle",
      description: "Complete guide to SDLC phases and methodologies",
      fileType: "pdf",
      fileName: "SDLC_Guide.pdf",
      fileSize: "2.5 MB",
      uploadDate: "2025-02-01",
      uploadedBy: "Santosh Kumar Tripathy",
    },
    {
      id: 2,
      title: "Design Patterns in Software Engineering",
      description: "Learn common design patterns used in enterprise applications",
      fileType: "pdf",
      fileName: "Design_Patterns.pdf",
      fileSize: "3.2 MB",
      uploadDate: "2025-02-03",
      uploadedBy: "Santosh Kumar Tripathy",
    },
    {
      id: 3,
      title: "Unit Testing and Test-Driven Development",
      description: "Best practices for unit testing and TDD approach",
      fileType: "pdf",
      fileName: "TDD_Best_Practices.pdf",
      fileSize: "1.8 MB",
      uploadDate: "2025-02-05",
      uploadedBy: "Santosh Kumar Tripathy",
    },
  ],
  // Course ID 2: Internet of Things
  2: [
    {
      id: 1,
      title: "IoT Fundamentals and Architecture",
      description: "Overview of IoT systems and architecture components",
      fileType: "pdf",
      fileName: "IoT_Fundamentals.pdf",
      fileSize: "2.1 MB",
      uploadDate: "2025-02-02",
      uploadedBy: "Bhaskar Mondal",
    },
    {
      id: 2,
      title: "Sensor Networks and Data Collection",
      description: "How to design and implement sensor networks",
      fileType: "pdf",
      fileName: "Sensor_Networks.pdf",
      fileSize: "2.8 MB",
      uploadDate: "2025-02-04",
      uploadedBy: "Bhaskar Mondal",
    },
  ],
  // Course ID 3: Machine Learning
  3: [
    {
      id: 1,
      title: "Machine Learning Algorithms Overview",
      description: "Comprehensive guide to supervised and unsupervised learning",
      fileType: "pdf",
      fileName: "ML_Algorithms.pdf",
      fileSize: "3.5 MB",
      uploadDate: "2025-02-01",
      uploadedBy: "Mukesh Kumar",
    },
    {
      id: 2,
      title: "Neural Networks and Deep Learning",
      description: "Introduction to neural networks and deep learning concepts",
      fileType: "pdf",
      fileName: "Neural_Networks.pdf",
      fileSize: "4.2 MB",
      uploadDate: "2025-02-06",
      uploadedBy: "Mukesh Kumar",
    },
    {
      id: 3,
      title: "Model Evaluation and Validation",
      description: "Techniques for evaluating and validating ML models",
      fileType: "pdf",
      fileName: "Model_Evaluation.pdf",
      fileSize: "2.3 MB",
      uploadDate: "2025-02-08",
      uploadedBy: "Mukesh Kumar",
    },
    {
      id: 4,
      title: "Hands-on Python Notebook - Iris Dataset",
      description: "Practical example using Iris dataset with Python",
      fileType: "pdf",
      fileName: "Iris_Notebook.pdf",
      fileSize: "1.5 MB",
      uploadDate: "2025-02-09",
      uploadedBy: "Mukesh Kumar",
    },
  ],
  // Course ID 4: Information Security (No materials uploaded)
  4: [],
  // Course ID 5: Open Elective (No materials uploaded)
  5: [],
};