
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
        bidIncrement: bid.bid_increment ? Number(bid.bid_increment) : (bid.bidIncrement || 0),
        // Map to .user for the global Bid type
        user: {
          fullName: bid.user_profile?.full_name || null,
          avatarUrl: bid.user_profile?.avatar_url || null,
          username: (bid.user_profile && "username" in bid.user_profile) ? bid.user_profile.username : null,
        },
        // Only in GlobalBid: also include user_profile for compatibility if needed elsewhere
        user_profile: bid.user_profile // Optional: pass-through for any fallback needs
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
    // Defensive extraction: GlobalBid has .user, but fallback to user_profile if needed.
    const user =
      "user" in bid && bid.user
        ? bid.user
        : bid.user_profile
        ? {
            fullName: (bid.user_profile as any).full_name || null,
            avatarUrl: (bid.user_profile as any).avatar_url || null,
            username: (bid.user_profile as any).username || null,
          }
        : { fullName: null, avatarUrl: null, username: null };

    return {
      id: bid.id,
      user_id: bid.userId,
      listing_id: bid.listingId,
      amount: bid.amount,
      maximum_bid: bid.maximumBid || 0,
      bid_increment: bid.bidIncrement || 0,
      status: bid.status,
      created_at:
        bid.createdAt instanceof Date
          ? bid.createdAt.toISOString()
          : new Date(bid.createdAt).toISOString(),
      user_profile: {
        full_name: user.fullName || null,
        avatar_url: user.avatarUrl || null,
        username: user.username || null,
      },
      userId: bid.userId,
      listingId: bid.listingId,
      maximumBid: bid.maximumBid || 0,
      bidIncrement: bid.bidIncrement || 0,
      createdAt:
        bid.createdAt instanceof Date
          ? bid.createdAt
          : new Date(bid.createdAt),
    };
  }
};
