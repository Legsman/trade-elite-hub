
import { Badge } from "@/components/ui/badge";
import { getEffectiveListingStatus, getStatusBadgeVariant } from "@/utils/listingStatus";
import { Check } from "lucide-react";
import { Listing } from "@/types";
import React from "react";

interface ListingCardStatusBadgeProps {
  listing: Listing;
}

export const ListingCardStatusBadge: React.FC<ListingCardStatusBadgeProps> = ({ listing }) => {
  const effectiveStatus = getEffectiveListingStatus(listing);
  const badge = getStatusBadgeVariant(listing);

  // Overlay SOLD indicator for better visibility
  if (effectiveStatus === "sold") {
    return (
      <>
        <div className={`absolute top-2 right-2 text-white text-xs font-medium rounded-full px-2 py-1 ${badge.color}`}>
          {badge.text}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Badge variant="secondary" className="text-lg font-bold bg-white/80 text-green-600 px-6 py-3 transform rotate-[-20deg]">
            <Check className="mr-1 h-4 w-4" /> SOLD
          </Badge>
        </div>
      </>
    );
  }

  // Default badge
  return (
    <div className={`absolute top-2 right-2 text-white text-xs font-medium rounded-full px-2 py-1 ${badge.color} ${badge.pulse ? "animate-pulse" : ""}`}>
      {badge.text}
    </div>
  );
};
