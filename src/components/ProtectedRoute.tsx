import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col space-y-3 p-6">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    // Save the attempted location for redirect after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!requireAuth && user) {
    // If user is logged in and trying to access auth page, redirect to dashboard
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;