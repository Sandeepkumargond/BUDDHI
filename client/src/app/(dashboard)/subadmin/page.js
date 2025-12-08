"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Announcements from "@/components/Announcements";

const SubAdminDashboard = () => {
  const [admissionStats, setAdmissionStats] = useState({
    todayAdmissions: 0,
    weekAdmissions: 0,
    monthAdmissions: 0,
    totalAdmissions: 0,
    pendingApplications: 0,
    completedApplications: 0
  });

  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [quickActions] = useState([
    {
      title: "New Student Admission",
      description: "Register a new student for admission",
      icon: "/student.png",
      href: "/admin_subadmin/students/create",
      color: "bg-blue-100 text-blue-800",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "View All Students",
      description: "View and manage student records",
      icon: "/class.png",
      href: "/admin_subadmin/students",
      color: "bg-green-100 text-green-800",
      buttonColor: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Admission Reports",
      description: "Generate admission reports",
      icon: "/result.png",
      href: "#",
      color: "bg-purple-100 text-purple-800",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Document Verification",
      description: "Verify student documents",
      icon: "/assignment.png",
      href: "#",
      color: "bg-orange-100 text-orange-800",
      buttonColor: "bg-orange-600 hover:bg-orange-700"
    }
  ]);

  // Load admission statistics
  useEffect(() => {
    const loadAdmissionStats = () => {
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const today = new Date().toISOString().split('T')[0];
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const todayCount = students.filter(s => s.admissionDate === today).length;
      const weekCount = students.filter(s => s.admissionDate >= oneWeekAgo).length;
      const monthCount = students.filter(s => s.admissionDate >= oneMonthAgo).length;

      setAdmissionStats({
        todayAdmissions: todayCount,
        weekAdmissions: weekCount,
        monthAdmissions: monthCount,
        totalAdmissions: students.length,
        pendingApplications: students.filter(s => s.status === "Pending").length,
        completedApplications: students.filter(s => s.status === "Active").length
      });

      // Get recent 5 admissions
      const recent = students
        .sort((a, b) => new Date(b.admissionDate || 0) - new Date(a.admissionDate || 0))
        .slice(0, 5);
      setRecentAdmissions(recent);
    };

    loadAdmissionStats();
    // Reload stats every 30 seconds
    const interval = setInterval(loadAdmissionStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className={`${color} p-6 rounded-lg shadow-sm border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {description && <p className="text-xs opacity-70 mt-1">{description}</p>}
        </div>
        <div className="bg-white bg-opacity-20 p-3 rounded-full">
          <Image src={icon} alt="" width={24} height={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT SECTION */}
      <div className="w-full xl:w-2/3 space-y-6">
        
        {/* Welcome Header */}
        <div className="bg-[#C3EBFA] text-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome, SubAdmin!</h1>
              <p className="text-gray-600 mt-1">Manage student admissions and records efficiently</p>
            </div>
            <div className="bg-white bg-opacity-50 p-3 rounded-full">
              <Image src="/admin.png" alt="" width={32} height={32} />
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Today's Admissions"
            value={admissionStats.todayAdmissions}
            icon="/student.png"
            color="bg-green-50 border-green-200 text-green-800"
            description="New students today"
          />
          <StatCard
            title="This Week"
            value={admissionStats.weekAdmissions}
            icon="/class.png"
            color="bg-blue-50 border-blue-200 text-blue-800"
            description="Admissions this week"
          />
          <StatCard
            title="This Month"
            value={admissionStats.monthAdmissions}
            icon="/calendar.png"
            color="bg-purple-50 border-purple-200 text-purple-800"
            description="Monthly admissions"
          />
          <StatCard
            title="Total Students"
            value={admissionStats.totalAdmissions}
            icon="/home.png"
            color="bg-orange-50 border-orange-200 text-orange-800"
            description="All registered students"
          />
          <StatCard
            title="Active Students"
            value={admissionStats.completedApplications}
            icon="/result.png"
            color="bg-green-50 border-green-200 text-green-800"
            description="Complete applications"
          />
          <StatCard
            title="Pending Applications"
            value={admissionStats.pendingApplications}
            icon="/assignment.png"
            color="bg-yellow-50 border-yellow-200 text-yellow-800"
            description="Awaiting completion"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <div key={index} className={`${action.color} p-4 rounded-lg border`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Image src={action.icon} alt="" width={20} height={20} className="mr-2" />
                      <h3 className="font-semibold">{action.title}</h3>
                    </div>
                    <p className="text-sm opacity-80 mb-3">{action.description}</p>
                    <Link href={action.href}>
                      <button className={`${action.buttonColor} text-white px-4 py-2 rounded text-sm font-medium transition-colors`}>
                        {action.title.includes("New") ? "Start Registration" : 
                         action.title.includes("View") ? "View Students" : 
                         action.title.includes("Reports") ? "Generate Report" : "Verify Documents"}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Admissions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Admissions</h2>
            <Link href="/admin_subadmin/students" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </Link>
          </div>
          
          {recentAdmissions.length > 0 ? (
            <div className="space-y-3">
              {recentAdmissions.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Image 
                      src={student.photo || "/noAvatar.png"} 
                      alt="" 
                      width={40} 
                      height={40} 
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.department} - {student.programme}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{student.enrolmentNo}</p>
                    <p className="text-xs text-gray-500">{student.admissionDate || "Today"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Image src="/nodata.png" alt="" width={60} height={60} className="mx-auto mb-3 opacity-50" />
              <p className="text-gray-500">No recent admissions</p>
              <Link href="/admin_subadmin/students/create">
                <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                  Add First Student
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full xl:w-1/3 space-y-6">
        
        {/* Today's Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Today's Tasks</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Review pending applications</p>
                <p className="text-xs text-gray-600">{admissionStats.pendingApplications} pending</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Document verification</p>
                <p className="text-xs text-gray-600">5 documents to verify</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Send welcome emails</p>
                <p className="text-xs text-gray-600">3 emails pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admission Progress */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Admission Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Applications Processed</span>
                <span>{admissionStats.completedApplications}/{admissionStats.totalAdmissions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${admissionStats.totalAdmissions > 0 ? (admissionStats.completedApplications / admissionStats.totalAdmissions) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Monthly Target</span>
                <span>{admissionStats.monthAdmissions}/50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(admissionStats.monthAdmissions / 50) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <Announcements />
        
        {/* Help & Support */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Help & Support</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Image src="/help.png" alt="" width={20} height={20} className="mr-3" />
                <div>
                  <p className="text-sm font-medium">Admission Guidelines</p>
                  <p className="text-xs text-gray-600">Step-by-step process</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Image src="/message.png" alt="" width={20} height={20} className="mr-3" />
                <div>
                  <p className="text-sm font-medium">Contact IT Support</p>
                  <p className="text-xs text-gray-600">Technical assistance</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubAdminDashboard;
