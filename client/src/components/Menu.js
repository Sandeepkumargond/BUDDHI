"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
// React Icons imports for sidebar items
import { MdDashboard, MdAppRegistration, MdPayment, MdAnnouncement, MdPendingActions, MdAssessment } from "react-icons/md";
import { FaIdCard, FaGraduationCap, FaClipboardCheck, FaCommentDots, FaBookOpen, FaMoneyBillWave, FaChalkboardTeacher, FaUserGraduate, FaUserShield, FaBuilding, FaUserPlus, FaUserEdit, FaUniversity, FaBed } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";

const menusByRole = {
  student: [
    { Icon: MdDashboard, label: "Dashboard", href: "/student" },
    { Icon: MdAnnouncement, label: "Notices", href: "/student/notices" },
    {
      Icon: MdAppRegistration,
      label: "Registration",
      isDropdown: true,
      subItems: [
        { label: "Semester Registration", href: "/student/registration" },
        { label: "View & Print Registration", href: "/student/registration/print_view" }
      ]
    },
    { Icon: FaBed, label: "Hostel", href: "/student/hostel" },
    {
      Icon: MdPayment,
      label: "Fee Payment",
      isDropdown: true,
      subItems: [
        { label: "Pay Fee", href: "/student/fee/payment" },
        { label: "View and Print Receipt", href: "/student/fee/view_print" }
      ]
    },
    { Icon: FaIdCard, label: "Admit Card", href: "/student/admit-card" },
    { Icon: FaBookOpen, label: "Study Materials", href: "/student/study-materials" },
    { Icon: FaGraduationCap, label: "Grade Card", href: "/student/grade-card" },
    { Icon: FaClipboardCheck, label: "Attendance", href: "/student/attendance" },
    { Icon: FaCommentDots, label: "Feedback", href: "/student/feedback" },
  ],

  faculty: [
    { Icon: MdDashboard, label: "Dashboard", href: "/faculty" },
    { Icon: FaUserGraduate, label: "Students", href: "/faculty/students" },
    { Icon: FaClipboardCheck, label: "Attendance", href: "/faculty/attendance" },
    { Icon: FaGraduationCap, label: "Grade Management", href: "/faculty/grades" },
    { Icon: MdAssessment, label: "Marks", href: "/faculty/marks" },
    { Icon: FaBookOpen, label: "Study Materials", href: "/faculty/study-material" },
    { Icon: MdAnnouncement, label: "Class Notices", href: "/faculty/class-notices" },
  ],

  admin: [
    { Icon: MdDashboard, label: "Dashboard", href: "/admin" },
    { Icon: FaChalkboardTeacher, label: "Faculty Management", href: "/admin/faculty" },
    { Icon: FaUserGraduate, label: "Students", href: "/admin_subadmin/students" },
    { Icon: FaMoneyBillWave, label: "Finance", href: "/admin/finance" },
    { Icon: FaUserShield, label: "Sub Admins", href: "/admin/subadmins" },
    { Icon: FaBuilding, label: "Departments", href: "/admin/departments" },
    {
      Icon: FaGraduationCap,
      label: "Grade Management",
      isDropdown: true,
      subItems: [
        { label: "View All Students", href: "/admin_subadmin/students/grades" },
        { label: "Add Grade Card", href: "/admin_subadmin/students/grades/add" }
      ]
    },
    {
      Icon: FaIdCard,
      label: "Admit Card",
      isDropdown: true,
      subItems: [
        { label: "Publish Admit Card", href: "/admin/admit-card" },
        { label: "Published Admit Cards", href: "/admin/admit-card/published" }
      ]
    },
    {
      Icon: MdAppRegistration,
      label: "Registration",
      isDropdown: true,
      subItems: [
        { label: "Create Form", href: "/admin/registration" },
        { label: "View Forms", href: "/admin/registration/forms" },
        { label: "All Registrations", href: "/admin/registration/registrations" }
      ]
    },
    {
      Icon: FaBed,
      label: "Hostel Management",
      isDropdown: true,
      subItems: [
        { label: "Manage Hostels", href: "/admin/hostel" },
        { label: "Allotments", href: "/admin/hostel/allotments" }
      ]
    },
    { Icon: MdAnnouncement, label: "Notice Management", href: "/admin/notices" },
  ],

  subadmin: [
    { Icon: MdDashboard, label: "Dashboard", href: "/subadmin" },
    { Icon: FaUserPlus, label: "Add Students", href: "/admin_subadmin/students/create" },
    { Icon: FaUserEdit, label: "View & Edit Students", href: "/admin_subadmin/students" },
    
  ],

  superadmin: [
    { Icon: MdDashboard, label: "Dashboard", href: "/superadmin" },
    { Icon: MdPendingActions, label: "View Requests", href: "/superadmin/requests" },
    { Icon: FaUniversity, label: "View All Colleges", href: "/superadmin/colleges" },
    { Icon: FaUserShield, label: "Manage Super Admins", href: "/superadmin/manage-superadmins" },
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
                  {item.Icon ? <item.Icon className="text-xl" /> : item.icon ? <Image src={item.icon} alt={item.label} width={20} height={20} /> : null}
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
                {item.Icon ? <item.Icon className="text-xl" /> : item.icon ? <Image src={item.icon} alt={item.label} width={20} height={20} /> : null}
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
