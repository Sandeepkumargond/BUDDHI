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
  // -------- CSE ---------
  {
    enrolmentNo: "2025110001",
    rollNo: "18349201",
    name: "Arjun Mehta",
    email: "arjun.mehta@college.com",
    photo: "https://randomuser.me/api/portraits/men/11.jpg",
    phone: "9876543211",
    semester: 4,
    department: "CSE",
    class: "A",
    address: "45 Lake View Road, Patna",
  },
  {
    enrolmentNo: "2025110002",
    rollNo: "18349202",
    name: "Neha Singh",
    email: "neha.singh@college.com",
    photo: "https://randomuser.me/api/portraits/women/12.jpg",
    phone: "9876543212",
    semester: 3,
    department: "CSE",
    class: "B",
    address: "12 Green Park, Delhi",
  },
  {
    enrolmentNo: "2025110003",
    rollNo: "18349203",
    name: "Rohit Verma",
    email: "rohit.verma@college.com",
    photo: "https://randomuser.me/api/portraits/men/13.jpg",
    phone: "9876543213",
    semester: 2,
    department: "CSE",
    class: "C",
    address: "7 Sunrise Colony, Lucknow",
  },
  {
    enrolmentNo: "2025110004",
    rollNo: "18349204",
    name: "Simran Kaur",
    email: "simran.kaur@college.com",
    photo: "https://randomuser.me/api/portraits/women/14.jpg",
    phone: "9876543214",
    semester: 1,
    department: "CSE",
    class: "A",
    address: "89 River View, Chandigarh",
  },
  {
    enrolmentNo: "2025110005",
    rollNo: "18349205",
    name: "Aditya Kumar",
    email: "aditya.kumar@college.com",
    photo: "https://randomuser.me/api/portraits/men/15.jpg",
    phone: "9876543215",
    semester: 3,
    department: "CSE",
    class: "B",
    address: "54 Garden Estate, Noida",
  },

  // -------- ECE ---------
  {
    enrolmentNo: "2025110006",
    rollNo: "28457201",
    name: "Shruti Sharma",
    email: "shruti.sharma@college.com",
    photo: "https://randomuser.me/api/portraits/women/21.jpg",
    phone: "9876543221",
    semester: 4,
    department: "ECE",
    class: "A",
    address: "31 Maple Street, Jaipur",
  },
  {
    enrolmentNo: "2025110007",
    rollNo: "28457202",
    name: "Kunal Joshi",
    email: "kunal.joshi@college.com",
    photo: "https://randomuser.me/api/portraits/men/22.jpg",
    phone: "9876543222",
    semester: 2,
    department: "ECE",
    class: "B",
    address: "9 Hill Top, Ahmedabad",
  },
  {
    enrolmentNo: "2025110008",
    rollNo: "28457203",
    name: "Priya Nair",
    email: "priya.nair@college.com",
    photo: "https://randomuser.me/api/portraits/women/23.jpg",
    phone: "9876543223",
    semester: 1,
    department: "ECE",
    class: "C",
    address: "88 Palm Avenue, Kochi",
  },
  {
    enrolmentNo: "2025110009",
    rollNo: "28457204",
    name: "Sahil Khan",
    email: "sahil.khan@college.com",
    photo: "https://randomuser.me/api/portraits/men/24.jpg",
    phone: "9876543224",
    semester: 3,
    department: "ECE",
    class: "A",
    address: "101 Royal Enclave, Mumbai",
  },
  {
    enrolmentNo: "2025110010",
    rollNo: "28457205",
    name: "Ishita Roy",
    email: "ishita.roy@college.com",
    photo: "https://randomuser.me/api/portraits/women/25.jpg",
    phone: "9876543225",
    semester: 4,
    department: "ECE",
    class: "B",
    address: "44 Lotus Garden, Kolkata",
  },

  // -------- MECH ---------
  {
    enrolmentNo: "2025110011",
    rollNo: "39568101",
    name: "Mohit Rana",
    email: "mohit.rana@college.com",
    photo: "https://randomuser.me/api/portraits/men/31.jpg",
    phone: "9876543231",
    semester: 3,
    department: "MECH",
    class: "C",
    address: "67 Steel Colony, Jamshedpur",
  },
  {
    enrolmentNo: "2025110012",
    rollNo: "39568102",
    name: "Ananya Gupta",
    email: "ananya.gupta@college.com",
    photo: "https://randomuser.me/api/portraits/women/32.jpg",
    phone: "9876543232",
    semester: 1,
    department: "MECH",
    class: "A",
    address: "5 Pearl Tower, Bhopal",
  },
  {
    enrolmentNo: "2025110013",
    rollNo: "39568103",
    name: "Deepak Rawat",
    email: "deepak.rawat@college.com",
    photo: "https://randomuser.me/api/portraits/men/33.jpg",
    phone: "9876543233",
    semester: 4,
    department: "MECH",
    class: "B",
    address: "72 Engine Road, Dehradun",
  },
  {
    enrolmentNo: "2025110014",
    rollNo: "39568104",
    name: "Riya Malhotra",
    email: "riya.malhotra@college.com",
    photo: "https://randomuser.me/api/portraits/women/34.jpg",
    phone: "9876543234",
    semester: 2,
    department: "MECH",
    class: "C",
    address: "90 Sunset Block, Indore",
  },
  {
    enrolmentNo: "2025110015",
    rollNo: "39568105",
    name: "Yash Patel",
    email: "yash.patel@college.com",
    photo: "https://randomuser.me/api/portraits/men/35.jpg",
    phone: "9876543235",
    semester: 4,
    department: "MECH",
    class: "A",
    address: "23 Valley Road, Surat",
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
