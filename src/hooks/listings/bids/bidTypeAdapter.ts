
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
    // Explicitly type user variable for safe property access
    type UserShape = { fullName: string | null, avatarUrl: string | null, username: string | null };

    let user: UserShape = { fullName: null, avatarUrl: null, username: null };

    if (
      "user" in bid &&
      bid.user &&
      typeof bid.user === "object" &&
      bid.user !== null
    ) {
      user = {
        fullName: "fullName" in bid.user ? (bid.user as any).fullName ?? null : null,
        avatarUrl: "avatarUrl" in bid.user ? (bid.user as any).avatarUrl ?? null : null,
        username: "username" in bid.user ? (bid.user as any).username ?? null : null,
      };
    } else if (
      bid.user_profile &&
      typeof bid.user_profile === "object" &&
      bid.user_profile !== null
    ) {
      user = {
        fullName: "full_name" in bid.user_profile ? (bid.user_profile as any).full_name ?? null : null,
        avatarUrl: "avatar_url" in bid.user_profile ? (bid.user_profile as any).avatar_url ?? null : null,
        username: "username" in bid.user_profile ? (bid.user_profile as any).username ?? null : null,
      };
    }

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
        full_name: user.fullName,
        avatar_url: user.avatarUrl,
        username: user.username,
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
