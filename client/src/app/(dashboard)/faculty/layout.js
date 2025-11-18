import ProtectedRoute from "@/components/ProtectedRoute";

export default function FacultyLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['faculty']}>
      {children}
    </ProtectedRoute>
  );
}
