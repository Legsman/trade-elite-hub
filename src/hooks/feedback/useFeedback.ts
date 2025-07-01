import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetch feedback for a user (as seller), as buyer, as giver, or by listing
export function useFeedback({ userId, as = "seller", listingId }) {
  return useQuery({
    queryKey: ["feedback", { userId, as, listingId }],
    queryFn: async () => {
      // Select username, not full_name, to avoid privacy breach
      let query = supabase.from("feedback").select(`
        *,
        from_user:from_user_id (username, avatar_url),
        listings!inner (seller_id)
      `);

      if (userId) {
        if (as === "seller") {
          // Feedback received when user was the seller
          query = query.eq("to_user_id", userId).eq("listings.seller_id", userId);
        } else if (as === "buyer") {
          // Feedback received when user was the buyer (not the seller)
          query = query.eq("to_user_id", userId).neq("listings.seller_id", userId);
        } else if (as === "giver") {
          // Explicitly feedbacks given BY this user
          query = query.eq("from_user_id", userId);
        }
      }
      if (listingId) {
        query = query.eq("listing_id", listingId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (process.env.NODE_ENV === "development") {
        console.log("[useFeedback] Fetched feedback with params", { userId, as, listingId, data });
      }
      if (error) throw error;
      return data;
    },
  });
}
