// ===========================
//        USER ROLE
// ===========================
export let role = "admin"; // admin | subadmin | superadmin | student

// ===========================
//       TEACHERS DATA
// (Original full list)
// ===========================
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

// ===========================
//      STUDENTS DATA
// 15 students — FULL
// ===========================
export const studentsData = [
  // ====================== CSE STUDENTS ======================
  {
    enrolmentNo: "2025110001",
    rollNo: 18349201,
    name: "Arjun Mehta",
    photo: "https://randomuser.me/api/portraits/men/11.jpg",

    dob: "2004-06-12",
    gender: "Male",
    bloodGroup: "A+",
    category: "General",
    nationality: "Indian",

    phone: "9876543211",
    email: "arjun.mehta@college.com",
    altPhone: "9123456789",
    currentAddress: "45 Lake View Road, Patna",
    permanentAddress: "54 Sunrise Nagar, Patna",
    city: "Patna",
    state: "Bihar",
    postalCode: "800001",

    course: "B.Tech",
    department: "CSE",
    semester: 4,
    class: "A",
    admissionYear: 2021,
    status: "Active",
    mentor: "Dr. R. Sharma",

    cgpa: { "1": 8.1, "2": 8.3, "3": 8.4, "4": 8.5 },
    attendance: { Math: 92, Physics: 88, Programming: 95 },
    backlogs: 0,
    improvements: 0,

    idCardNo: "ID20251101",
    libraryCardNo: "LIB881101",
    hostel: "Not Allotted",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2021, status: "Paid" },
      { year: 2022, status: "Paid" },
      { year: 2023, status: "Paid" },
    ],

    warnings: [],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Ramesh Mehta",
    parentPhone: "9876500011",
    parentEmail: "ramesh.mehta@example.com",
    parentOccupation: "Businessman",

    aadhar: "XXXX-XXXX-4321",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  {
    enrolmentNo: "2025110002",
    rollNo: 18349202,
    name: "Neha Singh",
    photo: "https://randomuser.me/api/portraits/women/12.jpg",

    dob: "2004-09-22",
    gender: "Female",
    bloodGroup: "B+",
    category: "OBC",
    nationality: "Indian",

    phone: "9876543212",
    email: "neha.singh@college.com",
    altPhone: "9123456782",
    currentAddress: "12 Green Park, Delhi",
    permanentAddress: "12 Green Park, Delhi",
    city: "New Delhi",
    state: "Delhi",
    postalCode: "110016",

    course: "B.Tech",
    department: "CSE",
    semester: 3,
    class: "B",
    admissionYear: 2021,
    status: "Active",
    mentor: "Prof. Anita Desai",

    cgpa: { "1": 7.9, "2": 8.1, "3": 8.0 },
    attendance: { Math: 89, DSA: 94, DBMS: 90 },
    backlogs: 0,
    improvements: 1,

    idCardNo: "ID20251102",
    libraryCardNo: "LIB881102",
    hostel: "Girls Hostel Block B",
    scholarship: "Merit Scholarship",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2021, status: "Paid" },
      { year: 2022, status: "Paid" }
    ],

    warnings: [],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Asha Singh",
    parentPhone: "9811122233",
    parentEmail: "asha.singh@example.com",
    parentOccupation: "Teacher",

    aadhar: "XXXX-XXXX-2211",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  {
    enrolmentNo: "2025110003",
    rollNo: 18349203,
    name: "Rohit Verma",
    photo: "https://randomuser.me/api/portraits/men/13.jpg",

    dob: "2003-12-02",
    gender: "Male",
    bloodGroup: "O+",
    category: "General",
    nationality: "Indian",

    phone: "9876543213",
    email: "rohit.verma@college.com",
    altPhone: "9123456711",
    currentAddress: "7 Sunrise Colony, Lucknow",
    permanentAddress: "7 Sunrise Colony, Lucknow",
    city: "Lucknow",
    state: "UP",
    postalCode: "226001",

    course: "B.Tech",
    department: "CSE",
    semester: 2,
    class: "C",
    admissionYear: 2022,
    status: "Active",
    mentor: "Dr. Mohan Gupta",

    cgpa: { "1": 8.0, "2": 7.8 },
    attendance: { Math: 91, EG: 86, Programming: 93 },
    backlogs: 1,
    improvements: 0,

    idCardNo: "ID20251103",
    libraryCardNo: "LIB881103",
    hostel: "Boys Hostel C1",
    scholarship: "None",
    feeStatus: "Pending",
    feeHistory: [
      { year: 2022, status: "Paid" },
    ],

    warnings: ["Low attendance in EG"],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Suresh Verma",
    parentPhone: "9898989898",
    parentEmail: "suresh.verma@example.com",
    parentOccupation: "Accountant",

    aadhar: "XXXX-XXXX-1212",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  {
    enrolmentNo: "2025110004",
    rollNo: 18349204,
    name: "Simran Kaur",
    photo: "https://randomuser.me/api/portraits/women/14.jpg",

    dob: "2004-08-30",
    gender: "Female",
    bloodGroup: "AB+",
    category: "General",
    nationality: "Indian",

    phone: "9876543214",
    email: "simran.kaur@college.com",
    altPhone: "9123456744",
    currentAddress: "89 River View, Chandigarh",
    permanentAddress: "89 River View, Chandigarh",
    city: "Chandigarh",
    state: "Punjab",
    postalCode: "160017",

    course: "B.Tech",
    department: "CSE",
    semester: 1,
    class: "A",
    admissionYear: 2023,
    status: "Active",
    mentor: "Prof. Harinder Singh",

    cgpa: { "1": 8.4 },
    attendance: { Math: 95, Programming: 90 },
    backlogs: 0,
    improvements: 0,

    idCardNo: "ID20251104",
    libraryCardNo: "LIB881104",
    hostel: "Girls Hostel A",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2023, status: "Paid" },
    ],

    warnings: [],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Jaspreet Kaur",
    parentPhone: "9876500023",
    parentEmail: "jaspreet.kaur@example.com",
    parentOccupation: "Nurse",

    aadhar: "XXXX-XXXX-6543",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  {
    enrolmentNo: "2025110005",
    rollNo: 18349205,
    name: "Aditya Kumar",
    photo: "https://randomuser.me/api/portraits/men/15.jpg",

    dob: "2003-05-19",
    gender: "Male",
    bloodGroup: "A-",
    category: "General",
    nationality: "Indian",

    phone: "9876543215",
    email: "aditya.kumar@college.com",
    altPhone: "9123456755",
    currentAddress: "54 Garden Estate, Noida",
    permanentAddress: "54 Garden Estate, Noida",
    city: "Noida",
    state: "UP",
    postalCode: "201301",

    course: "B.Tech",
    department: "CSE",
    semester: 3,
    class: "B",
    admissionYear: 2021,
    status: "Active",
    mentor: "Dr. Raghav Sharma",

    cgpa: { "1": 7.8, "2": 8.0, "3": 8.3 },
    attendance: { DBMS: 88, OS: 92, CN: 85 },
    backlogs: 0,
    improvements: 0,

    idCardNo: "ID20251105",
    libraryCardNo: "LIB881105",
    hostel: "Not Allotted",
    scholarship: "Sports Scholarship",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2021, status: "Paid" },
      { year: 2022, status: "Paid" },
      { year: 2023, status: "Paid" },
    ],

    warnings: [],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Vijay Kumar",
    parentPhone: "9876500055",
    parentEmail: "vijay.kumar@example.com",
    parentOccupation: "Government Officer",

    aadhar: "XXXX-XXXX-5678",
    healthIssues: "Asthma",
    insurance: "College Health Plan",
  },

  // ====================== ECE STUDENTS ======================
  {
    enrolmentNo: "2025110006",
    rollNo: 28457201,
    name: "Shruti Sharma",
    photo: "https://randomuser.me/api/portraits/women/21.jpg",

    dob: "2004-07-14",
    gender: "Female",
    bloodGroup: "A+",
    category: "OBC",
    nationality: "Indian",

    phone: "9876543221",
    email: "shruti.sharma@college.com",
    altPhone: "9123456766",
    currentAddress: "31 Maple Street, Jaipur",
    permanentAddress: "31 Maple Street, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    postalCode: "302001",

    course: "B.Tech",
    department: "ECE",
    semester: 4,
    class: "A",
    admissionYear: 2021,
    status: "Active",
    mentor: "Dr. Sunil Yadav",

    cgpa: { "1": 8.2, "2": 8.0, "3": 8.3, "4": 8.4 },
    attendance: { DSP: 93, Circuits: 90, Networks: 92 },
    backlogs: 0,
    improvements: 0,

    idCardNo: "ID20251106",
    libraryCardNo: "LIB881106",
    hostel: "Girls Hostel C",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2021, status: "Paid" },
      { year: 2022, status: "Paid" },
      { year: 2023, status: "Paid" }
    ],

    warnings: [],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Mahesh Sharma",
    parentPhone: "9876512301",
    parentEmail: "mahesh.sharma@example.com",
    parentOccupation: "Architect",

    aadhar: "XXXX-XXXX-2345",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  {
    enrolmentNo: "2025110007",
    rollNo: 28457202,
    name: "Kunal Joshi",
    photo: "https://randomuser.me/api/portraits/men/22.jpg",

    dob: "2003-11-04",
    gender: "Male",
    bloodGroup: "B+",
    category: "General",
    nationality: "Indian",

    phone: "9876543222",
    email: "kunal.joshi@college.com",
    altPhone: "9123456777",
    currentAddress: "9 Hill Top, Ahmedabad",
    permanentAddress: "9 Hill Top, Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    postalCode: "380001",

    course: "B.Tech",
    department: "ECE",
    semester: 2,
    class: "B",
    admissionYear: 2022,
    status: "Active",
    mentor: "Dr. Rakesh Rao",

    cgpa: { "1": 7.6, "2": 7.8 },
    attendance: { Circuits: 88, Signals: 82, Networks: 90 },
    backlogs: 0,
    improvements: 1,

    idCardNo: "ID20251107",
    libraryCardNo: "LIB881107",
    hostel: "Not Allotted",
    scholarship: "None",
    feeStatus: "Pending",
    feeHistory: [
      { year: 2022, status: "Paid" }
    ],

    warnings: ["Late fee submission"],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Harish Joshi",
    parentPhone: "9876512302",
    parentEmail: "harish.joshi@example.com",
    parentOccupation: "Shop Owner",

    aadhar: "XXXX-XXXX-7654",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  {
    enrolmentNo: "2025110008",
    rollNo: 28457203,
    name: "Priya Nair",
    photo: "https://randomuser.me/api/portraits/women/23.jpg",

    dob: "2004-02-15",
    gender: "Female",
    bloodGroup: "O+",
    category: "General",
    nationality: "Indian",

    phone: "9876543223",
    email: "priya.nair@college.com",
    altPhone: "9123456788",
    currentAddress: "88 Palm Avenue, Kochi",
    permanentAddress: "88 Palm Avenue, Kochi",
    city: "Kochi",
    state: "Kerala",
    postalCode: "682001",

    course: "B.Tech",
    department: "ECE",
    semester: 1,
    class: "C",
    admissionYear: 2023,
    status: "Active",
    mentor: "Prof. Lekha Menon",

    cgpa: { "1": 8.7 },
    attendance: { Circuits: 94, Math: 91, Electronics: 89 },
    backlogs: 0,
    improvements: 0,

    idCardNo: "ID20251108",
    libraryCardNo: "LIB881108",
    hostel: "Girls Hostel B",
    scholarship: "Merit Scholarship",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2023, status: "Paid" }
    ],

    warnings: [],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Suresh Nair",
    parentPhone: "9876512303",
    parentEmail: "suresh.nair@example.com",
    parentOccupation: "Engineer",

    aadhar: "XXXX-XXXX-9876",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  {
    enrolmentNo: "2025110009",
    rollNo: 28457204,
    name: "Sahil Khan",
    photo: "https://randomuser.me/api/portraits/men/24.jpg",

    dob: "2003-03-29",
    gender: "Male",
    bloodGroup: "A+",
    category: "OBC",
    nationality: "Indian",

    phone: "9876543224",
    email: "sahil.khan@college.com",
    altPhone: "9123456799",
    currentAddress: "101 Royal Enclave, Mumbai",
    permanentAddress: "101 Royal Enclave, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",

    course: "B.Tech",
    department: "ECE",
    semester: 3,
    class: "A",
    admissionYear: 2021,
    status: "Active",
    mentor: "Dr. Farooq Ahmed",

    cgpa: { "1": 7.7, "2": 7.9, "3": 8.1 },
    attendance: { Signals: 85, Networks: 89, Math: 90 },
    backlogs: 1,
    improvements: 0,

    idCardNo: "ID20251109",
    libraryCardNo: "LIB881109",
    hostel: "Not Allotted",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2021, status: "Paid" },
      { year: 2022, status: "Paid" },
      { year: 2023, status: "Paid" }
    ],

    warnings: [],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Imran Khan",
    parentPhone: "9876512304",
    parentEmail: "imran.khan@example.com",
    parentOccupation: "Driver",

    aadhar: "XXXX-XXXX-6789",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  {
    enrolmentNo: "2025110010",
    rollNo: 28457205,
    name: "Ishita Roy",
    photo: "https://randomuser.me/api/portraits/women/25.jpg",

    dob: "2004-05-11",
    gender: "Female",
    bloodGroup: "B-",
    category: "SC",
    nationality: "Indian",

    phone: "9876543225",
    email: "ishita.roy@college.com",
    altPhone: "9123456700",
    currentAddress: "44 Lotus Garden, Kolkata",
    permanentAddress: "44 Lotus Garden, Kolkata",
    city: "Kolkata",
    state: "West Bengal",
    postalCode: "700001",

    course: "B.Tech",
    department: "ECE",
    semester: 4,
    class: "B",
    admissionYear: 2021,
    status: "Active",
    mentor: "Prof. Arindam Sen",

    cgpa: { "1": 8.9, "2": 9.1, "3": 9.0, "4": 9.2 },
    attendance: { DSP: 96, Networks: 94, Controls: 95 },
    backlogs: 0,
    improvements: 0,

    idCardNo: "ID20251110",
    libraryCardNo: "LIB881110",
    hostel: "Girls Hostel A",
    scholarship: "Topper Scholarship",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2021, status: "Paid" },
      { year: 2022, status: "Paid" },
      { year: 2023, status: "Paid" }
    ],

    warnings: [],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Sudip Roy",
    parentPhone: "9876512305",
    parentEmail: "sudip.roy@example.com",
    parentOccupation: "Bank Manager",

    aadhar: "XXXX-XXXX-3333",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  // ====================== MECHANICAL STUDENTS ======================
  {
    enrolmentNo: "2025110011",
    rollNo: 39568101,
    name: "Mohit Rana",
    photo: "https://randomuser.me/api/portraits/men/31.jpg",

    dob: "2003-01-14",
    gender: "Male",
    bloodGroup: "O+",
    category: "General",
    nationality: "Indian",

    phone: "9876543231",
    email: "mohit.rana@college.com",
    altPhone: "9123456701",
    currentAddress: "67 Steel Colony, Jamshedpur",
    permanentAddress: "67 Steel Colony, Jamshedpur",
    city: "Jamshedpur",
    state: "Jharkhand",
    postalCode: "831001",

    course: "B.Tech",
    department: "MECH",
    semester: 3,
    class: "C",
    admissionYear: 2021,
    status: "Active",
    mentor: "Dr. Rajeev Singh",

    cgpa: { "1": 7.1, "2": 7.5, "3": 7.4 },
    attendance: { Mechanics: 89, Thermo: 92, Physics: 87 },
    backlogs: 0,
    improvements: 0,

    idCardNo: "ID20251111",
    libraryCardNo: "LIB881111",
    hostel: "Boys Hostel A",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2021, status: "Paid" },
      { year: 2022, status: "Paid" }
    ],

    warnings: [],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Mukesh Rana",
    parentPhone: "9876512306",
    parentEmail: "mukesh.rana@example.com",
    parentOccupation: "Factory Worker",

    aadhar: "XXXX-XXXX-1122",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  {
    enrolmentNo: "2025110012",
    rollNo: 39568102,
    name: "Ananya Gupta",
    photo: "https://randomuser.me/api/portraits/women/32.jpg",

    dob: "2004-02-28",
    gender: "Female",
    bloodGroup: "A+",
    category: "General",
    nationality: "Indian",

    phone: "9876543232",
    email: "ananya.gupta@college.com",
    altPhone: "9123456702",
    currentAddress: "5 Pearl Tower, Bhopal",
    permanentAddress: "5 Pearl Tower, Bhopal",
    city: "Bhopal",
    state: "MP",
    postalCode: "462001",

    course: "B.Tech",
    department: "MECH",
    semester: 1,
    class: "A",
    admissionYear: 2023,
    status: "Active",
    mentor: "Dr. Sonia Tiwari",

    cgpa: { "1": 8.2 },
    attendance: { Math: 94, Physics: 92, Mechanics: 89 },
    backlogs: 0,
    improvements: 0,

    idCardNo: "ID20251112",
    libraryCardNo: "LIB881112",
    hostel: "Girls Hostel C",
    scholarship: "Merit",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2023, status: "Paid" }
    ],

    warnings: [],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Shashank Gupta",
    parentPhone: "9876512307",
    parentEmail: "shashank.gupta@example.com",
    parentOccupation: "Software Engineer",

    aadhar: "XXXX-XXXX-2233",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  {
    enrolmentNo: "2025110013",
    rollNo: 39568103,
    name: "Deepak Rawat",
    photo: "https://randomuser.me/api/portraits/men/33.jpg",

    dob: "2003-03-10",
    gender: "Male",
    bloodGroup: "B+",
    category: "OBC",
    nationality: "Indian",

    phone: "9876543233",
    email: "deepak.rawat@college.com",
    altPhone: "9123456703",
    currentAddress: "72 Engine Road, Dehradun",
    permanentAddress: "72 Engine Road, Dehradun",
    city: "Dehradun",
    state: "Uttarakhand",
    postalCode: "248001",

    course: "B.Tech",
    department: "MECH",
    semester: 4,
    class: "B",
    admissionYear: 2021,
    status: "Active",
    mentor: "Dr. Neeraj Kumar",

    cgpa: { "1": 7.4, "2": 7.6, "3": 7.9, "4": 8.0 },
    attendance: { Thermo: 88, Machines: 85, Math: 91 },
    backlogs: 1,
    improvements: 0,

    idCardNo: "ID20251113",
    libraryCardNo: "LIB881113",
    hostel: "Not Allotted",
    scholarship: "None",
    feeStatus: "Pending",
    feeHistory: [
      { year: 2021, status: "Paid" },
      { year: 2022, status: "Paid" }
    ],

    warnings: ["Late project submission"],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Kiran Rawat",
    parentPhone: "9876512308",
    parentEmail: "kiran.rawat@example.com",
    parentOccupation: "Army Officer",

    aadhar: "XXXX-XXXX-3344",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  {
    enrolmentNo: "2025110014",
    rollNo: 39568104,
    name: "Riya Malhotra",
    photo: "https://randomuser.me/api/portraits/women/34.jpg",

    dob: "2004-01-05",
    gender: "Female",
    bloodGroup: "O+",
    category: "General",
    nationality: "Indian",

    phone: "9876543234",
    email: "riya.malhotra@college.com",
    altPhone: "9123456704",
    currentAddress: "90 Sunset Block, Indore",
    permanentAddress: "90 Sunset Block, Indore",
    city: "Indore",
    state: "MP",
    postalCode: "452001",

    course: "B.Tech",
    department: "MECH",
    semester: 2,
    class: "C",
    admissionYear: 2022,
    status: "Active",
    mentor: "Prof. A. Malhotra",

    cgpa: { "1": 8.1, "2": 7.9 },
    attendance: { Math: 93, Physics: 90, Machines: 89 },
    backlogs: 0,
    improvements: 0,

    idCardNo: "ID20251114",
    libraryCardNo: "LIB881114",
    hostel: "Girls Hostel A",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2022, status: "Paid" }
    ],

    warnings: [],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Amit Malhotra",
    parentPhone: "9876512309",
    parentEmail: "amit.malhotra@example.com",
    parentOccupation: "Doctor",

    aadhar: "XXXX-XXXX-5566",
    healthIssues: "None",
    insurance: "College Health Plan",
  },

  {
    enrolmentNo: "2025110015",
    rollNo: 39568105,
    name: "Yash Patel",
    photo: "https://randomuser.me/api/portraits/men/35.jpg",

    dob: "2003-11-21",
    gender: "Male",
    bloodGroup: "B-",
    category: "General",
    nationality: "Indian",

    phone: "9876543235",
    email: "yash.patel@college.com",
    altPhone: "9123456705",
    currentAddress: "23 Valley Road, Surat",
    permanentAddress: "23 Valley Road, Surat",
    city: "Surat",
    state: "Gujarat",
    postalCode: "395001",

    course: "B.Tech",
    department: "MECH",
    semester: 4,
    class: "A",
    admissionYear: 2021,
    status: "Active",
    mentor: "Prof. Hiren Desai",

    cgpa: { "1": 8.2, "2": 8.4, "3": 8.3, "4": 8.6 },
    attendance: { Thermo: 91, Math: 95, Machines: 88 },
    backlogs: 0,
    improvements: 0,

    idCardNo: "ID20251115",
    libraryCardNo: "LIB881115",
    hostel: "Not Allotted",
    scholarship: "None",
    feeStatus: "Paid",
    feeHistory: [
      { year: 2021, status: "Paid" },
      { year: 2022, status: "Paid" },
      { year: 2023, status: "Paid" }
    ],

    warnings: [],
    disciplinaryCases: [],
    counselling: [],

    parentName: "Rahul Patel",
    parentPhone: "9876512310",
    parentEmail: "rahul.patel@example.com",
    parentOccupation: "Businessman",

    aadhar: "XXXX-XXXX-7788",
    healthIssues: "None",
    insurance: "College Health Plan",
  },
];


