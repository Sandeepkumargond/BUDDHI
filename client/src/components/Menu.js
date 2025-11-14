import { role } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

const menusByRole = {
  student: [
    { icon: "/home.png", label: "Dashboard", href: "/student" },
    { icon: "/home.png", label: "Registration", href: "/registration" },
    { icon: "/home.png", label: "Hostel", href: "/hostel" },
    { icon: "/home.png", label: "Fee Payment", href: "/fee" },
    { icon: "/home.png", label: "Admit Card", href: "/admit-card" },
    { icon: "/home.png", label: "Grade Card", href: "/grade-card" },
    { icon: "/attendance.png", label: "Attendance", href: "/attendance" },
    { icon: "/home.png", label: "Feedback", href: "/feedback" },
    { icon: "/setting.png", label: "Settings", href: "/settings" },
  ],

  faculty: [
    { icon: "/home.png", label: "Dashboard", href: "/faculty" },
    { icon: "/attendance.png", label: "Attendance", href: "/attendance" },
    { icon: "/home.png", label: "Marks", href: "/marks" },
    { icon: "/home.png", label: "Study Materials", href: "/study-materials" },
    { icon: "/home.png", label: "Class Notices", href: "/class-notices" },
    { icon: "/setting.png", label: "Settings", href: "/settings" },
  ],

  admin: [
    { icon: "/home.png", label: "Dashboard", href: "/admin" },
    { icon: "/home.png", label: "Faculty", href: "/list/faculty" },
    { icon: "/student.png", label: "Students", href: "/list/students" },
    { icon: "/home.png", label: "Finance", href: "/finance" },
    
    // 🔥 UPDATED — replaced Add Subadmin with Sub Admins
    { icon: "/home.png", label: "Sub Admins", href: "/list/subadmins" },

    { icon: "/home.png", label: "Departments", href: "/list/departments" },
    { icon: "/home.png", label: "Grade Card", href: "/grade-card" },
    { icon: "/home.png", label: "Add Notices", href: "/list/add-notice" },
  ],

  subadmin: [
    { icon: "/home.png", label: "Add Students", href: "/list/students" },
    { icon: "/student.png", label: "View & Edit Students", href: "/subadmin/students" },
  ],

  superadmin: [
    { icon: "/home.png", label: "Dashboard", href: "/superadmin" },
    { icon: "/home.png", label: "View College Requests", href: "/superadmin/college-requests" },
    { icon: "/home.png", label: "View Registered Colleges", href: "/superadmin/registered-colleges" },
  ]
};

const Menu = () => {
  const currentRole = (role ?? "").toString().toLowerCase();
  const normalizedRole =
    currentRole === "collage_admin" || currentRole === "college_admin"
      ? "admin"
      : currentRole;

  const items = menusByRole[normalizedRole] ?? menusByRole["default"];

  return (
    <div className="mt-4 text-sm">
      <div className="flex flex-col gap-2">
        <span className="hidden lg:block text-gray-400 font-light my-4">MENU</span>
        {items.map((item) => (
          <Link
            href={item.href}
            key={item.label}
            className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-[#C3EBFA]Light"
          >
            <Image src={item.icon} alt={item.label} width={20} height={20} />
            <span className="hidden lg:block">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Menu;
