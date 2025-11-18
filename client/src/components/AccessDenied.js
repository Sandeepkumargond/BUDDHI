"use client";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AccessDenied() {
  const router = useRouter();
  const { role } = useAuth();

  const dashboardRoutes = {
    'superadmin': '/superadmin',
    'admin': '/admin',
    'subadmin': '/subadmin',
    'student': '/student',
    'faculty': '/faculty'
  };

  const handleGoBack = () => {
    const userDashboard = dashboardRoutes[role] || '/login';
    router.push(userDashboard);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 4v2M9 5a4 4 0 018 0v14a4 4 0 01-8 0V5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this page. Your current role is <span className="font-semibold capitalize">{role}</span>.
          </p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
          >
            Go to Your Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
