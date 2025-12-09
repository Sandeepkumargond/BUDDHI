"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";

export default function StudentLibraryPage() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [instituteId, setInstituteId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Determine institute ID based on student email domain
    useEffect(() => {
        const determineInstituteId = async () => {
            try {
                if (!user?.email) {
                    setError("Unable to determine your institute. Please contact support.");
                    setLoading(false);
                    return;
                }

                // Get all admins to match email domain
                const response = await apiService.request('/super-admin/get-admins');

                if (response.success && response.data?.admins) {
                    const admins = response.data.admins;

                    // Try to match by email domain
                    const emailDomain = user.email.split('@')[1];

                    // First try exact domain match
                    let matchedAdmin = admins.find(admin => {
                        const adminEmail = admin.email?.split('@')[1];
                        return adminEmail === emailDomain;
                    });

                    // If no match, try to match by college registration number in email
                    if (!matchedAdmin) {
                        matchedAdmin = admins.find(admin => {
                            const emailLower = user.email.toLowerCase();
                            const regNo = admin.collegeRegistartionNo?.toLowerCase();
                            const abbr = admin.abbreviation?.toLowerCase();
                            return emailLower.includes(regNo) || emailLower.includes(abbr);
                        });
                    }

                    // Default to first admin (NITP) if no match found
                    if (!matchedAdmin && admins.length > 0) {
                        console.warn('No institute match found, using first admin');
                        matchedAdmin = admins[0];
                    }

                    if (matchedAdmin) {
                        setInstituteId(matchedAdmin._id);
                        console.log('Student institute:', matchedAdmin.collegeName, '(' + matchedAdmin._id + ')');
                    } else {
                        setError("No institutes found in the system. Please contact support.");
                    }
                }
            } catch (err) {
                console.error('Error determining institute:', err);
                setError("Failed to load institute information. " + err.message);
            } finally {
                setLoading(false);
            }
        };

        determineInstituteId();
    }, [user]);

    // Fetch all available books when institute ID is determined
    useEffect(() => {
        if (instituteId) {
            fetchAllBooks();
        }
    }, [instituteId]);

    const fetchAllBooks = async () => {
        try {
            setSearching(true);
            setError(null);
            setHasSearched(true);

            // Search with empty query to get all books
            const response = await apiService.request(`/library/search/global?instituteId=${instituteId}`, {
                method: 'POST',
                body: {
                    title: '', // Empty search returns all books
                    instituteId: instituteId
                }
            });

            if (response.success) {
                setSearchResults(response.data.results || []);
            }
        } catch (err) {
            console.error('Error fetching books:', err);
            setError(err.message);
        } finally {
            setSearching(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!instituteId) {
            alert('Unable to determine your institute. Please refresh the page.');
            return;
        }

        try {
            setSearching(true);
            setError(null);
            setHasSearched(true);

            const response = await apiService.request(`/library/search/global?instituteId=${instituteId}`, {
                method: 'POST',
                body: {
                    title: searchQuery.trim(),
                    instituteId: instituteId
                }
            });

            if (response.success) {
                setSearchResults(response.data.results || []);
            }
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message);
        } finally {
            setSearching(false);
        }
    };

    const handleAccess = async (book) => {
        try {
            const response = await apiService.request('/library/access/token', {
                method: 'POST',
                body: {
                    bookId: book.bookId,
                    instituteId: instituteId
                }
            });

            if (response.success) {
                // Open the secure URL in a new tab
                window.open(response.data.secureUrl, '_blank');
            }
        } catch (err) {
            console.error('Access error:', err);
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading library...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">📚 Digital Library</h1>
                <p className="text-gray-600 mt-1">
                    Browse all available e-books from your library and partner institutions
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter books by title or author..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={searching}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                        {searching ? 'Searching...' : 'Filter'}
                    </button>
                </div>
            </form>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800">{error}</span>
                    </div>
                </div>
            )}

            {/* Results */}
            {hasSearched && !searching && (
                <div>
                    {searchResults.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                            <p className="text-gray-600">
                                Try searching with different keywords  or check the spelling.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                                    {' '}({searchResults.filter(b => b.isLocal).length} local, {searchResults.filter(b => !b.isLocal).length} from partners)
                                </p>
                            </div>

                            <div className="space-y-4">
                                {searchResults.map((book) => (
                                    <div
                                        key={book._id}
                                        className={`bg-white rounded-lg border p-6 transition-shadow hover:shadow-md ${!book.isLocal ? 'border-l-4 border-l-purple-500' : 'border-l-4 border-l-green-500'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                {/* Source Badge and College Name */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    {book.isLocal ? (
                                                        <span className="px-4 py-1.5 text-sm font-bold rounded-lg bg-green-100 text-green-900 border-2 border-green-300">
                                                            📚 YOUR COLLEGE
                                                        </span>
                                                    ) : (
                                                        <span className="px-4 py-1.5 text-sm font-bold rounded-lg bg-purple-100 text-purple-900 border-2 border-purple-300">
                                                            🔗 PARTNER COLLEGE
                                                        </span>
                                                    )}
                                                    <span className="px-3 py-1 text-sm font-semibold rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                                                        {book.category}
                                                    </span>
                                                </div>

                                                {/* College Name Display */}
                                                <div className="mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600">From:</span>
                                                        <span className="text-base font-bold text-gray-900">
                                                            {book.isLocal
                                                                ? book.instituteId?.collegeName || 'Your College'
                                                                : book.partnerInstitute?.name || book.source}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            ({book.isLocal
                                                                ? book.instituteId?.abbreviation
                                                                : book.partnerInstitute?.abbreviation})
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Title and Author */}
                                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{book.title}</h3>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    by {book.author}
                                                    {book.publicationYear && ` (${book.publicationYear})`}
                                                </p>

                                                {/* Description */}
                                                {book.description && (
                                                    <p className="text-gray-700 mb-3 line-clamp-2">{book.description}</p>
                                                )}

                                                {/* Metadata */}
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    {book.isbn && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium">ISBN:</span> {book.isbn}
                                                        </div>
                                                    )}
                                                    {book.publisher && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium">Publisher:</span> {book.publisher}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Access Button */}
                                            <div className="ml-4">
                                                <button
                                                    onClick={() => handleAccess(book)}
                                                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold whitespace-nowrap shadow-md hover:shadow-lg"
                                                >
                                                    📖 Access Resource
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
