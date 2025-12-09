"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";
import { getComplaintStats } from "@/lib/hostelApi";
import { MdSpeakerNotes } from "react-icons/md";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [complaintCount, setComplaintCount] = useState(0);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { user, role, logout } = useAuth();

  // Load complaint stats for admin
  useEffect(() => {
    if (role === "admin") {
      const loadStats = async () => {
        try {
          const stats = await getComplaintStats();
          setComplaintCount(stats.pending || 0);
        } catch (error) {
          // Silently fail - don't spam console if server is down
          setComplaintCount(0);
        }
      };
      loadStats();
    }
  }, [role]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      showToast.error('Logout failed, but redirecting...');
      // Force redirect even if logout fails
      router.push('/login');
    }
  };

  const handleProfileView = () => {
    setShowDropdown(false);
    // Navigate to profile page based on role
    router.push(`/${role}/profile`);
  };

  const handleComplaintsClick = () => {
    if (role === "admin") {
      router.push("/admin/hostel/complaints");
    }
  };

  return (
    <div className='flex items-center justify-between p-4'>
      {/* ICONS AND USER */}
      <div className='flex items-center gap-6 justify-end w-full'>
        {/* Complaints Icon (for Admin) */}
        {role === "admin" && (
          <div 
            className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative'
            onClick={handleComplaintsClick}
            title="View Complaints"
          >
            <MdSpeakerNotes className="text-xl text-gray-400" />
            {complaintCount > 0 && (
              <div className='absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs font-bold'>
                {complaintCount}
              </div>
            )}
          </div>
        )}

        {/* USER PROFILE */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={handleProfileClick}
          >
            <div className="flex flex-col">
              <span className="text-xs leading-3 font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-gray-500 text-right">
                {role?.charAt(0).toUpperCase() + role?.slice(1)}
              </span>
            </div>
            <Image
              src={user?.imageUrl || "/avatar.png"}
              alt=""
              width={36}
              height={36}
              className="rounded-full object-cover"
              style={{ width: 'auto', height: '36px' }}
            />
          </div>

          {/* DROPDOWN MENU */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={handleProfileView}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Image src="/profile.png" alt="" width={16} height={16} className="mr-3" />
                  Profile
                </button>
                <hr className="border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Image src="/logout.png" alt="" width={16} height={16} className="mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar