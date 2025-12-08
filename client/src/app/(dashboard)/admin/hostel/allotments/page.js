"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaDownload, FaBed, FaUser, FaCalendarAlt, FaFilter, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { initialRequests, initialHostels } from '@/lib/hostelData';
import { fetchHostelApplications, fetchHostels, updateHostelAllocation, removeHostelAllocation } from '@/lib/hostelApi';

const HostelAllotments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHostel, setFilterHostel] = useState('all');
  const [filterType, setFilterType] = useState('all'); // auto or manual
  const [allotments, setAllotments] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [selectedAllotment, setSelectedAllotment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    hostelId: '',
    roomNumber: '',
    floor: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Helper functions for floor and room selection
  const getAllFloorsForHostel = (hostelId) => {
    const hostel = hostels.find(h => String(h._id) === String(hostelId) || String(h.id) === String(hostelId));
    if (!hostel) return [];
    
    const numberOfFloors = hostel.numberOfFloors || 1;
    const floors = [];
    for (let i = 0; i < numberOfFloors; i++) {
      floors.push(i);
    }
    return floors;
  };

  const getAvailableRoomsCountPerFloor = (hostelId) => {
    const hostel = hostels.find(h => String(h._id) === String(hostelId) || String(h.id) === String(hostelId));
    if (!hostel) return {};
    
    const roomsPerFloor = {};
    const numberOfFloors = hostel.numberOfFloors || 1;
    
    // Initialize all floors with 0
    for (let i = 0; i < numberOfFloors; i++) {
      roomsPerFloor[i] = 0;
    }
    
    // Count available rooms per floor
    if (hostel.rooms) {
      hostel.rooms.forEach(r => {
        const floor = r.floor ?? 0;
        if (!r.occupied) {
          roomsPerFloor[floor] = (roomsPerFloor[floor] || 0) + 1;
        }
      });
    }
    
    return roomsPerFloor;
  };

  const getRoomsOnFloor = (hostelId, floor) => {
    const hostel = hostels.find(h => String(h._id) === String(hostelId) || String(h.id) === String(hostelId));
    if (!hostel) return [];
    
    const roomsOnFloor = hostel.rooms ? hostel.rooms.filter(r => !r.occupied && (r.floor ?? 0) === floor) : [];
    return roomsOnFloor.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  };

  const getAvailableRoomsForHostel = (hostelId) => {
    const hostel = hostels.find(h => String(h._id) === String(hostelId) || String(h.id) === String(hostelId));
    if (!hostel) return [];
    
    const availableRooms = hostel.rooms ? hostel.rooms.filter(r => !r.occupied) : [];
    return availableRooms.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [apps, hs] = await Promise.all([fetchHostelApplications(), fetchHostels()]);
        if (mounted) {
          const approvedApps = apps.filter(app => app.status === 'approved' && app.allottedHostel);
          setAllotments(approvedApps);
          setHostels(hs);
        }
      } catch (e) {
        console.error('Failed to load hostel data', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
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

  const openDetailsModal = (allotment) => {
    setSelectedAllotment(allotment);
    setShowDetailsModal(true);
  };

  const openEditModal = (allotment) => {
    setSelectedAllotment(allotment);
    setEditFormData({
      hostelId: hostels.find(h => h.name === allotment.allottedHostel)?._id || '',
      roomNumber: allotment.allottedRoom || '',
      floor: allotment.floor || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editFormData.hostelId || !editFormData.roomNumber || !editFormData.floor) {
      alert('Please select hostel, floor, and room number');
      return;
    }

    try {
      const selectedHostel = hostels.find(h => String(h._id) === String(editFormData.hostelId) || String(h.id) === String(editFormData.hostelId));
      if (!selectedHostel) {
        throw new Error('Hostel not found');
      }

      await updateHostelAllocation(selectedAllotment._id, selectedHostel.name, editFormData.roomNumber, editFormData.floor);
      
      // Update local state
      setAllotments(prev => prev.map(a => 
        a._id === selectedAllotment._id 
          ? { ...a, allottedHostel: selectedHostel.name, allottedRoom: editFormData.roomNumber, floor: editFormData.floor }
          : a
      ));
      
      setShowEditModal(false);
      alert('Hostel allocation updated successfully');
    } catch (err) {
      console.error('Failed to update allocation', err);
      alert(err.message || 'Failed to update allocation');
    }
  };

  const handleRemove = async (allotment) => {
    if (!window.confirm(`Are you sure you want to remove ${allotment.studentName} from ${allotment.allottedHostel}? They will be able to apply for hostel again.`)) {
      return;
    }

    try {
      await removeHostelAllocation(allotment._id);
      
      // Update local state
      setAllotments(prev => prev.filter(a => a._id !== allotment._id));
      
      alert(`${allotment.studentName} has been successfully removed from ${allotment.allottedHostel}. They can now apply for hostel again.`);
    } catch (err) {
      console.error('Failed to remove allocation', err);
      alert(err.message || 'Failed to remove student from hostel');
    }
  };

  const uniqueHostels = [...new Set(allotments.map(a => a.allottedHostel))];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <p>Loading hostel allotments...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hostel Allotments</h1>
        <button
          onClick={exportToCSV}
          className="bg-[#C3EBFA] text-gray-600 px-4 py-2 rounded-md hover:bg-[#A8DBF2] transition-colors flex items-center gap-2"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAllotments.map(allotment => (
                <tr key={allotment._id || allotment.id} className="hover:bg-gray-50">
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
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetailsModal(allotment)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => openEditModal(allotment)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleRemove(allotment)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
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

      {/* View Details Modal */}
      {showDetailsModal && selectedAllotment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Allotment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Student Information</h3>
                <p><strong>Name:</strong> {selectedAllotment.studentName}</p>
                <p><strong>ID:</strong> {selectedAllotment.studentId}</p>
                <p><strong>Email:</strong> {selectedAllotment.email}</p>
                <p><strong>Phone:</strong> {selectedAllotment.phone}</p>
                <p><strong>Course:</strong> {selectedAllotment.course}</p>
                <p><strong>Semester:</strong> {selectedAllotment.semester}</p>
                <p><strong>CGPA:</strong> {selectedAllotment.cgpa}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Allotment Details</h3>
                <p><strong>Hostel:</strong> {selectedAllotment.allottedHostel}</p>
                <p><strong>Room:</strong> {selectedAllotment.allottedRoom}</p>
                <p><strong>Allotment Date:</strong> {selectedAllotment.allottedDate}</p>
                <p><strong>Allocation Type:</strong> {selectedAllotment.allocationType === 'auto' ? 'Auto-Allocated' : 'Manual'}</p>
                {selectedAllotment.roomType && (
                  <p><strong>Room Type:</strong> {selectedAllotment.roomType}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Allocation Modal */}
      {showEditModal && selectedAllotment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Hostel Allocation</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Student: {selectedAllotment.studentName} ({selectedAllotment.studentId})</h3>
              
              <div className="bg-blue-50 p-4 rounded mb-4">
                <p className="text-sm"><strong>Current Hostel:</strong> {selectedAllotment.allottedHostel}</p>
                <p className="text-sm"><strong>Current Room:</strong> {selectedAllotment.allottedRoom}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Hostel *
                  </label>
                  <select
                    value={editFormData.hostelId}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, hostelId: e.target.value, floor: '', roomNumber: '' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Hostel</option>
                    {hostels.map(hostel => (
                      <option key={hostel._id || hostel.id} value={hostel._id || hostel.id}>
                        {hostel.name} ({hostel.availableRooms || (hostel.totalRooms - hostel.occupiedRooms)} available)
                      </option>
                    ))}
                  </select>
                </div>

                {editFormData.hostelId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Floor *
                    </label>
                    <select
                      value={editFormData.floor}
                      onChange={(e) => {
                        setEditFormData(prev => ({ ...prev, floor: e.target.value, roomNumber: '' }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Floor</option>
                      {getAllFloorsForHostel(editFormData.hostelId).map(floor => {
                        const availableOnFloor = getAvailableRoomsCountPerFloor(editFormData.hostelId)[floor] || 0;
                        const roomsPerFloor = hostels.find(h => String(h._id) === String(editFormData.hostelId) || String(h.id) === String(editFormData.hostelId))?.roomsPerFloor || 1;
                        return (
                          <option key={floor} value={floor.toString()}>
                            {floor === 0 ? 'Ground Floor' : `Floor ${floor}`} - {availableOnFloor}/{roomsPerFloor} rooms available
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {editFormData.floor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Room Number *
                    </label>
                    <select
                      value={editFormData.roomNumber}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Room</option>
                      {getRoomsOnFloor(editFormData.hostelId, parseInt(editFormData.floor)).map(room => (
                        <option key={room.number} value={room.number}>
                          Room {room.number}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {!editFormData.floor && editFormData.hostelId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Room Number *
                    </label>
                    <select
                      value={editFormData.roomNumber}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Room</option>
                      {getAvailableRoomsForHostel(editFormData.hostelId).map(room => (
                        <option key={room.number} value={room.number}>
                          Room {room.number} (Floor {room.floor === 0 ? 'Ground' : room.floor})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleEditSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Allocation
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelAllotments;
