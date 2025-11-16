"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const menusByRole = {
  student: [
    { icon: "/home.png", label: "Dashboard", href: "/student" },
   {
  icon: "/home.png",
  label: "Registration",
  isDropdown: true,
  subItems: [
    { label: "Registration Form", href: "/list/registration" },
    { label: "View & Print Registration", href: "/list/registration/print_view" }
  ]
},
    { icon: "/home.png", label: "Hostel", href: "/student/hostel" },
    { 
      icon: "/home.png", 
      label: "Fee Payment", 
      isDropdown: true,
      subItems: [
        { label: "Pay Fee", href: "/list/fee/payment" },
        { label: "View and Print Receipt", href: "/list/fee/view_print" }
      ]
    },
    { icon: "/home.png", label: "Admit Card", href: "/student/admit-card" },
    { icon: "/home.png", label: "Grade Card", href: "/student/grade-card" },
    { icon: "/attendance.png", label: "Attendance", href: "/student/attendance" },
    { icon: "/home.png", label: "Feedback", href: "/list/feedback" },
    { icon: "/setting.png", label: "Settings", href: "/student/settings" },
  ],

  faculty: [
    { icon: "/home.png", label: "Dashboard", href: "/faculty" },
    { icon: "/attendance.png", label: "Attendance", href: "/attendance" },
    { icon: "/home.png", label: "Marks", href: "/marks" },
    { icon: "/home.png", label: "Study Materials", href: "/study-materials" },
    { icon: "/home.png", label: "Class Notices", href: "/class-notices" },
  ],

  admin: [
    { icon: "/home.png", label: "Dashboard", href: "/admin" },
    { icon: "/home.png", label: "Faculty", href: "/list/faculty" },
    { icon: "/student.png", label: "Students", href: "/list/students" },
    { icon: "/home.png", label: "Finance", href: "/list/finance" },
    { icon: "/home.png", label: "Sub Admins", href: "/list/subadmins" },
    { icon: "/home.png", label: "Departments", href: "/list/departments" },
    { icon: "/home.png", label: "Add Notices", href: "/list/add-notice" },
    { icon: "/setting.png", label: "Settings", href: "/settings" },

  ],

  subadmin: [
    { icon: "/home.png", label: "Dashboard", href: "/subadmin" },
    { icon: "/home.png", label: "Add Students", href: "/list/students/create" },
    { icon: "/student.png", label: "View & Edit Students", href: "/list/students" },
  ],

  superadmin: [
    { icon: "/home.png", label: "Dashboard", href: "/superadmin" },
    { icon: "/home.png", label: "View Requests", href: "/superadmin/requests" },
    { icon: "/home.png", label: "View All Colleges", href: "/superadmin/colleges" },
    { icon: "/home.png", label: "Manage Super Admins", href: "/superadmin/manage-superadmins" },
  ]
};

const Menu = () => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const { role } = useAuth();
  
  const currentRole = (role ?? "").toString().toLowerCase();
  const normalizedRole =
    currentRole === "collage_admin" || currentRole === "college_admin"
      ? "admin"
      : currentRole;

  const items = menusByRole[normalizedRole] ?? menusByRole["default"];

  const toggleDropdown = (label) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <div className="mt-4 text-sm">
      <div className="flex flex-col gap-2">
        <span className="hidden lg:block text-gray-400 font-light my-4">MENU</span>
        {items.map((item) => (
          <div key={item.label}>
            {item.isDropdown ? (
              <div>
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className="w-full flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-[#C3EBFA]Light"
                >
                  <Image src={item.icon} alt={item.label} width={20} height={20} />
                  <span className="hidden lg:block flex-1 text-left">{item.label}</span>
                  <svg 
                    className={`hidden lg:block w-4 h-4 transition-transform ${openDropdowns[item.label] ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdowns[item.label] && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="block text-gray-400 py-1 px-2 rounded-md hover:bg-[#C3EBFA] hover:text-gray-600 text-sm"
                      >
                        <span className="hidden lg:block">{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-[#C3EBFA]Light"
              >
                <Image src={item.icon} alt={item.label} width={20} height={20} />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
