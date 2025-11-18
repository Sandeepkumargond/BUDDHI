import ProtectedRoute from "@/components/ProtectedRoute";

export default function SubAdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['subadmin']}>
      {children}
    </ProtectedRoute>
  );
}
