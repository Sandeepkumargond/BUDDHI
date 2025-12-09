import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import PYQ from "../models/pyq.model.js";
import { uploadStudyMaterial, deleteStudyMaterial } from "../utils/ImageKit.js";

// Upload PYQ (SubAdmin only)
const uploadPYQ = asyncHandler(async (req, res) => {
    console.log('📝 Uploading PYQ - Request body:', req.body);
    console.log('📎 File attached:', req.file ? 'Yes' : 'No');
    
    if (req.file) {
        console.log('📁 File details:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
    }

    const { department, semester, year, subject } = req.body;

    // Validate required fields
    if (!department || !semester || !year || !subject) {
        throw new ApiError(400, "All fields (department, semester, year, subject) are required");
    }

    if (!req.file) {
        throw new ApiError(400, "PDF file is required");
    }

    // Validate file type (must be PDF)
    if (req.file.mimetype !== 'application/pdf') {
        throw new ApiError(400, "Only PDF files are allowed");
    }

    // Validate year format
    if (!year.match(/^\d{4}$/)) {
        throw new ApiError(400, "Year must be a valid 4-digit year (e.g., 2024)");
    }

    // Validate semester
    const semesterNum = parseInt(semester);
    if (semesterNum < 1 || semesterNum > 8) {
        throw new ApiError(400, "Semester must be between 1 and 8");
    }

    try {
        // Upload PDF to ImageKit
        console.log('📤 Uploading PYQ PDF to ImageKit...');
        const uploadResult = await uploadStudyMaterial(req.file, {
            title: `PYQ - ${subject} - ${year}`,
            subject,
            semester: semesterNum,
            branch: department,
            materialType: 'PYQ'
        });

        if (uploadResult.error) {
            throw new ApiError(500, `File upload failed: ${uploadResult.message}`);
        }

        // Create PYQ record
        const pyqData = {
            department,
            semester: semesterNum,
            year,
            subject: subject.trim(),
            pdfUrl: uploadResult.url,
            pdfPublicId: uploadResult.fileId,
            uploadedBy: req.user._id,
            uploadedByName: req.user.name || req.user.email
        };

        const pyq = await PYQ.create(pyqData);

        console.log('✅ PYQ uploaded successfully:', pyq._id);

        return res.status(201).json(
            new ApiResponse(201, pyq, "PYQ uploaded successfully")
        );

    } catch (error) {
        console.error('❌ Error uploading PYQ:', error);
        throw new ApiError(500, error.message || "Failed to upload PYQ");
    }
});

// Get all PYQs with filters (Students and SubAdmin)
const getAllPYQs = asyncHandler(async (req, res) => {
    const { department, semester, year, subject } = req.query;

    console.log('🔍 Fetching PYQs with filters:', { department, semester, year, subject });

    // Build filter object
    const filter = {};
    
    if (department) {
        filter.department = department;
    }
    
    if (semester) {
        filter.semester = parseInt(semester);
    }
    
    if (year) {
        filter.year = year;
    }
    
    if (subject) {
        // Case-insensitive partial match for subject
        filter.subject = { $regex: subject, $options: 'i' };
    }

    try {
        // Fetch PYQs with filters, sorted by newest first
        const pyqs = await PYQ.find(filter)
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        console.log(`✅ Found ${pyqs.length} PYQs`);

        return res.status(200).json(
            new ApiResponse(200, {
                pyqs,
                count: pyqs.length
            }, "PYQs fetched successfully")
        );

    } catch (error) {
        console.error('❌ Error fetching PYQs:', error);
        throw new ApiError(500, "Failed to fetch PYQs");
    }
});

// Get unique filter values for dropdowns
const getPYQFilters = asyncHandler(async (req, res) => {
    try {
        // Get distinct values for each filter field
        const [departments, semesters, years, subjects] = await Promise.all([
            PYQ.distinct('department'),
            PYQ.distinct('semester'),
            PYQ.distinct('year'),
            PYQ.distinct('subject')
        ]);

        const filters = {
            departments: departments.sort(),
            semesters: semesters.sort((a, b) => a - b),
            years: years.sort((a, b) => b.localeCompare(a)), // Latest year first
            subjects: subjects.sort()
        };

        console.log('✅ Filter values fetched successfully');

        return res.status(200).json(
            new ApiResponse(200, filters, "Filter values fetched successfully")
        );

    } catch (error) {
        console.error('❌ Error fetching filter values:', error);
        throw new ApiError(500, "Failed to fetch filter values");
    }
});

// Delete PYQ (SubAdmin only)
const deletePYQ = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "PYQ ID is required");
    }

    try {
        // Find PYQ
        const pyq = await PYQ.findById(id);

        if (!pyq) {
            throw new ApiError(404, "PYQ not found");
        }

        // Delete file from ImageKit
        console.log('🗑️ Deleting PYQ file from ImageKit...');
        try {
            await deleteStudyMaterial(pyq.pdfPublicId);
        } catch (deleteError) {
            console.error('⚠️ Warning: Failed to delete file from ImageKit:', deleteError);
            // Continue with database deletion even if ImageKit deletion fails
        }

        // Delete PYQ from database
        await PYQ.findByIdAndDelete(id);

        console.log('✅ PYQ deleted successfully:', id);

        return res.status(200).json(
            new ApiResponse(200, null, "PYQ deleted successfully")
        );

    } catch (error) {
        console.error('❌ Error deleting PYQ:', error);
        throw new ApiError(500, error.message || "Failed to delete PYQ");
    }
});

// Get PYQ by ID
const getPYQById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "PYQ ID is required");
    }

    try {
        const pyq = await PYQ.findById(id)
            .populate('uploadedBy', 'name email')
            .lean();

        if (!pyq) {
            throw new ApiError(404, "PYQ not found");
        }

        console.log('✅ PYQ fetched successfully:', id);

        return res.status(200).json(
            new ApiResponse(200, pyq, "PYQ fetched successfully")
        );

    } catch (error) {
        console.error('❌ Error fetching PYQ:', error);
        throw new ApiError(500, error.message || "Failed to fetch PYQ");
    }
});

export {
    uploadPYQ,
    getAllPYQs,
    getPYQFilters,
    deletePYQ,
    getPYQById
};
