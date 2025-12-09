"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

export default function SuperAdminLibraryGovernance() {
    const [agreements, setAgreements] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAgreement, setNewAgreement] = useState({
        selectedInstitutes: [],
        sharingPolicy: "Selected Resources"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [agreementsRes, adminsRes] = await Promise.all([
                apiService.request('/library/agreement'),
                apiService.request('/super-admin/get-admins')
            ]);

            if (agreementsRes.success) {
                setAgreements(agreementsRes.data.agreements || []);
            }

            if (adminsRes.success) {
                setAdmins(adminsRes.data.admins || []);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleInstitute = (instituteId) => {
        setNewAgreement(prev => ({
            ...prev,
            selectedInstitutes: prev.selectedInstitutes.includes(instituteId)
                ? prev.selectedInstitutes.filter(id => id !== instituteId)
                : [...prev.selectedInstitutes, instituteId]
        }));
    };

    const handleCreateAgreement = async (e) => {
        e.preventDefault();

        if (newAgreement.selectedInstitutes.length < 2) {
            alert('Please select at least 2 institutes to create sharing agreements');
            return;
        }

        try {
            // Create agreements between all selected institutes (fully connected mesh)
            const selectedInstitutes = newAgreement.selectedInstitutes;
            const agreementPromises = [];

            for (let i = 0; i < selectedInstitutes.length; i++) {
                for (let j = i + 1; j < selectedInstitutes.length; j++) {
                    // Create bidirectional agreements
                    agreementPromises.push(
                        apiService.request('/library/agreement', {
                            method: 'POST',
                            body: {
                                sharingInstituteId: selectedInstitutes[i],
                                accessInstituteId: selectedInstitutes[j],
                                sharingPolicy: newAgreement.sharingPolicy
                            }
                        })
                    );
                    agreementPromises.push(
                        apiService.request('/library/agreement', {
                            method: 'POST',
                            body: {
                                sharingInstituteId: selectedInstitutes[j],
                                accessInstituteId: selectedInstitutes[i],
                                sharingPolicy: newAgreement.sharingPolicy
                            }
                        })
                    );
                }
            }

            await Promise.all(agreementPromises);

            alert('Sharing agreements created successfully!');
            setShowCreateModal(false);
            setNewAgreement({ selectedInstitutes: [], sharingPolicy: "Selected Resources" });
            fetchData();
        } catch (err) {
            console.error('Error creating agreements:', err);
            alert('Error creating agreements: ' + err.message);
        }
    };

    const handleToggleStatus = async (agreementId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
            await apiService.request(`/library/agreement/${agreementId}/status`, {
                method: 'PUT',
                body: { status: newStatus }
            });
            fetchData();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Error updating status: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">📚 Shared Library Governance</h1>
                    <p className="text-gray-600 mt-1">Manage inter-institutional resource sharing agreements</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Create Agreement
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <span className="text-red-800">{error}</span>
                </div>
            )}

            {/* Agreements Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agreement ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sharing Institute</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access Institute</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {agreements.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No sharing agreements yet. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            agreements.map((agreement) => (
                                <tr key={agreement._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        {agreement.agreementId}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-medium text-gray-900">
                                            {agreement.sharingInstituteId?.collegeName || 'N/A'}
                                        </div>
                                        <div className="text-gray-500">{agreement.sharingInstituteId?.abbreviation || ''}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-medium text-gray-900">
                                            {agreement.accessInstituteId?.collegeName || 'N/A'}
                                        </div>
                                        <div className="text-gray-500">{agreement.accessInstituteId?.abbreviation || ''}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{agreement.sharingPolicy}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${agreement.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {agreement.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleStatus(agreement.agreementId, agreement.status)}
                                            className={`text-sm font-medium ${agreement.status === 'Active'
                                                ? 'text-red-600 hover:text-red-900'
                                                : 'text-green-600 hover:text-green-900'
                                                }`}
                                        >
                                            {agreement.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Agreement Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Create Sharing Agreement</h2>
                        <p className="text-gray-600 mb-6">
                            Select 2 or more institutes to create bidirectional sharing agreements between all selected institutes.
                        </p>

                        <form onSubmit={handleCreateAgreement}>
                            {/* Institute Selection */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Select Institutes (check at least 2)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newAgreement.selectedInstitutes.length === admins.length) {
                                                // Deselect all
                                                setNewAgreement({ ...newAgreement, selectedInstitutes: [] });
                                            } else {
                                                // Select all
                                                setNewAgreement({ ...newAgreement, selectedInstitutes: admins.map(a => a._id) });
                                            }
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {newAgreement.selectedInstitutes.length === admins.length ? '✓ Deselect All' : '☐ Select All'}
                                    </button>
                                </div>
                                <div className="space-y-2 border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                                    {admins.map((admin) => (
                                        <label
                                            key={admin._id}
                                            className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={newAgreement.selectedInstitutes.includes(admin._id)}
                                                onChange={() => handleToggleInstitute(admin._id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <div className="ml-3">
                                                <div className="font-medium text-gray-900">{admin.collegeName}</div>
                                                <div className="text-sm text-gray-500">{admin.abbreviation} • {admin.collegeRegistartionNo}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Selected: {newAgreement.selectedInstitutes.length} institute(s)
                                </p>
                            </div>

                            {/* Sharing Policy */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sharing Policy
                                </label>
                                <select
                                    value={newAgreement.sharingPolicy}
                                    onChange={(e) => setNewAgreement({ ...newAgreement, sharingPolicy: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option>Selected Resources</option>
                                    <option>Only Tier 1 Resources</option>
                                    <option>Full E-Book Catalogue</option>
                                </select>
                            </div>

                            {/* Info Box */}
                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium">Automatic Bidirectional Sharing</p>
                                        <p className="mt-1">
                                            When you select multiple institutes, bidirectional agreements will be created between all
                                            pairs. For example, selecting A, B, and C creates: A↔B, B↔C, and A↔C.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewAgreement({ selectedInstitutes: [], sharingPolicy: "Selected Resources" });
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={newAgreement.selectedInstitutes.length < 2}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Create Agreements
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
