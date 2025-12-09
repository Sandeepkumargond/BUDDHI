import { io } from 'socket.io-client';

// Socket.io client instance
let socket = null;

// Get the Socket.io server URL from environment or default to localhost
const getSocketURL = () => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
        || process.env.NEXT_PUBLIC_SERVER_URL
        || 'http://localhost:5000';
    return baseURL.replace(/\/api\/v1$/, '');
};

// Initialize socket connection
export const initializeSocket = (token) => {
    if (socket) {
        return socket;
    }

    const serverURL = getSocketURL();

    socket = io(serverURL, {
        auth: {
            token: token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    // Connection events
    socket.on('connect', () => {
        console.log('Socket.io connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket.io disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error.message);
    });

    socket.on('error', (error) => {
        console.error('Socket.io error:', error);
    });

    return socket;
};

// Get socket instance
export const getSocket = () => {
    if (!socket) {
        console.warn('Socket not initialized. Call initializeSocket first.');
    }
    return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket.io disconnected');
    }
};

// Socket event emitters
export const joinConversation = (conversationId) => {
    if (socket) {
        socket.emit('join_conversation', { conversationId });
    }
};

export const leaveConversation = (conversationId) => {
    if (socket) {
        socket.emit('leave_conversation', { conversationId });
    }
};

export const sendSocketMessage = (data) => {
    if (socket) {
        socket.emit('send_message', data);
    }
};

export const emitTyping = (conversationId, isTyping) => {
    if (socket) {
        socket.emit('typing', { conversationId, isTyping });
    }
};

export const markSocketMessageAsRead = (messageId, conversationId) => {
    if (socket) {
        socket.emit('mark_as_read', { messageId, conversationId });
    }
};

// Socket event listeners
export const onNewMessage = (callback) => {
    if (socket) {
        socket.on('new_message', callback);
    }
};

export const onMessageNotification = (callback) => {
    if (socket) {
        socket.on('message_notification', callback);
    }
};

export const onUserTyping = (callback) => {
    if (socket) {
        socket.on('user_typing', callback);
    }
};

export const onMessageRead = (callback) => {
    if (socket) {
        socket.on('message_read', callback);
    }
};

// Remove event listeners
export const removeMessageListeners = () => {
    if (socket) {
        socket.off('new_message');
        socket.off('message_notification');
        socket.off('user_typing');
        socket.off('message_read');
    }
};

export default {
    initializeSocket,
    getSocket,
    disconnectSocket,
    joinConversation,
    leaveConversation,
    sendSocketMessage,
    emitTyping,
    markSocketMessageAsRead,
    onNewMessage,
    onMessageNotification,
    onUserTyping,
    onMessageRead,
    removeMessageListeners,
};
