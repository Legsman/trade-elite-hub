
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";

interface EndListingReasonPayload {
  reason: string;
  additionalInfo?: string;
}

export function useEndListing(listingId?: string) {
  const [isEnding, setIsEnding] = useState(false);
  const { user } = useAuth();

  const endListing = async (payload: EndListingReasonPayload) => {
    if (!user || !listingId) {
      toast({
        title: "Error",
        description: "Missing user or listing.",
        variant: "destructive",
      });
      return false;
    }

    setIsEnding(true);

    try {
      // Fetch current listing and check seller
      const { data: listing, error: fetchError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (fetchError) throw fetchError;
      if (!listing || listing.seller_id !== user.id) {
        throw new Error("You are not authorized to end this listing.");
      }
      if (listing.status !== "active") {
        throw new Error("Only active listings can be ended.");
      }

      // Optionally, you could store reason in metadata/audit table.
      // For now, just update status and updated_at.
      const { error: updateError } = await supabase
        .from("listings")
        .update({
          status: "ended",
          updated_at: new Date().toISOString(),
        })
        .eq("id", listingId);

      if (updateError) throw updateError;

      // Optionally notify bidders/offerees here.

      toast({
        title: "Listing Ended",
        description: "The listing has been ended and is no longer visible to buyers.",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error Ending Listing",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsEnding(false);
    }
  };

  return { isEnding, endListing };
}
