import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { SharedLibraryAgreement } from "../models/sharedLibraryAgreement.model.js";
import { LibraryInventory } from "../models/libraryInventory.model.js";
import { Admin } from "../models/admin.model.js";
import { SubAdmin } from "../models/subAdmin.model.js";
import { generateBookId, generateAgreementId } from "../utils/generateBookId.js";
import jwt from "jsonwebtoken";

// ==================== SUPER ADMIN ENDPOINTS ====================

/**
 * Create a new sharing agreement between two institutes
 * POST /api/v1/library/agreement
 * Role: Super Admin only
 */
export const createAgreement = asyncHandler(async (req, res) => {
    const { sharingInstituteId, accessInstituteId, sharingPolicy } = req.body;

    if (!sharingInstituteId || !accessInstituteId) {
        throw new ApiError(400, "Sharing institute ID and access institute ID are required");
    }

    if (sharingInstituteId === accessInstituteId) {
        throw new ApiError(400, "Sharing institute and access institute cannot be the same");
    }

    // Validate both institutes exist
    const [sharingInstitute, accessInstitute] = await Promise.all([
        Admin.findById(sharingInstituteId),
        Admin.findById(accessInstituteId)
    ]);

    if (!sharingInstitute) {
        throw new ApiError(404, "Sharing institute not found");
    }

    if (!accessInstitute) {
        throw new ApiError(404, "Access institute not found");
    }

    // Check if agreement already exists
    const existingAgreement = await SharedLibraryAgreement.findOne({
        sharingInstituteId,
        accessInstituteId,
    });

    if (existingAgreement) {
        throw new ApiError(409, "Agreement between these institutes already exists");
    }

    // Generate unique agreement ID
    const agreementId = await generateAgreementId();

    const agreement = await SharedLibraryAgreement.create({
        agreementId,
        sharingInstituteId,
        accessInstituteId,
        sharingPolicy: sharingPolicy || 'Selected Resources',
        status: 'Active',
    });

    const createdAgreement = await SharedLibraryAgreement.findById(agreement._id)
        .populate('sharingInstituteId', 'collegeName abbreviation')
        .populate('accessInstituteId', 'collegeName abbreviation');

    return res.status(201).json(
        new ApiResponse(
            201,
            createdAgreement,
            "Sharing agreement created successfully"
        )
    );
});

/**
 * Get all sharing agreements
 * GET /api/v1/library/agreement
 * Role: Super Admin only
 */
export const getAgreements = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const filter = {};
    if (status) {
        filter.status = status;
    }

    const agreements = await SharedLibraryAgreement.find(filter)
        .populate('sharingInstituteId', 'collegeName abbreviation collegeRegistartionNo')
        .populate('accessInstituteId', 'collegeName abbreviation collegeRegistartionNo')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            { agreements },
            "Agreements fetched successfully"
        )
    );
});

/**
 * Update agreement status (activate/deactivate)
 * PUT /api/v1/library/agreement/:agreementId/status
 * Role: Super Admin only
 */
export const updateAgreementStatus = asyncHandler(async (req, res) => {
    const { agreementId } = req.params;
    const { status } = req.body;

    if (!status || !['Active', 'Inactive'].includes(status)) {
        throw new ApiError(400, "Status must be either 'Active' or 'Inactive'");
    }

    const agreement = await SharedLibraryAgreement.findOneAndUpdate(
        { agreementId },
        { status },
        { new: true }
    ).populate('sharingInstituteId', 'collegeName abbreviation')
        .populate('accessInstituteId', 'collegeName abbreviation');

    if (!agreement) {
        throw new ApiError(404, "Agreement not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            agreement,
            "Agreement status updated successfully"
        )
    );
});

// ==================== SUB ADMIN ENDPOINTS ====================

/**
 * Create a new inventory item
 * POST /api/v1/library/inventory
 * Role: Sub Admin only
 */
