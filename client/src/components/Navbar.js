"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { role } from "@/lib/data"
import Image from "next/image"

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown)
  }

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...")
    // For example: clear tokens, redirect to login
    router.push('/sign-in')
  }

  const handleProfileView = () => {
    setShowDropdown(false)
    // Navigate to profile page
    router.push('/profile')
  }

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
        <div className='flex flex-col'>
          <span className="text-xs leading-3 font-medium">Sandeep</span>
          <span className="text-[10px] text-gray-500 text-right">{role}</span>
        </div>
        <div className="relative" ref={dropdownRef}>
          <Image 
            src="/avatar.png" 
            alt="" 
            width={36} 
            height={36} 
            className="rounded-full cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
            onClick={handleProfileClick}
          />
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
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