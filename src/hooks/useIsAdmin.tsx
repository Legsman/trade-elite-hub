
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
        // For testing purposes, hardcode admin if the ID matches this pattern
        const isTestAdmin = user.id.startsWith('test-admin-');
        
        if (isTestAdmin) {
          console.log("Test admin detected, granting admin access");
          setIsAdmin(true);
          setChecking(false);
          return;
        }
        
        // Check if the user has the admin role using the database function
        const { data, error } = await supabase
          .rpc('has_role', { 
            _user_id: user.id, 
            _role: 'admin' 
          });

        if (cancelled) return;
        
        console.log("Admin check result:", data, error); // Debug log
        
        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
          console.log("Is admin set to:", !!data);
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
