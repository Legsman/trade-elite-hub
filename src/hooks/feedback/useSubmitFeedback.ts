
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSubmitFeedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  async function submitFeedback({ fromUserId, toUserId, listingId, rating, comment }) {
    setIsSubmitting(true);
    const { error } = await supabase.from("feedback").insert([
      {
        from_user_id: fromUserId,
        to_user_id: toUserId,
        listing_id: listingId,
        rating,
        comment,
      },
    ]);
    setIsSubmitting(false);
    
    if (error) {
      // Handle duplicate feedback attempt
      if (error.code === '23505' && error.message.includes('feedback_unique_per_listing')) {
        throw new Error('You have already left feedback for this transaction.');
      }
      throw error;
    }
    
    // Invalidate feedback queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ["feedback"] });
    return true;
  }

  return { submitFeedback, isSubmitting };
}
