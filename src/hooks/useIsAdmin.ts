
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
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (cancelled) return;
        setIsAdmin(!!data);
      } catch (e) {
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
