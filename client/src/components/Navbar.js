"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { user, role, logout } = useAuth();

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
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      router.push('/login');
    }
  };

  const handleProfileView = () => {
    setShowDropdown(false);
    // Navigate to profile page based on role
    router.push(`/${role}/profile`);
  };

  return (
    <div className='flex items-center justify-between p-4'>
      {/* SEARCH BAR */}
      <div className='hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2'>
        <Image src="/search.png" alt="" width={14} height={14}/>
<input
        type="text"
        placeholder="Search..."
        defaultValue=""
        className="w-[200px] p-2 bg-transparent outline-none"
      />      </div>
      {/* ICONS AND USER */}
      <div className='flex items-center gap-6 justify-end w-full'>
        <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
          <Image src="/message.png" alt="" width={20} height={20}/>
        </div>
        <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative'>
          <Image src="/announcement.png" alt="" width={20} height={20}/>
          <div className='absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs'>1</div>
        </div>
        
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