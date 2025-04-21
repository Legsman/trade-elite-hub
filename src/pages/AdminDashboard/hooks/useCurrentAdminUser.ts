
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCurrentAdminUser() {
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    async function fetchInitialData() {
      try {
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
