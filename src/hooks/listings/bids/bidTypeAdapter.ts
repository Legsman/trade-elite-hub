
import { Bid as HookBid } from "./types";
import { Bid as GlobalBid } from "@/types";

/**
 * Adapts bid data between different Bid interfaces in the application
 */
export const adaptBidTypes = {
  /**
   * Converts a Bid from hooks/listings/bids/types to types/index.ts format
   */
  toGlobalBid(bid: HookBid): GlobalBid {
    return {
      id: bid.id,
      userId: bid.user_id,
      listingId: bid.listing_id,
      amount: bid.amount,
      maximumBid: bid.maximum_bid || 0,
      bidIncrement: bid.bid_increment || 0,
      status: bid.status,
      createdAt: bid.created_at ? new Date(bid.created_at) : new Date(),
      user: bid.user_profile ? {
        fullName: bid.user_profile.full_name || null,
        avatarUrl: bid.user_profile.avatar_url || null
      } : undefined
    };
  },
  
  /**
   * Converts an array of Bids from hooks/listings/bids/types to types/index.ts format
   */
  toGlobalBids(bids: HookBid[]): GlobalBid[] {
    return bids.map(bid => this.toGlobalBid(bid));
  }
};