export const createInventoryItem = asyncHandler(async (req, res) => {
    const {
        title,
        author,
        accessLink,
        category,
        isbn,
        publicationYear,
        publisher,
        description,
        isShareable,
        isLocalAvailable
    } = req.body;

    if (!title || !author || !accessLink) {
        throw new ApiError(400, "Title, author, and access link are required");
    }

    // Get Sub Admin's institute ID
    const subAdminId = req.user._id;
    const subAdmin = await SubAdmin.findById(subAdminId);

    if (!subAdmin) {
        throw new ApiError(404, "Sub Admin not found");
    }

    // Find the Admin (institute) using collegeRegistartionNo
    const admin = await Admin.findOne({ collegeRegistartionNo: subAdmin.collegeRegistartionNo });

    if (!admin) {
        throw new ApiError(404, "Institute not found");
    }

    // Generate unique book ID
    const bookId = await generateBookId();

    const inventoryItem = await LibraryInventory.create({
        bookId,
        title: title.trim(),
        author: author.trim(),
        accessLink,
        category: category || 'E-Book',
        isbn: isbn || undefined,
        publicationYear: publicationYear || undefined,
        publisher: publisher || undefined,
        description: description || undefined,
        isShareable: isShareable || false,
        isLocalAvailable: isLocalAvailable !== undefined ? isLocalAvailable : true,
        instituteId: admin._id,
        addedBy: subAdminId,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            inventoryItem,
            "Book added to inventory successfully"
        )
    );
});

/**
 * Get inventory for Sub Admin's institute
 * GET /api/v1/library/inventory
 * Role: Sub Admin only
 */
export const getInventory = asyncHandler(async (req, res) => {
    const { search, category, isShareable, page = 1, limit = 20 } = req.query;

    // Get Sub Admin's institute ID
    const subAdminId = req.user._id;
    const subAdmin = await SubAdmin.findById(subAdminId);

    if (!subAdmin) {
        throw new ApiError(404, "Sub Admin not found");
    }

    const admin = await Admin.findOne({ collegeRegistartionNo: subAdmin.collegeRegistartionNo });

    if (!admin) {
        throw new ApiError(404, "Institute not found");
    }

    const filter = { instituteId: admin._id };

    if (category) {
        filter.category = category;
    }

    if (isShareable !== undefined) {
        filter.isShareable = isShareable === 'true';
    }

    if (search) {
        filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [inventory, total] = await Promise.all([
        LibraryInventory.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('addedBy', 'firstName lastName email'),
        LibraryInventory.countDocuments(filter)
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                inventory,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            },
            "Inventory fetched successfully"
        )
    );
});

/**
 * Update inventory item
 * PUT /api/v1/library/inventory/:bookId
 * Role: Sub Admin only
 */
export const updateInventoryItem = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const updateData = req.body;

    // Get Sub Admin's institute ID
    const subAdminId = req.user._id;
    const subAdmin = await SubAdmin.findById(subAdminId);

    if (!subAdmin) {
        throw new ApiError(404, "Sub Admin not found");
    }

    const admin = await Admin.findOne({ collegeRegistartionNo: subAdmin.collegeRegistartionNo });

    if (!admin) {
        throw new ApiError(404, "Institute not found");
    }

    // Find the book and verify ownership
    const book = await LibraryInventory.findOne({ bookId });

    if (!book) {
        throw new ApiError(404, "Book not found");
    }

    // Verify that the book belongs to this institute
    if (book.instituteId.toString() !== admin._id.toString()) {
        throw new ApiError(403, "You can only update books in your institute's inventory");
    }

    // Update allowed fields
    const allowedUpdates = [
        'title', 'author', 'accessLink', 'category', 'isbn',
        'publicationYear', 'publisher', 'description',
        'isShareable', 'isLocalAvailable'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    });

    const updatedBook = await LibraryInventory.findOneAndUpdate(
        { bookId },
        { $set: updates },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedBook,
            "Book updated successfully"
        )
    );
});

/**
 * Update shareable status of a book
 * PUT /api/v1/library/inventory/:bookId/shareable
 * Role: Sub Admin only
 */
