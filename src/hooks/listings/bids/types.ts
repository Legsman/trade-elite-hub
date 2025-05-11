
import { Bid } from "@/types";

export interface UseBidsOptions {
  listingId?: string;
  onBidSuccess?: () => void;
}

export interface BidState {
  bids: Bid[];
  isLoading: boolean;
  error: string | null;
  highestBid: number | null;
}

export interface UserBidStatus {
  hasBid: boolean;
  isHighestBidder: boolean;
  userHighestBid: number | null;
}
