
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { ReactNode } from "react";
import { Loading } from "@/components/ui/loading";

type ProtectedRouteProps = {
  children: ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen message="Authenticating..." />;
  }

  if (!user) {
    // Redirect to login and save current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
