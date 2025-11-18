// src/lib/aryandata.js
export let role = "admin"; // admin, subadmin, superadmin, student

// teachersData left mostly intact (kept as before)
export const teachersData = [
  {
    id: 1,
    teacherId: "1234567890",
    name: "John Doe",
    email: "john@doe.com",
    photo:
      "https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1234567890",
    subjects: ["Math", "Geometry"],
    classes: ["1B", "2A", "3C"],
    address: "123 Main St, Anytown, USA",
  },
  // ... keep other teacher entries as before (I left them unchanged)
  {
    id: 2,
    teacherId: "1234567890",
    name: "Jane Doe",
    email: "jane@doe.com",
    photo:
      "https://images.pexels.com/photos/936126/pexels-photo-936126.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1234567890",
    subjects: ["Physics", "Chemistry"],
    classes: ["5A", "4B", "3C"],
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 3,
    teacherId: "1234567890",
    name: "Mike Geller",
    email: "mike@geller.com",
    photo:
      "https://images.pexels.com/photos/428328/pexels-photo-428328.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1234567890",
    subjects: ["Biology"],
    classes: ["5A", "4B", "3C"],
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 4,
    teacherId: "1234567890",
    name: "Jay French",
    email: "jay@gmail.com",
    photo:
      "https://images.pexels.com/photos/1187765/pexels-photo-1187765.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1234567890",
    subjects: ["History"],
    classes: ["5A", "4B", "3C"],
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 5,
    teacherId: "1234567890",
    name: "Jane Smith",
    email: "jane@gmail.com",
    photo:
      "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1234567890",
    subjects: ["Music", "History"],
    classes: ["5A", "4B", "3C"],
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 6,
    teacherId: "1234567890",
    name: "Anna Santiago",
    email: "anna@gmail.com",
    photo:
      "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1234567890",
    subjects: ["Physics"],
    classes: ["5A", "4B", "3C"],
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 7,
    teacherId: "1234567890",
    name: "Allen Black",
    email: "allen@black.com",
    photo:
      "https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1234567890",
    subjects: ["English", "Spanish"],
    classes: ["5A", "4B", "3C"],
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 8,
    teacherId: "1234567890",
    name: "Ophelia Castro",
    email: "ophelia@castro.com",
    photo:
      "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1234567890",
    subjects: ["Math", "Geometry"],
    classes: ["5A", "4B", "3C"],
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 9,
    teacherId: "1234567890",
    name: "Derek Briggs",
    email: "derek@briggs.com",
    photo:
      "https://images.pexels.com/photos/842980/pexels-photo-842980.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1234567890",
    subjects: ["Literature", "English"],
    classes: ["5A", "4B", "3C"],
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 10,
    teacherId: "1234567890",
    name: "John Glover",
    email: "john@glover.com",
    photo:
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1234567890",
    subjects: ["Biology"],
    classes: ["5A", "4B", "3C"],
    address: "123 Main St, Anytown, USA",
  },
];

