
import { useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { UseBidsOptions } from "./types";
import { useBidDataFetcher } from "./useBidDataFetcher";
import { useBidActions } from "./useBidActions";
import { useBidStatus } from "./useBidStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useBids = (options: UseBidsOptions = {}) => {
  const { listingId, onBidSuccess } = options;
  const { user } = useAuth();
  
  const { bids, isLoading, error, highestBid, fetchBids } = useBidDataFetcher(listingId);
  const { placeBid } = useBidActions(listingId, onBidSuccess, fetchBids);
  const { getUserBidStatus } = useBidStatus(bids, user?.id);

  // Memoized function to place a bid and fetch updated data
  const handlePlaceBid = useCallback(async (amount: number) => {
    console.log(`Starting bid placement process for amount: ${amount}`);
    const result = await placeBid(amount);
    
    if (result.success) {
      console.log("Bid placed successfully, fetching updated bids");
      // Immediately fetch the updated bids after successful bid placement
      await fetchBids();
      
      // Show a toast notification
      toast({
        title: "Bid Placed Successfully",
        description: `Your bid of £${amount.toLocaleString()} has been placed.`,
      });
    }
    return result;
  }, [placeBid, fetchBids]);

  // Fetch bids on mount or when listingId changes
  useEffect(() => {
    console.log("Setting up bids subscription for listing:", listingId);
    
    // Initial fetch
    fetchBids();
    
    // Set up real-time subscription for bids
    if (listingId) {
      const channelId = `bids-${listingId}-${Date.now()}`;
      console.log(`Creating Supabase channel: ${channelId}`);
      
      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bids',
            filter: `listing_id=eq.${listingId}`
          },
          (payload) => {
            console.log("Realtime bid update received:", payload);
            // Refetch bids when there's a change
            fetchBids();
          }
        )
        .subscribe((status) => {
          console.log(`Supabase realtime subscription status (${channelId}):`, status);
        });
      
      // Clean up the subscription
      return () => {
        console.log(`Cleaning up bids subscription for channel: ${channelId}`);
        supabase.removeChannel(channel);
      };
    }
  }, [listingId, fetchBids]);

  return {
    bids,
    isLoading,
    error,
    placeBid: handlePlaceBid, // Use our enhanced version that fetches after placement
    fetchBids,
    highestBid,
    getUserBidStatus
  };
};
