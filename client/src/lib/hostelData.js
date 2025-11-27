// Hostel Management System - Dummy Data

// Available hostels data
export const initialHostels = [
  {
    id: 1,
    name: "Radhakrishnan Hostel",
    type: "Boys",
    totalRooms: 50,
    occupiedRooms: 35,
    availableRooms: 15,
    warden: "Dr. Rajesh Kumar",
    contact: "+91 9876543210",
    address: "Near Main Gate, University Campus",
    feePerMonth: 8000,
    image: "/hostel1.jpg"
  },
  {
    id: 2,
    name: "Sarojini Naidu Hostel",
    type: "Girls",
    totalRooms: 40,
    occupiedRooms: 30,
    availableRooms: 10,
    warden: "Dr. Priya Sharma",
    contact: "+91 9876543211",
    address: "Block B, University Campus",
    feePerMonth: 8500,
    image: "/hostel2.jpg"
  },
  {
    id: 3,
    name: "APJ Abdul Kalam Hostel",
    type: "Boys",
    totalRooms: 60,
    occupiedRooms: 45,
    availableRooms: 15,
    warden: "Prof. Suresh Chandra",
    contact: "+91 9876543212",
    address: "Block C, University Campus",
    feePerMonth: 9000,
    image: "/hostel3.jpg"
  }
];

// Available hostels for students (derived from initialHostels)
export const availableHostels = initialHostels.map(hostel => ({
  id: hostel.id,
  name: hostel.name,
  type: hostel.type,
  availableRooms: hostel.availableRooms,
  totalRooms: hostel.totalRooms,
  warden: hostel.warden,
  feePerMonth: hostel.feePerMonth,
  image: hostel.image
}));

// Hostel requests data
export const initialRequests = [
  {
    id: 1,
    studentId: "CS2021001",
    studentName: "Rajesh Kumar",
    email: "rajesh.kumar@student.edu",
    phone: "+91 9876543210",
    course: "Computer Science",
    semester: "6th Semester",
    cgpa: 8.5,
    requestDate: "2024-11-15",
    preferredHostel: "Radhakrishnan Hostel",
    alternateHostel: "APJ Abdul Kalam Hostel",
    roomType: "Single",
    reason: "Need accommodation for final year project work and better study environment.",
    status: "pending",
    emergencyContact: "+91 9876543211",
    parentName: "Mr. Suresh Kumar",
    address: "123 Main Street, Delhi",
    priority: 1
  },
  {
    id: 2,
    studentId: "CS2021002",
    studentName: "Priya Sharma",
    email: "priya.sharma@student.edu",
    phone: "+91 9876543220",
    course: "Computer Science",
    semester: "4th Semester",
    cgpa: 9.1,
    requestDate: "2024-11-18",
    preferredHostel: "Sarojini Naidu Hostel",
    alternateHostel: null,
    roomType: "Shared",
    reason: "Distance from home is too much, need hostel accommodation for better attendance.",
    status: "pending",
    emergencyContact: "+91 9876543221",
    parentName: "Mr. Rakesh Sharma",
    address: "456 Park Avenue, Mumbai",
    priority: 1
  },
  {
    id: 3,
    studentId: "ME2021001",
    studentName: "Amit Singh",
    email: "amit.singh@student.edu",
    phone: "+91 9876543230",
    course: "Mechanical Engineering",
    semester: "8th Semester",
    cgpa: 7.8,
    requestDate: "2024-11-20",
    preferredHostel: "APJ Abdul Kalam Hostel",
    alternateHostel: "Radhakrishnan Hostel",
    roomType: "Single",
    reason: "Final year student, need quiet environment for thesis work.",
    status: "approved",
    emergencyContact: "+91 9876543231",
    parentName: "Mrs. Sunita Singh",
    address: "789 Oak Street, Bangalore",
    allottedHostel: "APJ Abdul Kalam Hostel",
    allottedRoom: "A-301",
    allottedDate: "2024-11-21",
    allocationType: "manual",
    priority: 2
  },
  {
    id: 4,
    studentId: "EE2021001",
    studentName: "Neha Gupta",
    email: "neha.gupta@student.edu",
    phone: "+91 9876543240",
    course: "Electrical Engineering",
    semester: "6th Semester",
    cgpa: 8.9,
    requestDate: "2024-11-22",
    preferredHostel: "Sarojini Naidu Hostel",
    alternateHostel: null,
    roomType: "Shared",
    reason: "Need hostel accommodation for internship preparation.",
    status: "rejected",
    emergencyContact: "+91 9876543241",
    parentName: "Mr. Vijay Gupta",
    address: "321 Pine Street, Chennai",
    rejectionReason: "No available rooms in preferred hostel",
    priority: 3
  },
  {
    id: 5,
    studentId: "CS2021003",
    studentName: "Rohit Verma",
    email: "rohit.verma@student.edu",
    phone: "+91 9876543250",
    course: "Computer Science",
    semester: "2nd Semester",
    cgpa: 8.2,
    requestDate: "2024-11-23",
    preferredHostel: "Radhakrishnan Hostel",
    alternateHostel: "APJ Abdul Kalam Hostel",
    roomType: "Shared",
    reason: "First time away from home, need hostel accommodation.",
    status: "pending",
    emergencyContact: "+91 9876543251",
    parentName: "Mrs. Kavita Verma",
    address: "654 Maple Street, Pune",
    priority: 2
  },
  {
    id: 6,
    studentId: "CS2021004",
    studentName: "Anjali Reddy",
    email: "anjali.reddy@student.edu",
    phone: "+91 9876543260",
    course: "Computer Science",
    semester: "4th Semester",
    cgpa: 9.3,
    requestDate: "2024-11-24",
    preferredHostel: "Sarojini Naidu Hostel",
    alternateHostel: null,
    roomType: "Single",
    reason: "High CGPA student, need single room for better concentration.",
    status: "approved",
    emergencyContact: "+91 9876543261",
    parentName: "Mr. Ravi Reddy",
    address: "987 Cedar Street, Hyderabad",
    allottedHostel: "Sarojini Naidu Hostel",
    allottedRoom: "B-205",
    allottedDate: "2024-11-25",
    allocationType: "auto",
    priority: 1
  }
];

// Student data for logged-in student
export const studentData = {
  id: "CS2021001",
  name: "John Doe",
  email: "john.doe@student.edu",
  phone: "+91 9876543210",
  course: "Computer Science",
  semester: "6th Semester",
  cgpa: 8.5,
  emergencyContact: "+91 9876543211",
  parentName: "Mr. Robert Doe",
  address: "123 Student Street, University City"
};

// Student's hostel requests history
export const studentRequests = [
  {
    id: 1,
    studentId: "CS2021001",
    preferredHostel: "Radhakrishnan Hostel",
    alternateHostel: "APJ Abdul Kalam Hostel",
    roomType: "Single",
    reason: "Need accommodation for final year project work.",
    status: "pending",
    requestDate: "2024-11-15",
    lastUpdated: "2024-11-15"
  }
];

// Auto-allocation algorithm priorities
export const allocationPriorities = {
  cgpa: {
    weight: 0.4,
    thresholds: {
      excellent: 9.0,
      good: 8.0,
      average: 7.0
    }
  },
  semester: {
    weight: 0.3,
    finalYearBonus: 0.2
  },
  requestDate: {
    weight: 0.3,
    earlierBonus: 0.1
  }
};

// Room types and their capacity
export const roomTypes = {
  single: { capacity: 1, priceMultiplier: 1.5 },
  shared: { capacity: 2, priceMultiplier: 1.0 },
  triple: { capacity: 3, priceMultiplier: 0.8 }
};

