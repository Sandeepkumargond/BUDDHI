"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";

export default function StudyMaterialPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    materialType: '',
    semester: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchMaterials();
    fetchStats();
  }, [filters]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await apiService.request(`/study-materials/faculty?${queryParams.toString()}`);
      
      if (response.success) {
        setMaterials(response.data.materials || []);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.request('/study-materials/faculty/stats');
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleDelete = async (materialId) => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      const response = await apiService.request(`/study-materials/faculty/${materialId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        alert('Material deleted successfully');
        fetchMaterials();
        fetchStats();
      }
    } catch (err) {
      console.error('Error deleting material:', err);
      alert('Failed to delete material');
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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">📚 Study Materials</h1>
          <p className="text-gray-600">Manage and share educational resources</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/faculty/study-material/upload"
            className="px-4 py-2 rounded bg-[#C3EBFA] text-gray-600 hover:bg-[#A8DBF2]"
          >
            + Upload Material
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Materials</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalMaterials || 0}</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalDownloads || 0}</p>
              </div>
              <div className="text-3xl">📥</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalViews || 0}</p>
              </div>
              <div className="text-3xl">👀</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalSubjects || 0}</p>
              </div>
              <div className="text-3xl">🎓</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search materials..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          
          <input
            type="text"
            placeholder="Filter by subject"
            value={filters.subject}
            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          
          <select
            value={filters.materialType}
            onChange={(e) => setFilters(prev => ({ ...prev, materialType: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="lecture_notes">📚 Lecture Notes</option>
            <option value="assignment">📝 Assignment</option>
            <option value="reference_book">📖 Reference Book</option>
            <option value="question_paper">❓ Question Paper</option>
            <option value="lab_manual">🔬 Lab Manual</option>
            <option value="presentation">📊 Presentation</option>
            <option value="other">📎 Other</option>
          </select>
          
          <select
            value={filters.semester}
            onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Your Materials</h3>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading materials...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
              <p className="text-gray-600">Start by uploading your first study material.</p>
              <Link
                href="/faculty/study-material/upload"
                className="mt-4 inline-block bg-[#C3EBFA] text-gray-600 px-4 py-2 rounded-lg hover:bg-[#A8DBF2]"
              >
                Upload Material
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material) => (
                <div key={material._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getMaterialTypeIcon(material.materialType)}</span>
                        <h4 className="font-semibold text-lg">{material.title}</h4>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {material.courseCode}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2 line-clamp-2">{material.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>📖 {material.subject}</span>
                        <span>🎓 Semester {material.semester}</span>
                        <span>🏢 {material.branch}</span>
                        <span>📄 {formatFileSize(material.fileSize)}</span>
                        <span>📅 {formatDate(material.createdAt)}</span>
                        <span>👀 {material.viewCount} views</span>
                        <span>📥 {material.downloadCount} downloads</span>
                      </div>
                      
                      {material.tags && material.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {material.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/faculty/study-material/view/${material._id}`}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                      >
                        View
                      </Link>
                      <Link
                        href={`/faculty/study-material/edit/${material._id}`}
                        className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(material._id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                      >
                        Delete
                      </button>
                      {material.materialType === 'assignment' && (
                        <Link
                          href={`/faculty/materials/${material._id}/submissions`}
                          className="bg-teal-100 text-teal-700 px-3 py-1 rounded text-sm hover:bg-teal-200"
                        >
                          View Submissions
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
