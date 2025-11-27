// src/app/(dashboard)/admin_subadmin/students/[enrolmentNo]/page.js
"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProfileClientSection from "./ProfileClientSection";
import { apiService } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { useAuth } from '@/context/AuthContext';

export default function SingleStudentPage({ params }) {
  const resolved = use(params);
  const enrolmentNo = resolved?.enrolmentNo;
  const { user, role } = useAuth();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  // Check if user can edit (admin or subadmin)
  const canEdit = role === 'admin' || role === 'subadmin';

  useEffect(() => {
    console.log('Auth state - User:', user, 'Role:', role, 'Can edit:', canEdit);
  }, [user, role, canEdit]);

  useEffect(() => {
    if (!enrolmentNo) return;

    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      try {
        // server route: GET /api/v1/student/:id
        const res = await apiService.request(`/student/${enrolmentNo}`);
        // res.data is the student document
        const s = res && res.data ? res.data : null;
        if (!s) {
          setStudent(null);
          return;
        }

        // Map server fields to the client shape used in this page
        const mapped = {
          _id: s._id,
          photo: s.imageUrl || '/student.png',
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          firstName: s.firstName || '',
          lastName: s.lastName || '',
          department: s.branch || s.department || '',
          semester: s.semester || '',
          section: s.section || s.class || '',
          batch: s.batch || '',
          rollNo: s.rollNo || '',
          enrolmentNo: s.enrollmentNo || s.enrolmentNo || '',
          status: s.accountStatus || s.status || '',
          dob: s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : '',
          gender: s.gender || '',
          bloodGroup: s.bloodGroup || '',
          category: s.category || '',
          nationality: s.nationality || '',
          phone: s.mobile || s.fatherMobile || '',
          email: s.email || s.personalMail || '',
          personalMail: s.personalMail || '',
          alternatePhone: s.alternatePhone || '',
          city: s.city || '',
          state: s.state || '',
          currentAddress: s.address || s.currentAddress || '',
          permanentAddress: s.permanentAddress || '',
          postalCode: s.postalCode || s.pincode || '',
          course: s.program || s.course || '',
          mentor: s.mentor || '',
          cgpa: s.cgpa || '',
          backlogs: s.backlogs || '',
          feeStatus: s.feeStatus || '',
          idCardNo: s.idCardNo || '',
          libraryCardNo: s.libraryCardNo || '',
          hostel: s.hostelAlloted || s.hostel || '',
          scholarship: s.scholarshipDetails || s.scholarship || '',
          parentName: s.fatherName || '',
          parentPhone: s.fatherMobile || s.parentPhone || '',
          parentEmail: s.parentEmail || s.personalMail || '',
          parentOccupation: s.fatherOccupation || s.parentOccupation || '',
          aadhar: s.aadharNo || s.aadhar || '',
          healthIssues: s.healthIssues || '',
          insurance: s.insurance || '',
          fatherName: s.fatherName || '',
          motherName: s.motherName || '',
          mobile: s.mobile || '',
          address: s.address || '',
        };

        setStudent(mapped);
        setEditData(mapped);
      } catch (err) {
        console.error('Failed to fetch student:', err);
        setError(err.message || 'Failed to fetch student');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [enrolmentNo]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(student);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Saving student data...', {
        studentId: student._id,
        role: role,
        editData: editData
      });

      // Call API to update student
      const updatePayload = {
        firstName: editData.firstName,
        lastName: editData.lastName,
        mobile: editData.mobile,
        personalMail: editData.personalMail,
        address: editData.address,
        semester: editData.semester,
        section: editData.section,
        batch: editData.batch,
        fatherName: editData.fatherName,
        motherName: editData.motherName,
      };

      console.log('Update payload:', updatePayload);

      let response;
      if (role === 'admin') {
        console.log('Using admin update endpoint');
        response = await apiService.adminUpdateStudent(student._id, updatePayload);
      } else if (role === 'subadmin') {
        console.log('Using subadmin update endpoint');
        response = await apiService.subAdminUpdateStudent(student._id, updatePayload);
      } else {
        throw new Error('Unauthorized to update student');
      }

      console.log('Update response:', response);

      if (response.data) {
        showToast.success('Student updated successfully');
        setStudent({ ...student, ...editData, name: `${editData.firstName} ${editData.lastName}` });
        setIsEditing(false);
      } else {
        throw new Error('No data in response');
      }
    } catch (err) {
      console.error('Failed to update student:', err);
      showToast.error(err.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading student...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-red-600">Error</h1>
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/admin_subadmin/students" className="text-blue-600 underline mt-4 block">
          Back to Students
        </Link>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-red-600">Student Not Found</h1>
        <Link href="/admin_subadmin/students" className="text-blue-600 underline mt-4 block">
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 bg-gray-50">
      {/* TOP HEADER CARD */}
      <div className="p-6 bg-white rounded-xl shadow-md border flex gap-6 items-center">
        <Image
          src={student.photo}
          alt={student.name}
          width={140}
          height={140}
          className="rounded-full border-2 shadow object-cover"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600 text-sm mt-1">
            {student.department} • Sem {student.semester} • Section {student.section} {student.batch && `• Batch ${student.batch}`}
          </p>

          <div className="mt-3 flex gap-3 flex-wrap text-xs">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              Roll: {student.rollNo}
            </span>
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
              Enrol: {student.enrolmentNo}
            </span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
              Status: {student.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Debug: Show role and canEdit status */}
          <div className="text-xs text-gray-500 mb-2">
            Role: {role || 'Not set'} | Can Edit: {canEdit ? 'Yes' : 'No'}
          </div>
          
          {canEdit && (
            <>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Edit Student
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
          <Link
            href="/admin_subadmin/students"
            className="text-sm text-slate-600 hover:text-black text-center"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="md:col-span-2 flex flex-col gap-6">

          {/* BASIC INFO */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="font-semibold mb-4 text-lg text-gray-800 border-b pb-2 drop-shadow-[0_0_8px_rgba(255,182,193,0.45)]">
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>DOB: {student.dob}</div>
              <div>Gender: {student.gender}</div>
              <div>Blood Group: {student.bloodGroup}</div>
              <div>Category: {student.category}</div>
              <div>Nationality: {student.nationality}</div>
            </div>
          </div>

          {/* CONTACT */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="font-semibold mb-4 text-lg text-gray-800 border-b pb-2 drop-shadow-[0_0_8px_rgba(255,182,193,0.45)]">
              Contact
            </h2>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <label className="block text-xs font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={editData.mobile || ''}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Personal Email</label>
                  <input
                    type="email"
                    value={editData.personalMail || ''}
                    onChange={(e) => handleChange('personalMail', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Alternate Phone</label>
                  <input
                    type="text"
                    value={editData.alternatePhone || ''}
                    onChange={(e) => handleChange('alternatePhone', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">Address</label>
                  <textarea
                    value={editData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    rows="2"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>Phone: {student.phone}</div>
                <div>Email: {student.email}</div>
                <div>Personal Email: {student.personalMail}</div>
                <div>Alternate Phone: {student.alternatePhone}</div>
                <div className="col-span-2">Current Address: {student.currentAddress}</div>
                <div className="col-span-2">Permanent Address: {student.permanentAddress}</div>
                <div>Pincode: {student.postalCode}</div>
              </div>
            )}
          </div>

          {/* ACADEMIC */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="font-semibold mb-4 text-lg text-gray-800 border-b pb-2 drop-shadow-[0_0_8px_rgba(255,182,193,0.45)]">
              Academic Details
            </h2>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <label className="block text-xs font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    value={editData.firstName || ''}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editData.lastName || ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Semester</label>
                  <input
                    type="number"
                    value={editData.semester || ''}
                    onChange={(e) => handleChange('semester', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Section</label>
                  <input
                    type="text"
                    value={editData.section || ''}
                    onChange={(e) => handleChange('section', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Batch</label>
                  <input
                    type="text"
                    value={editData.batch || ''}
                    onChange={(e) => handleChange('batch', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    placeholder="e.g., 2024"
                  />
                </div>
                <div>Course: {student.course}</div>
                <div>Department: {student.department}</div>
                <div>Mentor: {student.mentor}</div>
                <div>CGPA: {student.cgpa}</div>
                <div>Backlogs: {student.backlogs}</div>
                <div>Fee Status: {student.feeStatus}</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>Course: {student.course}</div>
                <div>Department: {student.department}</div>
                <div>Semester: {student.semester}</div>
                <div>Section: {student.section}</div>
                <div>Batch: {student.batch}</div>
                <div>Mentor: {student.mentor}</div>
                <div>CGPA: {student.cgpa}</div>
                <div>Backlogs: {student.backlogs}</div>
                <div>Fee Status: {student.feeStatus}</div>
              </div>
            )}
          </div>

          {/* ADMIN DETAILS */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="font-semibold mb-4 text-lg text-gray-800 border-b pb-2 drop-shadow-[0_0_8px_rgba(255,182,193,0.45)]">
              Admin Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>ID Card: {student.idCardNo}</div>
              <div>Library Card: {student.libraryCardNo}</div>
              <div>Hostel: {student.hostel}</div>
              <div>Scholarship: {student.scholarship}</div>
            </div>
          </div>

          {/* PARENT DETAILS */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="font-semibold mb-4 text-lg text-gray-800 border-b pb-2 drop-shadow-[0_0_8px_rgba(255,182,193,0.45)]">
              Parent / Guardian
            </h2>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <label className="block text-xs font-medium mb-1">Father Name</label>
                  <input
                    type="text"
                    value={editData.fatherName || ''}
                    onChange={(e) => handleChange('fatherName', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Mother Name</label>
                  <input
                    type="text"
                    value={editData.motherName || ''}
                    onChange={(e) => handleChange('motherName', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>Phone: {student.parentPhone}</div>
                <div>Email: {student.parentEmail}</div>
                <div>Occupation: {student.parentOccupation}</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>Father Name: {student.fatherName}</div>
                <div>Mother Name: {student.motherName}</div>
                <div>Phone: {student.parentPhone}</div>
                <div>Email: {student.parentEmail}</div>
                <div>Occupation: {student.parentOccupation}</div>
              </div>
            )}
          </div>

          {/* MISC */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="font-semibold mb-4 text-lg text-gray-800 border-b pb-2 drop-shadow-[0_0_8px_rgba(255,182,193,0.45)]">
              Miscellaneous
            </h2>
            <div className="text-sm text-gray-700 space-y-3">
              <div>Aadhar: {student.aadhar}</div>
              <div>Health Issues: {student.healthIssues}</div>
              <div>Insurance: {student.insurance}</div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div>
          <ProfileClientSection student={student} />
        </div>

      </div>
    </div>
  );
}
