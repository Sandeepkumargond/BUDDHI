"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to sign-in');
        router.push('/sign-in');
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        console.log('User role not allowed:', role, 'allowed:', allowedRoles);
        // Redirect to appropriate dashboard based on user's role
        const dashboardRoutes = {
          'superadmin': '/superadmin',
          'admin': '/admin', 
          'subadmin': '/subadmin',
          'student': '/student',
          'faculty': '/faculty'
        };
        router.push(dashboardRoutes[role] || '/sign-in');
        return;
      }
    }
  }, [loading, isAuthenticated, role, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return null;
  }

  return children;
}