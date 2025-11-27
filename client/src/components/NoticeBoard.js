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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-l-red-500';
      case 'high': return 'bg-orange-100 border-l-orange-500';
      case 'normal': return 'bg-blue-100 border-l-blue-500';
      case 'low': return 'bg-green-100 border-l-green-500';
      default: return 'bg-gray-100 border-l-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'academic': return '📚';
      case 'examination': return '📝';
      case 'event': return '🎉';
      case 'holiday': return '🏖️';
      case 'urgent': return '🚨';
      case 'admission': return '🎓';
      default: return '📢';
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

  const truncateText = (text, maxLength = 80) => {
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
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span>📋</span>
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
              <div className="bg-gray-200 rounded-md p-4 border-l-4 border-l-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
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
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notices.map((notice, index) => (
            <div
              key={notice._id}
              className={`${getPriorityColor(notice.priority)} rounded-md p-4 border-l-4 hover:shadow-sm transition-shadow cursor-pointer relative`}
            >
              {notice.isPinned && (
                <div className="absolute top-2 right-2">
                  <span className="text-purple-600 text-sm" title="Pinned">📌</span>
                </div>
              )}
              
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 pr-6">
                  <span className="text-sm">{getCategoryIcon(notice.category)}</span>
                  <h2 className="font-medium text-gray-900 text-sm line-clamp-1">
                    {notice.title}
                  </h2>
                  {notice.priority === 'urgent' && (
                    <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                      URGENT
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 bg-white rounded px-2 py-1 whitespace-nowrap">
                  {formatDate(notice.publishDate)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                {truncateText(notice.content)}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {notice.viewCount || 0}
                  </span>
                  <span>For: {notice.audience}</span>
                  {notice.attachmentUrl && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Attachment
                    </span>
                  )}
                </div>
                <Link
                  href={`/admin/notices/${notice._id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Running notices ticker for urgent notices */}
      {notices.some(notice => notice.priority === 'urgent') && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-2">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-medium text-xs">URGENT:</span>
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap text-red-700 text-xs">
                {notices
                  .filter(notice => notice.priority === 'urgent')
                  .map(notice => notice.title)
                  .join(' • ')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;