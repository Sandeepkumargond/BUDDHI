"use client";
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBed, FaUsers } from 'react-icons/fa';
import { fetchHostels, adminSaveHostel, deleteHostel } from '@/lib/hostelApi';

const HostelManagement = () => {
  const [hostels, setHostels] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchHostels();
        if (mounted) setHostels(data);
      } catch (e) {
        console.error('Failed to load hostels', e);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Boys',
    totalRooms: '',
    numberOfFloors: '',
    roomsPerFloor: '',
    warden: '',
    contact: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        totalRooms: parseInt(formData.totalRooms),
        numberOfFloors: parseInt(formData.numberOfFloors) || 1,
        roomsPerFloor: parseInt(formData.roomsPerFloor) || 1,
        warden: formData.warden,
        contact: formData.contact,
        address: formData.address,
      };
      const saved = await adminSaveHostel(payload);
      setHostels(prev => {
        const existsIdx = prev.findIndex(h => (h.name === saved.name));
        if (existsIdx >= 0) {
          const copy = [...prev];
          copy[existsIdx] = {
            id: saved.id || saved._id,
            name: saved.name,
            type: saved.type,
            totalRooms: saved.totalRooms,
            occupiedRooms: saved.occupiedRooms,
            availableRooms: (saved.totalRooms - saved.occupiedRooms),
            numberOfFloors: saved.numberOfFloors,
            roomsPerFloor: saved.roomsPerFloor,
            warden: saved.warden,
            contact: saved.contact,
            address: saved.address,
            feePerMonth: saved.feePerMonth,
            image: saved.image,
          };
          return copy;
        }
        return [
          ...prev,
          {
            id: saved.id || saved._id,
            name: saved.name,
            type: saved.type,
            totalRooms: saved.totalRooms,
            occupiedRooms: saved.occupiedRooms,
            availableRooms: (saved.totalRooms - saved.occupiedRooms),
            numberOfFloors: saved.numberOfFloors,
            roomsPerFloor: saved.roomsPerFloor,
            warden: saved.warden,
            contact: saved.contact,
            address: saved.address,
            feePerMonth: saved.feePerMonth,
            image: saved.image || "/hostel-default.jpg",
          }
        ];
      });
      resetForm();
    } catch (err) {
      console.error('Failed to save hostel', err);
      alert(err.message || 'Failed to save hostel');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Boys',
      totalRooms: '',
      numberOfFloors: '',
      roomsPerFloor: '',
      warden: '',
      contact: '',
      address: ''
    });
    setEditingHostel(null);
    setShowAddForm(false);
  };

  const handleEdit = (hostel) => {
    setEditingHostel(hostel);
    setFormData({
      name: hostel.name,
      type: hostel.type,
      totalRooms: hostel.totalRooms.toString(),
      numberOfFloors: (hostel.numberOfFloors || 1).toString(),
      roomsPerFloor: (hostel.roomsPerFloor || 1).toString(),
      warden: hostel.warden,
      contact: hostel.contact,
      address: hostel.address
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm('Are you sure you want to delete this hostel?')) {
      try {
        await deleteHostel(id, name);
        setHostels(prev => prev.filter(hostel => hostel.id !== id));
        alert('Hostel deleted successfully');
      } catch (err) {
        console.error('Failed to delete hostel', err);
        alert(err.message || 'Failed to delete hostel');
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hostel Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-[#C3EBFA] text-gray-600 px-4 py-2 rounded-md hover:bg-[#A8DBF2] transition-colors flex items-center gap-2"
        >
          <FaPlus /> Add Hostel
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <FaBed className="text-2xl text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{hostels.length}</h3>
              <p className="text-sm text-gray-600">Total Hostels</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <FaUsers className="text-2xl text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {hostels.reduce((sum, h) => sum + h.totalRooms, 0)}
              </h3>
              <p className="text-sm text-gray-600">Total Rooms</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <FaBed className="text-2xl text-yellow-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {hostels.reduce((sum, h) => sum + h.occupiedRooms, 0)}
              </h3>
              <p className="text-sm text-gray-600">Occupied Rooms</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <FaBed className="text-2xl text-purple-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {hostels.reduce((sum, h) => sum + h.availableRooms, 0)}
              </h3>
              <p className="text-sm text-gray-600">Available Rooms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-auto my-auto p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingHostel ? 'Edit Hostel' : 'Add New Hostel'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hostel name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Rooms
                </label>
                <input
                  type="number"
                  name="totalRooms"
                  value={formData.totalRooms}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter total number of rooms"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Floors (Ground=0)
                </label>
                <input
                  type="number"
                  name="numberOfFloors"
                  value={formData.numberOfFloors}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 4 (for ground floor + 3 more floors)"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rooms Per Floor
                </label>
                <input
                  type="number"
                  name="roomsPerFloor"
                  value={formData.roomsPerFloor}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10 (rooms on each floor)"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warden Name
                </label>
                <input
                  type="text"
                  name="warden"
                  value={formData.warden}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter warden name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact number"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hostel address"
                ></textarea>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingHostel ? 'Update Hostel' : 'Add Hostel'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hostels Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">All Hostels</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hostel Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hostels.map(hostel => (
                <tr key={hostel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{hostel.name}</div>
                      <div className="text-sm text-gray-500">{hostel.type} Hostel</div>
                      <div className="text-sm text-gray-500">{hostel.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div>Total: {hostel.totalRooms}</div>
                      <div>Occupied: <span className="text-yellow-600">{hostel.occupiedRooms}</span></div>
                      <div>Available: <span className="text-green-600">{hostel.availableRooms}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{hostel.warden}</div>
                    <div className="text-sm text-gray-500">{hostel.contact}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(hostel)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(hostel.id, hostel.name)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HostelManagement;