// ===========================
//      PARENTS DATA
// (original unchanged)
// ===========================
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

// ===========================
//      SUBJECTS DATA
// ===========================
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

// ===========================
//      CLASSES DATA
// ===========================
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

// ===========================
//      LESSONS DATA
// ===========================
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

// ===========================
//      EXAMS DATA
// ===========================
export const examsData = [
  { id: 1, subject: "Math", class: "1A", teacher: "Martha Morris", date: "2025-11-13" },
  { id: 2, subject: "English", class: "2A", teacher: "Randall Garcia", date: "2025-11-13" },
  { id: 3, subject: "Science", class: "3A", teacher: "Myrtie Scott", date: "2025-11-13" },
  { id: 4, subject: "Social Studies", class: "1B", teacher: "Alvin Swanson", date: "2025-11-13" },
  { id: 5, subject: "Art", class: "4A", teacher: "Mabelle Wallace", date: "2025-11-13" },
  { id: 6, subject: "Music", class: "5A", teacher: "Dale Thompson", date: "2025-11-13" },
  { id: 7, subject: "History", class: "6A", teacher: "Allie Conner", date: "2025-11-13" },
  { id: 8, subject: "Geography", class: "6B", teacher: "Hunter Fuller", date: "2025-11-13" },
  { id: 9, subject: "Physics", class: "7A", teacher: "Lois Lindsey", date: "2025-11-13" },
  { id: 10, subject: "Chemistry", class: "8A", teacher: "Vera Soto", date: "2025-11-13" },
];

