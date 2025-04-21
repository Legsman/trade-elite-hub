
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCurrentAdminUser() {
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Get the current user via supabase auth
        // This approach avoids any potential RLS recursion
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error("Failed to get current user:", error);
      }
    }
    fetchInitialData();
  }, []);

  return currentUserId;
}
