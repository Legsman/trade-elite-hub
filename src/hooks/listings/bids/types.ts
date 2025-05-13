
export interface Bid {
  id: string;
  listing_id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  maximum_bid?: number;
  bid_increment?: number;
  user_profile?: {
    full_name?: string;
    avatar_url?: string;
  };
  // Add these properties to match the type in types/index.ts
  userId?: string;
  listingId?: string;
  maximumBid?: number;
  bidIncrement?: number;
  createdAt?: Date;
}

export interface BidResult {
  success: boolean;
  error?: string;
  bidId?: string;
}

export interface UserBidStatus {
  hasBid: boolean;
  isHighestBidder: boolean;
  userBid: Bid | null;
  // Add these properties to match what CollapsibleBidForm expects
  userHighestBid: number;
  userMaximumBid: number;
}
