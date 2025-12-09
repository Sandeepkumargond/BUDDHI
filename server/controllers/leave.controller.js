import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Leave } from "../models/leave.model.js";
import { Student } from "../models/student.model.js";
import { Faculty } from "../models/faculty.model.js";
import mongoose from "mongoose";

// Student/Faculty: Apply for leave
export const applyLeave = asyncHandler(async (req, res) => {
    const { leaveType, startDate, endDate, reason, proofDocument } = req.body;
    const applicantId = req.user._id;
    const applicantType = req.user.role === 'student' ? 'Student' : 'Faculty';

    if (!leaveType || !startDate || !endDate || !reason) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
        throw new ApiError(400, "End date must be after start date");
    }

    // Calculate number of days
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Get applicant details
    let applicant;
    if (applicantType === 'Student') {
        applicant = await Student.findById(applicantId);
    } else {
        applicant = await Faculty.findById(applicantId);
    }

    if (!applicant) {
        throw new ApiError(404, "Applicant not found");
    }

    const leave = await Leave.create({
        applicantId,
        applicantType,
        applicantName: `${applicant.firstName} ${applicant.lastName}`,
        applicantEmail: applicant.email,
        leaveType,
        startDate: start,
        endDate: end,
        numberOfDays,
        reason,
        proofDocument,
        status: 'pending',
    });

    return res.status(201).json(
        new ApiResponse(201, { leave }, "Leave application submitted successfully")
    );
});

// Student/Faculty: Get my leave applications
export const getMyLeaves = asyncHandler(async (req, res) => {
    const applicantId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { applicantId };
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        query.status = status;
    }

    const leaves = await Leave.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Leave.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, { leaves, total, page: parseInt(page), limit: parseInt(limit) }, "Leave applications fetched successfully")
    );
});

// Student/Faculty: Get leave by ID
export const getLeaveById = asyncHandler(async (req, res) => {
    const { leaveId } = req.params;
    const applicantId = req.user._id;

    if (!mongoose.isValidObjectId(leaveId)) {
        throw new ApiError(400, "Invalid leave ID");
    }

    const leave = await Leave.findOne({ _id: leaveId, applicantId });

    if (!leave) {
        throw new ApiError(404, "Leave application not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { leave }, "Leave application fetched successfully")
    );
});

// Student/Faculty: Cancel leave application (only if pending)
export const cancelLeave = asyncHandler(async (req, res) => {
    const { leaveId } = req.params;
    const applicantId = req.user._id;

    const leave = await Leave.findOne({ _id: leaveId, applicantId });

    if (!leave) {
        throw new ApiError(404, "Leave application not found");
    }

    if (leave.status !== 'pending') {
        throw new ApiError(400, "Only pending leave applications can be cancelled");
    }

    await Leave.findByIdAndDelete(leaveId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Leave application cancelled successfully")
    );
});

// Admin: Get all leave applications
export const getAllLeaves = asyncHandler(async (req, res) => {
    const { status, applicantType, search, page = 1, limit = 20 } = req.query;

    const query = {};
    
    if (status && status !== '') {
        query.status = status;
    }
    
    if (applicantType && applicantType !== '') {
        query.applicantType = applicantType;
    }
    
    if (search && search !== '') {
        query.$or = [
            { applicantName: { $regex: search, $options: 'i' } },
            { applicantEmail: { $regex: search, $options: 'i' } },
            { reason: { $regex: search, $options: 'i' } },
        ];
    }

    const leaves = await Leave.find(query)
        .populate('reviewedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Leave.countDocuments(query);

    // Get statistics
    const stats = await Leave.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const statistics = {
        total: await Leave.countDocuments(),
        pending: stats.find(s => s._id === 'pending')?.count || 0,
        approved: stats.find(s => s._id === 'approved')?.count || 0,
        rejected: stats.find(s => s._id === 'rejected')?.count || 0,
    };

    return res.status(200).json(
        new ApiResponse(200, { 
            leaves, 
            total, 
            page: parseInt(page), 
            limit: parseInt(limit),
            statistics 
        }, "Leave applications fetched successfully")
    );
});

// Admin: Review leave application (approve/reject)
export const reviewLeave = asyncHandler(async (req, res) => {
    const { leaveId } = req.params;
    const { status, adminRemarks } = req.body;
    const adminId = req.user._id;

    if (!['approved', 'rejected'].includes(status)) {
        throw new ApiError(400, "Invalid status. Must be 'approved' or 'rejected'");
    }

    const leave = await Leave.findById(leaveId);

    if (!leave) {
        throw new ApiError(404, "Leave application not found");
    }

    if (leave.status !== 'pending') {
        throw new ApiError(400, "This leave application has already been reviewed");
    }

    leave.status = status;
    leave.adminRemarks = adminRemarks || '';
    leave.reviewedBy = adminId;
    leave.reviewedAt = new Date();

    await leave.save();

    return res.status(200).json(
        new ApiResponse(200, { leave }, `Leave application ${status} successfully`)
    );
});

// Admin: Delete leave application
export const deleteLeave = asyncHandler(async (req, res) => {
    const { leaveId } = req.params;

    const leave = await Leave.findByIdAndDelete(leaveId);

    if (!leave) {
        throw new ApiError(404, "Leave application not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Leave application deleted successfully")
    );
});
