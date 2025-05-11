
import { useEffect } from "react";
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

  // Fetch bids on mount or when listingId changes
  useEffect(() => {
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
          () => {
            // Refetch bids when there's a change
            fetchBids();
          }
        )
        .subscribe();
      
      // Clean up the subscription
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [listingId, fetchBids]);

  return {
    bids,
    isLoading,
    error,
    placeBid,
    fetchBids,
    highestBid,
    getUserBidStatus
  };
};
