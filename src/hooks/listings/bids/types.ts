
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
}
