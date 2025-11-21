"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";

export default function AddEditGradeCardPage() {
  const { user: authUser, role } = useAuth();
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    semester: '',
    academicYear: '',
    examType: 'Regular',
    subjects: []
  });

  const [newSubject, setNewSubject] = useState({
    code: '',
    name: '',
    type: 'Theory',
    credits: 3,
    internal: 0,
    external: 0
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await apiService.request(`/student/${studentId}`);
        if (response.success && response.data) {
          const studentData = response.data;
          setStudent(studentData);
          
          // Set default academic year
          const currentYear = new Date().getFullYear();
          setFormData(prev => ({
            ...prev,
            academicYear: `${currentYear}-${currentYear + 1}`
          }));
        } else {
          setError('Student not found');
        }
      } catch (err) {
        console.error('Error fetching student:', err);
        setError(err.message || 'Failed to fetch student details');
      } finally {
        setLoading(false);
      }
    };

    if (studentId && (role === 'admin' || role === 'sub-admin')) {
      fetchStudent();
    }
  }, [studentId, role]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectChange = (field, value) => {
    setNewSubject(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSubject = () => {
    if (!newSubject.code || !newSubject.name) {
      alert('Subject code and name are required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { ...newSubject }]
    }));

    setNewSubject({
      code: '',
      name: '',
      type: 'Theory',
      credits: 3,
      internal: 0,
      external: 0
    });
  };

  const removeSubject = (index) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  const updateSubject = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map((subject, i) => 
        i === index ? { ...subject, [field]: value } : subject
      )
    }));
  };

  const calculateTotal = (internal, external) => {
    return (parseInt(internal) || 0) + (parseInt(external) || 0);
  };

  const getGrade = (total) => {
    if (total >= 90) return { grade: 'A+', point: 10 };
    if (total >= 80) return { grade: 'A', point: 9 };
    if (total >= 70) return { grade: 'B+', point: 8 };
    if (total >= 60) return { grade: 'B', point: 7 };
    if (total >= 50) return { grade: 'C+', point: 6 };
    if (total >= 40) return { grade: 'C', point: 5 };
    if (total >= 35) return { grade: 'D', point: 4 };
    return { grade: 'F', point: 0 };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.semester || !formData.academicYear || formData.subjects.length === 0) {
      alert('Please fill in semester, academic year, and add at least one subject');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        semester: parseInt(formData.semester),
        academicYear: formData.academicYear,
        examType: formData.examType,
        subjects: formData.subjects
      };

      const response = await apiService.request(`/grades/admin/student/${studentId}/grades`, {
        method: 'POST',
        body: payload
      });

      if (response.success) {
        alert('Grade card saved successfully!');
        router.push(`/list/students/grades/${studentId}`);
      } else {
        throw new Error(response.message || 'Failed to save grade card');
      }
    } catch (err) {
      console.error('Error saving grade card:', err);
      alert(err.message || 'Failed to save grade card');
    } finally {
      setSaving(false);
    }
  };

  if (role !== 'admin' && role !== 'sub-admin') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add/Edit Grade Card</h1>
            <p className="text-gray-600">
              Student: {student.firstName} {student.lastName} ({student.rollNo})
            </p>
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
          <h3 className="text-lg font-semibold mb-4">Semester Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <select
                required
                value={formData.semester}
                onChange={(e) => handleInputChange('semester', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year *
              </label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                placeholder="2024-2025"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Type
              </label>
              <select
                value={formData.examType}
                onChange={(e) => handleInputChange('examType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Regular">Regular</option>
                <option value="Supplementary">Supplementary</option>
                <option value="Improvement">Improvement</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add Subject */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Add Subject</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
              <input
                type="text"
                value={newSubject.code}
                onChange={(e) => handleSubjectChange('code', e.target.value)}
                placeholder="CS101"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
              <input
                type="text"
                value={newSubject.name}
                onChange={(e) => handleSubjectChange('name', e.target.value)}
                placeholder="Data Structures"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newSubject.type}
                onChange={(e) => handleSubjectChange('type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Theory">Theory</option>
                <option value="Lab">Lab</option>
                <option value="Practical">Practical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
              <input
                type="number"
                value={newSubject.credits}
                onChange={(e) => handleSubjectChange('credits', parseInt(e.target.value))}
                min="1"
                max="6"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal</label>
              <input
                type="number"
                value={newSubject.internal}
                onChange={(e) => handleSubjectChange('internal', parseInt(e.target.value))}
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">External</label>
              <input
                type="number"
                value={newSubject.external}
                onChange={(e) => handleSubjectChange('external', parseInt(e.target.value))}
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={addSubject}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add Subject
            </button>
          </div>
        </div>

        {/* Subjects List */}
        {formData.subjects.length > 0 && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Subjects ({formData.subjects.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Code</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Credits</th>
                    <th className="text-left p-2">Internal</th>
                    <th className="text-left p-2">External</th>
                    <th className="text-left p-2">Total</th>
                    <th className="text-left p-2">Grade</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.subjects.map((subject, index) => {
                    const total = calculateTotal(subject.internal, subject.external);
                    const { grade, point } = getGrade(total);
                    return (
                      <tr key={index} className="border-b">
                        <td className="p-2">{subject.code}</td>
                        <td className="p-2">{subject.name}</td>
                        <td className="p-2">{subject.type}</td>
                        <td className="p-2">{subject.credits}</td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={subject.internal}
                            onChange={(e) => updateSubject(index, 'internal', parseInt(e.target.value))}
                            className="w-16 border border-gray-300 rounded px-2 py-1"
                            min="0"
                            max="100"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={subject.external}
                            onChange={(e) => updateSubject(index, 'external', parseInt(e.target.value))}
                            className="w-16 border border-gray-300 rounded px-2 py-1"
                            min="0"
                            max="100"
                          />
                        </td>
                        <td className="p-2 font-semibold">{total}</td>
                        <td className="p-2">
                          <span className={`font-semibold ${grade === 'F' ? 'text-red-600' : 'text-green-600'}`}>
                            {grade} ({point})
                          </span>
                        </td>
                        <td className="p-2">
                          <button
                            type="button"
                            onClick={() => removeSubject(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
            disabled={saving || formData.subjects.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Grade Card'}
          </button>
        </div>
      </form>
    </div>
  );
}