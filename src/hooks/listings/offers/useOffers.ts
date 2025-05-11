
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { UseOffersOptions } from "./types";
import { useOfferDataFetcher } from "./useOfferDataFetcher";
import { useOfferActions } from "./useOfferActions";
import { useOfferStatus } from "./useOfferStatus";

export const useOffers = (options: UseOffersOptions = {}) => {
  const { listingId, onOfferSuccess } = options;
  const { user } = useAuth();
  
  const { offers, isLoading, error, fetchOffers } = useOfferDataFetcher(listingId);
  const { makeOffer, respondToOffer } = useOfferActions(listingId, onOfferSuccess, fetchOffers);
  const { getUserOfferStatus } = useOfferStatus(offers, user?.id);

  // Fetch offers on mount or when listingId changes
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return {
    offers,
    isLoading,
    error,
    makeOffer,
    fetchOffers,
    respondToOffer,
    getUserOfferStatus
  };
};
