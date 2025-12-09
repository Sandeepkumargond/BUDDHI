"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";

export default function LibraryInventoryPage() {
    const { user } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        accessLink: '',
        category: 'E-Book',
        isbn: '',
        publicationYear: '',
        publisher: '',
        description: '',
        isShareable: false,
        isLocalAvailable: true
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await apiService.request('/library/inventory');

            if (response.success) {
                setInventory(response.data.inventory || []);
            }
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            accessLink: '',
            category: 'E-Book',
            isbn: '',
            publicationYear: '',
            publisher: '',
            description: '',
            isShareable: false,
            isLocalAvailable: true
        });
        setEditingBook(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingBook) {
                // Update existing book
                const response = await apiService.request(`/library/inventory/${editingBook.bookId}`, {
                    method: 'PUT',
                    body: formData
                });

                if (response.success) {
                    setInventory(inventory.map(book =>
                        book.bookId === editingBook.bookId ? response.data : book
                    ));
                    setShowAddModal(false);
                    resetForm();
                }
            } else {
                // Create new book
                const response = await apiService.request('/library/inventory', {
                    method: 'POST',
                    body: formData
                });

                if (response.success) {
                    setInventory([response.data, ...inventory]);
                    setShowAddModal(false);
                    resetForm();
                }
            }
        } catch (err) {
            console.error('Error saving book:', err);
            alert(err.message);
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            accessLink: book.accessLink,
            category: book.category,
            isbn: book.isbn || '',
            publicationYear: book.publicationYear || '',
            publisher: book.publisher || '',
            description: book.description || '',
            isShareable: book.isShareable,
            isLocalAvailable: book.isLocalAvailable
        });
        setShowAddModal(true);
    };

    const handleDelete = async (bookId) => {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            await apiService.request(`/library/inventory/${bookId}`, {
                method: 'DELETE'
            });

            setInventory(inventory.filter(book => book.bookId !== bookId));
        } catch (err) {
            console.error('Error deleting book:', err);
            alert(err.message);
        }
    };

    const handleToggleShareable = async (bookId, currentValue) => {
        try {
            const response = await apiService.request(`/library/inventory/${bookId}/shareable`, {
                method: 'PUT',
                body: { isShareable: !currentValue }
            });

            if (response.success) {
                setInventory(inventory.map(book =>
                    book.bookId === bookId ? { ...book, isShareable: !currentValue } : book
                ));
            }
        } catch (err) {
            console.error('Error updating shareable status:', err);
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">📚 Library Inventory</h1>
                    <p className="text-gray-600 mt-1">Manage your institute's digital library resources</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Add Book
                </button>
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
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Shareable</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {inventory.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No books in inventory. Add your first book to get started.
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((book) => (
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
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleShareable(book.bookId, book.isShareable)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${book.isShareable ? 'bg-green-600' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${book.isShareable ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(book)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(book.bookId)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Book Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            {editingBook ? 'Edit Book' : 'Add New Book'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                                    <input
                                        type="text"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Access Link *</label>
                                    <input
                                        type="url"
                                        value={formData.accessLink}
                                        onChange={(e) => setFormData({ ...formData, accessLink: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="https://example.com/ebook"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="E-Book">E-Book</option>
                                        <option value="Journal">Journal</option>
                                        <option value="Research Paper">Research Paper</option>
                                        <option value="Reference Material">Reference Material</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                                    <input
                                        type="text"
                                        value={formData.isbn}
                                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
                                    <input
                                        type="number"
                                        value={formData.publicationYear}
                                        onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        min="1900"
                                        max="2100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                                    <input
                                        type="text"
                                        value={formData.publisher}
                                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        rows="3"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isShareable}
                                            onChange={(e) => setFormData({ ...formData, isShareable: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Allow sharing with partner institutes
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingBook ? 'Update' : 'Add'} Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
