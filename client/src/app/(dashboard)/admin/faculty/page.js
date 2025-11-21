"use client";

import { useState, useEffect } from "react";
import { showToast } from "@/lib/toast";
import { apiService } from "@/lib/api";
import FormModal from "@/components/FormModal";

export default function FacultyManagement() {
  const [facultyList, setFacultyList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [expandedFacultyId, setExpandedFacultyId] = useState(null);

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
    fetchAllCourses();
  }, []);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllFaculty();
      setFacultyList(response.data?.faculty || []);
    } catch (error) {
      showToast.error("Failed to fetch faculty");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getAllDepartments();
      setDepartments(response.data?.departments || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const response = await apiService.getAllCourses();
      setCourses(response.data?.courses || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const handleAddFaculty = async (formData) => {
    try {
      // Ensure all required fields are present
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        personalMail: formData.personalMail,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        mobile: formData.mobile || '',
        department: formData.department,
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        designation: formData.designation || ''
      };
      
      const response = await apiService.createFaculty(payload);
      showToast.success("Faculty added successfully!");
      setShowAddModal(false);
      fetchFaculty();
    } catch (error) {
      console.error('Create faculty error:', error);
      showToast.error(error.response?.data?.message || error.message || "Failed to add faculty");
    }
  };

  const handleAssignCourse = async (assignmentData) => {
    try {
      const payload = {
        facultyId: selectedFaculty._id,
        courseId: assignmentData.courseId,
        semester: Number(assignmentData.semester),
        section: assignmentData.section || '',
        batch: assignmentData.batch || '',
        academicYear: assignmentData.academicYear || new Date().getFullYear().toString()
      };
      
      console.log('Assigning course with payload:', payload);
      
      await apiService.assignCourseToFaculty(payload);
      showToast.success("Course assigned successfully!");
      setShowAssignModal(false);
      setSelectedFaculty(null);
      fetchFaculty();
    } catch (error) {
      console.error('Assign course error:', error);
      showToast.error(error.response?.data?.message || error.message || "Failed to assign course");
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (!confirm("Are you sure you want to delete this faculty member?")) return;
    
    try {
      await apiService.deleteFaculty(facultyId);
      showToast.success("Faculty deleted successfully!");
      fetchFaculty();
    } catch (error) {
      showToast.error("Failed to delete faculty");
    }
  };

  const handleRemoveCourse = async (facultyId, assignmentId, courseName) => {
    if (!confirm(`Are you sure you want to remove the course assignment: ${courseName}?`)) return;
    
    try {
      await apiService.removeCourseFromFaculty(facultyId, assignmentId);
      showToast.success("Course assignment removed successfully!");
      fetchFaculty();
    } catch (error) {
      console.error('Remove course error:', error);
      showToast.error(error.response?.data?.message || error.message || "Failed to remove course assignment");
    }
  };

  const openAssignModal = (faculty) => {
    setSelectedFaculty(faculty);
    setShowAssignModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Faculty Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + Add Faculty
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading faculty...</div>
      ) : facultyList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No faculty members found. Add one to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Courses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {facultyList.map((faculty) => (
                <>
                  <tr key={faculty._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{faculty.facultyId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={faculty.imageUrl || "/avatar.png"}
                          alt={faculty.firstName}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {faculty.firstName} {faculty.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{faculty.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{faculty.department}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setExpandedFacultyId(expandedFacultyId === faculty._id ? null : faculty._id)}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {faculty.assignedCourses?.filter(c => c.isActive).length || 0} course(s)
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => openAssignModal(faculty)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Assign Course
                      </button>
                      <button
                        onClick={() => handleDeleteFaculty(faculty._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedFacultyId === faculty._id && faculty.assignedCourses?.filter(c => c.isActive).length > 0 && (
                    <tr key={`${faculty._id}-courses`}>
                      <td colSpan="6" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm text-gray-700 mb-3">Assigned Courses:</h3>
                          <div className="grid gap-2">
                            {faculty.assignedCourses.filter(c => c.isActive).map((assignment) => (
                              <div 
                                key={assignment._id} 
                                className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {assignment.courseId?.name || 'Unknown Course'} ({assignment.courseId?.code || 'N/A'})
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    Semester: {assignment.semester}
                                    {assignment.section && ` | Section: ${assignment.section}`}
                                    {assignment.batch && ` | Batch: ${assignment.batch}`}
                                    {assignment.academicYear && ` | Year: ${assignment.academicYear}`}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveCourse(
                                    faculty._id, 
                                    assignment._id,
                                    `${assignment.courseId?.name || 'Unknown'} (Sem ${assignment.semester}${assignment.section ? `, Sec ${assignment.section}` : ''})`
                                  )}
                                  className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Faculty Modal */}
      {showAddModal && (
        <AddFacultyModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddFaculty}
          departments={departments}
        />
      )}

      {/* Assign Course Modal */}
      {showAssignModal && selectedFaculty && (
        <AssignCourseModal
          faculty={selectedFaculty}
          courses={courses}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedFaculty(null);
          }}
          onSubmit={handleAssignCourse}
        />
      )}
    </div>
  );
}

function AddFacultyModal({ onClose, onSubmit, departments }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    personalMail: "",
    password: "",
    dateOfBirth: "",
    gender: "Male",
    mobile: "",
    department: "",
    designation: "",
    joiningDate: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Faculty</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Official Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Personal Email *</label>
              <input
                type="email"
                name="personalMail"
                required
                value={formData.personalMail}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender *</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department *</label>
              <select
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Department</option>
                <option value="CSE">Computer Science and Engineering</option>
                <option value="ECE">Electronics and Communication Engineering</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="CE">Civil Engineering</option>
                <option value="EE">Electrical Engineering</option>
                <option value="Architecture">Architecture</option>
                <option value="Chemical">Chemical Engineering</option>
                <option value="Biotech">Biotechnology</option>
                <option value="IT">Information Technology</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., Assistant Professor"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Joining Date</label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Faculty
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignCourseModal({ faculty, courses, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    courseId: "",
    semester: "",
    section: "",
    batch: "",
    academicYear: new Date().getFullYear().toString()
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Assign Course to {faculty.firstName} {faculty.lastName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Course *</label>
            <select
              name="courseId"
              required
              value={formData.courseId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.name} (Sem {course.semester})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{courses.length} courses available</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Semester *</label>
            <select
              name="semester"
              required
              value={formData.semester}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Batch</label>
              <input
                type="text"
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., 2024"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Academic Year *</label>
            <input
              type="text"
              name="academicYear"
              required
              value={formData.academicYear}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., 2024"
            />
          </div>

          {/* Show existing assignments */}
          {faculty.assignedCourses?.filter(c => c.isActive).length > 0 && (
            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">Current Assignments ({faculty.assignedCourses.filter(c => c.isActive).length}):</p>
              <div className="space-y-2 text-sm text-gray-600 max-h-40 overflow-y-auto">
                {faculty.assignedCourses.filter(c => c.isActive).map((assignment, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded">
                    <div className="font-medium">{assignment.courseId?.name || 'Unknown'} ({assignment.courseId?.code || 'N/A'})</div>
                    <div className="text-xs">
                      Sem {assignment.semester}
                      {assignment.section && ` | Sec ${assignment.section}`}
                      {assignment.batch && ` | Batch ${assignment.batch}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Assign Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
