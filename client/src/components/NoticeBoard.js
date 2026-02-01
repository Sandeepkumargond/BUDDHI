"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import Link from "next/link";

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLatestNotices();
  }, []);

  const fetchLatestNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch latest 5 active notices, prioritizing pinned ones
      const response = await apiService.request('/notices?limit=5&isActive=true&sortBy=createdAt&sortOrder=desc');
      
      if (response.success && response.data) {
        // Sort notices to show pinned ones first, then by creation date
        const sortedNotices = (response.data.notices || []).sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setNotices(sortedNotices);
      } else {
        setError('No notices available');
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError(err.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (error) {
    return (
      <div className="bg-white p-4 rounded-md border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Notice Board</h1>
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">Failed to load notices</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Notice Board
        </h1>
        <Link 
          href="/admin/notices"
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No notices available</p>
          <Link
            href="/admin/notices/create"
            className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            Create first notice
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 text-sm flex-1 pr-4">
                  {notice.title}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(notice.publishDate)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                {truncateText(notice.content)}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  For: {notice.audience}
                </span>
                <Link
                  href={`/admin/notices/${notice._id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
