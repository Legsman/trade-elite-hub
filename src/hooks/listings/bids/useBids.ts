
import { useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { UseBidsOptions } from "./types";
import { useBidDataFetcher } from "./useBidDataFetcher";
import { useBidActions } from "./useBidActions";
import { useBidStatus } from "./useBidStatus";
import { supabase } from "@/integrations/supabase/client";

export const useBids = (options: UseBidsOptions = {}) => {
  const { listingId, onBidSuccess } = options;
  const { user } = useAuth();
  
  const { bids, isLoading, error, highestBid, fetchBids } = useBidDataFetcher(listingId);
  const { placeBid } = useBidActions(listingId, onBidSuccess, fetchBids);
  const { getUserBidStatus } = useBidStatus(bids, user?.id);

  // Memoized function to place a bid and fetch updated data
  const handlePlaceBid = useCallback(async (amount: number) => {
    const result = await placeBid(amount);
    if (result.success) {
      // Immediately fetch the updated bids after successful bid placement
      await fetchBids();
    }
    return result;
  }, [placeBid, fetchBids]);

  // Fetch bids on mount or when listingId changes
  useEffect(() => {
    console.log("Setting up bids subscription for listing:", listingId);
    fetchBids();
    
    // Set up real-time subscription for bids
    if (listingId) {
      const channel = supabase
        .channel(`bids-${listingId}`)
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
          console.log("Supabase realtime subscription status:", status);
        });
      
      // Clean up the subscription
      return () => {
        console.log("Cleaning up bids subscription");
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
