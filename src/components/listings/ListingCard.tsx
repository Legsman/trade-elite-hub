
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Listing } from "@/types";
import { useAnalytics } from "@/hooks/use-analytics";
import { ListingCountdown } from "./ListingCountdown";
import { memo } from "react";
import { isListingActive, getEffectiveListingStatus } from "@/utils/listingStatus";
import {
  ListingCardImage,
  ListingCardPrice,
  ListingCardFooter,
  useListingCardAnalytics,
} from "./card";
import { SellerVerificationBadge } from "./card/SellerVerificationBadge";

interface ListingCardProps {
  listing: Listing;
  onClick?: (id: string) => void;
  highestBid?: number | null;
  bidCount?: number;
}

export const ListingCard = memo(({ listing, onClick, highestBid, bidCount = 0 }: ListingCardProps) => {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();

  const handleClick = () => {
    if (onClick) {
      onClick(listing.id);
    } else {
      trackEvent("listing_clicked", { listingId: listing.id });
      navigate(`/listings/${listing.id}`);
    }
  };

  // Analytics tracking effect (moved to hook)
  useListingCardAnalytics(listing);

  // Effective status & helpers
  const effectiveStatus = getEffectiveListingStatus(listing);
  const isSold = effectiveStatus === "sold";

  return (
    <Card
      id={`listing-card-${listing.id}`}
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
        isSold ? "border-green-500" : ""
      }`}
      onClick={handleClick}
    >
      <ListingCardImage listing={listing} />
      <CardContent className="p-4">
        <div className="mb-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
            <SellerVerificationBadge 
              sellerId={listing.sellerId} 
              className="ml-2 flex-shrink-0"
            />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {listing.location}
          </p>
        </div>
        
        {/* Show sold price for sold items, otherwise show current/highest bid */}
        {isSold && listing.saleAmount ? (
          <div className="mb-2">
            <div className="font-bold text-lg text-green-600">
              Sold for £{Number(listing.saleAmount).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground line-through">
              Listed at £{listing.price.toLocaleString()}
            </div>
          </div>
        ) : (
          <ListingCardPrice listing={listing} highestBid={highestBid} />
        )}
        
        {/* Countdown or ended status */}
        <div className="mt-2">
          {isListingActive(listing) ? (
            <ListingCountdown 
              expiryDate={listing.expiresAt instanceof Date ? listing.expiresAt : new Date(listing.expiresAt)} 
              isAuction={listing.type === "auction"} 
              listingStatus={effectiveStatus}
              className="text-xs"
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              {isSold
                ? "Sold"
                : effectiveStatus === "expired" || effectiveStatus === "ended"
                  ? "Ended"
                  : effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1)}
            </p>
          )}
        </div>
      </CardContent>
      <ListingCardFooter listing={listing} bidCount={bidCount} />
    </Card>
  );
});

ListingCard.displayName = "ListingCard";