export const updateInventoryShareable = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const { isShareable } = req.body;

    if (isShareable === undefined) {
        throw new ApiError(400, "isShareable field is required");
    }

    // Get Sub Admin's institute ID
    const subAdminId = req.user._id;
    const subAdmin = await SubAdmin.findById(subAdminId);

    if (!subAdmin) {
        throw new ApiError(404, "Sub Admin not found");
    }

    const admin = await Admin.findOne({ collegeRegistartionNo: subAdmin.collegeRegistartionNo });

    if (!admin) {
        throw new ApiError(404, "Institute not found");
    }

    // Find the book and verify ownership
    const book = await LibraryInventory.findOne({ bookId });

    if (!book) {
        throw new ApiError(404, "Book not found");
    }

    if (book.instituteId.toString() !== admin._id.toString()) {
        throw new ApiError(403, "You can only modify books in your institute's inventory");
    }

    const updatedBook = await LibraryInventory.findOneAndUpdate(
        { bookId },
        { isShareable: Boolean(isShareable) },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedBook,
            `Book ${isShareable ? 'marked as shareable' : 'removed from sharing'}`
        )
    );
});

/**
 * Delete inventory item
 * DELETE /api/v1/library/inventory/:bookId
 * Role: Sub Admin only
 */
export const deleteInventoryItem = asyncHandler(async (req, res) => {
    const { bookId } = req.params;

    // Get Sub Admin's institute ID
    const subAdminId = req.user._id;
    const subAdmin = await SubAdmin.findById(subAdminId);

    if (!subAdmin) {
        throw new ApiError(404, "Sub Admin not found");
    }

    const admin = await Admin.findOne({ collegeRegistartionNo: subAdmin.collegeRegistartionNo });

    if (!admin) {
        throw new ApiError(404, "Institute not found");
    }

    // Find the book and verify ownership
    const book = await LibraryInventory.findOne({ bookId });

    if (!book) {
        throw new ApiError(404, "Book not found");
    }

    if (book.instituteId.toString() !== admin._id.toString()) {
        throw new ApiError(403, "You can only delete books in your institute's inventory");
    }

    await LibraryInventory.findOneAndDelete({ bookId });

    return res.status(200).json(
        new ApiResponse(
            200,
            { bookId },
            "Book deleted successfully"
        )
    );
});

// ==================== STUDENT ENDPOINTS ====================

/**
 * CORE FEATURE: Frictionless global search
 * POST /api/v1/library/search/global
 * Role: Student/Authenticated User
 * 
 * Logic:
 * 1. Search local inventory first
 * 2. If not found, check active sharing agreements
 * 3. Query partner institutes' shareable inventory
 * 4. Return combined results with source indicator
 */
export const globalSearch = asyncHandler(async (req, res) => {
    const { title, author } = req.body;

    // Allow empty search to return all books
    // if (!title && !author) {
    //     throw new ApiError(400, "Search query (title or author) is required");
    // }

    // For students, we need to find their institute
    // The student doesn't have instituteId directly, so we'll use their email domain
    // or we need to add instituteId to Student model
    // For now, let's assume we can get it from the admin that manages them

    // Since students don't have a direct instituteId reference, we'll need to determine it differently
    // For this implementation, we'll add a query parameter or determine from the student's college
    // Let's use a simpler approach: Admin manages students through the same system

    // IMPORTANT NOTE: Students don't have instituteId in current schema
    // We'll need to either:
    // 1. Add instituteId to Student model, OR
    // 2. Infer from email domain, OR
    // 3. Require it as a parameter

    // For now, let's use the instituteId from query parameter
    // In production, this should be inferred from the student's record or JWT
    const userInstituteId = req.query.instituteId || req.body.instituteId;

    if (!userInstituteId) {
        throw new ApiError(400, "Institute ID is required. Student model needs to be updated to include instituteId reference.");
    }

    // Build search query - if empty, return all books
    const searchQuery = {};
    if (title && title.trim()) {
        searchQuery.title = { $regex: title.trim(), $options: 'i' };
    }
    if (author && author.trim()) {
        searchQuery.author = { $regex: author.trim(), $options: 'i' };
    }

    // Step 1: Search local inventory
    const localResults = await LibraryInventory.find({
        ...searchQuery,
        instituteId: userInstituteId,
        isLocalAvailable: true
    }).populate('instituteId', 'collegeName abbreviation');

    // Step 2: Find partner institutes through active agreements
    const partnerAgreements = await SharedLibraryAgreement.find({
        accessInstituteId: userInstituteId,
        status: 'Active'
    }).select('sharingInstituteId');

    const partnerInstituteIds = partnerAgreements.map(agreement => agreement.sharingInstituteId);

    // Step 3: Search partner inventories (only shareable books)
    const partnerResults = await LibraryInventory.find({
        ...searchQuery,
        instituteId: { $in: partnerInstituteIds },
        isShareable: true
    }).populate('instituteId', 'collegeName abbreviation');

    // Combine results
    const combinedResults = [
        ...localResults.map(book => ({
            ...book.toObject(),
            isLocal: true,
            source: 'Local Library'
        })),
        ...partnerResults.map(book => ({
            ...book.toObject(),
            isLocal: false,
            source: book.instituteId.collegeName,
            partnerInstitute: {
                name: book.instituteId.collegeName,
                abbreviation: book.instituteId.abbreviation
            }
        }))
    ];

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                results: combinedResults,
                localCount: localResults.length,
                partnerCount: partnerResults.length,
                totalCount: combinedResults.length
            },
            "Search completed successfully"
        )
    );
});

