
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingDetailSoldAlert } from "@/components/listings";
import { Listing } from "@/types";
import { NavigateFunction } from "react-router-dom";

interface ListingDetailsHeaderProps {
  navigate: NavigateFunction;
  listing: Listing;
  isSold: boolean;
}

export const ListingDetailsHeader = ({ navigate, listing, isSold }: ListingDetailsHeaderProps) => {
  return (
    <>
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate("/listings")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to listings
      </Button>

      {isSold && (
        <ListingDetailSoldAlert 
          isAuction={listing.type === "auction"}
          soldDate={listing.updatedAt}
        />
      )}
    </>
  );
};
