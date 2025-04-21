
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
    // Development mode: Always bypass admin check when user is logged in
    if (user && !bypassAdminCheck) {
      console.log("Development mode: Bypassing admin check");
      setBypassAdminCheck(true);
      toast({
        title: "Development Mode",
        description: "Admin check bypassed for development purposes.",
      });
    }
  }, [user, bypassAdminCheck]);

  console.log("AdminRoute - User:", !!user, "Loading:", loading, "Is Admin:", isAdmin, "Checking Admin:", checkingAdmin, "Bypass:", bypassAdminCheck);

  if (loading) {
    return <Loading fullScreen message="Authenticating..." />;
  }

  if (!user) {
    // Redirect to login if not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // In development mode, allow access immediately once bypassAdminCheck is true
  if (bypassAdminCheck) {
    return <>{children}</>;
  }

  if (checkingAdmin) {
    return <Loading fullScreen message="Verifying admin privileges..." />;
  }

  // Only check actual admin status if we're not bypassing the check
  if (isAdmin) {
    return <>{children}</>;
  }

  // Redirect to dashboard if logged in but not admin
  return <Navigate to="/dashboard" state={{ from: location }} replace />;
};

export default AdminRoute;
