import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import { Student } from "../models/student.model.js";
import { Alumni } from "../models/alumni.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get all conversations for the current user
export const getMyConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userModel = req.user.role === 'alumni' ? 'Alumni' : 'Student';

    const conversations = await Conversation.find({
        'participants.userId': userId,
        isActive: true,
    })
        .sort({ lastMessageAt: -1 })
        .populate('lastMessage')
        .lean();

    // Populate other participant details
    const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
            const otherParticipant = conv.participants.find(
                p => p.userId.toString() !== userId.toString()
            );

            let participantDetails = null;
            if (otherParticipant.userModel === 'Alumni') {
                participantDetails = await Alumni.findById(otherParticipant.userId)
                    .select('firstName lastName email imageUrl currentCompany currentDesignation')
                    .lean();
            } else {
                participantDetails = await Student.findById(otherParticipant.userId)
                    .select('firstName lastName email imageUrl branch semester')
                    .lean();
            }

            // Get unread count
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                receiverId: userId,
                isRead: false,
                isDeleted: false,
            });

            return {
                ...conv,
                otherParticipant: {
                    ...participantDetails,
                    userModel: otherParticipant.userModel,
                },
                unreadCount,
            };
        })
    );

    return res.status(200).json(
        new ApiResponse(200, conversationsWithDetails, "Conversations retrieved successfully")
    );
});

// Get messages in a specific conversation
export const getConversationMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
        _id: conversationId,
        'participants.userId': userId,
    });

    if (!conversation) {
        throw new ApiError(404, "Conversation not found");
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
        conversationId,
        isDeleted: false,
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'firstName lastName imageUrl')
        .lean();

    const total = await Message.countDocuments({
        conversationId,
        isDeleted: false,
    });

    // Mark received messages as read
    await Message.updateMany(
        {
            conversationId,
            receiverId: userId,
            isRead: false,
        },
        {
            $set: {
                isRead: true,
                readAt: new Date(),
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(200, {
            messages: messages.reverse(), // Return in chronological order
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        }, "Messages retrieved successfully")
    );
});

// Send a message
export const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, receiverModel, content, attachments } = req.body;
    const senderId = req.user._id;
    const senderModel = req.user.role === 'alumni' ? 'Alumni' : 'Student';

    if (!receiverId || !receiverModel || !content) {
        throw new ApiError(400, "Receiver and content are required");
    }

    if (!['Alumni', 'Student'].includes(receiverModel)) {
        throw new ApiError(400, "Invalid receiver model");
    }

    // Verify receiver exists
    const ReceiverModel = receiverModel === 'Alumni' ? Alumni : Student;
    const receiver = await ReceiverModel.findById(receiverId);
    if (!receiver) {
        throw new ApiError(404, "Receiver not found");
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreate(
        { userId: senderId, userModel: senderModel },
        { userId: receiverId, userModel: receiverModel }
    );

    // Create message
    const message = await Message.create({
        conversationId: conversation._id,
        senderId,
        senderModel,
        receiverId,
        receiverModel,
        content,
        attachments: attachments || [],
    });

    // Update conversation's last message
    await conversation.updateLastMessage(message._id);

    // Populate sender details
    const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'firstName lastName imageUrl')
        .lean();

    return res.status(201).json(
        new ApiResponse(201, {
            message: populatedMessage,
            conversationId: conversation._id,
        }, "Message sent successfully")
    );
});

// Mark message as read
export const markMessageAsRead = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
        _id: messageId,
        receiverId: userId,
    });

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    if (!message.isRead) {
        await message.markAsRead();
    }

    return res.status(200).json(
        new ApiResponse(200, message, "Message marked as read")
    );
});

// Mark all messages in conversation as read
export const markConversationAsRead = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
        _id: conversationId,
        'participants.userId': userId,
    });

    if (!conversation) {
        throw new ApiError(404, "Conversation not found");
    }

    const result = await Message.updateMany(
        {
            conversationId,
            receiverId: userId,
            isRead: false,
        },
        {
            $set: {
                isRead: true,
                readAt: new Date(),
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(200, { modifiedCount: result.modifiedCount }, "Messages marked as read")
    );
});

// Delete a message
export const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
        _id: messageId,
        senderId: userId,
    });

    if (!message) {
        throw new ApiError(404, "Message not found or you don't have permission to delete it");
    }

    await message.softDelete();

    return res.status(200).json(
        new ApiResponse(200, null, "Message deleted successfully")
    );
});

// Search users (alumni or students)
export const searchUsers = asyncHandler(async (req, res) => {
    const { role, query } = req.query;
    const currentUserId = req.user._id;

    if (!role || !['alumni', 'student'].includes(role)) {
        throw new ApiError(400, "Valid role (alumni or student) is required");
    }

    const UserModel = role === 'alumni' ? Alumni : Student;
    const searchRegex = new RegExp(query || '', 'i');

    const users = await UserModel.find({
        _id: { $ne: currentUserId }, // Exclude current user
        $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
        ],
        ...(role === 'alumni' ? { isVerified: true, isActive: true } : { accountStatus: 'approved' })
    })
        .select('firstName lastName email imageUrl currentCompany currentDesignation branch semester')
        .limit(20)
        .lean();

    return res.status(200).json(
        new ApiResponse(200, users, "Users retrieved successfully")
    );
});

// Get unread message count
export const getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const count = await Message.countDocuments({
        receiverId: userId,
        isRead: false,
        isDeleted: false,
    });

    return res.status(200).json(
        new ApiResponse(200, { count }, "Unread count retrieved successfully")
    );
});
