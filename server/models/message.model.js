import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true,
    },
    senderId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel',
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['Alumni', 'Student'],
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'receiverModel',
    },
    receiverModel: {
        type: String,
        required: true,
        enum: ['Alumni', 'Student'],
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
    },
    messageType: {
        type: String,
        enum: ['text', 'file', 'system'],
        default: 'text',
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        mimeType: String,
    }],
    isRead: {
        type: Boolean,
        default: false,
        index: true,
    },
    readAt: {
        type: Date,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
    },
}, { timestamps: true });

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

// Mark message as read
messageSchema.methods.markAsRead = function () {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Soft delete
messageSchema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};

export const Message = mongoose.model("Message", messageSchema);
