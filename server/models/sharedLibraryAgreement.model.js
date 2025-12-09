import mongoose, { Schema } from "mongoose";

const sharedLibraryAgreementSchema = new Schema(
    {
        agreementId: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        sharingInstituteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        accessInstituteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        sharingPolicy: {
            type: String,
            enum: ['Full E-Book Catalogue', 'Only Tier 1 Resources', 'Selected Resources'],
            default: 'Selected Resources',
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
    },
    { timestamps: true }
);

// Compound indexes for efficient lookup
sharedLibraryAgreementSchema.index({ accessInstituteId: 1, status: 1 });
sharedLibraryAgreementSchema.index({ sharingInstituteId: 1, status: 1 });

// Ensure no duplicate agreements between same institutes
sharedLibraryAgreementSchema.index({ sharingInstituteId: 1, accessInstituteId: 1 }, { unique: true });

export const SharedLibraryAgreement = mongoose.model("SharedLibraryAgreement", sharedLibraryAgreementSchema);
