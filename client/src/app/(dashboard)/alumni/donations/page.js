"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { toast } from "react-toastify";
import { FaPlus, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

export default function DonationsPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [totalDonated, setTotalDonated] = useState(0);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "INR",
    purpose: "scholarship",
    description: "",
    transactionId: "",
    paymentMethod: "upi",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAlumniProfile();
      if (response.success) {
        const donationsList = response.data.user?.donations || [];
        setDonations(donationsList);
        
        // Calculate total completed donations
        const total = donationsList
          .filter(d => d.status === 'completed')
          .reduce((sum, d) => sum + (d.amount || 0), 0);
        setTotalDonated(total);
      }
    } catch (error) {
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.addDonation({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success("Donation recorded successfully. Awaiting admin verification.");
      resetForm();
      fetchProfile();
    } catch (error) {
      toast.error(error.message || "Failed to record donation");
    }
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      currency: "INR",
      purpose: "scholarship",
      description: "",
      transactionId: "",
      paymentMethod: "upi",
    });
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-600" />;
      case 'pending':
        return <FaClock className="text-yellow-600" />;
      case 'failed':
        return <FaTimesCircle className="text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Donations</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <FaPlus /> Make Donation
        </button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#AEE7F7' }}>
          <h3 className="text-sm text-gray-700 mb-2">Total Donated</h3>
          <p className="text-3xl font-bold text-gray-900">₹{totalDonated.toLocaleString()}</p>
        </div>
        <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#C9CCFF' }}>
          <h3 className="text-sm text-gray-700 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-gray-900">{donations.filter(d => d.status === 'completed').length}</p>
        </div>
        <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#F9DB66' }}>
          <h3 className="text-sm text-gray-700 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-gray-900">{donations.filter(d => d.status === 'pending').length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : donations.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No donations yet. Click "Make Donation" to contribute to your alma mater.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {donations.map((donation, index) => {
            return (
            <div
              key={donation._id}
              className="bg-white border rounded-lg p-6 shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(donation.status)}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{donation.amount.toLocaleString()}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(donation.status)}`}>
                      {donation.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Purpose: <span className="font-medium capitalize">{donation.purpose}</span>
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                  {new Date(donation.donatedAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {donation.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-3">{donation.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t dark:border-gray-700 pt-4">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                  <p className="font-medium">{donation.transactionId || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <p className="font-medium capitalize">{donation.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                  <p className="font-medium">{donation.currency || 'INR'}</p>
                </div>
                {donation.receiptUrl && (
                  <div>
                    <a
                      href={donation.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Receipt
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* Donation Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Make a Donation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Amount *
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Purpose *
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="scholarship">Scholarship</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="research">Research</option>
                  <option value="general">General Fund</option>
                  <option value="event">Event Sponsorship</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="Enter transaction ID"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Add a note about your donation"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                Your donation will be verified by the admin before being marked as completed.
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Record Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
