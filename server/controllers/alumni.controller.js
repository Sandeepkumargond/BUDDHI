import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Alumni } from "../models/alumni.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Helper function to get alumni details by ID
export const getAlumniDetailsById = async (alumniId) => {
    if (!alumniId) {
        throw new ApiError(400, "Alumni ID is required");
    }

    const alumni = await Alumni.findById(alumniId).select("-password -refreshToken");

    if (!alumni) {
        throw new ApiError(404, "Alumni not found");
    }

    return alumni;
};

// Generate access and refresh tokens
export const generateAlumniAccessAndRefreshToken = async (alumniId) => {
    try {
        const alumni = await Alumni.findById(alumniId);
        
        if (!alumni) {
            throw new ApiError(404, "Alumni not found");
        }

        const accessToken = alumni.generateAccessToken();
        const refreshToken = alumni.generateRefreshToken();

        alumni.refreshToken = refreshToken;
        await alumni.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

// Register alumni (Admin only)
export const registerAlumni = asyncHandler(async (req, res) => {
    const {
        alumniId,
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        gender,
        mobile,
        alternateEmail,
        department,
        degree,
        batch,
        graduationYear,
        rollNumber,
        currentCompany,
        currentDesignation,
        industry,
        linkedinUrl,
        currentAddress,
    } = req.body;

    // Validate required fields
    if (!alumniId || !firstName || !lastName || !email || !password || !department || !degree || !batch || !graduationYear) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Check if alumni already exists
    const existingAlumni = await Alumni.findOne({ 
        $or: [{ email: email.toLowerCase() }, { alumniId }] 
    });

    if (existingAlumni) {
        throw new ApiError(409, "Alumni with this email or ID already exists");
    }

    // Create alumni
    const alumni = await Alumni.create({
        alumniId,
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        dateOfBirth,
        gender,
        mobile,
        alternateEmail,
        department,
        degree,
        batch,
        graduationYear,
        rollNumber,
        currentCompany,
        currentDesignation,
        industry,
        linkedinUrl,
        currentAddress,
        isVerified: false,
    });

    const createdAlumni = await Alumni.findById(alumni._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, { alumni: createdAlumni }, "Alumni registered successfully")
    );
});

// Alumni login
export const loginAlumni = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const alumni = await Alumni.findOne({ email: email.toLowerCase() });

    if (!alumni) {
        throw new ApiError(404, "Alumni not found");
    }

    if (alumni.accountStatus !== 'active') {
        throw new ApiError(403, "Account is not active. Please contact administration.");
    }

    const isPasswordValid = await alumni.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAlumniAccessAndRefreshToken(alumni._id);

    const loggedInAlumni = await getAlumniDetailsById(alumni._id);

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInAlumni,
                    accessToken,
                    refreshToken
                },
                "Alumni logged in successfully"
            )
        );
});

// Refresh access token
export const refreshAlumniAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const alumni = await Alumni.findById(decodedToken?._id);

        if (!alumni) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== alumni?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAlumniAccessAndRefreshToken(alumni._id);

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

// Logout alumni
export const logoutAlumni = asyncHandler(async (req, res) => {
    await Alumni.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: { refreshToken: 1 }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Alumni logged out successfully"));
});

// Get alumni profile
export const getMyProfile = asyncHandler(async (req, res) => {
    const alumniId = req.user?._id;
    const alumni = await getAlumniDetailsById(alumniId);

    return res.status(200).json(
        new ApiResponse(200, { user: alumni }, "Alumni profile fetched successfully")
    );
});

// Update alumni profile
export const updateAlumniProfile = asyncHandler(async (req, res) => {
    const alumniId = req.user?._id;
    
    const allowedUpdates = [
        'firstName', 'lastName', 'dateOfBirth', 'gender', 'mobile', 'alternateEmail',
        'currentCompany', 'currentDesignation', 'industry', 'linkedinUrl',
        'currentAddress', 'willingToMentor', 'areasOfExpertise', 'bio', 'imageUrl'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const updatedAlumni = await Alumni.findByIdAndUpdate(
        alumniId,
        { $set: updates },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, { alumni: updatedAlumni }, "Profile updated successfully")
    );
});

