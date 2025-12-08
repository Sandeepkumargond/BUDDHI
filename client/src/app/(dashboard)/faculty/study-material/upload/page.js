"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { FaBook, FaFileAlt, FaBookOpen, FaQuestionCircle, FaFlask, FaChartBar, FaPaperclip, FaUpload, FaList, FaGraduationCap, FaBullseye, FaFile } from 'react-icons/fa';

export default function UploadStudyMaterialPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    courseCode: "",
    semester: "",
    branch: "",
    materialType: "lecture_notes",
    tags: "",
    expiryDate: "",
    academicYear: "",
    difficulty: "intermediate",
    estimatedReadTime: "",
    language: "English"
  });

  const [file, setFile] = useState(null);
  const [targetAudience, setTargetAudience] = useState({
    semesters: [],
    branches: []
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // New state for courses
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const materialTypeOptions = [
    { value: 'lecture_notes', label: 'Lecture Notes' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'reference_book', label: 'Reference Book' },
    { value: 'question_paper', label: 'Question Paper' },
    { value: 'lab_manual', label: 'Lab Manual' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'other', label: 'Other' }
  ];

  const branchOptions = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS'];

  const difficultyOptions = [
    { value: 'beginner', label: '🟢 Beginner' },
    { value: 'intermediate', label: '🟡 Intermediate' },
    { value: 'advanced', label: '🔴 Advanced' }
  ];

  useEffect(() => {
    // Auto-generate academic year in YYYY-YY format
    const currentYear = new Date().getFullYear();
    const academicStartYear = new Date().getMonth() >= 6 ? currentYear : currentYear - 1;
    const nextYear = academicStartYear + 1;
    const academicYear = `${academicStartYear}-${nextYear.toString().slice(-2)}`;
    
    setFormData(prev => ({
      ...prev,
      academicYear
    }));
    
    // Fetch faculty's assigned courses
    fetchFacultyCourses();
  }, []);

  const fetchFacultyCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await apiService.getFacultyCourses();
      
      if (response.success) {
        setCourses(response.data.courses || []);
      } else {
        console.error('Failed to fetch courses:', response.message);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      alert('Failed to load assigned courses. Please refresh the page.');
    } finally {
      setLoadingCourses(false);
    }
  };

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

  const handleCourseChange = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    
    if (course) {
      setSelectedCourse(course);
      
      // Generate proper academic year format
      const currentYear = new Date().getFullYear();
      const academicStartYear = new Date().getMonth() >= 6 ? currentYear : currentYear - 1;
      const nextYear = academicStartYear + 1;
      const academicYear = `${academicStartYear}-${nextYear.toString().slice(-2)}`;
      
      // Auto-populate form fields based on selected course
      setFormData(prev => ({
        ...prev,
        subject: course.course.name,
        courseCode: course.course.code,
        semester: course.semester.toString(),
        branch: getBranchFromCourse(course),
        academicYear: academicYear // Use generated format instead of course.academicYear
      }));
      
      // Clear course-related errors
      setErrors(prev => ({
        ...prev,
        subject: '',
        courseCode: '',
        semester: ''
      }));
    } else {
      setSelectedCourse(null);
      // Clear auto-populated fields
      setFormData(prev => ({
        ...prev,
        subject: "",
        courseCode: "",
        semester: "",
        branch: ""
      }));
    }
  };

  const getBranchFromCourse = (course) => {
    // This is a simple mapping - you might need to adjust based on your course model
    // If course has department information, use that, otherwise use default mapping
    const branchMap = {
      'CSE': 'CSE',
      'ECE': 'ECE', 
      'EEE': 'EEE',
      'MECH': 'MECH',
      'CIVIL': 'CIVIL',
      'IT': 'IT',
      'AIDS': 'AIDS'
    };
    
    // Try to extract from course code or use department info if available
    const courseCode = course.course.code?.toUpperCase() || '';
    
    // Check if course code starts with any branch abbreviation
    for (const [key, value] of Object.entries(branchMap)) {
      if (courseCode.startsWith(key)) {
        return value;
      }
    }
    
    // If course has department info, use that
    if (course.course.departmentId) {
      // You might need to fetch department info or have it in the course data
      return 'CSE'; // Default fallback
    }
    
    return 'CSE'; // Default fallback
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'video/mp4',
        'application/zip'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Please select a valid file type (PDF, DOC, PPT, TXT, JPG, PNG, MP4, ZIP)');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSemesterToggle = (semester) => {
    setTargetAudience(prev => ({
      ...prev,
      semesters: prev.semesters.includes(semester)
        ? prev.semesters.filter(s => s !== semester)
        : [...prev.semesters, semester]
    }));
  };

  const handleBranchToggle = (branch) => {
    setTargetAudience(prev => ({
      ...prev,
      branches: prev.branches.includes(branch)
        ? prev.branches.filter(b => b !== branch)
        : [...prev.branches, branch]
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!selectedCourse) {
      newErrors.course = 'Please select a course from your assigned courses';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!file) {
      newErrors.file = 'Study material file is required';
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
      setUploading(true);
      
      // Debug: Log academic year before sending
      console.log('📅 Academic year being sent:', formData.academicYear);
      console.log('📋 Full form data:', formData);
      
      const submitFormData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          submitFormData.append(key, value);
        }
      });
      
      // Add processed arrays
      submitFormData.append('tags', JSON.stringify(
        formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      ));
      
      submitFormData.append('targetAudience', JSON.stringify(targetAudience));
      
      // Add file
      submitFormData.append('material', file);
      
      const response = await apiService.request('/study-materials/faculty/upload', {
        method: 'POST',
        body: submitFormData
      });
      
      if (response.success) {
        alert('Study material uploaded successfully!');
        router.push('/faculty/study-material');
      } else {
        throw new Error(response.message || 'Failed to upload material');
      }
    } catch (err) {
      console.error('Error uploading material:', err);
      alert(err.message || 'Failed to upload study material');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FaBook style={{ color: '#AEE7F7' }} /> Upload Study Material</h1>
        <p className="text-gray-600">Share educational resources with students</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FaList style={{ color: '#AEE7F7' }} /> Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter material title"
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.title ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Type *
              </label>
              <select
                required
                value={formData.materialType}
                onChange={(e) => handleInputChange('materialType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {materialTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the content and purpose of this material"
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.description ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Course Selection */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FaGraduationCap style={{ color: '#C9CCFF' }} /> Course Selection</h3>
          
          {loadingCourses ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading your assigned courses...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Courses Assigned</h4>
              <p className="text-gray-600">
                You don't have any courses assigned yet. Please contact the admin to get courses assigned to you.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Course *
                </label>
                <select
                  required
                  value={selectedCourse?._id || ""}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    errors.course ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">Choose from your assigned courses</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.displayText}
                    </option>
                  ))}
                </select>
                {errors.course && (
                  <p className="text-red-600 text-sm mt-1">{errors.course}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  Only courses assigned to you are available for study material upload
                </p>
              </div>

              {/* Display selected course details */}
              {selectedCourse && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Course Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Subject:</span>
                      <p className="text-blue-900">{selectedCourse.course.name}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Course Code:</span>
                      <p className="text-blue-900">{selectedCourse.course.code}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Semester:</span>
                      <p className="text-blue-900">{selectedCourse.semester}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Section:</span>
                      <p className="text-blue-900">{selectedCourse.section || 'All'}</p>
                    </div>
                  </div>
                  {selectedCourse.batch && (
                    <div className="mt-2 text-sm">
                      <span className="text-blue-700 font-medium">Batch:</span>
                      <span className="text-blue-900 ml-1">{selectedCourse.batch}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* File Upload */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FaPaperclip style={{ color: '#F9DB66' }} /> File Upload</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              id="material"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.mp4,.zip"
              className="hidden"
              required
            />
            <label
              htmlFor="material"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-gray-600 text-center">
                Click to upload study material<br />
                <span className="text-sm text-gray-500">
                  PDF, DOC, PPT, TXT, Images, Videos, ZIP (Max 50MB)
                </span>
              </span>
            </label>
            {file && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2"><FaFile style={{ color: '#C9CCFF' }} /> {file.name}</span>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
            {errors.file && (
              <p className="text-red-600 text-sm mt-2">{errors.file}</p>
            )}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">⚙️ Advanced Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Read Time (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedReadTime}
                onChange={(e) => handleInputChange('estimatedReadTime', e.target.value)}
                placeholder="e.g., 30"
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                placeholder="e.g., English"
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
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="Enter tags separated by commas (e.g., algorithms, sorting, complexity)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <p className="text-gray-500 text-sm mt-1">Separate multiple tags with commas</p>
          </div>
        </div>

        {/* Target Audience */}
        {selectedCourse && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FaBullseye style={{ color: '#AEE7F7' }} /> Additional Target Audience (Optional)</h3>
            <p className="text-gray-600 text-sm mb-4">
              By default, this material will be available to Semester {selectedCourse.semester} 
              {selectedCourse.section && ` Section ${selectedCourse.section}`}
              {selectedCourse.batch && ` Batch ${selectedCourse.batch}`} students.
              You can additionally share it with other semesters/branches.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Target Semesters
              </label>
              <div className="flex flex-wrap gap-2">
                {[1,2,3,4,5,6,7,8].filter(sem => sem !== selectedCourse.semester).map(semester => (
                  <button
                    key={semester}
                    type="button"
                    onClick={() => handleSemesterToggle(semester)}
                    className={`px-3 py-1 rounded border text-sm ${
                      targetAudience.semesters.includes(semester)
                        ? 'bg-blue-100 border-blue-400 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Semester {semester}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Target Branches
              </label>
              <div className="flex flex-wrap gap-2">
                {branchOptions.filter(branch => branch !== formData.branch).map(branch => (
                  <button
                    key={branch}
                    type="button"
                    onClick={() => handleBranchToggle(branch)}
                    className={`px-3 py-1 rounded border text-sm ${
                      targetAudience.branches.includes(branch)
                        ? 'bg-green-100 border-green-400 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {branch}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || !selectedCourse || courses.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : courses.length === 0 ? 'No Courses Available' : 'Upload Material'}
          </button>
        </div>
      </form>
    </div>
  );
}
