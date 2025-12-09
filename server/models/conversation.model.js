import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'participants.userModel',
    },
    userModel: {
        type: String,
        required: true,
        enum: ['Alumni', 'Student'],
    },
    lastReadAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

const conversationSchema = new Schema({
    participants: {
        type: [participantSchema],
        validate: {
            validator: function (v) {
                return v.length === 2;
            },
            message: 'Conversation must have exactly 2 participants'
        },
        required: true,
    },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Compound index to ensure unique conversations between two users
conversationSchema.index({
    'participants.userId': 1
}, {
    unique: true,
    partialFilterExpression: { isActive: true }
});

// Index for efficient sorting by last message
conversationSchema.index({ lastMessageAt: -1 });

// Static method to find or create conversation
conversationSchema.statics.findOrCreate = async function (participant1, participant2) {
    // Sort participants to ensure consistent order
    const participants = [participant1, participant2].sort((a, b) =>
        a.userId.toString().localeCompare(b.userId.toString())
    );

    let conversation = await this.findOne({
        'participants.userId': { $all: participants.map(p => p.userId) },
        isActive: true,
    });

    if (!conversation) {
        conversation = await this.create({
            participants,
            lastMessageAt: new Date(),
        });
    }

    return conversation;
};

// Method to get unread count for a specific user
conversationSchema.methods.getUnreadCount = async function (userId) {
    const Message = mongoose.model('Message');
    const count = await Message.countDocuments({
        conversationId: this._id,
        receiverId: userId,
        isRead: false,
        isDeleted: false,
    });
    return count;
};

// Method to get other participant
conversationSchema.methods.getOtherParticipant = function (userId) {
    return this.participants.find(p => p.userId.toString() !== userId.toString());
};

// Method to update last message
conversationSchema.methods.updateLastMessage = async function (messageId) {
    this.lastMessage = messageId;
    this.lastMessageAt = new Date();
    return this.save();
};

export const Conversation = mongoose.model("Conversation", conversationSchema);
