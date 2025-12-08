"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ViewNoticePage() {
  const { user: authUser, role } = useAuth();
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
        const response = await apiService.request(`/notices/${noticeId}`);

        if (response.success && response.data) {
          setNotice(response.data.notice);
        } else {
          setError('Notice not found');
        }
      } catch (err) {
        console.error('Error fetching notice:', err);
        setError(err.message || 'Failed to fetch notice');
      } finally {
        setLoading(false);
      }
    };

    if (noticeId && (role === 'admin' || role === 'sub-admin' || role === 'subadmin')) {
      fetchNotice();
    }
  }, [noticeId, role]);

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadAttachment = () => {
    if (notice.attachmentUrl) {
      const link = document.createElement('a');
      link.href = notice.attachmentUrl;
      link.target = '_blank';
      link.download = notice.attachmentName || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading notice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notice not found</h3>
          <p className="text-gray-600">The notice you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getCategoryIcon(notice.category)}</span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(notice.priority)}`}>
              {notice.priority.toUpperCase()} PRIORITY
            </span>
            {notice.isPinned && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                📌 PINNED
              </span>
            )}
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${notice.isActive
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-red-100 text-red-800 border-red-200'
              }`}>
              {notice.isActive ? '✓ ACTIVE' : '✗ INACTIVE'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{notice.title}</h1>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/admin/notices/${notice._id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Edit Notice
          </Link>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      </div>

      {/* Notice Details */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Published Date</label>
              <p className="text-gray-900">{formatDate(notice.publishDate)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Target Audience</label>
              <p className="text-gray-900 capitalize">{notice.audience}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <p className="text-gray-900 capitalize flex items-center gap-2">
                {getCategoryIcon(notice.category)} {notice.category}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">View Count</label>
              <p className="text-gray-900">{notice.viewCount} views</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {notice.expiryDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                <p className="text-gray-900">{formatDate(notice.expiryDate)}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Created By</label>
              <p className="text-gray-900">{notice.createdByName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-gray-900">{formatDate(notice.updatedAt)}</p>
            </div>

            {notice.tags && notice.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Tags</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {notice.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Target Audience Details */}
        {(notice.targetSemesters?.length > 0 || notice.targetBranches?.length > 0) && (
          <div className="border-t pt-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Specific Targeting</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notice.targetSemesters?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Target Semesters</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {notice.targetSemesters.map(semester => (
                      <span
                        key={semester}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                      >
                        Semester {semester}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {notice.targetBranches?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Target Branches</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {notice.targetBranches.map((branch, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded"
                      >
                        {branch}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Content</h4>
          <div className="prose max-w-none">
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {notice.content}
            </div>
          </div>
        </div>

        {/* Attachment */}
        {notice.attachmentUrl && (
          <div className="border-t pt-4 mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Attachment</h4>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl">📎</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{notice.attachmentName}</p>
                <p className="text-sm text-gray-500">Click to view or download</p>
              </div>
              <button
                onClick={downloadAttachment}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                View/Download
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Link
          href={`/admin/notices/${notice._id}/edit`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          Edit Notice
        </Link>
        <Link
          href="/admin/notices"
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-medium"
        >
          Back to Notices
        </Link>
      </div>
    </div>
  );
}