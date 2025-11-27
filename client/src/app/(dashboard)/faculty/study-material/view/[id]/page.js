"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiService } from "@/lib/api";

export default function ViewStudyMaterialPage() {
  const { id } = useParams();
  const router = useRouter();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchMaterial();
    }
  }, [id]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const response = await apiService.request(`/study-materials/faculty/${id}`);
      
      if (response.success) {
        setMaterial(response.data.material);
      } else {
        setError('Material not found');
      }
    } catch (err) {
      console.error('Error fetching material:', err);
      setError(err.message || 'Failed to fetch material');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await apiService.request(`/study-materials/faculty/${id}/download`, {
        method: 'POST'
      });
      
      if (response.success) {
        // Open the file URL in a new tab for download
        window.open(response.data.fileUrl, '_blank');
        
        // Refresh material to update download count
        fetchMaterial();
      }
    } catch (err) {
      console.error('Error downloading material:', err);
      alert('Failed to download material');
    }
  };

  const getMaterialTypeIcon = (type) => {
    const icons = {
      lecture_notes: '📚',
      assignment: '📝',
      reference_book: '📖',
      question_paper: '❓',
      lab_manual: '🔬',
      presentation: '📊',
      other: '📎'
    };
    return icons[type] || '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || colors.intermediate;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading material...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!material) {
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Materials
          </button>
          
          <div className="flex gap-2">
            <Link
              href={`/faculty/study-material/edit/${material._id}`}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              Edit Material
            </Link>
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          {/* Title and Type */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{getMaterialTypeIcon(material.materialType)}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{material.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                  {material.courseCode}
                </span>
                <span className={`px-3 py-1 text-sm rounded ${getDifficultyColor(material.metadata?.difficulty)}`}>
                  {material.metadata?.difficulty || 'intermediate'}
                </span>
                {!material.isActive && (
                  <span className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">📄 Description</h3>
            <p className="text-gray-700 leading-relaxed">{material.description}</p>
          </div>

          {/* Course Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">🎓 Course Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium">{material.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Course Code:</span>
                  <span className="font-medium">{material.courseCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Semester:</span>
                  <span className="font-medium">Semester {material.semester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch:</span>
                  <span className="font-medium">{material.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Academic Year:</span>
                  <span className="font-medium">{material.academicYear}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">📊 Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-medium">{material.viewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Downloads:</span>
                  <span className="font-medium">{material.downloadCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">File Size:</span>
                  <span className="font-medium">{formatFileSize(material.fileSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">File Type:</span>
                  <span className="font-medium">{material.fileType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{material.metadata?.language || 'English'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {material.metadata?.estimatedReadTime && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">⏱️ Estimated Read Time</h3>
              <p className="text-gray-700">{material.metadata.estimatedReadTime} minutes</p>
            </div>
          )}

          {/* Tags */}
          {material.tags && material.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">🏷️ Tags</h3>
              <div className="flex flex-wrap gap-2">
                {material.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Target Audience */}
          {(material.targetAudience?.semesters?.length > 0 || material.targetAudience?.branches?.length > 0) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">🎯 Additional Target Audience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {material.targetAudience.semesters?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Semesters</h4>
                    <div className="flex flex-wrap gap-2">
                      {material.targetAudience.semesters.map(semester => (
                        <span key={semester} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          Semester {semester}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {material.targetAudience.branches?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Branches</h4>
                    <div className="flex flex-wrap gap-2">
                      {material.targetAudience.branches.map(branch => (
                        <span key={branch} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          {branch}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* File Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">📎 File Information</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{material.fileName}</p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(material.fileSize)} • {material.fileType}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download File
              </button>
            </div>
          </div>

          {/* Upload Information */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Uploaded by: {material.uploadedBy?.firstName} {material.uploadedBy?.lastName}
              </div>
              <div className="flex gap-4">
                <div>Created: {formatDate(material.createdAt)}</div>
                {material.updatedAt !== material.createdAt && (
                  <div>Updated: {formatDate(material.updatedAt)}</div>
                )}
                {material.expiryDate && (
                  <div>Expires: {formatDate(material.expiryDate)}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
