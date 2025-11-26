"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateNoticePage() {
  const { user: authUser, role } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'all',
    priority: 'normal',
    category: 'general',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    isPinned: false,
    targetSemesters: [],
    targetBranches: [],
    tags: ''
  });

  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const audienceOptions = [
    { value: 'all', label: 'All' },
    { value: 'students', label: 'Students' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'staff', label: 'Staff' },
    { value: 'parents', label: 'Parents' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'normal', label: 'Normal', color: 'yellow' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'General', icon: '📢' },
    { value: 'academic', label: 'Academic', icon: '📚' },
    { value: 'examination', label: 'Examination', icon: '📝' },
    { value: 'event', label: 'Event', icon: '🎉' },
    { value: 'holiday', label: 'Holiday', icon: '🏖️' },
    { value: 'urgent', label: 'Urgent', icon: '🚨' },
    { value: 'admission', label: 'Admission', icon: '🎓' }
  ];

  const branchOptions = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSemesterToggle = (semester) => {
    setFormData(prev => ({
      ...prev,
      targetSemesters: prev.targetSemesters.includes(semester)
        ? prev.targetSemesters.filter(s => s !== semester)
        : [...prev.targetSemesters, semester]
    }));
  };

  const handleBranchToggle = (branch) => {
    setFormData(prev => ({
      ...prev,
      targetBranches: prev.targetBranches.includes(branch)
        ? prev.targetBranches.filter(b => b !== branch)
        : [...prev.targetBranches, branch]
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setAttachment(file);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.expiryDate && new Date(formData.expiryDate) <= new Date(formData.publishDate)) {
      newErrors.expiryDate = 'Expiry date must be after publish date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const submitFormData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'targetSemesters' || key === 'targetBranches') {
          submitFormData.append(key, JSON.stringify(value));
        } else if (key === 'tags') {
          // Convert comma-separated tags to array
          const tagsArray = value.split(',').map(tag => tag.trim()).filter(Boolean);
          submitFormData.append(key, JSON.stringify(tagsArray));
        } else {
          submitFormData.append(key, value);
        }
      });

      // Add attachment if exists
      if (attachment) {
        submitFormData.append('attachment', attachment);
      }

      const response = await apiService.request('/notices', {
        method: 'POST',
        body: submitFormData
      });

      if (response.success) {
        alert('Notice created successfully!');
        router.push('/list/notices');
      } else {
        throw new Error(response.message || 'Failed to create notice');
      }
    } catch (err) {
      console.error('Error creating notice:', err);
      alert(err.message || 'Failed to create notice');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'border-green-400 bg-green-50',
      normal: 'border-yellow-400 bg-yellow-50',
      high: 'border-orange-400 bg-orange-50',
      urgent: 'border-red-400 bg-red-50'
    };
    return colors[priority] || colors.normal;
  };

  if (role !== 'admin' && role !== 'sub-admin' && role !== 'subadmin') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Notice</h1>
            <p className="text-gray-600">Publish notice for students, faculty, or staff</p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter notice title"
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.title ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              required
              rows={6}
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write notice content..."
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.content ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.content && (
              <p className="text-red-600 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* Audience and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audience
              </label>
              <select
                value={formData.audience}
                onChange={(e) => handleInputChange('audience', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {audienceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Priority Level</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {priorityOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('priority', option.value)}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  formData.priority === option.value
                    ? getPriorityColor(option.value)
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publish Date
              </label>
              <input
                type="date"
                value={formData.publishDate}
                onChange={(e) => handleInputChange('publishDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.expiryDate ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.expiryDate && (
                <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Target Audience Details */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Target Audience (Optional)</h3>
          
          {/* Target Semesters */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Semesters (Leave empty for all semesters)
            </label>
            <div className="flex flex-wrap gap-2">
              {[1,2,3,4,5,6,7,8].map(semester => (
                <button
                  key={semester}
                  type="button"
                  onClick={() => handleSemesterToggle(semester)}
                  className={`px-3 py-1 rounded border text-sm ${
                    formData.targetSemesters.includes(semester)
                      ? 'bg-blue-100 border-blue-400 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Semester {semester}
                </button>
              ))}
            </div>
          </div>

          {/* Target Branches */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Branches (Leave empty for all branches)
            </label>
            <div className="flex flex-wrap gap-2">
              {branchOptions.map(branch => (
                <button
                  key={branch}
                  type="button"
                  onClick={() => handleBranchToggle(branch)}
                  className={`px-3 py-1 rounded border text-sm ${
                    formData.targetBranches.includes(branch)
                      ? 'bg-green-100 border-green-400 text-green-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {branch}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="Enter tags separated by commas (e.g., exam, schedule, important)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <p className="text-gray-500 text-sm mt-1">Separate multiple tags with commas</p>
          </div>
        </div>

        {/* Attachment */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Attachment</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              id="attachment"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
            />
            <label
              htmlFor="attachment"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-gray-600 text-center">
                Click to upload attachment<br />
                <span className="text-sm text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 5MB)</span>
              </span>
            </label>
            {attachment && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">📎 {attachment.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Options</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPinned}
              onChange={(e) => handleInputChange('isPinned', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              Pin this notice (Pinned notices appear at the top)
            </span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Notice'}
          </button>
        </div>
      </form>
    </div>
  );
}