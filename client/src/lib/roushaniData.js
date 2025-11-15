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
