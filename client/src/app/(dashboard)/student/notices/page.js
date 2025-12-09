"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import Link from "next/link";

export default function StudentNoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    search: ''
  });

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'general', label: 'General', icon: '' },
    { value: 'academic', label: 'Academic', icon: '' },
    { value: 'examination', label: 'Examination', icon: '' },
    { value: 'event', label: 'Event', icon: '' },
    { value: 'holiday', label: 'Holiday', icon: '' },
    { value: 'urgent', label: 'Urgent', icon: '' },
    { value: 'admission', label: 'Admission', icon: '' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'normal', label: 'Normal', color: 'yellow' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  useEffect(() => {
    fetchNotices();
  }, [filters]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await apiService.request(`/notices/public?${queryParams.toString()}`);
      
      if (response.success && response.data) {
        setNotices(response.data.notices || []);
      } else {
        throw new Error(response.message || 'Failed to fetch notices');
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: '',
      academic: '',
      examination: '',
      event: '',
      holiday: '',
      urgent: '',
      admission: ''
    };
    return icons[category] || '';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      normal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority] || colors.normal;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiryDate) => {
    return expiryDate && new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notice Board</h1>
        <p className="text-gray-600 mt-1">Stay updated with the latest announcements and important information</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search notices..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Notices List */}
      {notices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notices found</h3>
          <p className="text-gray-600">
            {filters.search || filters.category || filters.priority 
              ? "Try adjusting your filters to see more notices." 
              : "There are no notices available at the moment."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className={`bg-white rounded-lg border p-6 transition-shadow hover:shadow-md ${
                isExpired(notice.expiryDate) ? 'opacity-75' : ''
              } ${notice.isPinned ? 'ring-2 ring-purple-200' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header with badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(notice.priority)}`}>
                      {notice.priority.toUpperCase()}
                    </span>
                    {notice.isPinned && (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        PINNED
                      </span>
                    )}
                    {isExpired(notice.expiryDate) && (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        EXPIRED
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{notice.title}</h2>

                  {/* Course info when published by faculty */}
                  {notice.createdByModel === "Faculty" && (notice.courseCode || notice.courseName) && (
                    <p className="text-sm text-blue-700 mb-2">
                      {notice.courseCode ? `${notice.courseCode}` : ""}
                      {notice.courseName ? ` – ${notice.courseName}` : ""}
                      {notice.section ? ` • Sec ${notice.section}` : ""}
                      {notice.semester ? ` • Sem ${notice.semester}` : ""}
                    </p>
                  )}

                  {/* Content Preview */}
                  <p className="text-gray-700 mb-3 line-clamp-3">
                    {notice.content.length > 200 
                      ? `${notice.content.substring(0, 200)}...` 
                      : notice.content}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(notice.publishDate || notice.createdAt)}
                    </div>

                    {notice.expiryDate && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Expires: {formatDate(notice.expiryDate)}
                      </div>
                    )}

                    {notice.viewCount > 0 && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {notice.viewCount} views
                      </div>
                    )}

                    {notice.attachmentUrl && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Attachment
                      </div>
                    )}
                  </div>

                  {/* Target Information */}
                  {(notice.targetSemesters?.length > 0 || notice.targetBranches?.length > 0) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2 text-sm">
                        {notice.targetSemesters?.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Semesters:</span>
                            <span className="text-blue-600">
                              {notice.targetSemesters.join(', ')}
                            </span>
                          </div>
                        )}
                        {notice.targetBranches?.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Branches:</span>
                            <span className="text-green-600">
                              {notice.targetBranches.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="ml-4">
                  <Link
                    href={`/student/notices/${notice._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}