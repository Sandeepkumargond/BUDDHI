import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Notice } from "../models/notice.model.js";
import { uploadNoticeAttachment } from "../utils/ImageKit.js";

// Create a new notice (Admin/SubAdmin)
const createNotice = asyncHandler(async (req, res) => {
    // console.log('📝 Creating notice - Request body:', req.body);
    // console.log('📎 File attached:', req.file ? 'Yes' : 'No');
    // if (req.file) {
    //     console.log('📁 File details:', {
    //         originalname: req.file.originalname,
    //         mimetype: req.file.mimetype,
    //         size: req.file.size,
    //         path: req.file.path
    //     });
    // }

    const {
        title,
        content,
        audience = 'all',
        priority = 'normal',
        publishDate,
        expiryDate,
        category = 'general',
        targetSemesters,
        targetBranches,
        isPinned = false,
        tags
    } = req.body;

    // Parse JSON fields from FormData
    let parsedTargetSemesters = [];
    let parsedTargetBranches = [];
    let parsedTags = [];

    try {
        if (targetSemesters && typeof targetSemesters === 'string') {
            parsedTargetSemesters = JSON.parse(targetSemesters);
        }
        if (targetBranches && typeof targetBranches === 'string') {
            parsedTargetBranches = JSON.parse(targetBranches);
        }
        if (tags && typeof tags === 'string') {
            parsedTags = JSON.parse(tags);
        }
    } catch (parseError) {
        console.error('❌ JSON parsing error:', parseError);
        throw new ApiError(400, "Invalid JSON format in form data");
    }

    // Validate required fields
    if (!title?.trim()) {
        console.error('❌ Validation error: Title is missing');
        throw new ApiError(400, "Title is required");
    }
    if (!content?.trim()) {
        console.error('❌ Validation error: Content is missing');
        throw new ApiError(400, "Content is required");
    }

    // console.log('✅ Validation passed, proceeding with notice creation...');

    // Handle file upload if attachment exists
    let attachmentUrl = null;
    let attachmentName = null;
    
    if (req.file) {
        try {
            // console.log('🔄 Starting file upload to ImageKit...');
            const uploadResult = await uploadNoticeAttachment(req.file.path, req.file.originalname);
            // console.log('📤 Upload result:', uploadResult);
            
            if (uploadResult.error) {
                console.error('❌ Upload failed:', uploadResult.message);
                throw new ApiError(500, uploadResult.message || "Failed to upload attachment");
            }
            
            attachmentUrl = uploadResult.url;
            attachmentName = uploadResult.originalName;
            // console.log('✅ File uploaded successfully:', attachmentUrl);
        } catch (error) {
            console.error("❌ File upload error:", error);
            throw new ApiError(500, `Failed to upload attachment: ${error.message}`);
        }
    }

    // Determine creator model based on role
    let createdByModel;
    switch (req.user.role || req.user.userType) {
        case 'admin':
        case 'college_admin':
        case 'collage_admin':
            createdByModel = 'Admin';
            break;
        case 'sub-admin':
        case 'subadmin':
            createdByModel = 'SubAdmin';
            break;
        case 'super-admin':
        case 'superadmin':
            createdByModel = 'SuperAdmin';
            break;
        default:
            createdByModel = 'Admin';
    }

    // Create notice
    // console.log('📝 Creating notice with data:', {
    //     title: title.trim(),
    //     audience,
    //     priority,
    //     category,
    //     isPinned: isPinned === 'true' || isPinned === true,
    //     targetSemesters: parsedTargetSemesters,
    //     targetBranches: parsedTargetBranches,
    //     tags: parsedTags,
    //     hasAttachment: !!attachmentUrl
    // });

    const notice = await Notice.create({
        title: title.trim(),
        content: content.trim(),
        audience,
        priority,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        attachmentUrl,
        attachmentName,
        createdBy: req.user._id,
        createdByModel,
        createdByName: `${req.user.firstName} ${req.user.lastName}`,
        category,
        targetSemesters: parsedTargetSemesters,
        targetBranches: parsedTargetBranches,
        isPinned: isPinned === 'true' || isPinned === true,
        tags: parsedTags
    });

    // console.log('✅ Notice created successfully with ID:', notice._id);

    const populatedNotice = await Notice.findById(notice._id)
        .populate('createdBy', 'firstName lastName email');

    return res.status(201).json(
        new ApiResponse(201, { notice: populatedNotice }, "Notice created successfully")
    );
});

// Get all notices with pagination and filters
const getAllNotices = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        audience,
        priority,
        category,
        isActive,
        isPinned,
        search,
        startDate,
        endDate
    } = req.query;

    // Build filter query
    const filter = {};

    if (audience && audience !== 'all') {
        filter.audience = audience;
    }
    if (priority) {
        filter.priority = priority;
    }
    if (category) {
        filter.category = category;
    }
    if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
    }
    if (isPinned !== undefined) {
        filter.isPinned = isPinned === 'true';
    }
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }
    if (startDate || endDate) {
        filter.publishDate = {};
        if (startDate) {
            filter.publishDate.$gte = new Date(startDate);
        }
        if (endDate) {
            filter.publishDate.$lte = new Date(endDate);
        }
    }

    // Get notices with pagination
    const notices = await Notice.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .sort({ isPinned: -1, publishDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const total = await Notice.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            notices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }, "Notices retrieved successfully")
    );
});

