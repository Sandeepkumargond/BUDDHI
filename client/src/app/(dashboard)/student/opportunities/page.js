"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { toast } from "react-toastify";
import { FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaExternalLinkAlt, FaFilter } from "react-icons/fa";

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState("internships"); // internships or referrals
  const [internships, setInternships] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    location: "",
    position: "",
    search: "",
    referralType: "",
  });

  useEffect(() => {
    if (activeTab === "internships") {
      fetchInternships();
    } else {
      fetchReferrals();
    }
  }, [activeTab, filters]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllInternshipOpportunities(filters);
      if (response.success) {
        setInternships(response.data.opportunities);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch internships");
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllReferrals(filters);
      if (response.success) {
        setReferrals(response.data.referrals);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch referrals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Career Opportunities</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab("internships")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "internships"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Internship Opportunities
        </button>
        <button
          onClick={() => setActiveTab("referrals")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "referrals"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Referrals
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-gray-600 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by company, position..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {activeTab === "internships" ? (
            <>
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="text"
                placeholder="Position"
                value={filters.position}
                onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </>
          ) : (
            <select
              value={filters.referralType}
              onChange={(e) => setFilters({ ...filters, referralType: e.target.value })}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Referral Types</option>
              <option value="direct">Direct</option>
              <option value="indirect">Indirect</option>
              <option value="networking">Networking</option>
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeTab === "internships" ? (
            internships.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                No internship opportunities available at the moment.
              </div>
            ) : (
              internships.map((internship, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {internship.position}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaBuilding />
                        <span className="font-medium">{internship.companyName}</span>
                      </div>
                    </div>
                    {internship.applyLink && (
                      <a
                        href={internship.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply Now <FaExternalLinkAlt />
                      </a>
                    )}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">{internship.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {internship.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaMapMarkerAlt className="text-red-500" />
                        <span>{internship.location}</span>
                      </div>
                    )}
                    {internship.stipend && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaMoneyBillWave className="text-green-500" />
                        <span>₹{internship.stipend.toLocaleString()}</span>
                      </div>
                    )}
                    {internship.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaClock className="text-blue-500" />
                        <span>{internship.duration}</span>
                      </div>
                    )}
                  </div>

                  {internship.requirements && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Requirements:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{internship.requirements}</p>
                    </div>
                  )}

                  <div className="border-t dark:border-gray-700 pt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span>Posted by: </span>
                      <span className="font-medium">{internship.alumniName}</span>
                      {internship.alumniCompany && (
                        <span> ({internship.alumniCompany})</span>
                      )}
                    </div>
                    {internship.deadline && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Deadline: {new Date(internship.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            referrals.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                No referrals available at the moment.
              </div>
            ) : (
              referrals.map((referral, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {referral.position}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaBuilding />
                        <span className="font-medium">{referral.companyName}</span>
                      </div>
                    </div>
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
                      {referral.referralType}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">{referral.description}</p>

                  {referral.requirements && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Requirements:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{referral.requirements}</p>
                    </div>
                  )}

                  <div className="border-t dark:border-gray-700 pt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span>Referred by: </span>
                      <span className="font-medium">{referral.alumniName}</span>
                      {referral.alumniCompany && (
                        <span> ({referral.alumniCompany})</span>
                      )}
                    </div>
                    {referral.contactEmail && (
                      <a
                        href={`mailto:${referral.contactEmail}`}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Contact for Referral
                      </a>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}