// ===========================
//      ASSIGNMENTS DATA
// ===========================
export const assignmentsData = [
  { id: 1, subject: "Math", class: "1A", teacher: "Anthony Boone", dueDate: "2025-11-13" },
  { id: 2, subject: "English", class: "2A", teacher: "Clifford Bowen", dueDate: "2025-11-13" },
  { id: 3, subject: "Science", class: "3A", teacher: "Catherine Malone", dueDate: "2025-11-13" },
  { id: 4, subject: "Social Studies", class: "1B", teacher: "Willie Medina", dueDate: "2025-11-13" },
  { id: 5, subject: "Art", class: "4A", teacher: "Jose Ruiz", dueDate: "2025-11-13" },
  { id: 6, subject: "Music", class: "5A", teacher: "Katharine Owens", dueDate: "2025-11-13" },
  { id: 7, subject: "History", class: "6A", teacher: "Shawn Norman", dueDate: "2025-11-13" },
  { id: 8, subject: "Geography", class: "6B", teacher: "Don Holloway", dueDate: "2025-11-13" },
  { id: 9, subject: "Physics", class: "7A", teacher: "Franklin Gregory", dueDate: "2025-11-13" },
  { id: 10, subject: "Chemistry", class: "8A", teacher: "Danny Nguyen", dueDate: "2025-11-13" },
];

