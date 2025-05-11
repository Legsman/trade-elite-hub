
import { useCallback } from "react";
import { Bid } from "@/types";
import { UserBidStatus } from "./types";

export const useBidStatus = (bids: Bid[], userId?: string) => {
  const getUserBidStatus = useCallback((): UserBidStatus => {
    if (!userId || bids.length === 0) {
      return {
        hasBid: false,
        isHighestBidder: false,
        userHighestBid: null
      };
    }

    const userBids = bids.filter(bid => bid.userId === userId);
    const hasBid = userBids.length > 0;
    const highestBidAmount = bids[0].amount;
    const userHighestBid = hasBid ? Math.max(...userBids.map(bid => bid.amount)) : null;
    const isHighestBidder = hasBid && highestBidAmount === userHighestBid;

    return {
      hasBid,
      isHighestBidder,
      userHighestBid
    };
  }, [userId, bids]);

  return { getUserBidStatus };
};
