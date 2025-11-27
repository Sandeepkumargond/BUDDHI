"use client";
import React, { useState } from 'react';
import { FaCheck, FaTimes, FaEye, FaUser, FaBed, FaCalendarAlt, FaRocket } from 'react-icons/fa';
import { initialRequests, initialHostels } from '@/lib/hostelData';

const HostelRequests = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAutoAllocating, setIsAutoAllocating] = useState(false);
  const [allotmentData, setAllotmentData] = useState({
    hostelId: '',
    roomNumber: '',
    allotmentDate: '',
    specialInstructions: ''
  });

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(req => req.status === filterStatus);

  // Auto-allocation algorithm
  const autoAllocateHostels = () => {
    setIsAutoAllocating(true);
    
    const pendingRequests = requests.filter(req => req.status === 'pending');
    let updatedRequests = [...requests];
    let allocatedCount = 0;
    
    // Sort pending requests by priority (CGPA desc, request date asc)
    const sortedRequests = pendingRequests.sort((a, b) => {
      if (b.cgpa !== a.cgpa) return b.cgpa - a.cgpa;
      return new Date(a.requestDate) - new Date(b.requestDate);
    });
    
    // Track available rooms for each hostel
    const hostelAvailability = {};
    initialHostels.forEach(hostel => {
      const roomStartNumber = hostel.id * 100 + 1;
      hostelAvailability[hostel.id] = {
        name: hostel.name,
        type: hostel.type,
        available: hostel.availableRooms,
        rooms: Array.from({length: hostel.availableRooms}, (_, i) => roomStartNumber + i)
      };
    });
    
    sortedRequests.forEach(request => {
      // Determine gender-appropriate hostels
      const genderHostels = Object.entries(hostelAvailability).filter(([_, hostel]) => {
        // Simple gender matching logic based on student name
        const maleNames = ['rajesh', 'amit', 'suresh', 'vikash', 'kumar', 'singh'];
        const isMale = maleNames.some(name => request.studentName.toLowerCase().includes(name));
        return (isMale && hostel.type === 'Boys') || (!isMale && hostel.type === 'Girls');
      });
      
      // Try preferred hostel first
      let allocatedHostel = null;
      let roomNumber = null;
      
      for (let [hostelId, hostel] of genderHostels) {
        if (hostel.name === request.preferredHostel && hostel.available > 0) {
          allocatedHostel = hostel;
          roomNumber = hostel.rooms.shift();
          hostel.available--;
          
          // Update the request
          const requestIndex = updatedRequests.findIndex(r => r.id === request.id);
          updatedRequests[requestIndex] = {
            ...request,
            status: 'approved',
            allottedHostel: hostel.name,
            allottedRoom: `Room-${roomNumber}`,
            allottedDate: new Date().toISOString().split('T')[0],
            allocationType: 'auto'
          };
          allocatedCount++;
          break;
        }
      }
      
      // If preferred hostel not available, try alternate
      if (!allocatedHostel && request.alternateHostel) {
        for (let [hostelId, hostel] of genderHostels) {
          if (hostel.name === request.alternateHostel && hostel.available > 0) {
            roomNumber = hostel.rooms.shift();
            hostel.available--;
            
            const requestIndex = updatedRequests.findIndex(r => r.id === request.id);
            updatedRequests[requestIndex] = {
              ...request,
              status: 'approved',
              allottedHostel: hostel.name,
              allottedRoom: `Room-${roomNumber}`,
              allottedDate: new Date().toISOString().split('T')[0],
              allocationType: 'auto'
            };
            allocatedCount++;
            break;
          }
        }
      }
      
      // If no suitable hostel found, try any available hostel of the same gender
      if (!allocatedHostel) {
        for (let [hostelId, hostel] of genderHostels) {
          if (hostel.available > 0) {
            roomNumber = hostel.rooms.shift();
            hostel.available--;
            
            const requestIndex = updatedRequests.findIndex(r => r.id === request.id);
            updatedRequests[requestIndex] = {
              ...request,
              status: 'approved',
              allottedHostel: hostel.name,
              allottedRoom: `Room-${roomNumber}`,
              allottedDate: new Date().toISOString().split('T')[0],
              allocationType: 'auto'
            };
            allocatedCount++;
            break;
          }
        }
      }
    });
    
    setRequests(updatedRequests);
    setIsAutoAllocating(false);
    
    alert(`Auto-allocation completed! ${allocatedCount} students have been allocated hostels.`);
  };

  const handleStatusUpdate = (requestId, newStatus, allotmentInfo = {}) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: newStatus,
            ...allotmentInfo,
            allocationType: 'manual'
          }
        : req
    ));
  };

  const confirmAllotment = () => {
    if (!allotmentData.hostelId || !allotmentData.roomNumber) {
      alert('Please fill all required fields');
      return;
    }

    const hostel = initialHostels.find(h => h.id === parseInt(allotmentData.hostelId));
    
    handleStatusUpdate(selectedRequest.id, 'approved', {
      allottedHostel: hostel.name,
      allottedRoom: allotmentData.roomNumber,
      allottedDate: allotmentData.allotmentDate || new Date().toISOString().split('T')[0],
      specialInstructions: allotmentData.specialInstructions
    });

    setShowModal(false);
    setAllotmentData({
      hostelId: '',
      roomNumber: '',
      allotmentDate: '',
      specialInstructions: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = requests.filter(req => req.status === 'pending').length;
  const approvedCount = requests.filter(req => req.status === 'approved').length;
  const rejectedCount = requests.filter(req => req.status === 'rejected').length;

  return (
    <div className="p-6">
      {/* Header with Auto-Allocate Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hostel Requests</h1>
        <button
          onClick={autoAllocateHostels}
          disabled={isAutoAllocating || pendingCount === 0}
          className={`px-6 py-3 rounded-md font-semibold flex items-center gap-2 transition-colors ${
            isAutoAllocating || pendingCount === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
          }`}
        >
          <FaRocket className={isAutoAllocating ? 'animate-spin' : ''} />
          {isAutoAllocating ? 'Auto-Allocating...' : `Auto-Allocate (${pendingCount} Pending)`}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <FaUser className="text-2xl text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{requests.length}</h3>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <FaCalendarAlt className="text-2xl text-yellow-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{pendingCount}</h3>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <FaCheck className="text-2xl text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{approvedCount}</h3>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <FaTimes className="text-2xl text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{rejectedCount}</h3>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-md font-medium transition-colors capitalize ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'all' ? `All (${requests.length})` : `${status} (${requests.filter(r => r.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.studentName}</div>
                      <div className="text-sm text-gray-500">{request.studentId}</div>
                      <div className="text-sm text-gray-500">{request.course} - {request.semester}</div>
                      <div className="text-sm text-gray-500">CGPA: {request.cgpa}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Preferred: {request.preferredHostel}</div>
                      {request.alternateHostel && (
                        <div className="text-sm text-gray-500">Alternate: {request.alternateHostel}</div>
                      )}
                      <div className="text-sm text-gray-500">Room Type: {request.roomType}</div>
                      <div className="text-sm text-gray-500">Request Date: {request.requestDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium w-fit ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      {request.allocationType && (
                        <span className={`px-2 py-1 text-xs rounded font-medium w-fit ${
                          request.allocationType === 'auto' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {request.allocationType === 'auto' ? 'Auto' : 'Manual'}
                        </span>
                      )}
                      {request.allottedHostel && (
                        <div className="text-xs text-green-700">
                          <div>{request.allottedHostel}</div>
                          <div>{request.allottedRoom}</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setAllotmentData({
                                hostelId: '',
                                roomNumber: '',
                                allotmentDate: new Date().toISOString().split('T')[0],
                                specialInstructions: ''
                              });
                              setShowModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'rejected', { rejectionReason: 'Manual rejection' })}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedRequest.status === 'pending' ? 'Process Request' : 'Request Details'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Student Information</h3>
                <p><strong>Name:</strong> {selectedRequest.studentName}</p>
                <p><strong>ID:</strong> {selectedRequest.studentId}</p>
                <p><strong>Email:</strong> {selectedRequest.email}</p>
                <p><strong>Phone:</strong> {selectedRequest.phone}</p>
                <p><strong>Course:</strong> {selectedRequest.course}</p>
                <p><strong>Semester:</strong> {selectedRequest.semester}</p>
                <p><strong>CGPA:</strong> {selectedRequest.cgpa}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Request Details</h3>
                <p><strong>Preferred Hostel:</strong> {selectedRequest.preferredHostel}</p>
                {selectedRequest.alternateHostel && (
                  <p><strong>Alternate Hostel:</strong> {selectedRequest.alternateHostel}</p>
                )}
                <p><strong>Room Type:</strong> {selectedRequest.roomType}</p>
                <p><strong>Request Date:</strong> {selectedRequest.requestDate}</p>
                <p><strong>Emergency Contact:</strong> {selectedRequest.emergencyContact}</p>
                <p><strong>Parent Name:</strong> {selectedRequest.parentName}</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Reason for Request</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedRequest.reason}</p>
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Allotment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Hostel *
                    </label>
                    <select
                      value={allotmentData.hostelId}
                      onChange={(e) => setAllotmentData(prev => ({ ...prev, hostelId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Hostel</option>
                      {initialHostels
                        .filter(hostel => hostel.availableRooms > 0)
                        .map(hostel => (
                          <option key={hostel.id} value={hostel.id}>
                            {hostel.name} ({hostel.availableRooms} available)
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      value={allotmentData.roomNumber}
                      onChange={(e) => setAllotmentData(prev => ({ ...prev, roomNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter room number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allotment Date
                    </label>
                    <input
                      type="date"
                      value={allotmentData.allotmentDate}
                      onChange={(e) => setAllotmentData(prev => ({ ...prev, allotmentDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      value={allotmentData.specialInstructions}
                      onChange={(e) => setAllotmentData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any special instructions..."
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {selectedRequest.status === 'approved' && selectedRequest.allottedHostel && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-semibold text-green-800 mb-2">Allotment Information</h3>
                <p><strong>Allotted Hostel:</strong> {selectedRequest.allottedHostel}</p>
                <p><strong>Room:</strong> {selectedRequest.allottedRoom}</p>
                <p><strong>Allotment Date:</strong> {selectedRequest.allottedDate}</p>
                <p><strong>Allocation Type:</strong> {selectedRequest.allocationType === 'auto' ? 'Auto-Allocated' : 'Manual'}</p>
                {selectedRequest.specialInstructions && (
                  <p><strong>Instructions:</strong> {selectedRequest.specialInstructions}</p>
                )}
              </div>
            )}

            {selectedRequest.status === 'rejected' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="font-semibold text-red-800 mb-2">Rejection Information</h3>
                <p>{selectedRequest.rejectionReason || 'Request was rejected'}</p>
              </div>
            )}

            <div className="flex gap-4">
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={confirmAllotment}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve & Allot
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected', { rejectionReason: 'Manual rejection by admin' })}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelRequests;
