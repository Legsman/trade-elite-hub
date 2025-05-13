
import { memo } from "react";
import { ListingCard } from "./ListingCard";
import { Listing } from "@/types";

interface ListingGridProps {
  listings: Listing[];
  highestBids?: Record<string, number>;
  bidCounts?: Record<string, number>;
}

export const ListingGrid = memo(({ listings, highestBids = {}, bidCounts = {} }: ListingGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard 
          key={listing.id} 
          listing={listing}
          highestBid={listing.type === "auction" ? highestBids[listing.id] || null : null}
          bidCount={listing.type === "auction" ? bidCounts[listing.id] || 0 : 0}
        />
      ))}
    </div>
  );
});

ListingGrid.displayName = "ListingGrid";
