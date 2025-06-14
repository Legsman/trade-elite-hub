
// src/hooks/listings/bids/useBidStatus.ts
import { useCallback } from 'react';
import { useAuth } from '@/hooks/auth';
import { Bid, BidStatus } from './types';
import { useListing } from '../useListing';  // ≤ adjust path if needed

interface UseBidStatusProps {
  listingId: string;
  bids: Bid[];
}

export const useBidStatus = ({ listingId, bids }: UseBidStatusProps) => {
  // Pull in the listing so we know who the true winner is
  const { listing } = useListing(listingId);
  const { user } = useAuth();

  const getUserBidStatus = useCallback((): BidStatus => {
    if (!user || !bids || bids.length === 0 || !listing) {
      return {
        hasBid: false,
        isHighestBidder: false,
        userBid: null,
        userHighestBid: 0,
        userMaximumBid: 0,
      };
    }

    // Find the user's active bid (if any)
    const userBid = bids.find(
      (bid) => bid.user_id === user.id && bid.status === 'active'
    ) || null;

    // Are they the top bidder according to the listing?
    const isHighestBidder = listing.highestBidderId === user.id;

    return {
      hasBid: !!userBid,
      isHighestBidder,
      userBid,
      // MAIN CHANGE: show the user's maximum bid as their "highest bid"
      userHighestBid: userBid ? Number(userBid.maximum_bid) : 0,
      userMaximumBid: userBid && userBid.maximum_bid 
        ? Number(userBid.maximum_bid) 
        : 0,
    };
  }, [user, bids, listing?.highestBidderId]);

  return { getUserBidStatus };
};
