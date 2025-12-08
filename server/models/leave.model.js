import mongoose, { Schema } from "mongoose";

const leaveSchema = new Schema({
    applicantId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'applicantType',
    },
    applicantType: {
        type: String,
        required: true,
        enum: ['Student', 'Faculty'],
    },
    applicantName: {
        type: String,
        required: true,
    },
    applicantEmail: {
        type: String,
        required: true,
    },
    leaveType: {
        type: String,
        required: true,
        enum: ['sick', 'casual', 'emergency', 'personal', 'academic', 'other'],
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    numberOfDays: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    proofDocument: {
        type: String, // URL to uploaded document
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    adminRemarks: {
        type: String,
        trim: true,
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
    },
    reviewedAt: {
        type: Date,
    },
}, { timestamps: true });

// Index for faster queries
leaveSchema.index({ applicantId: 1, applicantType: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

export const Leave = mongoose.model("Leave", leaveSchema);
