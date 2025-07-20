
import { Listing } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Gavel, Eye, Heart } from "lucide-react";
import { ListingActionMenu } from "../listings/ListingActionMenu";
import { useNavigate } from "react-router-dom";
import React from "react";
import { getEffectiveListingStatus, getStatusBadgeVariant } from "@/utils/listingStatus";

interface SellerListingCardProps {
  listing: Listing;
  onEdit?: () => void;
  onEnd?: () => void;
  onReviewOffers?: () => void;
  onShare?: () => void;
  onChangeToAuction?: () => void;
  onRelist?: () => void;
  disableEnd?: boolean;
}

export function SellerListingCard({
  listing,
  onEdit,
  onEnd,
  onReviewOffers,
  onShare,
  onChangeToAuction,
  onRelist,
  disableEnd = false,
}: SellerListingCardProps) {
  const now = new Date();
  const expiresAt =
    listing.expiresAt instanceof Date
      ? listing.expiresAt
      : new Date(listing.expiresAt);

  const navigate = useNavigate();

  // --- REPLACED BADGE LOGIC ---
  const effectiveStatus = getEffectiveListingStatus(listing);
  const badge = getStatusBadgeVariant(listing);

  return (
    <Card className="relative overflow-hidden">
      {/* 3-dot action menu, top-left */}
      <ListingActionMenu
        listing={listing}
        onEdit={onEdit}
        onEnd={onEnd}
        onReviewOffers={onReviewOffers}
        onShare={onShare}
        onChangeToAuction={onChangeToAuction}
        onRelist={onRelist}
        disableEnd={disableEnd}
      />
      <div className="aspect-video overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        {/* Unified badge */}
        <Badge className={`${badge.color} text-white absolute top-2 right-2 ${badge.pulse ? "animate-pulse" : ""}`}>
          {badge.text}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
        </div>
        <div className="text-xs text-muted-foreground mb-1">
          {listing.location}
        </div>
        <div className="mt-2 font-bold text-lg">
          £{listing.price.toLocaleString()}
        </div>
        {/* Metrics */}
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground font-medium">
          <Eye className="h-4 w-4" /> {listing.views} views
          <Heart className="h-4 w-4 ml-4" /> {listing.saves || 0} saves
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="p-4 flex justify-end">
        <button
          className="text-sm underline"
          onClick={() => navigate(`/listings/${listing.id}`)}
        >
          View Listing
        </button>
      </CardFooter>
    </Card>
  );
}
