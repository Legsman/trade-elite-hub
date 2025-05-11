
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Listing } from "@/types";
import { useAnalytics } from "@/hooks/use-analytics";

interface ListingCardProps {
  listing: Listing;
  onClick?: (id: string) => void;
}

export const ListingCard = ({ listing, onClick }: ListingCardProps) => {
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

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
      onClick={handleClick}
    >
      <div className="aspect-video relative">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="object-cover h-full w-full"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-background/90 text-xs font-medium rounded-full px-2 py-1">
          {listing.type === "auction" ? "Auction" : "For Sale"}
        </div>
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
        <div className="mt-1 text-lg font-bold text-purple">
          £{listing.price.toLocaleString()}
        </div>
        <p className="mt-2 text-sm line-clamp-2">{listing.description}</p>
      </CardContent>
      <Separator />
      <CardFooter className="p-4 flex justify-between text-xs text-muted-foreground">
        <span>{listing.views} views</span>
        <span>{listing.saves} saves</span>
        <span className="capitalize">{listing.category}</span>
      </CardFooter>
    </Card>
  );
};
