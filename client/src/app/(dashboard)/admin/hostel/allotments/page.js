"use client";
import React, { useState, useMemo } from 'react';
import { FaSearch, FaDownload, FaBed, FaUser, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import { initialRequests, initialHostels } from '@/lib/hostelData';

const HostelAllotments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHostel, setFilterHostel] = useState('all');
  const [filterType, setFilterType] = useState('all'); // auto or manual

  // Get only approved requests with allotments
  const allotments = useMemo(() => {
    return initialRequests.filter(req => req.status === 'approved' && req.allottedHostel);
  }, []);

  // Filter allotments based on search and filters
  const filteredAllotments = useMemo(() => {
    let filtered = allotments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(allotment => 
        allotment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allotment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allotment.allottedHostel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allotment.allottedRoom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Hostel filter
    if (filterHostel !== 'all') {
      filtered = filtered.filter(allotment => allotment.allottedHostel === filterHostel);
    }

    // Allocation type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(allotment => allotment.allocationType === filterType);
    }

    return filtered;
  }, [allotments, searchTerm, filterHostel, filterType]);

  // Statistics
  const stats = useMemo(() => {
    const totalAllotments = allotments.length;
    const autoAllotments = allotments.filter(a => a.allocationType === 'auto').length;
    const manualAllotments = allotments.filter(a => a.allocationType === 'manual').length;
    
    const hostelWise = {};
    allotments.forEach(allotment => {
      if (!hostelWise[allotment.allottedHostel]) {
        hostelWise[allotment.allottedHostel] = 0;
      }
      hostelWise[allotment.allottedHostel]++;
    });

    return {
      total: totalAllotments,
      auto: autoAllotments,
      manual: manualAllotments,
      hostelWise
    };
  }, [allotments]);

  const exportToCSV = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Course',
      'Semester',
      'CGPA',
      'Allotted Hostel',
      'Room Number',
      'Allotment Date',
      'Allocation Type',
      'Phone',
      'Email'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredAllotments.map(allotment => [
        allotment.studentId,
        allotment.studentName,
        allotment.course,
        allotment.semester,
        allotment.cgpa,
        allotment.allottedHostel,
        allotment.allottedRoom,
        allotment.allottedDate,
        allotment.allocationType || 'manual',
        allotment.phone,
        allotment.email
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hostel-allotments-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueHostels = [...new Set(allotments.map(a => a.allottedHostel))];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hostel Allotments</h1>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <FaBed className="text-2xl text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{stats.total}</h3>
              <p className="text-sm text-gray-600">Total Allotments</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <FaUser className="text-2xl text-purple-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{stats.auto}</h3>
              <p className="text-sm text-gray-600">Auto Allocated</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <FaCalendarAlt className="text-2xl text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{stats.manual}</h3>
              <p className="text-sm text-gray-600">Manual Allocated</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center">
            <FaBed className="text-2xl text-orange-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{uniqueHostels.length}</h3>
              <p className="text-sm text-gray-600">Hostels Used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, hostel, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <select
              value={filterHostel}
              onChange={(e) => setFilterHostel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Hostels</option>
              {uniqueHostels.map(hostel => (
                <option key={hostel} value={hostel}>{hostel}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="auto">Auto Allocated</option>
              <option value="manual">Manual Allocated</option>
            </select>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <FaFilter className="mr-2" />
            Showing {filteredAllotments.length} of {stats.total} allotments
          </div>
        </div>
      </div>

      {/* Hostel-wise Summary */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Hostel-wise Allotment Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.hostelWise).map(([hostel, count]) => (
            <div key={hostel} className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-gray-800">{hostel}</div>
              <div className="text-sm text-gray-600">{count} students allocated</div>
            </div>
          ))}
        </div>
      </div>

      {/* Allotments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">All Allotments</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allotment Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAllotments.map(allotment => (
                <tr key={allotment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{allotment.studentName}</div>
                      <div className="text-sm text-gray-500">{allotment.studentId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{allotment.course}</div>
                      <div className="text-sm text-gray-500">{allotment.semester}</div>
                      <div className="text-sm text-gray-500">CGPA: {allotment.cgpa}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{allotment.allottedHostel}</div>
                      <div className="text-sm text-gray-500">{allotment.allottedRoom}</div>
                      <div className="text-sm text-gray-500">Date: {allotment.allottedDate}</div>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                          allotment.allocationType === 'auto' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {allotment.allocationType === 'auto' ? 'Auto' : 'Manual'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">{allotment.phone}</div>
                      <div className="text-sm text-gray-500">{allotment.email}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAllotments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FaBed className="mx-auto text-4xl mb-2 text-gray-300" />
            <p>No allotments found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelAllotments;