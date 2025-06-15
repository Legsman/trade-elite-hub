
export interface Bid {
  id: string;
  user_id: string;
  listing_id: string;
  amount: number;
  status: string;
  created_at: string;
  maximum_bid?: number;
  bid_increment?: number;
  user_profile?: {
    full_name: string | null;
    avatar_url: string | null;
    username?: string | null; // Now optional!
  };

  // For compatibility with types/index.ts
  userId: string;
  listingId: string;
  maximumBid: number;
  bidIncrement: number;
  createdAt: Date;
}

export interface BidStatus {
  hasBid: boolean;
  isHighestBidder: boolean;
  userBid: Bid | null;
  userHighestBid: number;
  userMaximumBid: number;
}

// Add the missing interface for component adaptation
export interface BidStatusWithAdaptation extends BidStatus {
  userHighestBid: number;
  userMaximumBid: number;
}
