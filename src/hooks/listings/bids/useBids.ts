
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { UseBidsOptions } from "./types";
import { useBidDataFetcher } from "./useBidDataFetcher";
import { useBidActions } from "./useBidActions";
import { useBidStatus } from "./useBidStatus";

export const useBids = (options: UseBidsOptions = {}) => {
  const { listingId, onBidSuccess } = options;
  const { user } = useAuth();
  
  const { bids, isLoading, error, highestBid, fetchBids } = useBidDataFetcher(listingId);
  const { placeBid } = useBidActions(listingId, onBidSuccess, fetchBids);
  const { getUserBidStatus } = useBidStatus(bids, user?.id);

  // Fetch bids on mount or when listingId changes
  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

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
