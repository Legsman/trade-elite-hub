
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OfferForm } from "./OfferForm";
import { OfferManagement } from "./OfferManagement";
import { useOffers } from "@/hooks/listings";
import { supabase } from "@/integrations/supabase/client";

interface OfferSectionProps {
  listingId: string;
  listingTitle: string;
  sellerId: string;
  currentPrice: number;
  userId?: string;
}

export const OfferSection = ({ 
  listingId, 
  listingTitle,
  sellerId, 
  currentPrice,
  userId
}: OfferSectionProps) => {
  const { 
    offers, 
    isLoading, 
    error, 
    makeOffer, 
    fetchOffers,
    respondToOffer,
    getUserOfferStatus
  } = useOffers({ listingId });
  
  const [bidsExist, setBidsExist] = useState(false);
  
  // Check if any bids exist for this listing
  useEffect(() => {
    const checkBids = async () => {
      const { data } = await supabase
        .from("bids")
        .select("id")
        .eq("listing_id", listingId)
        .limit(1);
      
      setBidsExist(!!(data && data.length > 0));
    };
    
    checkBids();
  }, [listingId]);
  
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleMakeOffer = useCallback(async (amount: number, message?: string) => {
    return await makeOffer(amount, message);
  }, [makeOffer]);

  const handleRespond = useCallback(async (offerId: string, status: 'accepted' | 'declined') => {
    return await respondToOffer(offerId, status);
  }, [respondToOffer]);

  const userOfferStatus = getUserOfferStatus();
  
  const isSeller = userId === sellerId;

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isSeller && (
          <div className="md:col-span-2">
            <OfferManagement 
              offers={offers}
              isLoading={isLoading}
              onRefresh={fetchOffers}
              onRespond={handleRespond}
              listingTitle={listingTitle}
            />
          </div>
        )}
        
        {!isSeller && userId && !bidsExist && (
          <div className="md:col-span-2">
            <OfferForm 
              listingId={listingId}
              listingTitle={listingTitle}
              currentPrice={currentPrice}
              onMakeOffer={handleMakeOffer}
              userOfferStatus={userOfferStatus}
            />
          </div>
        )}
        
        {!isSeller && userId && bidsExist && (
          <div className="md:col-span-2">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Bidding has started</AlertTitle>
              <AlertDescription>
                Offers are no longer accepted for this listing as bidding has begun. You can place a bid instead.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {!userId && (
          <div className="md:col-span-2">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login required</AlertTitle>
              <AlertDescription>
                Please log in to make an offer on this listing.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};
