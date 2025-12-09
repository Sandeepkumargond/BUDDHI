import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from './models/message.model.js';
import { Conversation } from './models/conversation.model.js';
import { Student } from './models/student.model.js';
import { Alumni } from './models/alumni.model.js';

let io = null;

// Initialize Socket.io server
export const initializeSocket = (httpServer) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);

    io = new SocketServer(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });

    // Authentication middleware for socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return next(new Error('Authentication token required'));
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            // Find user (try both Alumni and Student)
            let user = await Alumni.findById(decoded._id).select('_id firstName lastName email role');
            if (!user) {
                user = await Student.findById(decoded._id).select('_id firstName lastName email role');
            }

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.userId = user._id.toString();
            socket.userRole = user.role;
            socket.user = user;

            next();
        } catch (error) {
            console.error('Socket authentication error:', error.message);
            next(new Error('Authentication failed'));
        }
    });

    // Connection event
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId} (${socket.userRole})`);

        // Join user's personal room for notifications
        socket.join(`user:${socket.userId}`);

        // Join a conversation room
        socket.on('join_conversation', async ({ conversationId }) => {
            try {
                // Verify user is part of the conversation
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    'participants.userId': socket.userId,
                });

                if (conversation) {
                    socket.join(`conversation:${conversationId}`);
                    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
                } else {
                    socket.emit('error', { message: 'Conversation not found' });
                }
            } catch (error) {
                console.error('Error joining conversation:', error);
                socket.emit('error', { message: 'Failed to join conversation' });
            }
        });

        // Leave a conversation room
        socket.on('leave_conversation', ({ conversationId }) => {
            socket.leave(`conversation:${conversationId}`);
            console.log(`User ${socket.userId} left conversation ${conversationId}`);
        });

        // Send message event
        socket.on('send_message', async (data) => {
            try {
                const { conversationId, content, receiverId, receiverModel } = data;
                const senderId = socket.userId;
                const senderModel = socket.userRole === 'alumni' ? 'Alumni' : 'Student';

                // Verify conversation
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    'participants.userId': senderId,
                });

                if (!conversation) {
                    return socket.emit('error', { message: 'Conversation not found' });
                }

                // Create message
                const message = await Message.create({
                    conversationId,
                    senderId,
                    senderModel,
                    receiverId,
                    receiverModel,
                    content,
                    messageType: 'text',
                });

                // Update conversation
                await conversation.updateLastMessage(message._id);

                // Populate sender details
                const populatedMessage = await Message.findById(message._id)
                    .populate('senderId', 'firstName lastName imageUrl')
                    .lean();

                // Emit to conversation room
                io.to(`conversation:${conversationId}`).emit('new_message', {
                    message: populatedMessage,
                    conversationId,
                });

                // Emit notification to receiver's personal room
                io.to(`user:${receiverId}`).emit('message_notification', {
                    conversationId,
                    message: populatedMessage,
                    sender: socket.user,
                });

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing', ({ conversationId, isTyping }) => {
            socket.to(`conversation:${conversationId}`).emit('user_typing', {
                userId: socket.userId,
                isTyping,
            });
        });

        // Mark message as read
        socket.on('mark_as_read', async ({ messageId, conversationId }) => {
            try {
                const message = await Message.findOne({
                    _id: messageId,
                    receiverId: socket.userId,
                });

                if (message && !message.isRead) {
                    await message.markAsRead();

                    // Notify sender
                    io.to(`conversation:${conversationId}`).emit('message_read', {
                        messageId,
                        readAt: message.readAt,
                    });
                }
            } catch (error) {
                console.error('Error marking message as read:', error);
            }
        });

        // Disconnect event
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    console.log('Socket.io initialized');
    return io;
};

// Get Socket.io instance
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

export default { initializeSocket, getIO };
