import UserCard from "@/components/UserCard";
import Image from "next/image";
import Link from "next/link";
import Announcements from "@/components/Announcements";

const SuperAdminPage = () => {
  // Mock data for dashboard stats
  const stats = {
    totalColleges: 45,
    activeColleges: 42,
    pendingRequests: 8,
    totalSuperAdmins: 3
  };

  const recentRequests = [
    {
      id: 1,
      collegeName: "ABC Engineering College",
      location: "Mumbai, Maharashtra",
      requestDate: "2024-11-15",
      status: "pending"
    },
    {
      id: 2,
      collegeName: "XYZ Medical College",
      location: "Delhi, NCR",
      requestDate: "2024-11-14",
      status: "pending"
    },
    {
      id: 3,
      collegeName: "PQR Arts College",
      location: "Pune, Maharashtra",
      requestDate: "2024-11-13",
      status: "pending"
    }
  ];

  return (
    <div className="p-4 flex gap-4 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome, Developer
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Colleges</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalColleges}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Image src="/home.png" alt="colleges" width={24} height={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Colleges</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeColleges}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Image src="/home.png" alt="active" width={24} height={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Image src="/home.png" alt="pending" width={24} height={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalSuperAdmins}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Image src="/home.png" alt="admins" width={24} height={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link href="/superadmin/requests" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Image src="/home.png" alt="requests" width={24} height={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Requests</h3>
              <p className="text-sm text-gray-600">Review college registration requests</p>
            </div>
          </div>
        </Link>

        <Link href="/superadmin/colleges" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Image src="/home.png" alt="add college" width={24} height={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View College</h3>
              <p className="text-sm text-gray-600">View and manage college details</p>
            </div>
          </div>
        </Link>

        <Link href="/superadmin/manage-superadmins" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Image src="/home.png" alt="manage admins" width={24} height={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Super Admins</h3>
              <p className="text-sm text-gray-600">View, add, and manage super admin accounts</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Announcements */}
      <Announcements />

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent College Requests</h2>
            <Link href="/superadmin/requests" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{request.collegeName}</h3>
                    <p className="text-sm text-gray-600">{request.location}</p>
                    <p className="text-xs text-gray-500">Requested on {request.requestDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                      Pending
                    </span>
                    <Link 
                      href={`/superadmin/requests?id=${request.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent requests
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPage;
