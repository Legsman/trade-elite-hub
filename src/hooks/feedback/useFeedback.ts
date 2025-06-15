
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetch feedback for a user (as seller), as buyer, or by listing
export function useFeedback({ userId, as = "seller", listingId }) {
  return useQuery({
    queryKey: ["feedback", { userId, as, listingId }],
    queryFn: async () => {
      // Select username, not full_name, to avoid privacy breach
      let query = supabase.from("feedback").select(`
        *,
        from_user:from_user_id (username, avatar_url)
      `);

      if (userId) {
        if (as === "seller") {
          query = query.eq("to_user_id", userId);
        } else if (as === "buyer") {
          query = query.eq("from_user_id", userId);
        }
      }
      if (listingId) {
        query = query.eq("listing_id", listingId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
