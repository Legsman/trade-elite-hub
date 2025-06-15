
import { Listing } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Gavel, Eye, Heart } from "lucide-react";
import { ListingActionMenu } from "../listings/ListingActionMenu";
import { useNavigate } from "react-router-dom";
import React from "react";

interface SellerListingCardProps {
  listing: Listing;
  onEdit?: () => void;
  onEnd?: () => void;
  onReviewOffers?: () => void;
  onShare?: () => void;
  onChangeToAuction?: () => void;
  disableEnd?: boolean;
}

export function SellerListingCard({
  listing,
  onEdit,
  onEnd,
  onReviewOffers,
  onShare,
  onChangeToAuction,
  disableEnd = false,
}: SellerListingCardProps) {
  const now = new Date();
  const expiresAt =
    listing.expiresAt instanceof Date
      ? listing.expiresAt
      : new Date(listing.expiresAt);

  const navigate = useNavigate();

  // Status Badge
  const getStatusBadge = () => {
    if (listing.status === "sold") {
      return (
        <Badge className="bg-green-600 text-white absolute top-2 right-2">
          Sold
        </Badge>
      );
    }
    if (
      listing.status === "ended" ||
      listing.status === "expired" ||
      now > expiresAt
    ) {
      return (
        <Badge className="bg-gray-500 text-white absolute top-2 right-2">
          Ended
        </Badge>
      );
    }
    if (listing.status === "active") {
      // Ending soon (within 24h)
      const hours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hours > 0 && hours < 24) {
        return (
          <Badge className="bg-red-500 animate-pulse text-white absolute top-2 right-2">
            Ending Soon
          </Badge>
        );
      }
      return (
        <Badge className="bg-blue-500 text-white absolute top-2 right-2">
          Active
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="relative overflow-hidden">
      {/* 3-dot action menu, top-left */}
      <ListingActionMenu
        status={listing.status}
        type={listing.type}
        allowBestOffer={listing.allowBestOffer}
        onEdit={onEdit}
        onEnd={onEnd}
        onReviewOffers={onReviewOffers}
        onShare={onShare}
        onChangeToAuction={onChangeToAuction}
        disableEnd={disableEnd}
      />
      <div className="aspect-video overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        {getStatusBadge()}
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