// ===========================
//      RESULTS DATA
// ===========================
export const resultsData = [
  {
    id: 1,
    subject: "Math",
    class: "1A",
    teacher: "John Doe",
    student: "John Doe",
    date: "2025-11-13",
    type: "exam",
    score: 90,
  },
  {
    id: 2,
    subject: "English",
    class: "2A",
    teacher: "John Doe",
    student: "John Doe",
    date: "2025-11-13",
    type: "exam",
    score: 90,
  },
  {
    id: 3,
    subject: "Science",
    class: "3A",
    teacher: "John Doe",
    student: "John Doe",
    date: "2025-11-13",
    type: "exam",
    score: 90,
  },
  {
    id: 4,
    subject: "Social Studies",
    class: "1B",
    teacher: "John Doe",
    student: "John Doe",
    date: "2025-11-13",
    type: "exam",
    score: 90,
  },
  {
    id: 5,
    subject: "Art",
    class: "4A",
    teacher: "John Doe",
    student: "John Doe",
    date: "2025-11-13",
    type: "exam",
    score: 90,
  },
  {
    id: 6,
    subject: "Music",
    class: "5A",
    teacher: "John Doe",
    student: "John Doe",
    date: "2025-11-13",
    type: "exam",
    score: 90,
  },
  {
    id: 7,
    subject: "History",
    class: "6A",
    teacher: "John Doe",
    student: "John Doe",
    date: "2025-11-13",
    type: "exam",
    score: 90,
  },
  {
    id: 8,
    subject: "Geography",
    class: "6B",
    teacher: "John Doe",
    student: "John Doe",
    date: "2025-11-13",
    type: "exam",
    score: 90,
  },
  {
    id: 9,
    subject: "Physics",
    class: "7A",
    teacher: "John Doe",
    student: "John Doe",
    date: "2025-11-13",
    type: "exam",
    score: 90,
  },
  {
    id: 10,
    subject: "Chemistry",
    class: "8A",
    teacher: "John Doe",
    student: "John Doe",
    date: "2025-11-13",
    type: "exam",
    score: 90,
  },
];

