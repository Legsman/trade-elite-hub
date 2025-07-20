
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";

interface RelistingData {
  reason: string;
  additionalInfo?: string;
}

export const useRelistListing = (listingId?: string) => {
  const [isRelisting, setIsRelisting] = useState(false);
  const { user } = useAuth();

  const relistListing = async (data: RelistingData) => {
    if (!user || !listingId) {
      toast({
        title: "Error",
        description: "User or listing information missing",
        variant: "destructive",
      });
      return false;
    }

    setIsRelisting(true);

    try {
      // 1. Get current listing information
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("*, offers(id, user_id, amount, status)")
        .eq("id", listingId)
        .single();

      if (listingError) throw listingError;

      // 2. Verify the current user is the seller
      if (listing.seller_id !== user.id) {
        throw new Error("Only the seller can relist this item");
      }

      // 3. Save relisting information to a relisting_history table or to metadata
      const metadata = {
        relisted: true,
        previous_status: listing.status,
        relist_reason: data.reason,
        additional_info: data.additionalInfo || null,
        relist_date: new Date().toISOString(),
        previous_offers: listing.offers || [],
      };

      // 4. Clear auction data and reset listing to fresh state with new expiration
      const newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + 7); // 7 days from now
      
      const { error: updateError } = await supabase
        .from("listings")
        .update({
          status: "active",
          current_bid: null,
          highest_bidder_id: null,
          sale_buyer_id: null,
          sale_amount: null,
          sale_date: null,
          expires_at: newExpirationDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", listingId);

      if (updateError) throw updateError;

      // 5. Cancel all previous bids by setting them to inactive
      const { error: bidError } = await supabase
        .from("bids")
        .update({ 
          status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("listing_id", listingId)
        .eq("status", "active");

      if (bidError) throw bidError;

      // 6. Find accepted offer and notify previous buyer
      const acceptedOffer = listing.offers ? 
        listing.offers.find((offer: any) => offer.status === "accepted") :
        null;

      if (acceptedOffer) {
        // 7. Create a notification for the previous buyer
        await supabase
          .from("notifications")
          .insert({
            user_id: acceptedOffer.user_id,
            type: "listing_relisted",
            message: `The listing "${listing.title}" you purchased has been relisted by the seller. The reason provided is: ${data.reason}`,
            metadata: {
              listing_id: listingId,
              reason: data.reason,
              additional_info: data.additionalInfo || null,
            }
          });

        // 8. Update all previous offers to "cancelled"
        await supabase
          .from("offers")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("listing_id", listingId);
      }

      toast({
        title: "Listing Relisted",
        description: "Your listing is now active again and available for purchase",
      });

      return true;
    } catch (error) {
      console.error("Error relisting item:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error relisting the item",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRelisting(false);
    }
  };

  return {
    isRelisting,
    relistListing
  };
};
