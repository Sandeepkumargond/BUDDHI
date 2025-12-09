import mongoose, { Schema } from "mongoose";

const idCardFormSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            default: "ID Card Application Form"
        },
        academicYear: {
            type: String,
            required: true,
        },
        fee: {
            type: Number,
            required: true,
            default: 100
        },
        instructions: {
            type: String,
            default: "Please fill all the details carefully and upload required documents."
        },
        requiredDocuments: [{
            name: {
                type: String,
                required: true
            },
            description: String
        }],
        isActive: {
            type: Boolean,
            default: true
        },
        deadline: {
            type: Date,
            required: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const idCardApplicationSchema = new Schema(
    {
        formId: {
            type: Schema.Types.ObjectId,
            ref: "IdCardForm",
            required: true
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        enrollmentNo: {
            type: Number,
            required: true
        },
        // Student Details
        fullName: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        },
        fatherName: {
            type: String,
            required: true
        },
        motherName: {
            type: String,
            required: true
        },
        // Contact Details
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        permanentAddress: {
            type: String,
            required: true
        },
        // Academic Details
        course: {
            type: String,
            required: true
        },
        branch: {
            type: String,
            required: true
        },
        semester: {
            type: Number,
            required: true
        },
        academicYear: {
            type: String,
            required: true
        },
        // Documents
        photoUrl: {
            type: String,
            required: true
        },
        signatureUrl: {
            type: String,
            required: true
        },
        uploadedDocuments: [{
            documentName: String,
            documentUrl: String
        }],
        // Payment Details
        paymentId: {
            type: String,
        },
        orderId: {
            type: String,
        },
        paymentAmount: {
            type: Number,
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        paymentDate: {
            type: Date
        },
        // Application Status
        status: {
            type: String,
            enum: ['pending', 'under_review', 'approved', 'printing', 'ready', 'dispatched', 'rejected'],
            default: 'pending'
        },
        statusHistory: [{
            status: {
                type: String,
                enum: ['pending', 'under_review', 'approved', 'printing', 'ready', 'dispatched', 'rejected']
            },
            updatedBy: {
                type: Schema.Types.ObjectId,
                ref: "Admin"
            },
            remarks: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],
        remarks: {
            type: String
        },
        rejectionReason: {
            type: String
        },
        idCardNumber: {
            type: String,
            unique: true,
            sparse: true
        },
        dispatchDate: {
            type: Date
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin"
        },
        reviewedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Index for faster queries
idCardApplicationSchema.index({ studentId: 1, formId: 1 });
idCardApplicationSchema.index({ status: 1 });
idCardApplicationSchema.index({ enrollmentNo: 1 });

export const IdCardForm = mongoose.model("IdCardForm", idCardFormSchema);
export const IdCardApplication = mongoose.model("IdCardApplication", idCardApplicationSchema);