/* ----------------------------------------------------------------
   STUDENTS (15 students): each student has:
   - name, photo, rollNo (8-digit number), enrolmentNo (string),
   - department ("CSE","ECE","MECH"), semester (int 1..4), class ("A"/"B"/"C")
   - contact, addresses, and the detailed profile fields requested.
------------------------------------------------------------------ */
export const studentsData = [
  // CSE - 5 students
  {
    name: "Arjun Mehta",
    photo:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 18349201,
    enrolmentNo: "2025110001",
    department: "CSE",
    semester: 4,
    class: "A",

    dob: "2003-05-12",
    gender: "Male",
    bloodGroup: "B+",
    category: "General",
    nationality: "Indian",

    phone: "9812345601",
    alternatePhone: "9812345602",
    email: "arjun.mehta@college.com",
    currentAddress: "45 Lake View Road, Patna",
    permanentAddress: "45 Lake View Road, Patna",
    city: "Patna",
    state: "Bihar",
    postalCode: "800001",

    course: "B.Tech",
    admissionYear: 2021,
    status: "Active",
    mentor: "Dr. R. Sharma",

    cgpa: 8.7,
    sgpa: [8.2, 8.5, 9.0, 8.7],
    backlogs: 0,
    attendancePercent: 92,

    idCardNo: "ID2025110001",
    libraryCardNo: "LIB2025110001",
    hostel: "Block A - Room 203",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2023, amount: 50000, status: "Paid", paidOn: "2024-04-10" },
      { year: 2024, amount: 50000, status: "Paid", paidOn: "2025-04-12" },
    ],

    warnings: [],
    disciplinary: [],
    counselling: [{ date: "2024-09-01", notes: "Academic counselling" }],

    parentName: "Rajesh Mehta",
    parentPhone: "9800000001",
    parentEmail: "rajesh.mehta@example.com",
    parentOccupation: "Bank Manager",

    aadhar: "XXXX-XXXX-1001",
    insurance: "HEALTH-INS-1001",
    healthIssues: "None",
  },

  {
    name: "Neha Singh",
    photo:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 18349202,
    enrolmentNo: "2025110002",
    department: "CSE",
    semester: 3,
    class: "B",

    dob: "2003-08-02",
    gender: "Female",
    bloodGroup: "A+",
    category: "OBC",
    nationality: "Indian",

    phone: "9812345611",
    alternatePhone: "9812345612",
    email: "neha.singh@college.com",
    currentAddress: "12 Green Park, Delhi",
    permanentAddress: "12 Green Park, Delhi",
    city: "New Delhi",
    state: "Delhi",
    postalCode: "110016",

    course: "B.Tech",
    admissionYear: 2021,
    status: "Active",
    mentor: "Prof. S. Banerjee",

    cgpa: 8.3,
    sgpa: [8.0, 8.1, 8.9],
    backlogs: 0,
    attendancePercent: 89,

    idCardNo: "ID2025110002",
    libraryCardNo: "LIB2025110002",
    hostel: "Block B - Room 101",
    scholarship: "Merit (partial)",
    feeStatus: "Paid",
    feeHistory: [{ year: 2024, amount: 50000, status: "Paid", paidOn: "2024-04-11" }],

    warnings: [],
    disciplinary: [],
    counselling: [],

    parentName: "Sunita Singh",
    parentPhone: "9800000011",
    parentEmail: "sunita.singh@example.com",
    parentOccupation: "Teacher",

    aadhar: "XXXX-XXXX-1002",
    insurance: "HEALTH-INS-1002",
    healthIssues: "None",
  },

  {
    name: "Rohit Verma",
    photo:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 18349203,
    enrolmentNo: "2025110003",
    department: "CSE",
    semester: 2,
    class: "C",

    dob: "2004-02-20",
    gender: "Male",
    bloodGroup: "O+",
    category: "General",
    nationality: "Indian",

    phone: "9812345621",
    alternatePhone: "9812345622",
    email: "rohit.verma@college.com",
    currentAddress: "7 Sunrise Colony, Lucknow",
    permanentAddress: "7 Sunrise Colony, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    postalCode: "226001",

    course: "B.Tech",
    admissionYear: 2022,
    status: "Active",
    mentor: "Dr. P. Roy",

    cgpa: 7.9,
    sgpa: [7.8, 8.0],
    backlogs: 1,
    attendancePercent: 85,

    idCardNo: "ID2025110003",
    libraryCardNo: "LIB2025110003",
    hostel: "Day Scholar",
    scholarship: "None",
    feeStatus: "Pending",
    feeHistory: [{ year: 2024, amount: 50000, status: "Pending" }],

    warnings: [{ date: "2024-10-01", note: "Low attendance" }],
    disciplinary: [],
    counselling: [{ date: "2024-10-10", notes: "Attendance improvement" }],

    parentName: "Suresh Verma",
    parentPhone: "9800000021",
    parentEmail: "suresh.verma@example.com",
    parentOccupation: "Business",

    aadhar: "XXXX-XXXX-1003",
    insurance: "HEALTH-INS-1003",
    healthIssues: "Mild asthma",
  },

  {
    name: "Simran Kaur",
    photo:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 18349204,
    enrolmentNo: "2025110004",
    department: "CSE",
    semester: 1,
    class: "A",

    dob: "2004-11-11",
    gender: "Female",
    bloodGroup: "AB+",
    category: "SC",
    nationality: "Indian",

    phone: "9812345631",
    alternatePhone: "9812345632",
    email: "simran.kaur@college.com",
    currentAddress: "89 River View, Chandigarh",
    permanentAddress: "89 River View, Chandigarh",
    city: "Chandigarh",
    state: "Chandigarh",
    postalCode: "160017",

    course: "B.Tech",
    admissionYear: 2023,
    status: "Active",
    mentor: "Dr. A. Gill",

    cgpa: 8.1,
    sgpa: [8.1],
    backlogs: 0,
    attendancePercent: 94,

    idCardNo: "ID2025110004",
    libraryCardNo: "LIB2025110004",
    hostel: "Block C - Room 305",
    scholarship: "Means-tested",
    feeStatus: "Paid",
    feeHistory: [{ year: 2024, amount: 50000, status: "Paid" }],

    warnings: [],
    disciplinary: [],
    counselling: [],

    parentName: "Manjit Kaur",
    parentPhone: "9800000031",
    parentEmail: "manjit.kaur@example.com",
    parentOccupation: "Home-maker",

    aadhar: "XXXX-XXXX-1004",
    insurance: "HEALTH-INS-1004",
    healthIssues: "None",
  },

  {
    name: "Aditya Kumar",
    photo:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 18349205,
    enrolmentNo: "2025110005",
    department: "CSE",
    semester: 3,
    class: "B",

    dob: "2003-07-04",
    gender: "Male",
    bloodGroup: "A-",
    category: "General",
    nationality: "Indian",

    phone: "9812345641",
    alternatePhone: "9812345642",
    email: "aditya.kumar@college.com",
    currentAddress: "54 Garden Estate, Noida",
    permanentAddress: "54 Garden Estate, Noida",
    city: "Noida",
    state: "Uttar Pradesh",
    postalCode: "201301",

    course: "B.Tech",
    admissionYear: 2021,
    status: "Active",
    mentor: "Prof. M. Arora",

    cgpa: 8.0,
    sgpa: [7.9, 8.1, 8.0],
    backlogs: 0,
    attendancePercent: 90,

    idCardNo: "ID2025110005",
    libraryCardNo: "LIB2025110005",
    hostel: "Block B - Room 204",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [{ year: 2024, amount: 50000, status: "Paid" }],

    warnings: [],
    disciplinary: [],
    counselling: [],

    parentName: "Kamal Kumar",
    parentPhone: "9800000041",
    parentEmail: "kamal.kumar@example.com",
    parentOccupation: "Civil Engineer",

    aadhar: "XXXX-XXXX-1005",
    insurance: "HEALTH-INS-1005",
    healthIssues: "None",
  },

  // ECE - 5 students
  {
    name: "Shruti Sharma",
    photo:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 28457201,
    enrolmentNo: "2025110006",
    department: "ECE",
    semester: 4,
    class: "A",

    dob: "2002-06-01",
    gender: "Female",
    bloodGroup: "O+",
    category: "General",
    nationality: "Indian",

    phone: "9823456701",
    alternatePhone: "9823456702",
    email: "shruti.sharma@college.com",
    currentAddress: "31 Maple Street, Jaipur",
    permanentAddress: "31 Maple Street, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    postalCode: "302001",

    course: "B.Tech",
    admissionYear: 2020,
    status: "Active",
    mentor: "Dr. V. Kapoor",

    cgpa: 8.9,
    sgpa: [8.6, 9.0, 8.9, 9.1],
    backlogs: 0,
    attendancePercent: 96,

    idCardNo: "ID2025110006",
    libraryCardNo: "LIB2025110006",
    hostel: "Block D - Room 110",
    scholarship: "Merit",
    feeStatus: "Paid",
    feeHistory: [{ year: 2024, amount: 50000, status: "Paid" }],

    warnings: [],
    disciplinary: [],
    counselling: [],

    parentName: "Anil Sharma",
    parentPhone: "9800000051",
    parentEmail: "anil.sharma@example.com",
    parentOccupation: "Professor",

    aadhar: "XXXX-XXXX-1006",
    insurance: "HEALTH-INS-1006",
    healthIssues: "None",
  },

  {
    name: "Kunal Joshi",
    photo:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 28457202,
    enrolmentNo: "2025110007",
    department: "ECE",
    semester: 2,
    class: "B",

    dob: "2003-03-15",
    gender: "Male",
    bloodGroup: "B-",
    category: "OBC",
    nationality: "Indian",

    phone: "9823456711",
    alternatePhone: "9823456712",
    email: "kunal.joshi@college.com",
    currentAddress: "9 Hill Top, Ahmedabad",
    permanentAddress: "9 Hill Top, Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    postalCode: "380001",

    course: "B.Tech",
    admissionYear: 2022,
    status: "Active",
    mentor: "Prof. R. Desai",

    cgpa: 7.6,
    sgpa: [7.4, 7.8],
    backlogs: 0,
    attendancePercent: 82,

    idCardNo: "ID2025110007",
    libraryCardNo: "LIB2025110007",
    hostel: "Day Scholar",
    scholarship: "None",
    feeStatus: "Pending",
    feeHistory: [{ year: 2024, amount: 50000, status: "Pending" }],

    warnings: [{ date: "2024-08-20", note: "Fee pending" }],
    disciplinary: [],
    counselling: [],

    parentName: "Ramesh Joshi",
    parentPhone: "9800000061",
    parentEmail: "ramesh.joshi@example.com",
    parentOccupation: "Shopkeeper",

    aadhar: "XXXX-XXXX-1007",
    insurance: "HEALTH-INS-1007",
    healthIssues: "None",
  },

  {
    name: "Priya Nair",
    photo:
      "https://images.pexels.com/photos/3769712/pexels-photo-3769712.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 28457203,
    enrolmentNo: "2025110008",
    department: "ECE",
    semester: 1,
    class: "C",

    dob: "2004-01-30",
    gender: "Female",
    bloodGroup: "A+",
    category: "General",
    nationality: "Indian",

    phone: "9823456721",
    alternatePhone: "9823456722",
    email: "priya.nair@college.com",
    currentAddress: "88 Palm Avenue, Kochi",
    permanentAddress: "88 Palm Avenue, Kochi",
    city: "Kochi",
    state: "Kerala",
    postalCode: "682001",

    course: "B.Tech",
    admissionYear: 2023,
    status: "Active",
    mentor: "Dr. M. Isaac",

    cgpa: 8.2,
    sgpa: [8.2],
    backlogs: 0,
    attendancePercent: 91,

    idCardNo: "ID2025110008",
    libraryCardNo: "LIB2025110008",
    hostel: "Block E - Room 402",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [{ year: 2024, amount: 50000, status: "Paid" }],

    warnings: [],
    disciplinary: [],
    counselling: [],

    parentName: "Leela Nair",
    parentPhone: "9800000071",
    parentEmail: "leela.nair@example.com",
    parentOccupation: "Manager",

    aadhar: "XXXX-XXXX-1008",
    insurance: "HEALTH-INS-1008",
    healthIssues: "None",
  },

  {
    name: "Sahil Khan",
    photo:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 28457204,
    enrolmentNo: "2025110009",
    department: "ECE",
    semester: 3,
    class: "A",

    dob: "2003-09-09",
    gender: "Male",
    bloodGroup: "O-",
    category: "General",
    nationality: "Indian",

    phone: "9823456731",
    alternatePhone: "9823456732",
    email: "sahil.khan@college.com",
    currentAddress: "101 Royal Enclave, Mumbai",
    permanentAddress: "101 Royal Enclave, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",

    course: "B.Tech",
    admissionYear: 2021,
    status: "Active",
    mentor: "Prof. N. Iqbal",

    cgpa: 8.4,
    sgpa: [8.1, 8.5, 8.6],
    backlogs: 0,
    attendancePercent: 93,

    idCardNo: "ID2025110009",
    libraryCardNo: "LIB2025110009",
    hostel: "Block F - Room 210",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [{ year: 2024, amount: 50000, status: "Paid" }],

    warnings: [],
    disciplinary: [],
    counselling: [],

    parentName: "Aslam Khan",
    parentPhone: "9800000081",
    parentEmail: "aslam.khan@example.com",
    parentOccupation: "Driver",

    aadhar: "XXXX-XXXX-1009",
    insurance: "HEALTH-INS-1009",
    healthIssues: "None",
  },

  {
    name: "Ishita Roy",
    photo:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 28457205,
    enrolmentNo: "2025110010",
    department: "ECE",
    semester: 4,
    class: "B",

    dob: "2002-12-12",
    gender: "Female",
    bloodGroup: "B+",
    category: "General",
    nationality: "Indian",

    phone: "9823456741",
    alternatePhone: "9823456742",
    email: "ishita.roy@college.com",
    currentAddress: "44 Lotus Garden, Kolkata",
    permanentAddress: "44 Lotus Garden, Kolkata",
    city: "Kolkata",
    state: "West Bengal",
    postalCode: "700001",

    course: "B.Tech",
    admissionYear: 2020,
    status: "Active",
    mentor: "Dr. S. Mukherjee",

    cgpa: 8.6,
    sgpa: [8.3, 8.7, 8.6, 8.8],
    backlogs: 0,
    attendancePercent: 95,

    idCardNo: "ID2025110010",
    libraryCardNo: "LIB2025110010",
    hostel: "Block G - Room 105",
    scholarship: "Merit",
    feeStatus: "Paid",
    feeHistory: [{ year: 2024, amount: 50000, status: "Paid" }],

    warnings: [],
    disciplinary: [],
    counselling: [],

    parentName: "Rita Roy",
    parentPhone: "9800000091",
    parentEmail: "rita.roy@example.com",
    parentOccupation: "Accountant",

    aadhar: "XXXX-XXXX-1010",
    insurance: "HEALTH-INS-1010",
    healthIssues: "None",
  },

  // MECH - 5 students
  {
    name: "Mohit Rana",
    photo:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 39568101,
    enrolmentNo: "2025110011",
    department: "MECH",
    semester: 3,
    class: "C",

    dob: "2002-04-22",
    gender: "Male",
    bloodGroup: "A+",
    category: "General",
    nationality: "Indian",

    phone: "9834567801",
    alternatePhone: "9834567802",
    email: "mohit.rana@college.com",
    currentAddress: "67 Steel Colony, Jamshedpur",
    permanentAddress: "67 Steel Colony, Jamshedpur",
    city: "Jamshedpur",
    state: "Jharkhand",
    postalCode: "831001",

    course: "B.Tech",
    admissionYear: 2021,
    status: "Active",
    mentor: "Prof. G. Saini",

    cgpa: 7.8,
    sgpa: [7.6, 7.9, 7.8],
    backlogs: 1,
    attendancePercent: 86,

    idCardNo: "ID2025110011",
    libraryCardNo: "LIB2025110011",
    hostel: "Block H - Room 302",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [{ year: 2024, amount: 50000, status: "Paid" }],

    warnings: [],
    disciplinary: [],
    counselling: [],

    parentName: "Ramesh Rana",
    parentPhone: "9800000101",
    parentEmail: "ramesh.rana@example.com",
    parentOccupation: "Farmer",

    aadhar: "XXXX-XXXX-1011",
    insurance: "HEALTH-INS-1011",
    healthIssues: "None",
  },

  {
    name: "Ananya Gupta",
    photo:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 39568102,
    enrolmentNo: "2025110012",
    department: "MECH",
    semester: 1,
    class: "A",

    dob: "2004-10-10",
    gender: "Female",
    bloodGroup: "AB+",
    category: "General",
    nationality: "Indian",

    phone: "9834567811",
    alternatePhone: "9834567812",
    email: "ananya.gupta@college.com",
    currentAddress: "5 Pearl Tower, Bhopal",
    permanentAddress: "5 Pearl Tower, Bhopal",
    city: "Bhopal",
    state: "Madhya Pradesh",
    postalCode: "462001",

    course: "B.Tech",
    admissionYear: 2023,
    status: "Active",
    mentor: "Dr. H. Mehta",

    cgpa: 8.0,
    sgpa: [8.0],
    backlogs: 0,
    attendancePercent: 90,

    idCardNo: "ID2025110012",
    libraryCardNo: "LIB2025110012",
    hostel: "Block A - Room 111",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [{ year: 2024, amount: 50000, status: "Paid" }],

    warnings: [],
    disciplinary: [],
    counselling: [],

    parentName: "Vikram Gupta",
    parentPhone: "9800000111",
    parentEmail: "vikram.gupta@example.com",
    parentOccupation: "Software Engineer",

    aadhar: "XXXX-XXXX-1012",
    insurance: "HEALTH-INS-1012",
    healthIssues: "None",
  },

  {
    name: "Deepak Rawat",
    photo:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 39568103,
    enrolmentNo: "2025110013",
    department: "MECH",
    semester: 4,
    class: "B",

    dob: "2002-02-28",
    gender: "Male",
    bloodGroup: "O+",
    category: "OBC",
    nationality: "Indian",

    phone: "9834567821",
    alternatePhone: "9834567822",
    email: "deepak.rawat@college.com",
    currentAddress: "72 Engine Road, Dehradun",
    permanentAddress: "72 Engine Road, Dehradun",
    city: "Dehradun",
    state: "Uttarakhand",
    postalCode: "248001",

    course: "B.Tech",
    admissionYear: 2020,
    status: "Active",
    mentor: "Prof. K. Sharma",

    cgpa: 7.7,
    sgpa: [7.6, 7.8, 7.7, 7.9],
    backlogs: 0,
    attendancePercent: 88,

    idCardNo: "ID2025110013",
    libraryCardNo: "LIB2025110013",
    hostel: "Block B - Room 307",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [{ year: 2024, amount: 50000, status: "Paid" }],

    warnings: [],
    disciplinary: [],
    counselling: [],

    parentName: "Ramesh Rawat",
    parentPhone: "9800000121",
    parentEmail: "ramesh.rawat@example.com",
    parentOccupation: "Contractor",

    aadhar: "XXXX-XXXX-1013",
    insurance: "HEALTH-INS-1013",
    healthIssues: "None",
  },

  {
    name: "Riya Malhotra",
    photo:
      "https://images.pexels.com/photos/3769712/pexels-photo-3769712.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 39568104,
    enrolmentNo: "2025110014",
    department: "MECH",
    semester: 2,
    class: "C",

    dob: "2003-11-03",
    gender: "Female",
    bloodGroup: "B+",
    category: "General",
    nationality: "Indian",

    phone: "9834567831",
    alternatePhone: "9834567832",
    email: "riya.malhotra@college.com",
    currentAddress: "90 Sunset Block, Indore",
    permanentAddress: "90 Sunset Block, Indore",
    city: "Indore",
    state: "Madhya Pradesh",
    postalCode: "452001",

    course: "B.Tech",
    admissionYear: 2022,
    status: "Active",
    mentor: "Dr. R. Gupta",

    cgpa: 8.2,
    sgpa: [8.1, 8.3],
    backlogs: 0,
    attendancePercent: 92,

    idCardNo: "ID2025110014",
    libraryCardNo: "LIB2025110014",
    hostel: "Block C - Room 405",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [{ year: 2024, amount: 50000, status: "Paid" }],

    warnings: [],
    disciplinary: [],
    counselling: [],

    parentName: "Sandeep Malhotra",
    parentPhone: "9800000131",
    parentEmail: "sandeep.malhotra@example.com",
    parentOccupation: "Manager",

    aadhar: "XXXX-XXXX-1014",
    insurance: "HEALTH-INS-1014",
    healthIssues: "None",
  },

  {
    name: "Yash Patel",
    photo:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rollNo: 39568105,
    enrolmentNo: "2025110015",
    department: "MECH",
    semester: 4,
    class: "A",

    dob: "2002-09-25",
    gender: "Male",
    bloodGroup: "A+",
    category: "General",
    nationality: "Indian",

    phone: "9834567841",
    alternatePhone: "9834567842",
    email: "yash.patel@college.com",
    currentAddress: "23 Valley Road, Surat",
    permanentAddress: "23 Valley Road, Surat",
    city: "Surat",
    state: "Gujarat",
    postalCode: "395001",

    course: "B.Tech",
    admissionYear: 2020,
    status: "Active",
    mentor: "Prof. S. Patel",

    cgpa: 8.4,
    sgpa: [8.2, 8.4, 8.6, 8.4],
    backlogs: 0,
    attendancePercent: 94,

    idCardNo: "ID2025110015",
    libraryCardNo: "LIB2025110015",
    hostel: "Block D - Room 120",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [{ year: 2024, amount: 50000, status: "Paid" }],

    warnings: [],
    disciplinary: [],
    counselling: [],

    parentName: "Ketan Patel",
    parentPhone: "9800000141",
    parentEmail: "ketan.patel@example.com",
    parentOccupation: "Business",

    aadhar: "XXXX-XXXX-1015",
    insurance: "HEALTH-INS-1015",
    healthIssues: "None",
  },
];

