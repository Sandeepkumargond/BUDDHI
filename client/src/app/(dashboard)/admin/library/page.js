"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";

export default function AdminLibraryPage() {
    const { user } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        shareable: 0,
        categories: {}
    });
    const [filter, setFilter] = useState({
        category: '',
        isShareable: ''
    });

    useEffect(() => {
        fetchInventory();
    }, [filter]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await apiService.request('/library/admin/inventory');

            if (response.success) {
                const books = response.data.inventory || [];
                setInventory(books);

                // Calculate stats
                const total = books.length;
                const shareable = books.filter(b => b.isShareable).length;
                const categories = books.reduce((acc, book) => {
                    acc[book.category] = (acc[book.category] || 0) + 1;
                    return acc;
                }, {});

                setStats({ total, shareable, categories });
            }
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredInventory = inventory.filter(book => {
        if (filter.category && book.category !== filter.category) return false;
        if (filter.isShareable === 'true' && !book.isShareable) return false;
        if (filter.isShareable === 'false' && book.isShareable) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading library data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">📚 Library Management</h1>
                <p className="text-gray-600 mt-1">View and manage your institution's digital library inventory</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border p-4">
                    <div className="text-sm text-gray-600">Total Books</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <div className="text-sm text-gray-600">Shareable</div>
                    <div className="text-3xl font-bold text-green-600">{stats.shareable}</div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <div className="text-sm text-gray-600">Private</div>
                    <div className="text-3xl font-bold text-gray-600">{stats.total - stats.shareable}</div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <div className="text-sm text-gray-600">Categories</div>
                    <div className="text-3xl font-bold text-purple-600">{Object.keys(stats.categories).length}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={filter.category}
                            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="">All Categories</option>
                            <option value="E-Book">E-Book</option>
                            <option value="Journal">Journal</option>
                            <option value="Research Paper">Research Paper</option>
                            <option value="Reference Material">Reference Material</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sharing Status</label>
                        <select
                            value={filter.isShareable}
                            onChange={(e) => setFilter({ ...filter, isShareable: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="">All Books</option>
                            <option value="true">Shareable Only</option>
                            <option value="false">Private Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <span className="text-red-800">{error}</span>
                </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Added</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        {inventory.length === 0
                                            ? "No books in inventory yet."
                                            : "No books match the selected filters."}
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map((book) => (
                                    <tr key={book._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                            {book.bookId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                            {book.isbn && <div className="text-xs text-gray-500">ISBN: {book.isbn}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{book.author}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {book.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {book.publicationYear || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${book.isShareable
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {book.isShareable ? '🔗 Shared' : '🔒 Private'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            {new Date(book.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Library Management Overview</p>
                        <p>This page shows all books in your institution's digital library. Books marked as "Shared" are available to students from partner institutions through active sharing agreements.</p>
                        <p className="mt-2">
                            <strong>Note:</strong> To modify the inventory or change sharing status, please use the Sub Admin account or contact your librarian.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
