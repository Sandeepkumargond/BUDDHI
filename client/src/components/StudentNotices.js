"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import Link from "next/link";

const StudentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentNotices = async () => {
      try {
        setLoading(true);
        // 1) Get current student profile for filtering
        const profileRes = await apiService.getProfile('student');
        const student = profileRes?.data?.user || {};

        // 2) Get active student-targeted notices
        const response = await apiService.request('/notices/public?audience=students&limit=50&sort=latest', { method: 'GET', silent: true });
        const allNotices = response?.data?.notices || [];

        // 3) Keep only faculty-created notices relevant to this student
        const filtered = allNotices.filter(n => {
          if (n.createdByModel !== 'Faculty') return false; // only faculty notices here

          // Match by branch/semester/section if present on notice
          if (n.branch && student.branch && n.branch !== student.branch) return false;
          if (typeof n.semester === 'number' && typeof student.semester === 'number' && n.semester !== student.semester) return false;
          if (n.section && student.section && n.section !== student.section) return false;

          // If no targeting fields set, assume it's broadly relevant to students
          return true;
        })
        .slice(0, 5);

        setNotices(filtered);
      } catch (err) {
        console.error('Error fetching notices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentNotices();
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-700',
      academic: 'bg-purple-100 text-purple-700',
      examination: 'bg-orange-100 text-orange-700',
      event: 'bg-pink-100 text-pink-700',
      holiday: 'bg-green-100 text-green-700',
      urgent: 'bg-red-100 text-red-700',
      admission: 'bg-indigo-100 text-indigo-700'
    };
    return colors[category] || colors.general;
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
        <h1 className="text-xl font-semibold">Recent Notices</h1>
        <Link 
          href="/student/notices"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      {notices.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(notice.category)}`}>
                      {notice.category.charAt(0).toUpperCase() + notice.category.slice(1)}
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
                      <span>Attachment</span>
                    )}
                  </div>
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