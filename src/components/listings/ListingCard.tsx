import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Listing } from "@/types";
import { useAnalytics } from "@/hooks/use-analytics";
import { ListingCountdown } from "./ListingCountdown";
import { Gavel, Check } from "lucide-react";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { getBidCountText } from "@/lib/utils";
import { useEffect } from "react";

interface ListingCardProps {
  listing: Listing;
  onClick?: (id: string) => void;
  highestBid?: number | null;
  bidCount?: number; // New prop to track bid count
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

  // Helper: Get now and expiry as Date
  const now = new Date();
  const expiresAt = listing.expiresAt instanceof Date ? listing.expiresAt : new Date(listing.expiresAt);

  // Check if auction/listing is ending soon (active & within 24 hours & not expired)
  const isEndingSoon = () => {
    if (listing.status !== "active" || !expiresAt || now > expiresAt) return false;
    const hoursRemaining = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursRemaining <= 24 && hoursRemaining > 0;
  };

  // New: Check if item has ended (time-based, not just status)
  const isActuallyEnded = () => {
    return now > expiresAt && listing.status === "active";
  };

  // Priority-based badge rendering: Sold > Ended > Expired/Completed > Ending Soon > Default
  const getStatusBadge = () => {
    if (listing.status === "sold") {
      return (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium rounded-full px-2 py-1">
          Sold
        </div>
      );
    } else if (isActuallyEnded()) {
      // Show "Ended" if listing has expired time-wise, but status was not yet updated in DB
      return (
        <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs font-medium rounded-full px-2 py-1">
          Ended
        </div>
      );
    } else if (listing.status === "expired" || listing.status === "completed") {
      return (
        <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-medium rounded-full px-2 py-1">
          {listing.status === "expired" ? "Expired" : "Completed"}
        </div>
      );
    } else if (isEndingSoon()) {
      return (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium rounded-full px-2 py-1 animate-pulse">
          Ending Soon
        </div>
      );
    } else {
      return (
        <div className="absolute top-2 right-2 bg-background/90 text-xs font-medium rounded-full px-2 py-1">
          {listing.type === "auction" ? "Auction" : "For Sale"}
        </div>
      );
    }
  };

  // Only active listings show countdown; ended shows "Ended"
  const showCountdown = () => {
    return listing.status === "active" && now < expiresAt;
  };

  useEffect(() => {
    // Use Intersection Observer to only count view when card is actually visible, and only once
    let hasTracked = false;
    const card = document.getElementById(`listing-card-${listing.id}`);

    if (!card) return;

    const track = async () => {
      if (hasTracked) return;
      hasTracked = true;
      await fetch("/functions/v1/track-listing-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId: listing.id }),
      });
    };

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            track();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(card);

    return () => observer.disconnect();
  }, [listing.id]);

  return (
    <Card
      id={`listing-card-${listing.id}`}
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
        listing.status === "sold" ? "border-green-500" : ""
      }`}
      onClick={handleClick}
    >
      <div className="aspect-video relative">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className={`object-cover h-full w-full ${
            listing.status === "sold" ? "opacity-80" : ""
          }`}
          loading="lazy"
        />
        {getStatusBadge()}

        {/* Overlay SOLD indicator for better visibility */}
        {listing.status === "sold" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Badge variant="secondary" className="text-lg font-bold bg-white/80 text-green-600 px-6 py-3 transform rotate-[-20deg]">
              <Check className="mr-1 h-4 w-4" /> SOLD
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {listing.location}
          </p>
        </div>
        {listing.type === "auction" ? (
          <div className="mt-1">
            {highestBid ? (
              <div className="flex items-center">
                <Gavel className="h-4 w-4 mr-1 text-purple" />
                <div className="text-lg font-bold text-purple">
                  £{highestBid.toLocaleString()}
                </div>
                <span className="text-xs text-muted-foreground ml-1">(Current bid)</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Gavel className="h-4 w-4 mr-1" />
                <div className="text-lg font-bold text-purple">
                  £{listing.price.toLocaleString()}
                </div>
                <span className="text-xs text-muted-foreground ml-1">(Starting bid)</span>
              </div>
            )}
          </div>
        ) : listing.status === "sold" ? (
          <div className="mt-1 text-lg font-bold text-green-600">
            Sold for £{listing.price.toLocaleString()}
          </div>
        ) : (
          <div className="mt-1 text-lg font-bold text-purple">
            £{listing.price.toLocaleString()}
          </div>
        )}

        {/* Countdown or ended status */}
        <div className="mt-2">
          {showCountdown() ? (
            <ListingCountdown 
              expiryDate={expiresAt} 
              isAuction={listing.type === "auction"} 
              listingStatus={listing.status}
              className="text-xs"
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              {listing.status === "sold"
                ? "No longer available"
                : now > expiresAt
                  ? "Ended"
                  : "Ended"}
            </p>
          )}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="p-4 flex justify-between text-xs text-muted-foreground">
        <span>{listing.views} views</span>
        {listing.type === "auction" ? (
          <span>{getBidCountText(bidCount)}</span>
        ) : (
          <span>{listing.saves || 0} saves</span>
        )}
        <span className="capitalize">{listing.category}</span>
      </CardFooter>
    </Card>
  );
});

ListingCard.displayName = "ListingCard";