// Add internship opportunity
export const addInternshipOpportunity = asyncHandler(async (req, res) => {
    const alumniId = req.user?._id;
    const {
        companyName,
        position,
        description,
        duration,
        stipend,
        location,
        requirements,
        applyLink,
        deadline,
    } = req.body;

    if (!companyName || !position || !description) {
        throw new ApiError(400, "Company name, position, and description are required");
    }

    const alumni = await Alumni.findById(alumniId);
    
    alumni.internshipOpportunities.push({
        companyName,
        position,
        description,
        duration,
        stipend,
        location,
        requirements,
        applyLink,
        deadline,
    });

    await alumni.save();

    return res.status(201).json(
        new ApiResponse(201, { internship: alumni.internshipOpportunities[alumni.internshipOpportunities.length - 1] }, "Internship opportunity added successfully")
    );
});

// Update internship opportunity
export const updateInternshipOpportunity = asyncHandler(async (req, res) => {
    const alumniId = req.user?._id;
    const { internshipId } = req.params;
    
    const alumni = await Alumni.findById(alumniId);
    
    const internship = alumni.internshipOpportunities.id(internshipId);
    
    if (!internship) {
        throw new ApiError(404, "Internship opportunity not found");
    }

    Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
            internship[key] = req.body[key];
        }
    });

    await alumni.save();

    return res.status(200).json(
        new ApiResponse(200, { internship }, "Internship opportunity updated successfully")
    );
});

// Delete internship opportunity
export const deleteInternshipOpportunity = asyncHandler(async (req, res) => {
    const alumniId = req.user?._id;
    const { internshipId } = req.params;
    
    const alumni = await Alumni.findById(alumniId);
    
    alumni.internshipOpportunities.pull(internshipId);
    await alumni.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Internship opportunity deleted successfully")
    );
});

// Add referral
export const addReferral = asyncHandler(async (req, res) => {
    const alumniId = req.user?._id;
    const {
        companyName,
        position,
        description,
        requirements,
        contactEmail,
        referralType,
    } = req.body;

    if (!companyName || !position) {
        throw new ApiError(400, "Company name and position are required");
    }

    const alumni = await Alumni.findById(alumniId);
    
    alumni.referrals.push({
        companyName,
        position,
        description,
        requirements,
        contactEmail,
        referralType,
    });

    await alumni.save();

    return res.status(201).json(
        new ApiResponse(201, { referral: alumni.referrals[alumni.referrals.length - 1] }, "Referral added successfully")
    );
});

// Update referral
export const updateReferral = asyncHandler(async (req, res) => {
    const alumniId = req.user?._id;
    const { referralId } = req.params;
    
    const alumni = await Alumni.findById(alumniId);
    
    const referral = alumni.referrals.id(referralId);
    
    if (!referral) {
        throw new ApiError(404, "Referral not found");
    }

    Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
            referral[key] = req.body[key];
        }
    });

    await alumni.save();

    return res.status(200).json(
        new ApiResponse(200, { referral }, "Referral updated successfully")
    );
});

// Delete referral
export const deleteReferral = asyncHandler(async (req, res) => {
    const alumniId = req.user?._id;
    const { referralId } = req.params;
    
    const alumni = await Alumni.findById(alumniId);
    
    alumni.referrals.pull(referralId);
    await alumni.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Referral deleted successfully")
    );
});

// Add donation
export const addDonation = asyncHandler(async (req, res) => {
    const alumniId = req.user?._id;
    const {
        amount,
        currency,
        purpose,
        description,
        transactionId,
        paymentMethod,
        receiptUrl,
    } = req.body;

    if (!amount || !purpose) {
        throw new ApiError(400, "Amount and purpose are required");
    }

    const alumni = await Alumni.findById(alumniId);
    
    alumni.donations.push({
        amount,
        currency,
        purpose,
        description,
        transactionId,
        paymentMethod,
        receiptUrl,
        status: 'pending',
    });

    await alumni.save();

    return res.status(201).json(
        new ApiResponse(201, { donation: alumni.donations[alumni.donations.length - 1] }, "Donation recorded successfully")
    );
});

