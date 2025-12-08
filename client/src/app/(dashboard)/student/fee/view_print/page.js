"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";

export default function ViewPrintReceiptsPage() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [imageSrc, setImageSrc] = useState("https://i.pravatar.cc/100?img=12");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [semesterReceipts, setSemesterReceipts] = useState([]);

  const toAbsoluteUrl = (url) => {
    if (!url) return "/noAvatar.png";
    try {
      // Already absolute (http/https)
      if (/^https?:\/\//i.test(url)) return url;
      // Remove leading slashes to avoid double slashes
      const cleaned = url.startsWith("/") ? url.slice(1) : url;
      const base = process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
      return `${base}/${cleaned}`;
    } catch {
      return "/noAvatar.png";
    }
  };

  useEffect(() => {
    if (user) {
      setStudentData({
        name: user.name,
        enrollment: user.enrollment,
        department: user.department,
        photo: user.photo,
      });
      // Initialize image source with user photo if valid, else fallback
      const candidate = typeof user.photo === "string" && user.photo.trim().length > 0 ? user.photo : "/noAvatar.png";
      setImageSrc(candidate);
      setAvailableSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const res = await apiService.get("/api/v1/student/me");
        const profile = res?.data || {};
        const rawPhoto = (typeof profile.photo === "string" && profile.photo.trim().length > 0)
          ? profile.photo
          : (typeof profile.avatarUrl === "string" && profile.avatarUrl.trim().length > 0 ? profile.avatarUrl : "/noAvatar.png");
        const photoUrl = toAbsoluteUrl(rawPhoto);
        setStudentData({
          name: profile.name || user.name,
          enrollment: profile.enrollment || user.enrollment,
          department: profile.department || user.department,
          photo: photoUrl,
        });
        setImageSrc(photoUrl);
        // TODO: fetch semesters from backend if available
        setAvailableSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
      } catch (err) {
        setStudentData({
          name: user.name,
          enrollment: user.enrollment,
          department: user.department,
          photo: "/noAvatar.png",
        });
        setImageSrc("/noAvatar.png");
      }
    };
    fetchProfile();
  }, [user]);
  const handleSemesterSelect = (semester) => {
    setSelectedSemester(semester);
    // Placeholder: set empty receipts; integrate backend later
    setSemesterReceipts([]);
  };

  const printReceipt = (payment) => {
    // Stub; integrate real print HTML later
    window.print();
  };

  const downloadReceipt = (payment) => {
    // Stub; integrate real download later
    console.debug("Download receipt", payment?.receiptNumber);
  };

  return (
    <div className="flex-1 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Student Information Card */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Image
                src={imageSrc}
                alt=""
                width={60}
                height={60}
                className="rounded-full object-cover mr-4"
                unoptimized
                onError={() => setImageSrc("/noAvatar.png")}
                priority
              />
              <div>
                <h3 className="font-semibold text-lg">{studentData?.name}</h3>
                <p className="text-gray-600">{studentData?.enrollment}</p>
                <p className="text-sm text-gray-500">{studentData?.department}</p>
              </div>
            </div>
          </div>

          {/* Semester Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Semester to View Receipts:
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => handleSemesterSelect(e.target.value)}
              className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">-- Select Semester --</option>
              {availableSemesters.map((semester, index) => (
                <option key={index} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </div>

          {/* Receipts Display */}
          {selectedSemester && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Receipts for Semester {selectedSemester}
              </h2>

              {semesterReceipts.length === 0 ? (
                <div className="text-center py-16">
                  <Image
                    src="/empty.png"
                    alt=""
                    width={80}
                    height={80}
                    className="mx-auto mb-4 opacity-50"
                  />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    No Receipts Found
                  </h3>
                  <p className="text-gray-600">
                    No payment receipts found for Semester {selectedSemester}.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {semesterReceipts.map((payment, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">
                            Receipt #{payment.receiptNumber}
                          </h3>
                          <p className="text-gray-600">
                            Payment Date: {payment.paymentDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-600">
                            ₹{payment.amount?.toLocaleString?.() || payment.amount}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.paymentMethod}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => printReceipt(payment)}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
                        >
                          Print Receipt
                        </button>
                        <button
                          onClick={() => downloadReceipt(payment)}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
                        >
                          Download Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
