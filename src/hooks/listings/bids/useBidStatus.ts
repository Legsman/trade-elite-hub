
import { useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { Bid, UserBidStatus } from "./types";

interface UseBidStatusProps {
  listingId: string;
  bids: Bid[];
}

export const useBidStatus = ({ listingId, bids }: UseBidStatusProps) => {
  const { user } = useAuth();
  
  const getUserBidStatus = useCallback((): UserBidStatus => {
    console.log(`[useBidStatus] Getting bid status for user, ${bids.length} bids available`);
    
    if (!user || !bids || bids.length === 0) {
      return {
        hasBid: false,
        isHighestBidder: false,
        userBid: null,
        userHighestBid: 0,
        userMaximumBid: 0
      };
    }
    
    // Sort bids by amount in descending order to find highest bid
    const sortedBids = [...bids].sort((a, b) => Number(b.amount) - Number(a.amount));
    const highestBid = sortedBids[0];
    
    // Find user's active bid, if any
    const userBid = bids.find(bid => bid.user_id === user.id && bid.status === 'active') || null;
    
    const status: UserBidStatus = {
      hasBid: !!userBid,
      isHighestBidder: !!userBid && userBid.id === highestBid.id,
      userBid,
      userHighestBid: userBid ? Number(userBid.amount) : 0,
      userMaximumBid: userBid && userBid.maximum_bid ? Number(userBid.maximum_bid) : 0
    };
    
    console.log('[useBidStatus] User bid status:', status);
    
    return status;
  }, [user, bids]);
  
  return {
    getUserBidStatus
  };
};
