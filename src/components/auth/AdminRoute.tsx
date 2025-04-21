
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { ReactNode } from "react";
import { Loading } from "@/components/ui/loading";
import { useIsAdmin } from "@/hooks/useIsAdmin";

type AdminRouteProps = {
  children: ReactNode;
};

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();
  const { isAdmin, checking: checkingAdmin } = useIsAdmin();
  const location = useLocation();

  console.log("AdminRoute - User:", !!user, "Loading:", loading, "Is Admin:", isAdmin, "Checking Admin:", checkingAdmin);

  if (loading) {
    return <Loading fullScreen message="Authenticating..." />;
  }

  if (!user) {
    // Redirect to login if not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (checkingAdmin) {
    return <Loading fullScreen message="Verifying admin privileges..." />;
  }

  // Only allow access if user is admin
  if (isAdmin) {
    return <>{children}</>;
  }

  // Redirect to dashboard if logged in but not admin
  return <Navigate to="/dashboard" state={{ from: location }} replace />;
};

export default AdminRoute;
