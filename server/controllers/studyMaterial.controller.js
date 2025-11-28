import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import StudyMaterial from "../models/studyMaterial.model.js";
import { uploadStudyMaterial, deleteStudyMaterial } from "../utils/ImageKit.js";
import { Course } from "../models/course.model.js";
import { Faculty } from "../models/faculty.model.js";

// Create/Upload study material (Faculty)
const uploadMaterial = asyncHandler(async (req, res) => {
    console.log('📚 Creating study material - Request body:', req.body);
    console.log('� Academic year received:', req.body.academicYear);
    console.log('�📎 File attached:', req.file ? 'Yes' : 'No');
    
    if (req.file) {
        console.log('📁 File details:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });
    }

    const {
        title,
        description,
        subject,
        courseCode,
        semester,
        branch,
        materialType,
        tags,
        targetAudience,
        expiryDate,
        academicYear,
        difficulty,
        estimatedReadTime,
        language
    } = req.body;

    // Validate required fields
    if (!title || !description || !subject || !courseCode || !semester || !branch || !materialType) {
        throw new ApiError(400, "All required fields must be provided");
    }

    if (!req.file) {
        throw new ApiError(400, "Study material file is required");
    }

    // Parse JSON fields from FormData
    let parsedTags = [];
    let parsedTargetAudience = { semesters: [], branches: [] };

    try {
        if (tags && typeof tags === 'string') {
            parsedTags = JSON.parse(tags);
        }
        if (targetAudience && typeof targetAudience === 'string') {
            parsedTargetAudience = JSON.parse(targetAudience);
        }
    } catch (parseError) {
        console.error('❌ JSON parsing error:', parseError);
        throw new ApiError(400, "Invalid JSON format in form data");
    }

    try {
        // Upload file to ImageKit
        console.log('📤 Uploading study material to ImageKit...');
        const uploadResult = await uploadStudyMaterial(req.file, {
            title,
            subject,
            courseCode,
            semester,
            branch,
            materialType
        });

        if (uploadResult.error) {
            throw new ApiError(500, `File upload failed: ${uploadResult.message}`);
        }

        // Create study material record
        // Generate academic year if not provided
        let finalAcademicYear = academicYear;
        if (!finalAcademicYear || !finalAcademicYear.match(/^\d{4}-\d{2}$/)) {
            const currentYear = new Date().getFullYear();
            const academicStartYear = new Date().getMonth() >= 6 ? currentYear : currentYear - 1;
            const nextYear = academicStartYear + 1;
            finalAcademicYear = `${academicStartYear}-${nextYear.toString().slice(-2)}`;
            console.log('📅 Generated academic year:', finalAcademicYear);
        }

        const materialData = {
            title,
            description,
            subject,
            courseCode,
            semester: parseInt(semester),
            branch,
            materialType,
            fileUrl: uploadResult.url,
            fileName: uploadResult.fileName,
            fileId: uploadResult.fileId,
            fileSize: uploadResult.fileSize,
            fileType: req.file.mimetype,
            uploadedBy: req.user._id,
            tags: parsedTags,
            targetAudience: parsedTargetAudience,
            academicYear: finalAcademicYear,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            metadata: {
                difficulty: difficulty || 'intermediate',
                estimatedReadTime: estimatedReadTime ? parseInt(estimatedReadTime) : undefined,
                language: language || 'English'
            }
        };

        const studyMaterial = new StudyMaterial(materialData);
        await studyMaterial.save();

        // Populate the created material
        await studyMaterial.populate('uploadedBy', 'firstName lastName email');

        console.log('✅ Study material created successfully:', {
            id: studyMaterial._id,
            title: studyMaterial.title,
            fileUrl: studyMaterial.fileUrl
        });

        return res.status(201).json(
            new ApiResponse(201, { material: studyMaterial }, "Study material uploaded successfully")
        );

    } catch (error) {
        console.error('❌ Error creating study material:', error);
        throw new ApiError(500, error.message || "Failed to upload study material");
    }
});

// Get all materials by faculty (Faculty)
const getFacultyMaterials = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        subject,
        materialType,
        semester,
        branch,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = { uploadedBy: req.user._id, isActive: true };

    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (materialType) query.materialType = materialType;
    if (semester) query.semester = parseInt(semester);
    if (branch) query.branch = branch;

    // Search functionality
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const materials = await StudyMaterial.find(query)
        .populate('uploadedBy', 'firstName lastName email')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip);

    const total = await StudyMaterial.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            materials,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }, "Faculty materials retrieved successfully")
    );
});

