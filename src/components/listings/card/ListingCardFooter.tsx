
import React from "react";
import { Separator } from "@/components/ui/separator";
import { getBidCountText } from "@/lib/utils";
import { Listing } from "@/types";

interface ListingCardFooterProps {
  listing: Listing;
  bidCount?: number;
}

export const ListingCardFooter: React.FC<ListingCardFooterProps> = ({ listing, bidCount = 0 }) => {
  return (
    <>
      <Separator />
      <div className="p-4 flex justify-between text-xs text-muted-foreground">
        <span>{listing.views} views</span>
        {listing.type === "auction" ? (
          <span>{getBidCountText(bidCount)}</span>
        ) : (
          <span>{listing.saves || 0} saves</span>
        )}
        <span className="capitalize">{listing.category}</span>
      </div>
    </>
  );
};
