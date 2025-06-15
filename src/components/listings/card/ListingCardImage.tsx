
import React from "react";
import { Listing } from "@/types";
import { getEffectiveListingStatus } from "@/utils/listingStatus";
import { ListingCardStatusBadge } from "./ListingCardStatusBadge";

interface ListingCardImageProps {
  listing: Listing;
}

export const ListingCardImage: React.FC<ListingCardImageProps> = ({ listing }) => {
  const effectiveStatus = getEffectiveListingStatus(listing);

  return (
    <div className="aspect-video relative">
      <img
        src={listing.images[0]}
        alt={listing.title}
        className={`object-cover h-full w-full ${effectiveStatus === "sold" ? "opacity-80" : ""}`}
        loading="lazy"
      />
      {/* Status badge and overlays */}
      <ListingCardStatusBadge listing={listing} />
    </div>
  );
};