// Get active notices for public view (students/faculty)
const getActiveNotices = asyncHandler(async (req, res) => {
    const {
        audience = 'all',
        limit = 20,
        page = 1,
        category,
        priority,
        search,
        sort = 'latest'
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build query for active notices
    const query = {
        isActive: true,
        $and: [
            {
                $or: [
                    { expiryDate: null },
                    { expiryDate: { $gt: new Date() } }
                ]
            }
        ]
    };

    // Filter by audience
    if (audience && audience !== 'all') {
        query.$and.push({
            $or: [
                { audience: 'all' },
                { audience: audience }
            ]
        });
    }

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Filter by priority
    if (priority) {
        query.priority = priority;
    }

    // Search functionality
    if (search) {
        query.$and.push({
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ]
        });
    }

    // Determine sort order
    let sortCriteria = { isPinned: -1 };
    switch (sort) {
        case 'latest':
            sortCriteria.publishDate = -1;
            break;
        case 'oldest':
            sortCriteria.publishDate = 1;
            break;
        case 'priority':
            sortCriteria.priority = 1;
            break;
        default:
            sortCriteria.publishDate = -1;
    }

    const notices = await Notice.find(query)
        .populate('createdBy', 'firstName lastName')
        .sort(sortCriteria)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .select('-__v');

    const total = await Notice.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            notices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }, "Active notices retrieved successfully")
    );
});

// Get single notice by ID
const getNoticeById = asyncHandler(async (req, res) => {
    const { noticeId } = req.params;

    const notice = await Notice.findById(noticeId)
        .populate('createdBy', 'firstName lastName email');

    if (!notice) {
        throw new ApiError(404, "Notice not found");
    }

    // Increment view count
    await notice.incrementViewCount();

    return res.status(200).json(
        new ApiResponse(200, { notice }, "Notice retrieved successfully")
    );
});

// Update notice (Admin/SubAdmin)
const updateNotice = asyncHandler(async (req, res) => {
    const { noticeId } = req.params;
    const updateData = { ...req.body };

    const notice = await Notice.findById(noticeId);
    if (!notice) {
        throw new ApiError(404, "Notice not found");
    }

    // Handle file upload if new attachment exists
    if (req.file) {
        try {
            const uploadResult = await uploadNoticeAttachment(req.file.path, req.file.originalname);
            if (uploadResult.error) {
                throw new ApiError(500, uploadResult.message || "Failed to upload attachment");
            }
            updateData.attachmentUrl = uploadResult.url;
            updateData.attachmentName = uploadResult.originalName;
        } catch (error) {
            console.error("File upload error:", error);
            throw new ApiError(500, "Failed to upload attachment");
        }
    }

    // Update notice
    const updatedNotice = await Notice.findByIdAndUpdate(
        noticeId,
        updateData,
        { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    return res.status(200).json(
        new ApiResponse(200, { notice: updatedNotice }, "Notice updated successfully")
    );
});

// Delete notice (Admin/SubAdmin)
const deleteNotice = asyncHandler(async (req, res) => {
    const { noticeId } = req.params;

    const notice = await Notice.findById(noticeId);
    if (!notice) {
        throw new ApiError(404, "Notice not found");
    }

    await Notice.findByIdAndDelete(noticeId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Notice deleted successfully")
    );
});

// Toggle notice active status
const toggleNoticeStatus = asyncHandler(async (req, res) => {
    const { noticeId } = req.params;

    const notice = await Notice.findById(noticeId);
    if (!notice) {
        throw new ApiError(404, "Notice not found");
    }

    notice.isActive = !notice.isActive;
    await notice.save();

    return res.status(200).json(
        new ApiResponse(200, { notice }, `Notice ${notice.isActive ? 'activated' : 'deactivated'} successfully`)
    );
});

// Pin/Unpin notice
const toggleNoticePin = asyncHandler(async (req, res) => {
    const { noticeId } = req.params;

    const notice = await Notice.findById(noticeId);
    if (!notice) {
        throw new ApiError(404, "Notice not found");
    }

    notice.isPinned = !notice.isPinned;
    await notice.save();

    return res.status(200).json(
        new ApiResponse(200, { notice }, `Notice ${notice.isPinned ? 'pinned' : 'unpinned'} successfully`)
    );
});

// Get notice statistics
const getNoticeStats = asyncHandler(async (req, res) => {
    const stats = await Notice.aggregate([
        {
            $group: {
                _id: null,
                totalNotices: { $sum: 1 },
                activeNotices: {
                    $sum: {
                        $cond: [{ $eq: ["$isActive", true] }, 1, 0]
                    }
                },
                pinnedNotices: {
                    $sum: {
                        $cond: [{ $eq: ["$isPinned", true] }, 1, 0]
                    }
                },
                totalViews: { $sum: "$viewCount" }
            }
        }
    ]);

    const categoryStats = await Notice.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 }
            }
        }
    ]);

    const audienceStats = await Notice.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: "$audience",
                count: { $sum: 1 }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            stats: stats[0] || {
                totalNotices: 0,
                activeNotices: 0,
                pinnedNotices: 0,
                totalViews: 0
            },
            categoryStats,
            audienceStats
        }, "Notice statistics retrieved successfully")
    );
});

export {
    createNotice,
    getAllNotices,
    getActiveNotices,
    getNoticeById,
    updateNotice,
    deleteNotice,
    toggleNoticeStatus,
    toggleNoticePin,
    getNoticeStats
};