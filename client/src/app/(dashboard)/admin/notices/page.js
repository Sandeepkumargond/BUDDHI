"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NoticesListPage() {
  const { user: authUser, role } = useAuth();
  const router = useRouter();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    audience: '',
    priority: '',
    category: '',
    isActive: '',
    search: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (role === 'admin' || role === 'sub-admin' || role === 'subadmin') {
      fetchNotices();
      fetchStats();
    }
  }, [filters, role]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await apiService.request(`/notices?${queryParams}`);

      if (response.success && response.data) {
        setNotices(response.data.notices || []);
      } else {
        setError('Failed to fetch notices');
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError(err.message || 'Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.request('/notices/stats');
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotices();
  };

  const toggleNoticeStatus = async (noticeId, currentStatus) => {
    try {
      const response = await apiService.request(`/notices/${noticeId}/toggle-status`, {
        method: 'PATCH'
      });

      if (response.success) {
        // Update the notice in the list
        setNotices(prev =>
          prev.map(notice =>
            notice._id === noticeId
              ? { ...notice, isActive: !currentStatus }
              : notice
          )
        );
        fetchStats(); // Refresh stats
      }
    } catch (err) {
      console.error('Error toggling notice status:', err);
      alert('Failed to update notice status');
    }
  };

  const toggleNoticePin = async (noticeId, currentPinned) => {
    try {
      const response = await apiService.request(`/notices/${noticeId}/toggle-pin`, {
        method: 'PATCH'
      });

      if (response.success) {
        // Update the notice in the list
        setNotices(prev =>
          prev.map(notice =>
            notice._id === noticeId
              ? { ...notice, isPinned: !currentPinned }
              : notice
          )
        );
        fetchStats(); // Refresh stats
      }
    } catch (err) {
      console.error('Error toggling notice pin:', err);
      alert('Failed to update notice pin status');
    }
  };

  const deleteNotice = async (noticeId) => {
    if (!confirm('Are you sure you want to delete this notice?')) {
      return;
    }

    try {
      const response = await apiService.request(`/notices/${noticeId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        // Remove from list
        setNotices(prev => prev.filter(notice => notice._id !== noticeId));
        fetchStats(); // Refresh stats
      }
    } catch (err) {
      console.error('Error deleting notice:', err);
      alert('Failed to delete notice');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    // Removed emoji icons — return empty string (icons can be added later)
    return ''
  };

  if (role !== 'admin' && role !== 'sub-admin' && role !== 'subadmin') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notice Management</h1>
          <p className="text-gray-600 mt-1">Manage and publish notices for students, faculty, and staff</p>
        </div>
        <Link
          href="/admin/notices/create"
          className="bg-[#AEE7F7] text-gray-600 px-4 py-2 rounded-lg hover:bg-[#8DD4E8] flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Notice
        </Link>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Notices</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalNotices}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Active Notices</p>
                <p className="text-2xl font-bold text-green-900">{stats.activeNotices}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Pinned Notices</p>
                <p className="text-2xl font-bold text-purple-900">{stats.pinnedNotices}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Total Views</p>
                <p className="text-2xl font-bold text-orange-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Filters</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-blue-600 hover:text-blue-700"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search notices..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
              <select
                value={filters.audience}
                onChange={(e) => handleFilterChange('audience', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Audiences</option>
                <option value="all">All</option>
                <option value="students">Students</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
                <option value="parents">Parents</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Categories</option>
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="examination">Examination</option>
                <option value="event">Event</option>
                <option value="holiday">Holiday</option>
                <option value="urgent">Urgent</option>
                <option value="admission">Admission</option>
              </select>

              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <button
                type="button"
                onClick={() => setFilters({
                  page: 1,
                  limit: 12,
                  audience: '',
                  priority: '',
                  category: '',
                  isActive: '',
                  search: ''
                })}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading notices...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Notices Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className={`bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow ${notice.isPinned ? 'ring-2 ring-purple-200 bg-purple-50' : ''
                }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getCategoryIcon(notice.category)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(notice.priority)}`}>
                    {notice.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-1">
                  {notice.isPinned && (
                    <span className="text-purple-600" title="Pinned">Pinned</span>
                  )}
                  <span className={`w-3 h-3 rounded-full ${notice.isActive ? 'bg-green-400' : 'bg-red-400'}`}
                    title={notice.isActive ? 'Active' : 'Inactive'}>
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {notice.title}
              </h3>

              {/* Content Preview */}
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {notice.content}
              </p>

              {/* Meta Info */}
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span>Audience: <span className="font-medium">{notice.audience}</span></span>
                  <span>Views: <span className="font-medium">{notice.viewCount}</span></span>
                </div>
                <div className="flex justify-between">
                  <span>By: <span className="font-medium">{notice.createdByName}</span></span>
                  <span>{new Date(notice.publishDate).toLocaleDateString()}</span>
                </div>
                {notice.attachmentUrl && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Has attachment</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/notices/${notice._id}`}
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-blue-700"
                >
                  View
                </Link>
                <Link
                  href={`/admin/notices/${notice._id}/edit`}
                  className="flex-1 bg-gray-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-gray-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => toggleNoticePin(notice._id, notice.isPinned)}
                  className={`px-3 py-2 rounded text-sm ${notice.isPinned
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  title={notice.isPinned ? 'Unpin' : 'Pin'}
                >
                  {notice.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={() => toggleNoticeStatus(notice._id, notice.isActive)}
                  className={`px-3 py-2 rounded text-sm ${notice.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  title={notice.isActive ? 'Deactivate' : 'Activate'}
                >
                  {notice.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteNotice(notice._id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  title="Delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && notices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notices found</h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.audience || filters.priority || filters.category || filters.isActive
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating your first notice.'
            }
          </p>
          <Link
            href="/admin/notices/create"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add First Notice
          </Link>
        </div>
      )}
    </div>
  );
}