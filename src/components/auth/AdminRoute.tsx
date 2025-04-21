
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { ReactNode, useEffect, useState } from "react";
import { Loading } from "@/components/ui/loading";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "@/hooks/use-toast";

type AdminRouteProps = {
  children: ReactNode;
};

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();
  const { isAdmin, checking: checkingAdmin } = useIsAdmin();
  const location = useLocation();
  const [bypassAdminCheck, setBypassAdminCheck] = useState(false);

  useEffect(() => {
    // For development purposes, consider anyone logged in as an admin
    // Remove this in production
    if (user && !isAdmin && !bypassAdminCheck) {
      console.log("Development mode: Bypassing admin check");
      setBypassAdminCheck(true);
      toast({
        title: "Development Mode",
        description: "Admin check bypassed for development purposes.",
      });
    }
  }, [user, isAdmin, bypassAdminCheck]);

  console.log("AdminRoute - User:", !!user, "Loading:", loading, "Is Admin:", isAdmin, "Checking Admin:", checkingAdmin);

  if (loading) {
    return <Loading fullScreen message="Authenticating..." />;
  }

  if (!user) {
    // Redirect to login if not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // In development mode, allow access even if not admin
  if (bypassAdminCheck || isAdmin) {
    return <>{children}</>;
  }

  if (checkingAdmin) {
    return <Loading fullScreen message="Verifying admin privileges..." />;
  }

  // Redirect to dashboard if logged in but not admin
  return <Navigate to="/dashboard" state={{ from: location }} replace />;
};

export default AdminRoute;