// Get material by ID (Faculty/Student)
const getMaterialById = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    const material = await StudyMaterial.findById(materialId)
        .populate('uploadedBy', 'firstName lastName email department');

    if (!material) {
        throw new ApiError(404, "Study material not found");
    }

    // Check if user has access (faculty can see their own, students can see active materials)
    const userRole = req.user.role || req.user.constructor.modelName.toLowerCase();
    
    if (userRole === 'faculty' && material.uploadedBy._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied to this material");
    }

    if (userRole === 'student' && !material.isActive) {
        throw new ApiError(404, "Material not available");
    }

    // Increment view count
    await material.incrementViewCount();

    return res.status(200).json(
        new ApiResponse(200, { material }, "Material retrieved successfully")
    );
});

// Update study material (Faculty)
const updateMaterial = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    
    const {
        title,
        description,
        subject,
        courseCode,
        semester,
        branch,
        materialType,
        tags,
        targetAudience,
        expiryDate,
        academicYear,
        difficulty,
        estimatedReadTime,
        language,
        isActive
    } = req.body;

    // Find existing material
    const existingMaterial = await StudyMaterial.findById(materialId);
    if (!existingMaterial) {
        throw new ApiError(404, "Study material not found");
    }

    // Check ownership
    if (existingMaterial.uploadedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to update this material");
    }

    // Parse JSON fields from FormData
    let parsedTags = existingMaterial.tags;
    let parsedTargetAudience = existingMaterial.targetAudience;

    try {
        if (tags && typeof tags === 'string') {
            parsedTags = JSON.parse(tags);
        }
        if (targetAudience && typeof targetAudience === 'string') {
            parsedTargetAudience = JSON.parse(targetAudience);
        }
    } catch (parseError) {
        console.error('❌ JSON parsing error:', parseError);
        throw new ApiError(400, "Invalid JSON format in form data");
    }

    // Prepare update data
    const updateData = {
        title: title || existingMaterial.title,
        description: description || existingMaterial.description,
        subject: subject || existingMaterial.subject,
        courseCode: courseCode || existingMaterial.courseCode,
        semester: semester ? parseInt(semester) : existingMaterial.semester,
        branch: branch || existingMaterial.branch,
        materialType: materialType || existingMaterial.materialType,
        tags: parsedTags,
        targetAudience: parsedTargetAudience,
        academicYear: academicYear || existingMaterial.academicYear,
        expiryDate: expiryDate ? new Date(expiryDate) : existingMaterial.expiryDate,
        isActive: isActive !== undefined ? isActive : existingMaterial.isActive,
        metadata: {
            difficulty: difficulty || existingMaterial.metadata.difficulty,
            estimatedReadTime: estimatedReadTime ? parseInt(estimatedReadTime) : existingMaterial.metadata.estimatedReadTime,
            language: language || existingMaterial.metadata.language
        }
    };

    // Handle file replacement if new file is uploaded
    if (req.file) {
        try {
            console.log('📤 Uploading new file for material update...');
            const uploadResult = await uploadStudyMaterial(req.file, {
                title: updateData.title,
                subject: updateData.subject,
                courseCode: updateData.courseCode,
                semester: updateData.semester,
                branch: updateData.branch,
                materialType: updateData.materialType
            });

            if (uploadResult.error) {
                throw new ApiError(500, `File upload failed: ${uploadResult.message}`);
            }

            // Delete old file from ImageKit
            if (existingMaterial.cloudinaryPublicId) {
                await deleteStudyMaterial(existingMaterial.cloudinaryPublicId);
            }

            // Update file-related fields
            updateData.fileUrl = uploadResult.url;
            updateData.fileName = uploadResult.fileName;
            updateData.fileSize = uploadResult.fileSize;
            updateData.fileType = req.file.mimetype;
            updateData.cloudinaryPublicId = uploadResult.fileId;

            console.log('✅ New file uploaded and old file deleted');
        } catch (uploadError) {
            console.error('❌ File upload failed:', uploadError);
            throw new ApiError(500, `File upload failed: ${uploadError.message}`);
        }
    }

    // Update the material
    const updatedMaterial = await StudyMaterial.findByIdAndUpdate(
        materialId,
        updateData,
        { new: true, runValidators: true }
    ).populate('uploadedBy', 'firstName lastName email');

    console.log('✅ Study material updated successfully:', {
        id: updatedMaterial._id,
        title: updatedMaterial.title
    });

    return res.status(200).json(
        new ApiResponse(200, { material: updatedMaterial }, "Study material updated successfully")
    );
});

