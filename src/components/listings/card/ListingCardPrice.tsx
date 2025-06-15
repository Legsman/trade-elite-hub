
import React from "react";
import { Gavel, Check } from "lucide-react";
import { Listing } from "@/types";

interface ListingCardPriceProps {
  listing: Listing;
  highestBid?: number | null;
}

export const ListingCardPrice: React.FC<ListingCardPriceProps> = ({ listing, highestBid }) => {
  if (listing.type === "auction") {
    return (
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
    );
  }
  if (listing.status === "sold") {
    return (
      <div className="mt-1 text-lg font-bold text-green-600">
        Sold for £{listing.price.toLocaleString()}
      </div>
    );
  }
  return (
    <div className="mt-1 text-lg font-bold text-purple">
      £{listing.price.toLocaleString()}
    </div>
  );
};
