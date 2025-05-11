
import { ListingCard } from "./ListingCard";
import { Listing } from "@/types";

interface ListingGridProps {
  listings: Listing[];
  highestBids?: Record<string, number>;
}

export const ListingGrid = ({ listings, highestBids = {} }: ListingGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard 
          key={listing.id} 
          listing={listing}
          highestBid={listing.type === "auction" ? highestBids[listing.id] || null : null}
        />
      ))}
    </div>
  );
};