// Admin: List all alumni with filters
export const listAllAlumni = asyncHandler(async (req, res) => {
    const {
        department,
        graduationYear,
        isVerified,
        isActive,
        search,
        page = 1,
        limit = 20,
    } = req.query;

    const filter = {};
    
    if (department && department !== '') filter.department = department;
    if (graduationYear && graduationYear !== '') filter.graduationYear = parseInt(graduationYear);
    if (isVerified !== undefined && isVerified !== '') filter.isVerified = isVerified === 'true';
    if (isActive !== undefined && isActive !== '') filter.isActive = isActive === 'true';
    
    if (search) {
        filter.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { alumniId: { $regex: search, $options: 'i' } },
            { currentCompany: { $regex: search, $options: 'i' } },
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [alumni, total] = await Promise.all([
        Alumni.find(filter)
            .select("-password -refreshToken")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip),
        Alumni.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            alumni,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            }
        }, "Alumni list fetched successfully")
    );
});

// Admin: Get alumni by ID
export const getAlumniById = asyncHandler(async (req, res) => {
    const { alumniId } = req.params;

    if (!mongoose.isValidObjectId(alumniId)) {
        throw new ApiError(400, "Invalid alumni ID");
    }

    const alumni = await getAlumniDetailsById(alumniId);

    return res.status(200).json(
        new ApiResponse(200, { alumni }, "Alumni details fetched successfully")
    );
});

