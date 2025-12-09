'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api';
import {
    initializeSocket,
    getSocket,
    joinConversation,
    leaveConversation,
    sendSocketMessage,
    onNewMessage,
    onMessageNotification,
    removeMessageListeners
} from '@/lib/socket';

export const useMessages = (user) => {
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize socket connection
    useEffect(() => {
        if (user?.accessToken) {
            try {
                initializeSocket(user.accessToken);
            } catch (err) {
                console.error('Failed to initialize socket:', err);
            }
        }
    }, [user]);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiService.getConversations();
            setConversations(response.data || []);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch messages for a conversation
    const fetchMessages = useCallback(async (conversationId) => {
        if (!conversationId) return;

        try {
            setLoading(true);
            const response = await apiService.getConversationMessages(conversationId);
            setMessages(response.data?.messages || []);
            setCurrentConversation(conversationId);

            // Join conversation room
            joinConversation(conversationId);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Send a message
    const sendMessage = useCallback(async (receiverId, receiverModel, content) => {
        if (!content.trim()) return;

        try {
            setSending(true);
            const response = await apiService.sendMessage(receiverId, receiverModel, content);

            // Add message to current conversation if it matches
            if (response.data?.conversationId === currentConversation) {
                setMessages(prev => [...prev, response.data.message]);
            }

            // Emit via socket for real-time delivery
            sendSocketMessage({
                conversationId: response.data.conversationId,
                content,
                receiverId,
                receiverModel,
            });

            // Refresh conversations to update last message
            fetchConversations();

            setError(null);
            return response.data;
        } catch (err) {
            setError(err.message);
            console.error('Error sending message:', err);
            throw err;
        } finally {
            setSending(false);
        }
    }, [currentConversation, fetchConversations]);

    // Start a new conversation
    const startConversation = useCallback(async (receiverId, receiverModel, initialMessage) => {
        try {
            const response = await sendMessage(receiverId, receiverModel, initialMessage);
            if (response?.conversationId) {
                await fetchMessages(response.conversationId);
                await fetchConversations();
            }
            return response;
        } catch (err) {
            console.error('Error starting conversation:', err);
            throw err;
        }
    }, [sendMessage, fetchMessages, fetchConversations]);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await apiService.getUnreadMessageCount();
            setUnreadCount(response.data?.count || 0);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    }, []);

    // Listen for new messages
    useEffect(() => {
        const handleNewMessage = (data) => {
            if (data.conversationId === currentConversation) {
                setMessages(prev => {
                    // Avoid duplicates
                    const exists = prev.some(m => m._id === data.message._id);
                    if (exists) return prev;
                    return [...prev, data.message];
                });
            }

            // Update conversations list
            fetchConversations();
        };

        const handleMessageNotification = (data) => {
            // Refresh conversations and unread count
            fetchConversations();
            fetchUnreadCount();
        };

        onNewMessage(handleNewMessage);
        onMessageNotification(handleMessageNotification);

        return () => {
            removeMessageListeners();
        };
    }, [currentConversation, fetchConversations, fetchUnreadCount]);

    // Leave conversation when switching
    useEffect(() => {
        return () => {
            if (currentConversation) {
                leaveConversation(currentConversation);
            }
        };
    }, [currentConversation]);

    // Initial load
    useEffect(() => {
        fetchConversations();
        fetchUnreadCount();
    }, [fetchConversations, fetchUnreadCount]);

    return {
        conversations,
        messages,
        currentConversation,
        loading,
        sending,
        error,
        unreadCount,
        fetchConversations,
        fetchMessages,
        sendMessage,
        startConversation,
        setCurrentConversation,
    };
};
