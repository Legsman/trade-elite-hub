
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSubmitFeedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (error) throw error;
    return true;
  }

  return { submitFeedback, isSubmitting };
}
