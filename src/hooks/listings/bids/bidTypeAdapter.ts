
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
      // Validate bid has essential fields
      if (!bid.id || !bid.user_id || !bid.listing_id || bid.amount === undefined) {
        console.error('[bidTypeAdapter] Bid is missing essential fields:', bid);
      }
      
      // Check profile data specifically and log warnings
      if (!bid.user_profile) {
        console.warn('[bidTypeAdapter] Bid is missing user_profile data:', bid);
      } else if (!bid.user_profile.full_name) {
        console.warn('[bidTypeAdapter] Bid user_profile is missing full_name:', bid.user_profile);
      }
      
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
          fullName: bid.user_profile.full_name || "Anonymous User",
          avatarUrl: bid.user_profile.avatar_url || null
        } : {
          fullName: "Anonymous User", 
          avatarUrl: null
        }
      };
      
      console.log('[bidTypeAdapter] Converted to global bid:', globalBid);
      return globalBid;
    } catch (error) {
      console.error('[bidTypeAdapter] Error converting bid to global format:', error);
      // Provide a minimal valid object to prevent UI crashes
      return {
        id: bid.id || 'unknown-id',
        userId: bid.user_id || 'unknown-user',
        listingId: bid.listing_id || 'unknown-listing',
        amount: bid.amount || 0,
        maximumBid: bid.maximum_bid || 0,
        bidIncrement: bid.bid_increment || 0,
        status: bid.status || 'unknown',
        createdAt: new Date(),
        user: {
          fullName: "Anonymous User",
          avatarUrl: null
        }
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
