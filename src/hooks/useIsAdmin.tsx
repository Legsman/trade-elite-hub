
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    if (!user || loading) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    let cancelled = false;

    const check = async () => {
      setChecking(true);
      try {
        console.log("Checking admin status for user:", user.id);
        // Using rpc_is_admin which is designed specifically to avoid recursion issues
        const { data, error } = await supabase
          .rpc('rpc_is_admin');

        if (cancelled) return;
        
        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        } else {
          // The function returns an array of records with is_admin property
          const isUserAdmin = data && data.length > 0 && data[0].is_admin;
          console.log("Admin status check result:", isUserAdmin, data);
          setIsAdmin(!!isUserAdmin);
        }
      } catch (e) {
        console.error("Error checking admin status:", e);
        setIsAdmin(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    check();
    return () => { cancelled = true };
  }, [user, loading]);

  return { isAdmin, checking };
}
