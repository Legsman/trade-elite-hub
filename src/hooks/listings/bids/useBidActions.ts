
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useBidActions = (
  listingId?: string,
  onBidSuccess?: () => void,
  fetchBids?: () => Promise<void>
) => {
  const { user } = useAuth();

  const placeBid = useCallback(async (amount: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place a bid.",
        variant: "destructive",
      });
      return { success: false };
    }

    if (!listingId) {
      toast({
        title: "Error",
        description: "Listing not found.",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      // First, fetch the highest bid to validate the new bid
      const { data: currentBids, error: fetchError } = await supabase
        .from("bids")
        .select("amount")
        .eq("listing_id", listingId)
        .order("amount", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      // Check if new bid is higher than the current highest bid
      const currentHighBid = currentBids.length > 0 ? Number(currentBids[0].amount) : 0;
      if (amount <= currentHighBid) {
        toast({
          title: "Invalid Bid",
          description: `Your bid must be higher than the current highest bid (£${currentHighBid.toLocaleString()}).`,
          variant: "destructive",
        });
        return { success: false };
      }

      // Insert new bid
      const { error: insertError } = await supabase
        .from("bids")
        .insert({
          user_id: user.id,
          listing_id: listingId,
          amount,
          status: "active"
        });

      if (insertError) throw insertError;

      // Create notification for the listing owner
      const { data: listingData } = await supabase
        .from("listings")
        .select("seller_id, title")
        .eq("id", listingId)
        .single();

      if (listingData && listingData.seller_id !== user.id) {
        await supabase
          .from("notifications")
          .insert({
            user_id: listingData.seller_id,
            type: "new_bid",
            message: `New bid of £${amount.toLocaleString()} on your listing "${listingData.title}"`,
            metadata: {
              listing_id: listingId,
              bid_amount: amount,
              bidder_id: user.id
            }
          });
      }

      toast({
        title: "Bid Placed",
        description: `Your bid of £${amount.toLocaleString()} has been placed successfully.`,
      });

      // Refresh bids
      if (fetchBids) {
        fetchBids();
      }
      
      // Call success callback if provided
      if (onBidSuccess) {
        onBidSuccess();
      }

      return { success: true };
    } catch (err) {
      console.error("Error placing bid:", err);
      toast({
        title: "Error",
        description: "Failed to place bid. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [user, listingId, fetchBids, onBidSuccess]);

  return { placeBid };
};
