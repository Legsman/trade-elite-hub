
import React, { memo } from "react";
import { ListingGrid } from "@/components/listings";
import { Loading } from "@/components/ui/loading";
import { ListingPagination } from "./ListingPagination";
import { Listing } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ListingContentProps {
  listings: Listing[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  highestBids?: Record<string, number>;
  onPageChange: (page: number) => void;
  onRetry?: () => void;
}

export const ListingContent: React.FC<ListingContentProps> = memo(({
  listings,
  isLoading,
  error,
  totalCount,
  pageSize,
  currentPage,
  highestBids = {},
  onPageChange,
  onRetry,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  // Only show loading state when we have no listings
  if (isLoading && (!listings || listings.length === 0)) {
    return (
      <div className="flex justify-center py-8">
        <Loading message="Loading listings..." />
      </div>
    );
  }

  if (error && (!listings || listings.length === 0)) {
    return (
      <div className="text-center py-8 space-y-4">
        <h2 className="text-2xl font-bold">Connection Error</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're having trouble connecting to the server. We'll keep trying automatically.
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry Now
          </Button>
        )}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">No Listings Found</h2>
        <p className="text-muted-foreground">No listings match your criteria. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ListingGrid listings={listings} highestBids={highestBids} />
      
      {/* Show loading indicator when refreshing data with existing listings */}
      {isLoading && listings.length > 0 && (
        <div className="flex justify-center py-2">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      
      <ListingPagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={onPageChange} 
      />
    </div>
  );
});

ListingContent.displayName = "ListingContent";
