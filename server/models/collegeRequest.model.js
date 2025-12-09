import mongoose from "mongoose";

const collegeRequestSchema = new mongoose.Schema(
    {
        // College Information
        collegeName: {
            type: String,
            required: true,
            trim: true
        },
        collegeType: {
            type: String,
            required: true,
            enum: ['engineering', 'medical', 'arts', 'commerce', 'law', 'management', 'pharmacy', 'agriculture', 'other']
        },
        establishedYear: {
            type: Number,
            required: true
        },
        affiliation: {
            type: String,
            required: true,
            trim: true
        },
        totalStudents: {
            type: Number,
            default: 0
        },
        totalFaculty: {
            type: Number,
            default: 0
        },
        website: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        recognitionType: {
            type: String,
            required: true,
            enum: ['ugc', 'aicte', 'naac', 'state', 'deemed', 'private', 'other']
        },
        courses: {
            type: String,
            trim: true
        },
        infrastructure: {
            type: String,
            trim: true
        },

        // Address Information
        address: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        pincode: {
            type: String,
            required: true,
            trim: true
        },

        // Admin Contact Information
        adminName: {
            type: String,
            required: true,
            trim: true
        },
        adminDesignation: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        alternatePhone: {
            type: String,
            trim: true
        },

        // Documents (array of document URLs)
        documents: [{
            type: String
        }],

        // Request Status
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        rejectionReason: {
            type: String,
            trim: true
        },

        // Processed by (reference to SuperAdmin)
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SuperAdmin'
        },
        processedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Index for faster queries
collegeRequestSchema.index({ status: 1, createdAt: -1 });
collegeRequestSchema.index({ email: 1 });

export const CollegeRequest = mongoose.model("CollegeRequest", collegeRequestSchema);
