import { Hostel } from "../models/hostel.model.js";
import { HostelApplication } from "../models/hostelApplication.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const generateRooms = (count) => {
  const rooms = [];
  for (let i = 1; i <= count; i++) {
    rooms.push({ number: `${i}`, occupied: false, student: null });
  }
  return rooms;
};

export const createOrUpdateHostel = asyncHandler(async (req, res) => {
  const { name, type, totalRooms, warden, contact, address, feePerMonth, image } = req.body;
  if (!name || !type || totalRooms == null) {
    throw new ApiError(400, "name, type and totalRooms are required");
  }

  let hostel = await Hostel.findOne({ name });
  if (!hostel) {
    hostel = await Hostel.create({
      name,
      type,
      totalRooms,
      occupiedRooms: 0,
      rooms: generateRooms(totalRooms),
      warden,
      contact,
      address,
      feePerMonth,
      image,
    });
  } else {
    // If totalRooms changes, adjust rooms array (add/remove free rooms only)
    const delta = totalRooms - hostel.totalRooms;
    hostel.type = type;
    hostel.totalRooms = totalRooms;
    hostel.warden = warden ?? hostel.warden;
    hostel.contact = contact ?? hostel.contact;
    hostel.address = address ?? hostel.address;
    hostel.feePerMonth = feePerMonth ?? hostel.feePerMonth;
    hostel.image = image ?? hostel.image;

    if (delta > 0) {
      // add new empty rooms
      const start = hostel.rooms.length;
      for (let i = 1; i <= delta; i++) {
        hostel.rooms.push({ number: `${start + i}`, occupied: false, student: null });
      }
    } else if (delta < 0) {
      // remove from the end only if not occupied
      let removeCount = -delta;
      for (let i = hostel.rooms.length - 1; i >= 0 && removeCount > 0; i--) {
        if (!hostel.rooms[i].occupied) {
          hostel.rooms.splice(i, 1);
          removeCount--;
        }
      }
    }
    await hostel.save();
  }

  return res.status(200).json(new ApiResponse(200, hostel, "Hostel saved"));
});

export const listHostels = asyncHandler(async (req, res) => {
  const hostels = await Hostel.find().lean();
  const normalized = hostels.map((h) => ({
    id: h._id,
    name: h.name,
    type: h.type,
    totalRooms: h.totalRooms,
    occupiedRooms: h.occupiedRooms,
    availableRooms: h.totalRooms - h.occupiedRooms,
    warden: h.warden,
    contact: h.contact,
    address: h.address,
    feePerMonth: h.feePerMonth,
    image: h.image,
  }));
  return res.status(200).json(new ApiResponse(200, normalized, "Hostels fetched"));
});

const pickRandomAvailable = (hostels) => {
  const pool = hostels.filter((h) => h.totalRooms - h.occupiedRooms > 0);
  if (pool.length === 0) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
};

const pickRoomInHostel = (hostel) => {
  const free = hostel.rooms.filter((r) => !r.occupied);
  if (free.length === 0) return null;
  const idx = Math.floor(Math.random() * free.length);
  return free[idx];
};

