"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function StudentNoticeDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const noticeId = params.noticeId;

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const response = await apiService.request(`/notices/public/${noticeId}`);
        
        if (response.success && response.data) {
          setNotice(response.data.notice);
        } else {
          throw new Error(response.message || 'Notice not found');
        }
      } catch (err) {
        console.error('Error fetching notice:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (noticeId) {
      fetchNotice();
    }
  }, [noticeId]);

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiryDate) => {
    return expiryDate && new Date(expiryDate) < new Date();
  };

  const handleDownload = () => {
    if (notice.attachmentUrl) {
      window.open(notice.attachmentUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading notice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notice Not Found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/student/notices"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Notices
          </Link>
        </div>
      </div>
    );
  }

  if (!notice) {
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Link
            href="/student/notices"
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Notices
          </Link>
        </div>

        <div className="bg-white rounded-lg border p-6">
          {/* Notice Badges */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{getCategoryIcon(notice.category)}</span>
            <span className={`px-4 py-2 text-sm font-medium rounded-full border ${getPriorityColor(notice.priority)}`}>
              {notice.priority.toUpperCase()} PRIORITY
            </span>
            {notice.isPinned && (
              <span className="px-4 py-2 text-sm font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                📌 PINNED
              </span>
            )}
            {isExpired(notice.expiryDate) && (
              <span className="px-4 py-2 text-sm font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                ⏰ EXPIRED
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{notice.title}</h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Published: {formatDate(notice.publishDate || notice.createdAt)}</span>
            </div>

            {notice.expiryDate && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Expires: {formatDate(notice.expiryDate)}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{notice.viewCount || 0} views</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="capitalize">{notice.category}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
              {notice.content}
            </div>
          </div>

          {/* Target Audience */}
          {(notice.targetSemesters?.length > 0 || notice.targetBranches?.length > 0) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📍 Target Audience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notice.targetSemesters?.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">🎯 Semesters</h4>
                    <div className="flex flex-wrap gap-2">
                      {notice.targetSemesters.map(semester => (
                        <span key={semester} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          Semester {semester}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {notice.targetBranches?.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">🏢 Branches</h4>
                    <div className="flex flex-wrap gap-2">
                      {notice.targetBranches.map(branch => (
                        <span key={branch} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {branch}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {notice.tags?.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🏷️ Tags</h3>
              <div className="flex flex-wrap gap-2">
                {notice.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attachment */}
          {notice.attachmentUrl && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📎 Attachment</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {notice.attachmentName || 'Attachment'}
                      </p>
                      <p className="text-sm text-gray-600">Click to view or download</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View/Download
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notice Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Published by: {notice.createdBy?.firstName} {notice.createdBy?.lastName} 
                {notice.createdBy?.role && ` (${notice.createdBy.role})`}
              </div>
              {notice.updatedAt && notice.updatedAt !== notice.createdAt && (
                <div>
                  Last updated: {formatDate(notice.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}