import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e85d45]"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Redirect to dashboard if not admin when admin is required
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
