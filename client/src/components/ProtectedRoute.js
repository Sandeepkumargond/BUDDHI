"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccessDenied from './AccessDenied';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to sign-in');
        router.push('/sign-in');
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        console.log('User role not allowed:', role, 'allowed:', allowedRoles);
        // Show access denied page instead of redirecting
        setShowAccessDenied(true);
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

  if (showAccessDenied || (allowedRoles.length > 0 && !allowedRoles.includes(role))) {
    return <AccessDenied />;
  }

  return children;
}