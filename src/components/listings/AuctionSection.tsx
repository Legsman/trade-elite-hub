
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BidForm } from "./BidForm";
import { BidHistory } from "./BidHistory";
import { useBids } from "@/hooks/listings";

interface AuctionSectionProps {
  listingId: string;
  sellerId: string;
  currentPrice: number;
  userId?: string;
}

export const AuctionSection = ({ 
  listingId, 
  sellerId, 
  currentPrice,
  userId
}: AuctionSectionProps) => {
  const { 
    bids, 
    isLoading, 
    error, 
    placeBid, 
    fetchBids,
    highestBid,
    getUserBidStatus
  } = useBids({ listingId });
  
  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const handlePlaceBid = useCallback(async (amount: number) => {
    return await placeBid(amount);
  }, [placeBid]);

  const userBidStatus = getUserBidStatus();
  
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
        <div>
          <BidHistory 
            bids={bids}
            isLoading={isLoading}
            onRefresh={fetchBids}
            currentUserId={userId}
          />
        </div>
        
        <div>
          {!isSeller && userId && (
            <BidForm 
              listingId={listingId}
              currentPrice={currentPrice}
              highestBid={highestBid}
              onPlaceBid={handlePlaceBid}
              userBidStatus={userBidStatus}
            />
          )}
          
          {isSeller && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>This is your auction</AlertTitle>
              <AlertDescription>
                You cannot bid on your own auction. You can view bid history and wait for the auction to end.
              </AlertDescription>
            </Alert>
          )}
          
          {!userId && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login required</AlertTitle>
              <AlertDescription>
                Please log in to place a bid on this auction.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};
