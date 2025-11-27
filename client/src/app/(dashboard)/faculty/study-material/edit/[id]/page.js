"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api";

export default function EditStudyMaterialPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    courseCode: '',
    semester: '',
    branch: '',
    academicYear: '',
    materialType: 'lecture_notes',
    tags: [],
    targetAudience: {
      semesters: [],
      branches: []
    },
    metadata: {
      difficulty: 'intermediate',
      language: 'English',
      estimatedReadTime: ''
    },
    expiryDate: '',
    isActive: true
  });
  
  const [newFile, setNewFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [targetSemesterInput, setTargetSemesterInput] = useState('');
  const [targetBranchInput, setTargetBranchInput] = useState('');

  const materialTypes = [
    { value: 'lecture_notes', label: 'Lecture Notes' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'reference_book', label: 'Reference Book' },
    { value: 'question_paper', label: 'Question Paper' },
    { value: 'lab_manual', label: 'Lab Manual' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'other', label: 'Other' }
  ];

  const branches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

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
        const material = response.data.material;
        setFormData({
          title: material.title || '',
          description: material.description || '',
          subject: material.subject || '',
          courseCode: material.courseCode || '',
          semester: material.semester?.toString() || '',
          branch: material.branch || '',
          academicYear: material.academicYear || '',
          materialType: material.materialType || 'lecture_notes',
          tags: material.tags || [],
          targetAudience: {
            semesters: material.targetAudience?.semesters || [],
            branches: material.targetAudience?.branches || []
          },
          metadata: {
            difficulty: material.metadata?.difficulty || 'intermediate',
            language: material.metadata?.language || 'English',
            estimatedReadTime: material.metadata?.estimatedReadTime?.toString() || ''
          },
          expiryDate: material.expiryDate ? new Date(material.expiryDate).toISOString().split('T')[0] : '',
          isActive: material.isActive !== false
        });
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setNewFile(file);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addTargetSemester = () => {
    const semester = parseInt(targetSemesterInput);
    if (semester && !formData.targetAudience.semesters.includes(semester)) {
      setFormData(prev => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          semesters: [...prev.targetAudience.semesters, semester]
        }
      }));
      setTargetSemesterInput('');
    }
  };

  const removeTargetSemester = (semester) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        semesters: prev.targetAudience.semesters.filter(s => s !== semester)
      }
    }));
  };

  const addTargetBranch = () => {
    if (targetBranchInput && !formData.targetAudience.branches.includes(targetBranchInput)) {
      setFormData(prev => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          branches: [...prev.targetAudience.branches, targetBranchInput]
        }
      }));
      setTargetBranchInput('');
    }
  };

  const removeTargetBranch = (branch) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        branches: prev.targetAudience.branches.filter(b => b !== branch)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.subject) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const submitData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key === 'targetAudience' || key === 'metadata') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'tags') {
          submitData.append(key, JSON.stringify(formData.tags));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add file if new one is selected
      if (newFile) {
        submitData.append('file', newFile);
      }

      const response = await apiService.request(`/study-materials/faculty/${id}`, {
        method: 'PUT',
        body: submitData,
        headers: {} // Let browser set content-type for FormData
      });

      if (response.success) {
        alert('Material updated successfully!');
        router.push('/faculty/study-material');
      } else {
        throw new Error(response.message || 'Failed to update material');
      }
    } catch (err) {
      console.error('Error updating material:', err);
      alert(err.message || 'Failed to update material');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Study Material</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter material title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter subject name"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide a detailed description of the material"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Code
              </label>
              <input
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., CS101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select semester</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select branch</option>
                {branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Material Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Type
              </label>
              <select
                name="materialType"
                value={formData.materialType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {materialTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2024-25"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                name="metadata.difficulty"
                value={formData.metadata.difficulty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <input
                type="text"
                name="metadata.language"
                value={formData.metadata.language}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="English"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Read Time (minutes)
              </label>
              <input
                type="number"
                name="metadata.estimatedReadTime"
                value={formData.metadata.estimatedReadTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="30"
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">File</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Replace File (optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.mp4,.zip"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG, MP4, ZIP (Max: 50MB)
            </p>
            {newFile && (
              <p className="text-sm text-green-600 mt-1">
                New file selected: {newFile.name}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Tags</h2>
          
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Enter tag"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button
              type="button"
              onClick={addTag}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Target Audience</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Semesters
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={targetSemesterInput}
                  onChange={(e) => setTargetSemesterInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select semester</option>
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addTargetSemester}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.targetAudience.semesters.map(semester => (
                  <span key={semester} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    Semester {semester}
                    <button
                      type="button"
                      onClick={() => removeTargetSemester(semester)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Branches
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={targetBranchInput}
                  onChange={(e) => setTargetBranchInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select branch</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addTargetBranch}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.targetAudience.branches.map(branch => (
                  <span key={branch} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    {branch}
                    <button
                      type="button"
                      onClick={() => removeTargetBranch(branch)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date (optional)
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Active (visible to students)
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {saving ? 'Updating...' : 'Update Material'}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
