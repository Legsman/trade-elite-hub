
import { Bid as GlobalBid } from "@/types";
import { Bid } from "./types";

/**
 * Adapter to convert between the internal Bid type and the global Bid type
 * used by components that expect the global Bid interface.
 */
export const adaptBidTypes = {
  /**
   * Convert internal Bid array to global Bid array
   */
  toGlobalBids: (bids: Bid[]): GlobalBid[] => {
    console.log(`[bidTypeAdapter] Converting ${bids?.length || 0} bids to global format`);
    
    if (!bids || !Array.isArray(bids)) {
      console.warn('[bidTypeAdapter] No bids to convert or invalid input', bids);
      return [];
    }
    
    try {
      return bids.map(bid => ({
        id: bid.id,
        userId: bid.user_id || bid.userId,
        listingId: bid.listing_id || bid.listingId,
        amount: Number(bid.amount),
        status: bid.status,
        createdAt: bid.createdAt || new Date(bid.created_at),
        maximumBid: bid.maximum_bid ? Number(bid.maximum_bid) : (bid.maximumBid || 0),
        bidIncrement: bid.bid_increment ? Number(bid.bid_increment) : (bid.bidIncrement || 5),
        userProfile: {
          fullName: bid.user_profile?.full_name || null,
          avatarUrl: bid.user_profile?.avatar_url || null
        }
      }));
    } catch (error) {
      console.error('[bidTypeAdapter] Error converting bids:', error);
      return [];
    }
  },
  
  /**
   * Convert a global Bid to internal Bid format
   */
  toInternalBid: (bid: GlobalBid): Bid => {
    return {
      id: bid.id,
      user_id: bid.userId,
      listing_id: bid.listingId,
      amount: bid.amount,
      maximum_bid: bid.maximumBid || 0,
      bid_increment: bid.bidIncrement || 5,
      status: bid.status,
      created_at: bid.createdAt?.toISOString() || new Date().toISOString(),
      user_profile: {
        full_name: bid.userProfile?.fullName || null,
        avatar_url: bid.userProfile?.avatarUrl || null
      },
      userId: bid.userId,
      listingId: bid.listingId,
      maximumBid: bid.maximumBid || 0,
      bidIncrement: bid.bidIncrement || 5,
      createdAt: bid.createdAt
    };
  }
};