export const submitHostelApplication = asyncHandler(async (req, res) => {
  const {
    studentId,
    studentName,
    email,
    phone,
    course,
    semester,
    cgpa,
    roomType,
    reason,
    emergencyContact,
    parentName,
    address,
    choices = [],
  } = req.body;

  if (!studentId || !studentName) {
    throw new ApiError(400, "studentId and studentName are required");
  }

  // Get authenticated student's MongoDB ID
  const authenticatedStudentId = req.user?._id;

  // Save application first as pending
  const application = await HostelApplication.create({
    student: authenticatedStudentId,
    studentId,
    studentName,
    email,
    phone,
    course,
    semester,
    cgpa,
    roomType,
    reason,
    emergencyContact,
    parentName,
    address,
    choices,
    status: "pending",
  });

  // Allocation attempt respecting choices
  const hostels = await Hostel.find();
  let assignedHostel = null;
  let assignedRoom = null;

  // Try prioritized choices first
  const sortedChoices = [...choices].sort((a, b) => (a.priority ?? 1) - (b.priority ?? 1));
  for (const ch of sortedChoices) {
    const h = hostels.find((x) => x.name === ch.hostelName);
    if (!h) continue;
    if (h.totalRooms - h.occupiedRooms <= 0) continue;
    if (ch.roomNumber) {
      const room = h.rooms.find((r) => r.number === ch.roomNumber && !r.occupied);
      if (room) {
        assignedHostel = h;
        assignedRoom = room;
        break;
      }
    } else {
      const room = pickRoomInHostel(h);
      if (room) {
        assignedHostel = h;
        assignedRoom = room;
        break;
      }
    }
  }

  // Fallback: random available hostel and room
  if (!assignedHostel || !assignedRoom) {
    const randHostel = pickRandomAvailable(hostels);
    if (!randHostel) {
      // No capacity anywhere
      application.status = "rejected";
      application.rejectionReason = "No available rooms in any hostel";
      await application.save();
      return res.status(200).json(new ApiResponse(200, application, "Application saved, no allocation possible"));
    }
    const room = pickRoomInHostel(randHostel);
    if (!room) {
      application.status = "rejected";
      application.rejectionReason = "No available rooms in selected hostel";
      await application.save();
      return res.status(200).json(new ApiResponse(200, application, "Application saved, no allocation possible"));
    }
    assignedHostel = randHostel;
    assignedRoom = room;
  }

  // Mark room occupied and increment hostel occupancy
  assignedRoom.occupied = true;
  assignedHostel.occupiedRooms = (assignedHostel.occupiedRooms ?? 0) + 1;
  await assignedHostel.save();

  application.status = "approved";
  application.allottedHostel = assignedHostel.name;
  application.allottedRoom = assignedRoom.number;
  application.allocationType = "auto";
  application.allottedDate = new Date();
  await application.save();

  return res.status(200).json(new ApiResponse(200, application, "Hostel allocated"));
});

export const listApplications = asyncHandler(async (req, res) => {
  const apps = await HostelApplication.find().sort({ createdAt: -1 }).lean();
  return res.status(200).json(new ApiResponse(200, apps, "Applications fetched"));
});

export const getStudentHostelAllocation = asyncHandler(async (req, res) => {
  const studentId = req.user?._id;
  
  console.log("getStudentHostelAllocation - studentId:", studentId);
  
  if (!studentId) {
    throw new ApiError(401, "Student not authenticated");
  }

  // Find approved application for this student
  const application = await HostelApplication.findOne({ 
    student: studentId, 
    status: "approved" 
  }).lean();

  console.log("Found application:", application);

  if (!application) {
    console.log("No approved application found for student:", studentId);
    return res.status(200).json(new ApiResponse(200, null, "No allocation found"));
  }

  // Fetch hostel details
  const hostelDetails = await Hostel.findOne({ name: application.allottedHostel }).lean();

  console.log("Found hostel details:", hostelDetails?.name);

  // Find the specific room details
  let roomDetails = {};
  if (hostelDetails && application.allottedRoom) {
    const room = hostelDetails.rooms.find((r) => r.number === application.allottedRoom);
    if (room) {
      roomDetails = {
        roomNumber: room.number,
        occupied: room.occupied,
      };
    }
  }

  const allocationData = {
    hostelName: application.allottedHostel,
    roomNumber: application.allottedRoom,
    allottedDate: application.allottedDate,
    roomType: application.roomType,
    hostelDetails: {
      id: hostelDetails?._id,
      name: hostelDetails?.name,
      type: hostelDetails?.type,
      totalRooms: hostelDetails?.totalRooms,
      occupiedRooms: hostelDetails?.occupiedRooms,
      warden: hostelDetails?.warden,
      contact: hostelDetails?.contact,
      address: hostelDetails?.address,
      feePerMonth: hostelDetails?.feePerMonth,
      image: hostelDetails?.image,
    },
    roomDetails
  };

  return res.status(200).json(new ApiResponse(200, allocationData, "Allocation details fetched"));
});

