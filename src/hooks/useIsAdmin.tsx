
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export function useIsAdmin() {
  const { user, supabaseUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    if (!supabaseUser || loading) {
      // Only check admin once supabaseUser is loaded and user is authenticated.
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    let cancelled = false;

    const check = async () => {
      setChecking(true);
      try {
        console.log("[useIsAdmin] Checking admin status for:", supabaseUser.id);
        // Use rpc_is_admin: expects [] and result like [{ is_admin: true/false }]
        const { data, error } = await supabase.rpc('rpc_is_admin');
        if (cancelled) return;

        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        } else if (Array.isArray(data) && data.length > 0 && typeof data[0].is_admin === 'boolean') {
          setIsAdmin(data[0].is_admin === true);
          console.log("[useIsAdmin] rpc_is_admin returned:", data[0].is_admin);
        } else {
          setIsAdmin(false);
          console.warn("[useIsAdmin] rpc_is_admin returned no/invalid data", data);
        }
      } catch (e) {
        console.error("Error checking admin status:", e);
        setIsAdmin(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    check();
    return () => { cancelled = true; };
  }, [supabaseUser, loading]);

  return { isAdmin, checking };
}
