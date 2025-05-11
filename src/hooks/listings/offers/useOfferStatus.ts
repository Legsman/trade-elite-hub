
import { useCallback } from "react";
import { Offer } from "@/types";
import { UserOfferStatus } from "./types";

export const useOfferStatus = (offers: Offer[], userId?: string) => {
  const getUserOfferStatus = useCallback((): UserOfferStatus => {
    if (!userId || offers.length === 0) {
      return {
        hasPendingOffer: false,
        latestOffer: null
      };
    }

    const userOffers = offers.filter(offer => offer.userId === userId);
    const hasPendingOffer = userOffers.some(offer => offer.status === 'pending');
    const latestOffer = userOffers.length > 0 ? userOffers[0] : null;

    return {
      hasPendingOffer,
      latestOffer
    };
  }, [userId, offers]);

  return { getUserOfferStatus };
};
