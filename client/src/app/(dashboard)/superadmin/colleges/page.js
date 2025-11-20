"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { apiService } from "@/lib/api";

const AllCollegesPage = () => {
  // fetched colleges (mapped from admins) running on the platform
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedCollege, setSelectedCollege] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleStatusToggle = (id) => {
    setColleges(prev => 
      prev.map(college => 
        college.id === id ? { 
          ...college, 
          status: college.status === "active" ? "inactive" : "active",
          lastActive: college.status === "active" ? college.lastActive : new Date().toISOString().split('T')[0]
        } : college
      )
    );
  };

  const handleDeactivate = (id) => {
    if (confirm("Are you sure you want to deactivate this college? This will suspend their access to the platform.")) {
      setColleges(prev => 
        prev.map(college => 
          college.id === id ? { ...college, status: "inactive" } : college
        )
      );
      showToast.success("College deactivated successfully!");
    }
  };

  const filteredColleges = colleges.filter(college => {
    const matchesStatus = filterStatus === "all" || college.status === filterStatus;
    const matchesType = filterType === "all" || college.collegeType.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      college.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.adminName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusColor = (status) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getTypeColor = (type) => {
    const colors = {
      "Engineering": "bg-blue-100 text-blue-800",
      "Medical": "bg-red-100 text-red-800",
      "Arts": "bg-purple-100 text-purple-800",
      "Commerce": "bg-yellow-100 text-yellow-800",
      "Law": "bg-gray-100 text-gray-800",
      "Management": "bg-indigo-100 text-indigo-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const activeColleges = colleges.filter(c => c.status === "active").length;
  const inactiveColleges = colleges.filter(c => c.status === "inactive").length;
  const totalStudents = colleges.reduce((sum, c) => sum + (c.totalStudents || 0), 0);

  // Fetch admins from backend and map them to colleges
  useEffect(() => {
    let mounted = true;

    const fetchAdmins = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.request('/super-admin/get-admins');
        const admins = data?.data?.admins || [];

        // Map admins to the college object shape used by this component
        const mapped = admins.map((a) => ({
          id: a._id,
          collegeName: a.collegeName || 'Unknown College',
          collegeType: a.collegeType || 'Unknown',
          adminName: `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.personalMail || a.email,
          email: a.personalMail || a.email,
          phone: a.mobile || '',
          location: a.location || '',
          address: a.address || '',
          establishedYear: a.establishedYear || '',
          affiliation: a.affiliation || '',
          recognitionType: a.recognitionType || '',
          totalStudents: a.totalStudents || 0,
          totalFaculty: a.totalFaculty || 0,
          website: a.website || '',
          status: a.status || 'active',
          joinedDate: a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : '',
          lastActive: a.updatedAt ? new Date(a.updatedAt).toISOString().split('T')[0] : '',
          courses: a.courses || '',
          infrastructure: a.infrastructure || ''
        }));

        if (mounted) setColleges(mapped);
      } catch (err) {
        console.error('Failed to fetch admins:', err);
        if (mounted) setError(err.message || 'Failed to fetch colleges');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAdmins();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">All Colleges</h1>
          <p className="text-gray-600 mt-1">View and manage all colleges running on the platform</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Colleges</p>
              <p className="text-2xl font-bold text-gray-900">{colleges.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Colleges</p>
              <p className="text-2xl font-bold text-green-600">{activeColleges}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Colleges</p>
              <p className="text-2xl font-bold text-red-600">{inactiveColleges}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-purple-600">{totalStudents.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search colleges, location, or admin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="engineering">Engineering</option>
                <option value="medical">Medical</option>
                <option value="arts">Arts</option>
                <option value="commerce">Commerce</option>
                <option value="law">Law</option>
                <option value="management">Management</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {filteredColleges.length} of {colleges.length} colleges
          </div>
        </div>
      </div>

      {/* Colleges Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  College Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statistics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredColleges.map((college) => (
                <tr key={college.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {college.collegeName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{college.collegeName}</div>
                        <div className="text-sm text-gray-500">{college.location}</div>
                        <div className="text-xs text-gray-400">Est. {college.establishedYear}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{college.adminName}</div>
                    <div className="text-sm text-gray-500">{college.email}</div>
                    <div className="text-sm text-gray-500">{college.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Students: {college.totalStudents}</div>
                    <div className="text-sm text-gray-500">Faculty: {college.totalFaculty}</div>
                    <div className="text-sm text-gray-500">{college.affiliation}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(college.collegeType)}`}>
                        {college.collegeType}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(college.status)}`}>
                        {college.status.charAt(0).toUpperCase() + college.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Joined: {college.joinedDate}</div>
                    <div>Last Active: {college.lastActive}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCollege(college)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleStatusToggle(college.id)}
                        className={college.status === "active" ? "text-orange-600 hover:text-orange-900" : "text-green-600 hover:text-green-900"}
                        title={college.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {college.status === "active" ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>

                      {college.website && (
                        <a
                          href={college.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900"
                          title="Visit Website"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredColleges.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No colleges found matching your criteria.
          </div>
        )}
      </div>

      {/* College Details Modal */}
      {selectedCollege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">College Details</h2>
                <button
                  onClick={() => setSelectedCollege(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* College Information */}
              <div>
                <h3 className="text-lg font-medium mb-3">College Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">College Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCollege.collegeName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">College Type</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedCollege.collegeType)}`}>
                      {selectedCollege.collegeType}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Established Year</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCollege.establishedYear}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Affiliation</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCollege.affiliation}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recognition</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCollege.recognitionType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    {selectedCollege.website ? (
                      <a href={selectedCollege.website} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-blue-600 hover:text-blue-800">
                        {selectedCollege.website}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">Not provided</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-medium mb-3">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Full Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCollege.address}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCollege.location}</p>
                  </div>
                </div>
              </div>

              {/* Admin Information */}
              <div>
                <h3 className="text-lg font-medium mb-3">Administrative Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCollege.adminName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCollege.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCollege.phone}</p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-medium mb-3">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Students</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCollege.totalStudents}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Faculty</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCollege.totalFaculty}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCollege.status)}`}>
                      {selectedCollege.status.charAt(0).toUpperCase() + selectedCollege.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Joined Date</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCollege.joinedDate}</p>
                  </div>
                </div>
              </div>

              {/* Courses */}
              <div>
                <h3 className="text-lg font-medium mb-3">Courses Offered</h3>
                <p className="text-sm text-gray-900">{selectedCollege.courses}</p>
              </div>

              {/* Infrastructure */}
              <div>
                <h3 className="text-lg font-medium mb-3">Infrastructure</h3>
                <p className="text-sm text-gray-900">{selectedCollege.infrastructure}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleStatusToggle(selectedCollege.id)}
                  className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                    selectedCollege.status === "active" 
                      ? "bg-orange-600 text-white hover:bg-orange-700" 
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {selectedCollege.status === "active" ? "Deactivate College" : "Activate College"}
                </button>
                {selectedCollege.website && (
                  <a
                    href={selectedCollege.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCollegesPage;