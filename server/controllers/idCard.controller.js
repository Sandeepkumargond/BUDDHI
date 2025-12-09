import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { IdCardForm, IdCardApplication } from "../models/idCard.model.js";
import { Student } from "../models/student.model.js";
import mongoose from "mongoose";

// ==================== ADMIN CONTROLLERS ====================

// Create ID Card Form
export const createIdCardForm = asyncHandler(async (req, res) => {
    const { title, academicYear, fee, instructions, requiredDocuments, deadline } = req.body;

    if (!academicYear || !fee || !deadline) {
        throw new ApiError(400, "Academic year, fee, and deadline are required");
    }

    // Deactivate all previous forms
    await IdCardForm.updateMany({}, { isActive: false });

    const form = await IdCardForm.create({
        title: title || "ID Card Application Form",
        academicYear,
        instructions,
        requiredDocuments: requiredDocuments || [],
        deadline: new Date(deadline),
        createdBy: req.user._id,
        isActive: true
    });

    return res.status(201).json(
        new ApiResponse(201, form, "ID Card form created successfully")
    );
});

// Get all ID Card Forms
export const getAllIdCardForms = asyncHandler(async (req, res) => {
    const forms = await IdCardForm.find()
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, forms, "ID Card forms fetched successfully")
    );
});

// Get Active ID Card Form
export const getActiveIdCardForm = asyncHandler(async (req, res) => {
    const form = await IdCardForm.findOne({ isActive: true })
        .populate("createdBy", "name email");

    if (!form) {
        throw new ApiError(404, "No active ID card form found");
    }

    return res.status(200).json(
        new ApiResponse(200, form, "Active form fetched successfully")
    );
});

// Update ID Card Form
export const updateIdCardForm = asyncHandler(async (req, res) => {
    const { formId } = req.params;
    const updates = req.body;

    if (!mongoose.isValidObjectId(formId)) {
        throw new ApiError(400, "Invalid form ID");
    }

    const form = await IdCardForm.findByIdAndUpdate(
        formId,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!form) {
        throw new ApiError(404, "Form not found");
    }

    return res.status(200).json(
        new ApiResponse(200, form, "Form updated successfully")
    );
});

// Toggle Form Active Status
export const toggleFormStatus = asyncHandler(async (req, res) => {
    const { formId } = req.params;

    if (!mongoose.isValidObjectId(formId)) {
        throw new ApiError(400, "Invalid form ID");
    }

    const form = await IdCardForm.findById(formId);
    if (!form) {
        throw new ApiError(404, "Form not found");
    }

    // If activating this form, deactivate all others
    if (!form.isActive) {
        await IdCardForm.updateMany({ _id: { $ne: formId } }, { isActive: false });
    }

    form.isActive = !form.isActive;
    await form.save();

    return res.status(200).json(
        new ApiResponse(200, form, `Form ${form.isActive ? 'activated' : 'deactivated'} successfully`)
    );
});

// Delete ID Card Form
export const deleteIdCardForm = asyncHandler(async (req, res) => {
    const { formId } = req.params;

    if (!mongoose.isValidObjectId(formId)) {
        throw new ApiError(400, "Invalid form ID");
    }

    const form = await IdCardForm.findByIdAndDelete(formId);
    
    if (!form) {
        throw new ApiError(404, "Form not found");
    }

    // Also delete all applications associated with this form
    await IdCardApplication.deleteMany({ formId });

    return res.status(200).json(
        new ApiResponse(200, { deletedForm: form }, "Form and associated applications deleted successfully")
    );
});

// Get all applications
export const getAllApplications = asyncHandler(async (req, res) => {
    const { status, academicYear, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await IdCardApplication.find(filter)
        .populate("studentId", "firstName lastName email enrollmentNo")
        .populate("formId", "title academicYear fee")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await IdCardApplication.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            applications,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "Applications fetched successfully")
    );
});

// Get application by ID
export const getApplicationById = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;

    if (!mongoose.isValidObjectId(applicationId)) {
        throw new ApiError(400, "Invalid application ID");
    }

    const application = await IdCardApplication.findById(applicationId)
        .populate("studentId", "firstName lastName email enrollmentNo phone personalMail")
        .populate("formId", "title academicYear fee")
        .populate("reviewedBy", "name email")
        .populate("statusHistory.updatedBy", "name email");

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    return res.status(200).json(
        new ApiResponse(200, application, "Application fetched successfully")
    );
});

// Update application status
export const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { status, remarks, idCardNumber, dispatchDate } = req.body;

    if (!mongoose.isValidObjectId(applicationId)) {
        throw new ApiError(400, "Invalid application ID");
    }

    const validStatuses = ['pending', 'under_review', 'approved', 'printing', 'ready', 'dispatched', 'rejected'];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const application = await IdCardApplication.findById(applicationId);
    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    // Add to status history
    application.statusHistory.push({
        status,
        updatedBy: req.user._id,
        remarks: remarks || "",
        timestamp: new Date()
    });

    application.status = status;
    if (remarks) application.remarks = remarks;
    if (status === 'rejected' && remarks) application.rejectionReason = remarks;
    if (idCardNumber) application.idCardNumber = idCardNumber;
    if (dispatchDate) application.dispatchDate = new Date(dispatchDate);
    
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    await application.save();

    const updatedApplication = await IdCardApplication.findById(applicationId)
        .populate("studentId", "firstName lastName email")
        .populate("formId", "title academicYear")
        .populate("reviewedBy", "name email");

    return res.status(200).json(
        new ApiResponse(200, updatedApplication, "Application status updated successfully")
    );
});

