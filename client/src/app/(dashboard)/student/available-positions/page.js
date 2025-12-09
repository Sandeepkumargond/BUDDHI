"use client";
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { showToast } from '@/lib/toast';

const AvailablePositions = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    applicationText: '',
    coverLetter: '',
    resume: '',
    studentPhone: '',
    gpa: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [appliedPositions, setAppliedPositions] = useState(new Set());

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        // Get all sent-to-students hiring requests
        const response = await apiService.request(
          `/hiring-requests/available?page=${page}&limit=10`,
          {
            method: 'GET',
          }
        );
        const positionsData = response.data?.requests || [];
        setPositions(positionsData);
        if (response.data?.pagination) {
          setTotalPages(response.data.pagination.pages);
        }
      } catch (error) {
        showToast.error('Error fetching job positions');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [page]);

  const handleOpenApplicationForm = (position) => {
    setSelectedPosition(position);
    setShowApplicationModal(true);
    setApplicationData({
      applicationText: '',
      coverLetter: '',
      resume: '',
      studentPhone: '',
      gpa: '',
    });
  };

  const handleCloseApplicationForm = () => {
    setShowApplicationModal(false);
    setSelectedPosition(null);
    setApplicationData({
      applicationText: '',
      coverLetter: '',
      resume: '',
      studentPhone: '',
      gpa: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    if (!applicationData.applicationText.trim()) {
      showToast.error('Please fill in the application text');
      return;
    }

    if (!applicationData.studentPhone.trim()) {
      showToast.error('Please provide your phone number');
      return;
    }

    if (!applicationData.gpa) {
      showToast.error('Please enter your GPA');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiService.request('/applications/apply', {
        method: 'POST',
        data: {
          hiringRequestId: selectedPosition._id,
          applicationText: applicationData.applicationText,
          coverLetter: applicationData.coverLetter,
          resume: applicationData.resume,
          studentPhone: applicationData.studentPhone,
          gpa: applicationData.gpa ? parseFloat(applicationData.gpa) : null,
        },
      });

      if (response.data || response.status === 'success') {
        showToast.success('Application submitted successfully!');
        // Mark position as applied
        setAppliedPositions(prev => new Set(prev).add(selectedPosition._id));
        handleCloseApplicationForm();
      }
    } catch (error) {
      showToast.error(error.message || 'Error submitting application');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Available Job Positions</h1>
        <p className="text-gray-600">View and apply for job positions available in your college</p>
      </div>

      {positions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">No job positions available right now</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Job Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Position Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Positions</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Salary</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {positions.map((position) => (
                    <tr key={position._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{position.companyName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{position.jobTitle}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">
                          {position.positionType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 font-semibold">{position.numberOfPositions}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{position.salaryRange || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {appliedPositions.has(position._id) ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed font-semibold text-sm flex items-center gap-2"
                          >
                            ✓ Submitted
                          </button>
                        ) : new Date(position.deadline) < new Date() ? (
                          <button
                            disabled
                            title="Application deadline has passed"
                            className="px-4 py-2 bg-red-400 text-white rounded-lg cursor-not-allowed font-semibold text-sm"
                          >
                            Not Accepted
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenApplicationForm(position)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold text-sm"
                          >
                            Apply Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                ← Previous
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-semibold">
                  Page {page} of {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Apply for Position</h2>
                <p className="text-green-100 text-sm mt-1">{selectedPosition.companyName} - {selectedPosition.jobTitle}</p>
              </div>
              <button
                onClick={handleCloseApplicationForm}
                className="text-white hover:bg-green-700 p-2 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Position Details */}
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Position Type</p>
                  <p className="font-semibold text-gray-800">{selectedPosition.positionType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Positions Available</p>
                  <p className="font-semibold text-gray-800">{selectedPosition.numberOfPositions}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Salary Range</p>
                  <p className="font-semibold text-gray-800">{selectedPosition.salaryRange || 'Not Specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Posted Date</p>
                  <p className="font-semibold text-gray-800">{new Date(selectedPosition.sentToStudentsAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className={`font-semibold ${new Date(selectedPosition.deadline) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                    {new Date(selectedPosition.deadline).toLocaleDateString()} {new Date(selectedPosition.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            {selectedPosition.description && (
              <div className="px-6 py-4 border-b">
                <h3 className="font-bold text-gray-800 mb-2">Job Description</h3>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {selectedPosition.description}
                </div>
              </div>
            )}

            {/* Deadline Expired Alert */}
            {new Date(selectedPosition.deadline) < new Date() && (
              <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                <p className="text-red-700 font-semibold text-center">❌ Application deadline has passed. This position is no longer accepting applications.</p>
              </div>
            )}

            {/* Application Form */}
            {new Date(selectedPosition.deadline) >= new Date() && (
              <form onSubmit={handleSubmitApplication} className="p-6 space-y-5">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="studentPhone"
                    value={applicationData.studentPhone}
                    onChange={handleInputChange}
                    placeholder="e.g., 9876543210"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* GPA */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current GPA *
                  </label>
                  <input
                    type="number"
                    name="gpa"
                    value={applicationData.gpa}
                    onChange={handleInputChange}
                    placeholder="e.g., 8.5"
                    min="0"
                    max="10"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Application Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Why do you want to apply for this position? *
                  </label>
                  <textarea
                    name="applicationText"
                    value={applicationData.applicationText}
                    onChange={handleInputChange}
                    placeholder="Tell us about your interest in this position and why you think you're a good fit..."
                    rows="5"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    name="coverLetter"
                    value={applicationData.coverLetter}
                    onChange={handleInputChange}
                    placeholder="Share any additional information you'd like us to know..."
                    rows="4"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Resume Info */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resume Link/Info (Optional)
                  </label>
                  <input
                    type="text"
                    name="resume"
                    value={applicationData.resume}
                    onChange={handleInputChange}
                    placeholder="e.g., Link to your resume or portfolio"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseApplicationForm}
                    className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 transition font-semibold disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailablePositions;
