
import { Listing } from "@/types";
import { ListingCard } from "./ListingCard";
import { Button } from "@/components/ui/button";

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
  error?: string | null;
  onListingClick?: (id: string) => void;
  onRefresh?: () => void;
  emptyMessage?: string;
}

export const ListingGrid = ({
  listings,
  isLoading,
  error,
  onListingClick,
  onRefresh,
  emptyMessage = "No listings found matching your criteria."
}: ListingGridProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card animate-pulse">
            <div className="aspect-video bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-5 bg-muted rounded w-1/4 mt-2" />
              <div className="h-3 bg-muted rounded w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard 
          key={listing.id} 
          listing={listing} 
          onClick={onListingClick} 
        />
      ))}
    </div>
  );
};
