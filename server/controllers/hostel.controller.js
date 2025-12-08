import { Hostel } from "../models/hostel.model.js";
import { HostelApplication } from "../models/hostelApplication.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const generateRooms = (count, numberOfFloors = 1, roomsPerFloor = 1) => {
  const rooms = [];
  let roomNum = 1;
  
  // Generate exactly 'count' rooms distributed across floors
  for (let i = 0; i < count; i++) {
    const floor = Math.floor(i / roomsPerFloor);
    rooms.push({ number: `${roomNum}`, floor, occupied: false, student: null });
    roomNum++;
  }
  return rooms;
};

export const createOrUpdateHostel = asyncHandler(async (req, res) => {
  const { name, type, totalRooms, numberOfFloors, roomsPerFloor, warden, contact, address, feePerMonth, image } = req.body;
  if (!name || !type || totalRooms == null) {
    throw new ApiError(400, "name, type and totalRooms are required");
  }

  const floorCount = numberOfFloors ?? 1;
  const roomCount = roomsPerFloor ?? 1;
  
  // Calculate expected total rooms based on floor structure
  const expectedTotalRooms = floorCount * roomCount;
  
  // Use the calculated total if it's different from what was provided
  const finalTotalRooms = expectedTotalRooms > 0 ? expectedTotalRooms : totalRooms;

  let hostel = await Hostel.findOne({ name });
  if (!hostel) {
    // Create new hostel
    hostel = await Hostel.create({
      name,
      type,
      totalRooms: finalTotalRooms,
      occupiedRooms: 0,
      numberOfFloors: floorCount,
      roomsPerFloor: roomCount,
      rooms: generateRooms(finalTotalRooms, floorCount, roomCount),
      warden,
      contact,
      address,
      feePerMonth,
      image,
    });
  } else {
    // Update existing hostel
    const delta = finalTotalRooms - hostel.totalRooms;
    
    // If totalRooms changes, adjust rooms array (add/remove free rooms only)
    if (delta > 0) {
      // add new empty rooms with proper floor assignment
      const start = hostel.rooms.length;
      for (let i = 1; i <= delta; i++) {
        const roomNum = start + i;
        const floor = Math.floor((roomNum - 1) / roomCount);
        hostel.rooms.push({ number: `${roomNum}`, floor, occupied: false, student: null });
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

    // Update all fields
    hostel.type = type;
    hostel.totalRooms = finalTotalRooms;
    hostel.numberOfFloors = floorCount;
    hostel.roomsPerFloor = roomCount;
    hostel.warden = warden ?? hostel.warden;
    hostel.contact = contact ?? hostel.contact;
    hostel.address = address ?? hostel.address;
    hostel.feePerMonth = feePerMonth ?? hostel.feePerMonth;
    hostel.image = image ?? hostel.image;

    try {
      await hostel.save();
    } catch (error) {
      // If version conflict, reload and try again
      hostel = await Hostel.findById(hostel._id);
      if (hostel) {
        hostel.type = type;
        hostel.totalRooms = finalTotalRooms;
        hostel.numberOfFloors = floorCount;
        hostel.roomsPerFloor = roomCount;
        hostel.warden = warden ?? hostel.warden;
        hostel.contact = contact ?? hostel.contact;
        hostel.address = address ?? hostel.address;
        hostel.feePerMonth = feePerMonth ?? hostel.feePerMonth;
        hostel.image = image ?? hostel.image;
        await hostel.save();
      } else {
        throw error;
      }
    }
  }

  return res.status(200).json(new ApiResponse(200, hostel, "Hostel saved"));
});

export const listHostels = asyncHandler(async (req, res) => {
  const hostels = await Hostel.find().lean();
  const normalized = hostels.map((h) => {
    // Recalculate occupied count from rooms array to ensure accuracy
    const actualOccupiedCount = h.rooms ? h.rooms.filter(r => r.occupied || r.student).length : 0;
    const actualAvailableCount = h.rooms ? h.rooms.filter(r => !r.occupied && !r.student).length : 0;
    
    return {
      id: h._id,
      _id: h._id,
      name: h.name,
      type: h.type,
      totalRooms: h.rooms ? h.rooms.length : h.totalRooms,
      occupiedRooms: actualOccupiedCount,
      availableRooms: actualAvailableCount,
      numberOfFloors: h.numberOfFloors || 1,
      roomsPerFloor: h.roomsPerFloor || 1,
      warden: h.warden,
      contact: h.contact,
      address: h.address,
      feePerMonth: h.feePerMonth,
      image: h.image,
      rooms: h.rooms ? h.rooms.map(r => ({
        number: r.number,
        floor: r.floor || 0,
        occupied: r.occupied || !!r.student,
        student: r.student || null
      })) : []
    };
  });
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
  assignedRoom.student = authenticatedStudentId;
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
        floor: room.floor ?? 0,
        occupied: room.occupied,
      };
    }
  }

  const allocationData = {
    hostelName: application.allottedHostel,
    roomNumber: application.allottedRoom,
    floor: roomDetails.floor ?? '-',
    roomType: application.roomType,
    status: application.status,
    allottedDate: application.allottedDate,
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

export const updateHostelAllocation = asyncHandler(async (req, res) => {
  const { applicationId, newHostelName, newRoomNumber, newFloor } = req.body;

  if (!applicationId || !newHostelName || !newRoomNumber || !newFloor) {
    throw new ApiError(400, "applicationId, newHostelName, newRoomNumber, and newFloor are required");
  }

  // Find the application
  const application = await HostelApplication.findById(applicationId);
  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.status !== "approved") {
    throw new ApiError(400, "Can only edit approved allocations");
  }

  // Get current hostel and mark old room as unoccupied
  const currentHostel = await Hostel.findOne({ name: application.allottedHostel });
  if (currentHostel) {
    const currentRoom = currentHostel.rooms.find((r) => r.number === application.allottedRoom);
    if (currentRoom) {
      currentRoom.occupied = false;
      currentRoom.student = null;
    }
    currentHostel.occupiedRooms = Math.max(0, (currentHostel.occupiedRooms ?? 1) - 1);
    await currentHostel.save();
  }

  // Get new hostel and mark new room as occupied
  const newHostel = await Hostel.findOne({ name: newHostelName });
  if (!newHostel) {
    throw new ApiError(404, "New hostel not found");
  }

  const newRoom = newHostel.rooms.find((r) => r.number === newRoomNumber);
  if (!newRoom) {
    throw new ApiError(404, "Room not found in selected hostel");
  }

  if (newRoom.occupied) {
    throw new ApiError(400, "Selected room is already occupied");
  }

  newRoom.occupied = true;
  newRoom.student = application.student;
  newRoom.floor = newFloor;
  newHostel.occupiedRooms = (newHostel.occupiedRooms ?? 0) + 1;
  await newHostel.save();

  // Update application
  application.allottedHostel = newHostelName;
  application.allottedRoom = newRoomNumber;
  application.floor = newFloor;
  application.allottedDate = new Date();
  await application.save();

  return res.status(200).json(new ApiResponse(200, application, "Hostel allocation updated successfully"));
});

export const removeHostelAllocation = asyncHandler(async (req, res) => {
  const { applicationId } = req.body;

  if (!applicationId) {
    throw new ApiError(400, "applicationId is required");
  }

  // Find the application
  const application = await HostelApplication.findById(applicationId);
  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.status !== "approved") {
    throw new ApiError(400, "Can only remove approved allocations");
  }

  // Get current hostel and mark room as unoccupied
  const currentHostel = await Hostel.findOne({ name: application.allottedHostel });
  if (currentHostel) {
    const currentRoom = currentHostel.rooms.find((r) => r.number === application.allottedRoom);
    if (currentRoom) {
      currentRoom.occupied = false;
      currentRoom.student = null;
    }
    currentHostel.occupiedRooms = Math.max(0, (currentHostel.occupiedRooms ?? 1) - 1);
    await currentHostel.save();
  }

  // Update application status
  application.status = "removed";
  application.allottedHostel = null;
  application.allottedRoom = null;
  application.removedDate = new Date();
  await application.save();

  return res.status(200).json(new ApiResponse(200, application, "Student removed from hostel successfully"));
});

export const deleteHostel = asyncHandler(async (req, res) => {
  const { hostelId, hostelName } = req.body;

  if (!hostelId && !hostelName) {
    throw new ApiError(400, "hostelId or hostelName is required");
  }

  let query = hostelId ? { _id: hostelId } : { name: hostelName };
  
  // Find and delete the hostel
  const deletedHostel = await Hostel.findOneAndDelete(query);
  
  if (!deletedHostel) {
    throw new ApiError(404, "Hostel not found");
  }

  // Also delete/update any applications for this hostel
  await HostelApplication.updateMany(
    { allottedHostel: deletedHostel.name },
    { status: "cancelled", allottedHostel: null, allottedRoom: null }
  );

  return res.status(200).json(new ApiResponse(200, deletedHostel, "Hostel deleted successfully"));
});
