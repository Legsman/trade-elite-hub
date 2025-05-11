
import { Offer } from "@/types";

export interface UseOffersOptions {
  listingId?: string;
  onOfferSuccess?: () => void;
}

export interface OfferState {
  offers: Offer[];
  isLoading: boolean;
  error: string | null;
}

export interface UserOfferStatus {
  hasPendingOffer: boolean;
  latestOffer: Offer | null;
}