// rest of original arrays — unchanged except some dates normalized
export const parentsData = [
  {
    id: 1,
    name: "John Doe",
    students: ["Sarah Brewer"],
    email: "john@doe.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 2,
    name: "Jane Doe",
    students: ["Cecilia Bradley"],
    email: "jane@doe.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 3,
    name: "Mike Geller",
    students: ["Fanny Caldwell"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 4,
    name: "Jay French",
    students: ["Mollie Fitzgerald", "Ian Bryant"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 5,
    name: "Jane Smith",
    students: ["Mable Harvey"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 6,
    name: "Anna Santiago",
    students: ["Joel Lambert"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 7,
    name: "Allen Black",
    students: ["Carrie Tucker", "Lilly Underwood"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 8,
    name: "Ophelia Castro",
    students: ["Alexander Blair"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 9,
    name: "Derek Briggs",
    students: ["Susan Webster", "Maude Stone"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 10,
    name: "John Glover",
    students: ["Stella Scott"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
];

export const subjectsData = [
  { id: 1, name: "Math", teachers: ["Alice Phelps", "Russell Davidson"] },
  { id: 2, name: "English", teachers: ["Manuel Becker", "Eddie Chavez"] },
  { id: 3, name: "Physics", teachers: ["Lola Newman", "Darrell Delgado"] },
  { id: 4, name: "Chemistry", teachers: ["Nathan Kelly", "Benjamin Snyder"] },
  { id: 5, name: "Biology", teachers: ["Alma Benson", "Lina Collier"] },
  { id: 6, name: "History", teachers: ["Hannah Bowman", "Betty Obrien"] },
  { id: 7, name: "Geography", teachers: ["Lora French", "Sue Brady"] },
  { id: 8, name: "Art", teachers: ["Harriet Alvarado", "Mayme Keller"] },
  { id: 9, name: "Music", teachers: ["Gertrude Roy", "Rosa Singleton"] },
  { id: 10, name: "Literature", teachers: ["Effie Lynch", "Brett Flowers"] },
];

export const classesData = [
  { id: 1, name: "1A", capacity: 20, grade: 1, supervisor: "Joseph Padilla" },
  { id: 2, name: "2B", capacity: 22, grade: 2, supervisor: "Blake Joseph" },
  { id: 3, name: "3C", capacity: 20, grade: 3, supervisor: "Tom Bennett" },
  { id: 4, name: "4B", capacity: 18, grade: 4, supervisor: "Aaron Collins" },
  { id: 5, name: "5A", capacity: 16, grade: 5, supervisor: "Iva Frank" },
  { id: 6, name: "5B", capacity: 20, grade: 5, supervisor: "Leila Santos" },
  { id: 7, name: "7A", capacity: 18, grade: 7, supervisor: "Carrie Walton" },
  { id: 8, name: "6B", capacity: 22, grade: 6, supervisor: "Christopher Butler" },
  { id: 9, name: "6C", capacity: 18, grade: 6, supervisor: "Marc Miller" },
  { id: 10, name: "6D", capacity: 20, grade: 6, supervisor: "Ophelia Marsh" },
];

export const lessonsData = [
  { id: 1, subject: "Math", class: "1A", teacher: "Tommy Wise" },
  { id: 2, subject: "English", class: "2A", teacher: "Rhoda Frank" },
  { id: 3, subject: "Science", class: "3A", teacher: "Della Dunn" },
  { id: 4, subject: "Social Studies", class: "1B", teacher: "Bruce Rodriguez" },
  { id: 5, subject: "Art", class: "4A", teacher: "Birdie Butler" },
  { id: 6, subject: "Music", class: "5A", teacher: "Bettie Oliver" },
  { id: 7, subject: "History", class: "6A", teacher: "Herman Howard" },
  { id: 8, subject: "Geography", class: "6B", teacher: "Lucinda Thomas" },
  { id: 9, subject: "Physics", class: "6C", teacher: "Ronald Roberts" },
  { id: 10, subject: "Chemistry", class: "4B", teacher: "Julia Pittman" },
];

export const examsData = [
  { id: 1, subject: "Math", class: "1A", teacher: "Martha Morris", date: "2025-01-01" },
  { id: 2, subject: "English", class: "2A", teacher: "Randall Garcia", date: "2025-01-01" },
  { id: 3, subject: "Science", class: "3A", teacher: "Myrtie Scott", date: "2025-01-01" },
  { id: 4, subject: "Social Studies", class: "1B", teacher: "Alvin Swanson", date: "2025-01-01" },
  { id: 5, subject: "Art", class: "4A", teacher: "Mabelle Wallace", date: "2025-01-01" },
  { id: 6, subject: "Music", class: "5A", teacher: "Dale Thompson", date: "2025-01-01" },
  { id: 7, subject: "History", class: "6A", teacher: "Allie Conner", date: "2025-01-01" },
  { id: 8, subject: "Geography", class: "6B", teacher: "Hunter Fuller", date: "2025-01-01" },
  { id: 9, subject: "Physics", class: "7A", teacher: "Lois Lindsey", date: "2025-01-01" },
  { id: 10, subject: "Chemistry", class: "8A", teacher: "Vera Soto", date: "2025-01-01" },
];

export const assignmentsData = [
  { id: 1, subject: "Math", class: "1A", teacher: "Anthony Boone", dueDate: "2025-01-01" },
  { id: 2, subject: "English", class: "2A", teacher: "Clifford Bowen", dueDate: "2025-01-01" },
  { id: 3, subject: "Science", class: "3A", teacher: "Catherine Malone", dueDate: "2025-01-01" },
  { id: 4, subject: "Social Studies", class: "1B", teacher: "Willie Medina", dueDate: "2025-01-01" },
  { id: 5, subject: "Art", class: "4A", teacher: "Jose Ruiz", dueDate: "2025-01-01" },
  { id: 6, subject: "Music", class: "5A", teacher: "Katharine Owens", dueDate: "2025-01-01" },
  { id: 7, subject: "History", class: "6A", teacher: "Shawn Norman", dueDate: "2025-01-01" },
  { id: 8, subject: "Geography", class: "6B", teacher: "Don Holloway", dueDate: "2025-01-01" },
  { id: 9, subject: "Physics", class: "7A", teacher: "Franklin Gregory", dueDate: "2025-01-01" },
  { id: 10, subject: "Chemistry", class: "8A", teacher: "Danny Nguyen", dueDate: "2025-01-01" },
];

export const resultsData = [
  { id: 1, subject: "Math", class: "1A", teacher: "John Doe", student: "John Doe", date: "2025-01-01", type: "exam", score: 90 },
  { id: 2, subject: "English", class: "2A", teacher: "John Doe", student: "John Doe", date: "2025-01-01", type: "exam", score: 90 },
  { id: 3, subject: "Science", class: "3A", teacher: "John Doe", student: "John Doe", date: "2025-01-01", type: "exam", score: 90 },
  { id: 4, subject: "Social Studies", class: "1B", teacher: "John Doe", student: "John Doe", date: "2025-01-01", type: "exam", score: 90 },
  { id: 5, subject: "Art", class: "4A", teacher: "John Doe", student: "John Doe", date: "2025-01-01", type: "exam", score: 90 },
  { id: 6, subject: "Music", class: "5A", teacher: "John Doe", student: "John Doe", date: "2025-01-01", type: "exam", score: 90 },
  { id: 7, subject: "History", class: "6A", teacher: "John Doe", student: "John Doe", date: "2025-01-01", type: "exam", score: 90 },
  { id: 8, subject: "Geography", class: "6B", teacher: "John Doe", student: "John Doe", date: "2025-01-01", type: "exam", score: 90 },
  { id: 9, subject: "Physics", class: "7A", teacher: "John Doe", student: "John Doe", date: "2025-01-01", type: "exam", score: 90 },
  { id: 10, subject: "Chemistry", class: "8A", teacher: "John Doe", student: "John Doe", date: "2025-01-01", type: "exam", score: 90 },
];

export const eventsData = [
  { id: 1, title: "Lake Trip", class: "1A", date: "2025-01-13", startTime: "10:00", endTime: "11:00" },
  { id: 2, title: "Picnic", class: "2A", date: "2025-01-13", startTime: "10:00", endTime: "11:00" },
  { id: 3, title: "Beach Trip", class: "3A", date: "2025-01-13", startTime: "10:00", endTime: "11:00" },
  { id: 4, title: "Museum Trip", class: "4A", date: "2025-01-13", startTime: "10:00", endTime: "11:00" },
  { id: 5, title: "Music Concert", class: "5A", date: "2025-01-13", startTime: "10:00", endTime: "11:00" },
  { id: 6, title: "Magician Show", class: "1B", date: "2025-01-13", startTime: "10:00", endTime: "11:00" },
  { id: 7, title: "Lake Trip", class: "2B", date: "2025-01-13", startTime: "10:00", endTime: "11:00" },
  { id: 8, title: "Cycling Race", class: "3B", date: "2025-01-13", startTime: "10:00", endTime: "11:00" },
  { id: 9, title: "Art Exhibition", class: "4B", date: "2025-01-13", startTime: "10:00", endTime: "11:00" },
  { id: 10, title: "Sports Tournament", class: "5B", date: "2025-01-13", startTime: "10:00", endTime: "11:00" },
];

export const announcementsData = [
  { id: 1, title: "About 4A Math Test", class: "4A", date: "2025-01-13" },
  { id: 2, title: "About 3A Math Test", class: "3A", date: "2025-01-13" },
  { id: 3, title: "About 3B Math Test", class: "3B", date: "2025-01-13" },
  { id: 4, title: "About 6A Math Test", class: "6A", date: "2025-01-13" },
  { id: 5, title: "About 8C Math Test", class: "8C", date: "2025-01-13" },
  { id: 6, title: "About 2A Math Test", class: "2A", date: "2025-01-13" },
  { id: 7, title: "About 4C Math Test", class: "4C", date: "2025-01-13" },
  { id: 8, title: "About 4B Math Test", class: "4B", date: "2025-01-13" },
  { id: 9, title: "About 3C Math Test", class: "3C", date: "2025-01-13" },
  { id: 10, title: "About 1C Math Test", class: "1C", date: "2025-01-13" },
];

// calendar events (simple)
export const calendarEvents = [
  { title: "Math", allDay: false, start: new Date(2025, 10, 13, 8, 0), end: new Date(2025, 10, 13, 8, 45) },
  { title: "English", allDay: false, start: new Date(2025, 10, 13, 9, 0), end: new Date(2025, 10, 13, 9, 45) },
  { title: "Biology", allDay: false, start: new Date(2025, 10, 13, 10, 0), end: new Date(2025, 10, 13, 10, 45) },
  { title: "Physics", allDay: false, start: new Date(2025, 10, 13, 11, 0), end: new Date(2025, 10, 13, 11, 45) },
  { title: "Chemistry", allDay: false, start: new Date(2025, 10, 13, 13, 0), end: new Date(2025, 10, 13, 13, 45) },
  { title: "History", allDay: false, start: new Date(2025, 10, 13, 14, 0), end: new Date(2025, 10, 13, 14, 45) },
];