/**
 * Generate secure time-limited access token for a book
 * POST /api/v1/library/access/token
 * Role: Student/Authenticated User
 */
export const generateAccessToken = asyncHandler(async (req, res) => {
    const { bookId, instituteId } = req.body;
    const studentId = req.user._id;

    if (!bookId) {
        throw new ApiError(400, "Book ID is required");
    }

    // Find the book
    const book = await LibraryInventory.findOne({ bookId })
        .populate('instituteId', 'collegeName abbreviation');

    if (!book) {
        throw new ApiError(404, "Book not found");
    }

    // Verify access rights
    // If book is from student's institute, allow
    // If book is from partner institute, verify active agreement
    const isLocalBook = book.instituteId._id.toString() === instituteId;

    if (!isLocalBook) {
        // Verify sharing agreement exists and is active
        const hasAccess = await SharedLibraryAgreement.findOne({
            accessInstituteId: instituteId,
            sharingInstituteId: book.instituteId._id,
            status: 'Active'
        });

        if (!hasAccess) {
            throw new ApiError(403, "No active sharing agreement for this resource");
        }

        if (!book.isShareable) {
            throw new ApiError(403, "This book is not available for sharing");
        }
    }

    // Generate time-limited JWT token
    const accessToken = jwt.sign(
        {
            bookId: book.bookId,
            studentId: studentId,
            instituteId: instituteId,
            purpose: 'library_access',
            bookTitle: book.title
        },
        process.env.LIBRARY_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.LIBRARY_TOKEN_EXPIRY || '24h' }
    );

    // Return secure URL with token
    const secureUrl = `${book.accessLink}${book.accessLink.includes('?') ? '&' : '?'}token=${accessToken}`;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                accessToken,
                secureUrl,
                expiresIn: '24 hours',
                book: {
                    bookId: book.bookId,
                    title: book.title,
                    author: book.author,
                    source: isLocalBook ? 'Local Library' : book.instituteId.collegeName
                }
            },
            "Access token generated successfully"
        )
    );
});

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get inventory for Admin's institute (read-only view)
 * GET /api/v1/library/admin/inventory
 * Role: Admin only
 */
export const getAdminInventory = asyncHandler(async (req, res) => {
    const { search, category, isShareable, page = 1, limit = 100 } = req.query;

    // Get Admin's institute ID
    const adminId = req.user._id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    const filter = { instituteId: admin._id };

    if (category) {
        filter.category = category;
    }

    if (isShareable !== undefined) {
        filter.isShareable = isShareable === 'true';
    }

    if (search) {
        filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [inventory, total] = await Promise.all([
        LibraryInventory.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('addedBy', 'firstName lastName email'),
        LibraryInventory.countDocuments(filter)
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                inventory,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            },
            "Inventory fetched successfully"
        )
    );
});