// ===========================
//        EVENTS DATA
// ===========================
export const eventsData = [
  {
    id: 1,
    title: "Lake Trip",
    class: "1A",
    date: "2025-11-13",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 2,
    title: "Picnic",
    class: "2A",
    date: "2025-11-13",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 3,
    title: "Beach Trip",
    class: "3A",
    date: "2025-11-13",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 4,
    title: "Museum Trip",
    class: "4A",
    date: "2025-11-13",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 5,
    title: "Music Concert",
    class: "5A",
    date: "2025-11-13",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 6,
    title: "Magician Show",
    class: "1B",
    date: "2025-11-13",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 7,
    title: "Lake Trip",
    class: "2B",
    date: "2025-11-13",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 8,
    title: "Cycling Race",
    class: "3B",
    date: "2025-11-13",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 9,
    title: "Art Exhibition",
    class: "4B",
    date: "2025-11-13",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 10,
    title: "Sports Tournament",
    class: "5B",
    date: "2025-11-13",
    startTime: "10:00",
    endTime: "11:00",
  },
];

// ===========================
//      CALENDAR EVENTS
// ===========================
export const calendarEvents = [
  {
    title: "Math",
    allDay: false,
    start: new Date(2025, 10, 13, 8, 0),
    end: new Date(2025, 10, 13, 8, 45),
  },
  {
    title: "English",
    allDay: false,
    start: new Date(2025, 10, 13, 9, 0),
    end: new Date(2025, 10, 13, 9, 45),
  },
  {
    title: "Biology",
    allDay: false,
    start: new Date(2025, 10, 13, 10, 0),
    end: new Date(2025, 10, 13, 10, 45),
  },
  {
    title: "Physics",
    allDay: false,
    start: new Date(2025, 10, 13, 11, 0),
    end: new Date(2025, 10, 13, 11, 45),
  },
  {
    title: "Chemistry",
    allDay: false,
    start: new Date(2025, 10, 13, 13, 0),
    end: new Date(2025, 10, 13, 13, 45),
  },
  {
    title: "History",
    allDay: false,
    start: new Date(2025, 10, 13, 14, 0),
    end: new Date(2025, 10, 13, 14, 45),
  },
];
