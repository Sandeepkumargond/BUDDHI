"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import Link from "next/link";

const StudentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentNotices();
  }, []);

  const fetchRecentNotices = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/notices/public?limit=5&sort=latest');
      
      if (response.success && response.data) {
        setNotices(response.data.notices || []);
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: '📢',
      academic: '📚',
      examination: '📝',
      event: '🎉',
      holiday: '🏖️',
      urgent: '🚨',
      admission: '🎓'
    };
    return icons[category] || '📢';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600',
      normal: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || colors.normal;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md">
        <h1 className="text-xl font-semibold mb-4">📢 Recent Notices</h1>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">📢 Recent Notices</h1>
        <Link 
          href="/student/notices"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      {notices.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No notices available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <Link
              key={notice._id}
              href={`/student/notices/${notice._id}`}
              className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getCategoryIcon(notice.category)}</span>
                    {notice.isPinned && (
                      <span className="text-purple-600 text-xs">📌</span>
                    )}
                    <span className={`text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                      {notice.priority.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                    {notice.title.length > 50 
                      ? `${notice.title.substring(0, 50)}...` 
                      : notice.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {notice.content.length > 80 
                      ? `${notice.content.substring(0, 80)}...` 
                      : notice.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatDate(notice.publishDate || notice.createdAt)}</span>
                    {notice.attachmentUrl && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Attachment
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotices;