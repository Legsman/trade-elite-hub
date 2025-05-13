
import { useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { Bid } from "./types";

interface UseBidStatusProps {
  listingId: string;
  bids: Bid[];
}

interface BidStatus {
  hasBid: boolean;
  isHighestBidder: boolean;
  userBid: Bid | null;
}

export const useBidStatus = ({ listingId, bids }: UseBidStatusProps) => {
  const { user } = useAuth();
  
  const getUserBidStatus = useCallback((): BidStatus => {
    if (!user || !bids || bids.length === 0) {
      return {
        hasBid: false,
        isHighestBidder: false,
        userBid: null
      };
    }
    
    // Sort bids by amount in descending order to find highest bid
    const sortedBids = [...bids].sort((a, b) => Number(b.amount) - Number(a.amount));
    const highestBid = sortedBids[0];
    
    // Find user's active bid, if any
    const userBid = bids.find(bid => bid.user_id === user.id && bid.status === 'active') || null;
    
    return {
      hasBid: !!userBid,
      isHighestBidder: !!userBid && userBid.id === highestBid.id,
      userBid
    };
  }, [user, bids]);
  
  return {
    getUserBidStatus
  };
};
