
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
    console.log('[bidTypeAdapter] Converting bid to global format:', bid);
    
    try {
      const globalBid: GlobalBid = {
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
      
      console.log('[bidTypeAdapter] Converted to global bid:', globalBid);
      return globalBid;
    } catch (error) {
      console.error('[bidTypeAdapter] Error converting bid to global format:', error);
      // Provide a minimal valid object to prevent UI crashes
      return {
        id: bid.id,
        userId: bid.user_id,
        listingId: bid.listing_id,
        amount: bid.amount,
        maximumBid: 0,
        bidIncrement: 0,
        status: bid.status,
        createdAt: new Date()
      };
    }
  },
  
  /**
   * Converts an array of Bids from hooks/listings/bids/types to types/index.ts format
   */
  toGlobalBids(bids: HookBid[]): GlobalBid[] {
    console.log(`[bidTypeAdapter] Converting ${bids.length} bids to global format`);
    return bids.map(bid => this.toGlobalBid(bid));
  }
};
