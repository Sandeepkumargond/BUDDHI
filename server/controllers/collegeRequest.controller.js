import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { CollegeRequest } from "../models/collegeRequest.model.js";
import { uploadImageOnImageKit } from "../utils/ImageKit.js";

// Public endpoint - Submit college registration request
export const submitCollegeRequest = asyncHandler(async (req, res) => {
    const {
        collegeName,
        collegeType,
        establishedYear,
        affiliation,
        totalStudents,
        totalFaculty,
        website,
        description,
        address,
        state,
        city,
        pincode,
        adminName,
        adminDesignation,
        email,
        phone,
        alternatePhone,
        recognitionType,
        courses,
        infrastructure
    } = req.body;

    // Validate required fields
    if (!collegeName || !collegeType || !establishedYear || !affiliation ||
        !address || !state || !city || !pincode ||
        !adminName || !adminDesignation || !email || !phone || !recognitionType) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Check if request with same email already exists
    const existingRequest = await CollegeRequest.findOne({
        email: email.toLowerCase(),
        status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
        throw new ApiError(409, "A request with this email already exists");
    }

    // Handle document uploads if any
    const documentUrls = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            try {
                const uploadedDoc = await uploadImageOnImageKit(file.path, `college-request-${Date.now()}`);
                if (uploadedDoc && uploadedDoc.url) {
                    documentUrls.push(uploadedDoc.url);
                }
            } catch (error) {
                console.error("Error uploading document:", error);
            }
        }
    }

    // Create college request
    const collegeRequest = await CollegeRequest.create({
        collegeName: collegeName.trim(),
        collegeType,
        establishedYear: Number(establishedYear),
        affiliation: affiliation.trim(),
        totalStudents: totalStudents ? Number(totalStudents) : 0,
        totalFaculty: totalFaculty ? Number(totalFaculty) : 0,
        website: website?.trim(),
        description: description?.trim(),
        address: address.trim(),
        state: state.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        adminName: adminName.trim(),
        adminDesignation: adminDesignation.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone?.trim(),
        recognitionType,
        courses: courses?.trim(),
        infrastructure: infrastructure?.trim(),
        documents: documentUrls,
        status: 'pending'
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            { request: collegeRequest },
            "College registration request submitted successfully"
        )
    );
});

// SuperAdmin - Get all college requests
export const getAllCollegeRequests = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        filter.status = status;
    }

    const requests = await CollegeRequest.find(filter)
        .populate('processedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            { requests },
            "College requests fetched successfully"
        )
    );
});

// SuperAdmin - Get single college request
export const getCollegeRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const request = await CollegeRequest.findById(id)
        .populate('processedBy', 'firstName lastName email')
        .lean();

    if (!request) {
        throw new ApiError(404, "College request not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { request },
            "College request fetched successfully"
        )
    );
});

// SuperAdmin - Approve college request
export const approveCollegeRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const superAdminId = req.user?._id;

    const request = await CollegeRequest.findById(id);

    if (!request) {
        throw new ApiError(404, "College request not found");
    }

    if (request.status !== 'pending') {
        throw new ApiError(400, "Request has already been processed");
    }

    request.status = 'approved';
    request.processedBy = superAdminId;
    request.processedAt = new Date();
    await request.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { request },
            "College request approved successfully"
        )
    );
});

// SuperAdmin - Reject college request
export const rejectCollegeRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const superAdminId = req.user?._id;

    if (!reason || !reason.trim()) {
        throw new ApiError(400, "Rejection reason is required");
    }

    const request = await CollegeRequest.findById(id);

    if (!request) {
        throw new ApiError(404, "College request not found");
    }

    if (request.status !== 'pending') {
        throw new ApiError(400, "Request has already been processed");
    }

    request.status = 'rejected';
    request.rejectionReason = reason.trim();
    request.processedBy = superAdminId;
    request.processedAt = new Date();
    await request.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { request },
            "College request rejected successfully"
        )
    );
});
