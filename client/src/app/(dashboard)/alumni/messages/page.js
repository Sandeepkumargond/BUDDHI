'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { apiService } from '@/lib/api';

export default function AlumniMessagesPage() {
    const { user } = useAuth();
    const {
        conversations,
        messages,
        currentConversation,
        loading,
        sending,
        fetchMessages,
        sendMessage,
        startConversation,
    } = useMessages(user);

    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Search for students
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            const response = await apiService.searchUsers('student', query);
            setSearchResults(response.data || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    // Select a conversation
    const handleSelectConversation = (conv) => {
        setSelectedConversation(conv);
        setShowSearch(false);
        fetchMessages(conv._id);
    };

    // Start new conversation with a student
    const handleStartConversation = async (student) => {
        try {
            const message = `Hi ${student.firstName}, I'd like to connect with you.`;
            await startConversation(student._id, 'Student', message);
            setShowSearch(false);
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversation) return;

        try {
            await sendMessage(
                selectedConversation.otherParticipant._id,
                selectedConversation.otherParticipant.userModel,
                messageInput
            );
            setMessageInput('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Format timestamp
    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                    <div className="flex h-full">
                        {/* Conversations Sidebar */}
                        <div className="w-1/3 border-r border-gray-200 flex flex-col">
                            {/* Search Header */}
                            <div className="p-4 border-b border-gray-200">
                                <button
                                    onClick={() => setShowSearch(!showSearch)}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {showSearch ? 'View Conversations' : 'New Message'}
                                </button>

                                {showSearch && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            placeholder="Search students..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Conversations or Search Results List */}
                            <div className="flex-1 overflow-y-auto">
                                {showSearch ? (
                                    // Search Results
                                    <div className="p-2">
                                        {searching && <div className="text-center py-4 text-gray-500">Searching...</div>}
                                        {!searching && searchResults.length === 0 && searchQuery.length >= 2 && (
                                            <div className="text-center py-4 text-gray-500">No students found</div>
                                        )}
                                        {searchResults.map((student) => (
                                            <div
                                                key={student._id}
                                                onClick={() => handleStartConversation(student)}
                                                className="p-3 hover:bg-gray-100 cursor-pointer rounded-lg mb-2 transition-colors"
                                            >
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                                        {student.firstName?.[0]}{student.lastName?.[0]}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900">
                                                            {student.firstName} {student.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {student.branch} • Sem {student.semester}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // Conversations List
                                    <div className="p-2">
                                        {loading && <div className="text-center py-4 text-gray-500">Loading...</div>}
                                        {!loading && conversations.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <p>No conversations yet</p>
                                                <p className="text-sm mt-2">Click &quot;New Message&quot; to start chatting</p>
                                            </div>
                                        )}
                                        {conversations.map((conv) => (
                                            <div
                                                key={conv._id}
                                                onClick={() => handleSelectConversation(conv)}
                                                className={`p-3 cursor-pointer rounded-lg mb-2 transition-colors ${selectedConversation?._id === conv._id ? 'bg-blue-50' : 'hover:bg-gray-100'
                                                    }`}
                                            >
                                                <div className="flex items-start">
                                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3 flex-shrink-0">
                                                        {conv.otherParticipant?.firstName?.[0]}{conv.otherParticipant?.lastName?.[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-baseline">
                                                            <div className="font-semibold text-gray-900 truncate">
                                                                {conv.otherParticipant?.firstName} {conv.otherParticipant?.lastName}
                                                            </div>
                                                            <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                                                {formatTime(conv.lastMessageAt)}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-600 truncate">
                                                            {conv.lastMessage?.content || 'No messages yet'}
                                                        </div>
                                                        {conv.unreadCount > 0 && (
                                                            <div className="mt-1">
                                                                <span className="inline-block bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                                    {conv.unreadCount} new
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col">
                            {selectedConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-gray-200 bg-white">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                                {selectedConversation.otherParticipant?.firstName?.[0]}
                                                {selectedConversation.otherParticipant?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    {selectedConversation.otherParticipant?.firstName} {selectedConversation.otherParticipant?.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {selectedConversation.otherParticipant?.branch} • Sem {selectedConversation.otherParticipant?.semester}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                        {messages.map((msg) => {
                                            const isSent = msg.senderId._id === user?._id || msg.senderId === user?._id;
                                            return (
                                                <div key={msg._id} className={`mb-4 flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-xs lg:max-w-md ${isSent ? 'order-2' : 'order-1'}`}>
                                                        <div
                                                            className={`px-4 py-2 rounded-lg ${isSent ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'
                                                                } shadow`}
                                                        >
                                                            {msg.content}
                                                        </div>
                                                        <div className={`text-xs text-gray-500 mt-1 ${isSent ? 'text-right' : 'text-left'}`}>
                                                            {formatTime(msg.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 bg-white border-t border-gray-200">
                                        <form onSubmit={handleSendMessage} className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                placeholder="Type a message..."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                disabled={sending}
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || !messageInput.trim()}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {sending ? 'Sending...' : 'Send'}
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center bg-gray-50">
                                    <div className="text-center text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <p className="text-lg">Select a conversation to start messaging</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
