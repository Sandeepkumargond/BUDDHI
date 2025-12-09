import mongoose, { Schema } from "mongoose";

const libraryInventorySchema = new Schema(
    {
        bookId: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        author: {
            type: String,
            required: true,
            trim: true,
        },
        isLocalAvailable: {
            type: Boolean,
            default: true,
        },
        isShareable: {
            type: Boolean,
            default: false,
        },
        instituteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
            index: true,
        },
        accessLink: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['E-Book', 'Journal', 'Research Paper', 'Reference Material'],
            default: 'E-Book',
        },
        isbn: {
            type: String,
            trim: true,
        },
        publicationYear: {
            type: Number,
        },
        publisher: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubAdmin',
        },
    },
    { timestamps: true }
);

// Compound indexes for efficient search
libraryInventorySchema.index({ instituteId: 1, isShareable: 1 });
libraryInventorySchema.index({ title: 'text', author: 'text' });

export const LibraryInventory = mongoose.model("LibraryInventory", libraryInventorySchema);
