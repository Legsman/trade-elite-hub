
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { ReactNode } from "react";
import { Loading } from "@/components/ui/loading";

type AdminRouteProps = {
  children: ReactNode;
};

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen message="Authenticating..." />;
  }

  if (!user || user.role !== 'admin') {
    // Redirect to dashboard if logged in but not admin, or to login if not logged in
    const redirectTo = user ? "/dashboard" : "/login";
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