// Get statistics
export const getIdCardStatistics = asyncHandler(async (req, res) => {
    const stats = await IdCardApplication.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    const totalApplications = await IdCardApplication.countDocuments();
    const totalRevenue = await IdCardApplication.aggregate([
        {
            $match: { paymentStatus: 'completed' }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$paymentAmount" }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            statusWise: stats,
            totalApplications,
            totalRevenue: totalRevenue[0]?.total || 0
        }, "Statistics fetched successfully")
    );
});

// ==================== STUDENT CONTROLLERS ====================

// Get active form for students
export const getActiveFormForStudent = asyncHandler(async (req, res) => {
    const form = await IdCardForm.findOne({ isActive: true });

    if (!form) {
        throw new ApiError(404, "No active ID card form available");
    }

    // Check if student already applied
    const existingApplication = await IdCardApplication.findOne({
        studentId: req.user._id,
        formId: form._id
    });

    return res.status(200).json(
        new ApiResponse(200, {
            form,
            hasApplied: !!existingApplication,
            application: existingApplication
        }, "Form fetched successfully")
    );
});

// Submit ID Card Application
export const submitIdCardApplication = asyncHandler(async (req, res) => {
    const {
        formId,
        fullName,
        dateOfBirth,
        bloodGroup,
        fatherName,
        motherName,
        phone,
        email,
        permanentAddress,
        course,
        branch,
        semester,
        academicYear,
        photoUrl,
        signatureUrl,
        uploadedDocuments
    } = req.body;

    if (!mongoose.isValidObjectId(formId)) {
        throw new ApiError(400, "Invalid form ID");
    }

    // Verify form exists and is active
    const form = await IdCardForm.findById(formId);
    if (!form) {
        throw new ApiError(404, "Form not found");
    }
    if (!form.isActive) {
        throw new ApiError(400, "Form is not active");
    }

    // Check deadline
    if (new Date() > new Date(form.deadline)) {
        throw new ApiError(400, "Application deadline has passed");
    }

    // Check if student already applied
    const existingApplication = await IdCardApplication.findOne({
        studentId: req.user._id,
        formId: formId
    });

    if (existingApplication) {
        throw new ApiError(400, "You have already submitted an application for this form");
    }

    // Get student details
    const student = await Student.findById(req.user._id);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    // Create application
    const application = await IdCardApplication.create({
        formId,
        studentId: req.user._id,
        enrollmentNo: student.enrollmentNo,
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        bloodGroup,
        fatherName,
        motherName,
        phone,
        email,
        permanentAddress,
        course,
        branch,
        semester,
        academicYear,
        photoUrl,
        signatureUrl,
        uploadedDocuments: uploadedDocuments || [],
        paymentAmount: form.fee,
        paymentStatus: 'pending',
        status: 'pending',
        statusHistory: [{
            status: 'pending',
            remarks: 'Application submitted',
            timestamp: new Date()
        }]
    });

    return res.status(201).json(
        new ApiResponse(201, application, "Application submitted successfully. Please complete the payment.")
    );
});

// Get student's applications
export const getMyApplications = asyncHandler(async (req, res) => {
    const applications = await IdCardApplication.find({ studentId: req.user._id })
        .populate("formId", "title academicYear fee deadline")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, applications, "Applications fetched successfully")
    );
});

// Get specific application
export const getMyApplicationById = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;

    if (!mongoose.isValidObjectId(applicationId)) {
        throw new ApiError(400, "Invalid application ID");
    }

    const application = await IdCardApplication.findOne({
        _id: applicationId,
        studentId: req.user._id
    })
        .populate("formId", "title academicYear fee")
        .populate("statusHistory.updatedBy", "name email");

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    return res.status(200).json(
        new ApiResponse(200, application, "Application fetched successfully")
    );
});

// Update payment status (called after Razorpay verification)
export const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { paymentId, orderId, paymentStatus } = req.body;

    if (!mongoose.isValidObjectId(applicationId)) {
        throw new ApiError(400, "Invalid application ID");
    }

    const application = await IdCardApplication.findOne({
        _id: applicationId,
        studentId: req.user._id
    });

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    application.paymentId = paymentId;
    application.orderId = orderId;
    application.paymentStatus = paymentStatus;
    
    if (paymentStatus === 'completed') {
        application.paymentDate = new Date();
        application.status = 'under_review';
        application.statusHistory.push({
            status: 'under_review',
            remarks: 'Payment completed, under review',
            timestamp: new Date()
        });
    }

    await application.save();

    return res.status(200).json(
        new ApiResponse(200, application, "Payment status updated successfully")
    );
});
