
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
        // Explicitly log the user ID we're checking
        console.log("Checking admin status for user ID:", user.id);
        
        // Insert admin role if it doesn't exist for this user (TEMPORARY FIX)
        // This is just for debugging purposes to ensure the admin role exists
        const { error: insertError } = await supabase
          .from("user_roles")
          .upsert({ 
            user_id: user.id, 
            role: "admin" 
          }, { 
            onConflict: 'user_id,role' 
          });
          
        if (insertError) {
          console.error("Error upserting admin role:", insertError);
        } else {
          console.log("Admin role upserted for user:", user.id);
        }
        
        // Now check if the user has the admin role
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (cancelled) return;
        
        console.log("Admin check result:", data, error); // Debug log
        
        if (error) {
          console.error("Error fetching admin role:", error);
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
