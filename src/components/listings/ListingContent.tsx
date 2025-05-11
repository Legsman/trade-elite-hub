
import React from "react";
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

export const ListingContent: React.FC<ListingContentProps> = ({
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading message="Loading listings..." />
      </div>
    );
  }

  if (error || !listings) {
    return (
      <div className="text-center py-8 space-y-4">
        <h2 className="text-2xl font-bold">Error</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {error || "Failed to load listings. Please try again later."}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
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
      <ListingPagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={onPageChange} 
      />
    </div>
  );
};
