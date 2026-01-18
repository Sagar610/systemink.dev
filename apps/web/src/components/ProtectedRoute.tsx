import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { ReactNode } from 'react';
import { Role } from '@systemink/shared';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: Role;
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
