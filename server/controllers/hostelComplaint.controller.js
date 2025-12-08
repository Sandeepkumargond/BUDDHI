import { HostelComplaint } from "../models/hostelComplaint.model.js";
import { Student } from "../models/student.model.js";
import { Hostel } from "../models/hostel.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Submit a new complaint (Student)
export const submitComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const student = await Student.findById(req.user._id).select("firstName lastName email");
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // Try to get student's hostel allocation
  let hostelName = null;
  let roomNumber = null;
  let hostelId = null;

  const hostel = await Hostel.findOne({ "rooms.student": req.user._id });
  if (hostel) {
    hostelName = hostel.name;
    hostelId = hostel._id;
    const room = hostel.rooms.find((r) => r.student?.toString() === req.user._id.toString());
    if (room) roomNumber = room.number;
  }

  const complaint = await HostelComplaint.create({
    studentId: req.user._id,
    studentName: `${student.firstName} ${student.lastName}`.trim(),
    studentEmail: student.email,
    hostelName,
    hostelId,
    roomNumber,
    title,
    description,
    category: category || "Other",
    priority: priority || "Medium",
    status: "Pending",
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      complaint,
      "Complaint submitted successfully"
    )
  );
});

// Get complaints for a student (Student)
export const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await HostelComplaint.find({ studentId: req.user._id })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      complaints,
      "Complaints retrieved successfully"
    )
  );
});

// Get all complaints (Admin)
export const getAllComplaints = asyncHandler(async (req, res) => {
  const { status, priority, hostelName, searchTerm } = req.query;

  let query = {};

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (hostelName) query.hostelName = hostelName;

  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { studentName: { $regex: searchTerm, $options: "i" } },
    ];
  }

  const complaints = await HostelComplaint.find(query)
    .populate("studentId", "firstName lastName email enrollmentNo")
    .populate("hostelId", "name type")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      complaints,
      "All complaints retrieved successfully"
    )
  );
});

// Get complaint stats (Admin)
export const getComplaintStats = asyncHandler(async (req, res) => {
  const totalComplaints = await HostelComplaint.countDocuments();
  const pendingComplaints = await HostelComplaint.countDocuments({
    status: "Pending",
  });
  const inProgressComplaints = await HostelComplaint.countDocuments({
    status: "In Progress",
  });
  const resolvedComplaints = await HostelComplaint.countDocuments({
    status: "Resolved",
  });

  const byPriority = await HostelComplaint.aggregate([
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
      },
    },
  ]);

  const byCategory = await HostelComplaint.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: totalComplaints,
        pending: pendingComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        byPriority,
        byCategory,
      },
      "Complaint statistics retrieved successfully"
    )
  );
});

// Update complaint status (Admin)
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const { status, adminNotes } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const complaint = await HostelComplaint.findById(complaintId);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  complaint.status = status;
  if (adminNotes) complaint.adminNotes = adminNotes;

  if (status === "Resolved" || status === "Closed") {
    complaint.resolvedDate = new Date();
  }

  await complaint.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      complaint,
      "Complaint status updated successfully"
    )
  );
});

// Get single complaint detail (Admin/Student)
export const getComplaintDetail = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;

  const complaint = await HostelComplaint.findById(complaintId)
    .populate("studentId", "firstName lastName email enrollmentNo phone")
    .populate("hostelId", "name type warden contact");

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Check authorization - student can only view their own complaints
  if (
    req.user.role === "student" &&
    complaint.studentId.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Unauthorized to view this complaint");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      complaint,
      "Complaint detail retrieved successfully"
    )
  );
});

// Delete complaint (Admin only)
export const deleteComplaint = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;

  const complaint = await HostelComplaint.findByIdAndDelete(complaintId);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Complaint deleted successfully"
    )
  );
});

// Bulk update complaints (Admin)
export const bulkUpdateComplaints = asyncHandler(async (req, res) => {
  const { complaintIds, status, priority } = req.body;

  if (!complaintIds || !Array.isArray(complaintIds)) {
    throw new ApiError(400, "complaintIds array is required");
  }

  if (!status && !priority) {
    throw new ApiError(400, "status or priority is required");
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (priority) updateData.priority = priority;

  const result = await HostelComplaint.updateMany(
    { _id: { $in: complaintIds } },
    updateData
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Complaints updated successfully"
    )
  );
});