// Delete study material (Faculty)
const deleteMaterial = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    const material = await StudyMaterial.findById(materialId);
    if (!material) {
        throw new ApiError(404, "Study material not found");
    }

    // Check ownership
    if (material.uploadedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this material");
    }

    // Delete file from ImageKit
    if (material.cloudinaryPublicId) {
        const deleteResult = await deleteStudyMaterial(material.cloudinaryPublicId);
        if (deleteResult.error) {
            console.warn('⚠️ Failed to delete file from ImageKit:', deleteResult.message);
        }
    }

    // Delete from database
    await StudyMaterial.findByIdAndDelete(materialId);

    console.log('✅ Study material deleted successfully:', {
        id: material._id,
        title: material.title
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Study material deleted successfully")
    );
});

// Download material (increment download count)
const downloadMaterial = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    const material = await StudyMaterial.findById(materialId);
    if (!material) {
        throw new ApiError(404, "Study material not found");
    }

    // Check if material is active
    if (!material.isActive) {
        throw new ApiError(404, "Material not available");
    }

    // Increment download count
    await material.incrementDownloadCount();

    return res.status(200).json(
        new ApiResponse(200, { 
            fileUrl: material.fileUrl,
            fileName: material.fileName,
            fileSize: material.fileSize
        }, "Material download link retrieved")
    );
});

// Get public materials for students
const getPublicMaterials = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        subject,
        materialType,
        semester,
        branch,
        search,
        sortBy = 'publishDate',
        sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query for active materials
    const query = {
        isActive: true,
        $or: [
            { expiryDate: null },
            { expiryDate: { $gt: new Date() } }
        ]
    };

    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (materialType) query.materialType = materialType;
    if (semester) query.semester = parseInt(semester);
    if (branch) query.branch = branch;

    // Search functionality
    if (search) {
        query.$and = query.$and || [];
        query.$and.push({
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ]
        });
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const materials = await StudyMaterial.find(query)
        .populate('uploadedBy', 'firstName lastName')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip)
        .select('-cloudinaryPublicId');

    const total = await StudyMaterial.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            materials,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }, "Public materials retrieved successfully")
    );
});

// Get study material statistics (Faculty)
const getMaterialStats = asyncHandler(async (req, res) => {
    const facultyId = req.user._id;

    try {
        const stats = await StudyMaterial.getStatsByFaculty(facultyId);
        
        // Get recent activities
        const recentMaterials = await StudyMaterial.find({ uploadedBy: facultyId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title createdAt downloadCount viewCount');

        // Get material type distribution
        const materialTypeStats = await StudyMaterial.aggregate([
            { $match: { uploadedBy: facultyId, isActive: true } },
            {
                $group: {
                    _id: '$materialType',
                    count: { $sum: 1 },
                    totalDownloads: { $sum: '$downloadCount' },
                    totalViews: { $sum: '$viewCount' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        return res.status(200).json(
            new ApiResponse(200, {
                stats: stats[0] || {
                    totalMaterials: 0,
                    totalDownloads: 0,
                    totalViews: 0,
                    totalSubjects: 0,
                    materialTypeStats: []
                },
                recentMaterials,
                materialTypeStats
            }, "Material statistics retrieved successfully")
        );

    } catch (error) {
        console.error('❌ Error getting material stats:', error);
        throw new ApiError(500, "Failed to retrieve material statistics");
    }
});

// Get faculty's assigned courses for study material dropdown
const getFacultyCourses = asyncHandler(async (req, res) => {
    const facultyId = req.user?._id;

    const faculty = await Faculty.findById(facultyId)
        .populate('assignedCourses.courseId', 'name code credits semester departmentId');

    if (!faculty) {
        throw new ApiError(404, "Faculty not found");
    }

    const courses = faculty.assignedCourses
        .filter(a => a.isActive)
        .map(a => ({
            _id: a._id,
            course: a.courseId,
            semester: a.semester,
            section: a.section,
            batch: a.batch,
            academicYear: a.academicYear,
            // Format for easy display
            displayText: `${a.courseId.code} - ${a.courseId.name} (Sem ${a.semester}${a.section ? `, Sec ${a.section}` : ''}${a.batch ? `, Batch ${a.batch}` : ''})`
        }))
        .sort((a, b) => a.semester - b.semester);

    return res.status(200).json(
        new ApiResponse(200, { courses }, "Faculty courses fetched successfully")
    );
});

export {
    uploadMaterial,
    getFacultyMaterials,
    getFacultyCourses,
    getMaterialById,
    updateMaterial,
    deleteMaterial,
    downloadMaterial,
    getPublicMaterials,
    getMaterialStats
};