// Admin: Update alumni status
export const updateAlumniStatus = asyncHandler(async (req, res) => {
    const { alumniId } = req.params;
    const { accountStatus, isVerified, isActive } = req.body;

    const updates = {};
    if (accountStatus) updates.accountStatus = accountStatus;
    if (isVerified !== undefined) updates.isVerified = isVerified;
    if (isActive !== undefined) updates.isActive = isActive;

    const alumni = await Alumni.findByIdAndUpdate(
        alumniId,
        { $set: updates },
        { new: true }
    ).select("-password -refreshToken");

    if (!alumni) {
        throw new ApiError(404, "Alumni not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { alumni }, "Alumni status updated successfully")
    );
});

// Admin: Delete alumni
export const deleteAlumni = asyncHandler(async (req, res) => {
    const { alumniId } = req.params;

    const alumni = await Alumni.findByIdAndDelete(alumniId);

    if (!alumni) {
        throw new ApiError(404, "Alumni not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Alumni deleted successfully")
    );
});

// Public: Get all internship opportunities
export const getAllInternshipOpportunities = asyncHandler(async (req, res) => {
    const { location, position, search } = req.query;

    const alumni = await Alumni.find({
        isVerified: true,
        isActive: true,
    }).select('firstName lastName internshipOpportunities currentCompany');

    let opportunities = [];
    alumni.forEach(alum => {
        alum.internshipOpportunities.forEach(intern => {
            if (intern.isActive && intern.isApproved) {
                opportunities.push({
                    ...intern.toObject(),
                    alumniName: `${alum.firstName} ${alum.lastName}`,
                    alumniId: alum._id,
                    alumniCompany: alum.currentCompany,
                });
            }
        });
    });

    // Apply filters
    if (location) {
        opportunities = opportunities.filter(o => 
            o.location?.toLowerCase().includes(location.toLowerCase())
        );
    }
    if (position) {
        opportunities = opportunities.filter(o => 
            o.position?.toLowerCase().includes(position.toLowerCase())
        );
    }
    if (search) {
        const searchLower = search.toLowerCase();
        opportunities = opportunities.filter(o => 
            o.companyName?.toLowerCase().includes(searchLower) ||
            o.position?.toLowerCase().includes(searchLower) ||
            o.description?.toLowerCase().includes(searchLower)
        );
    }

    return res.status(200).json(
        new ApiResponse(200, { opportunities }, "Internship opportunities fetched successfully")
    );
});

// Public: Get all referrals
export const getAllReferrals = asyncHandler(async (req, res) => {
    const { referralType, search } = req.query;

    const alumni = await Alumni.find({
        isVerified: true,
        isActive: true,
    }).select('firstName lastName referrals currentCompany');

    let referrals = [];
    alumni.forEach(alum => {
        alum.referrals.forEach(ref => {
            if (ref.isActive && ref.isApproved) {
                referrals.push({
                    ...ref.toObject(),
                    alumniName: `${alum.firstName} ${alum.lastName}`,
                    alumniId: alum._id,
                    alumniCompany: alum.currentCompany,
                });
            }
        });
    });

    // Apply filters
    if (referralType) {
        referrals = referrals.filter(r => r.referralType === referralType);
    }
    if (search) {
        const searchLower = search.toLowerCase();
        referrals = referrals.filter(r => 
            r.companyName?.toLowerCase().includes(searchLower) ||
            r.position?.toLowerCase().includes(searchLower)
        );
    }

    return res.status(200).json(
        new ApiResponse(200, { referrals }, "Referrals fetched successfully")
    );
});

// Admin: Get donation statistics
export const getDonationStats = asyncHandler(async (req, res) => {
    // Overall stats (all donations regardless of status)
    const overall = await Alumni.aggregate([
        { $unwind: '$donations' },
        {
            $group: {
                _id: null,
                totalDonations: { $sum: '$donations.amount' },
                donationCount: { $sum: 1 },
                avgDonation: { $avg: '$donations.amount' },
                maxDonation: { $max: '$donations.amount' },
            }
        }
    ]);

    // Status-wise breakdown
    const byStatus = await Alumni.aggregate([
        { $unwind: '$donations' },
        {
            $group: {
                _id: '$donations.status',
                total: { $sum: '$donations.amount' },
                count: { $sum: 1 },
            }
        }
    ]);

    // Purpose-wise breakdown (all statuses)
    const byPurpose = await Alumni.aggregate([
        { $unwind: '$donations' },
        {
            $group: {
                _id: '$donations.purpose',
                total: { $sum: '$donations.amount' },
                count: { $sum: 1 },
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            overall: overall[0] || { totalDonations: 0, donationCount: 0, avgDonation: 0, maxDonation: 0 },
            byStatus,
            byPurpose,
        }, "Donation statistics fetched successfully")
    );
});

// Admin: Update donation status
export const updateDonationStatus = asyncHandler(async (req, res) => {
    const { alumniId, donationId } = req.params;
    const { status, receiptUrl } = req.body;

    if (!status || !['pending', 'completed', 'failed'].includes(status)) {
        throw new ApiError(400, "Valid status is required");
    }

    const alumni = await Alumni.findById(alumniId);
    
    if (!alumni) {
        throw new ApiError(404, "Alumni not found");
    }

    const donation = alumni.donations.id(donationId);
    
    if (!donation) {
        throw new ApiError(404, "Donation not found");
    }

    donation.status = status;
    if (receiptUrl) donation.receiptUrl = receiptUrl;

    await alumni.save();

    return res.status(200).json(
        new ApiResponse(200, { donation }, "Donation status updated successfully")
    );
});

// Admin: Update internship approval
export const updateInternshipApproval = asyncHandler(async (req, res) => {
    const { alumniId, internshipId } = req.params;
    const { isApproved } = req.body;

    if (typeof isApproved !== 'boolean') {
        throw new ApiError(400, "isApproved boolean is required");
    }

    const alumni = await Alumni.findById(alumniId);
    if (!alumni) throw new ApiError(404, "Alumni not found");

    const internship = alumni.internshipOpportunities.id(internshipId);
    if (!internship) throw new ApiError(404, "Internship not found");

    internship.isApproved = isApproved;
    await alumni.save();

    return res.status(200).json(
        new ApiResponse(200, { internship }, "Internship approval updated successfully")
    );
});

// Admin: Update referral approval
export const updateReferralApproval = asyncHandler(async (req, res) => {
    const { alumniId, referralId } = req.params;
    const { isApproved } = req.body;

    if (typeof isApproved !== 'boolean') {
        throw new ApiError(400, "isApproved boolean is required");
    }

    const alumni = await Alumni.findById(alumniId);
    if (!alumni) throw new ApiError(404, "Alumni not found");

    const referral = alumni.referrals.id(referralId);
    if (!referral) throw new ApiError(404, "Referral not found");

    referral.isApproved = isApproved;
    await alumni.save();

    return res.status(200).json(
        new ApiResponse(200, { referral }, "Referral approval updated successfully")
    );
});

export {
    Alumni
};
