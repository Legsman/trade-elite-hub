
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingImageGallery } from "@/components/listings";
import { useBids } from "@/hooks/listings";
import { BidHistory } from "@/components/listings/BidHistory";
import { Listing } from "@/types";

interface ListingDetailsMainContentProps {
  listing: Listing;
  isOwner: boolean;
  userId?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refetchListing: () => Promise<void>; // Required to refresh listing data after bid/offer
}

export const ListingDetailsMainContent = ({
  listing,
  isOwner,
  userId,
  activeTab,
  setActiveTab,
  refetchListing
}: ListingDetailsMainContentProps) => {
  const isAuction = listing.type === "auction";
  const isSold = listing.status === "sold";

  // Memoize formatDate for performance, same as in ListingDetailsTabs
  const formatDate = useMemo(() => (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }, []);

  // UseBids only for auction listings (for Bid History)
  const { bids, isLoading } = useBids && isAuction
    ? useBids({ listingId: listing.id })
    : { bids: [], isLoading: false };

  return (
    <>
      <ListingImageGallery 
        images={listing.images} 
        listingId={listing.id}
        title={listing.title}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 mt-6">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          {isAuction && <TabsTrigger value="bid-history">Bid History</TabsTrigger>}
        </TabsList>
        {/* Description tab */}
        <TabsContent value="description" className="space-y-4">
          <div className="text-lg">
            {(listing.description || "").split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </TabsContent>
        {/* Details tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Condition</span>
              <span className="font-medium">{listing.condition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium capitalize">{listing.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Listing Type</span>
              <span className="font-medium capitalize">{listing.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">{listing.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Listed On</span>
              <span className="font-medium">{formatDate(listing.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires</span>
              <span className="font-medium">{formatDate(listing.expiresAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best Offer</span>
              <span className="font-medium">{listing.allowBestOffer ? "Accepted" : "Not Accepted"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item ID</span>
              <span className="font-medium">{listing.id}</span>
            </div>
          </div>
        </TabsContent>
        {/* Bid History tab, only for auctions */}
        {isAuction && (
          <TabsContent value="bid-history" className="space-y-4">
            <BidHistory
              bids={bids}
              isLoading={isLoading}
              currentUserId={userId}
              // onRefresh can be provided to refresh from parent or via useBids
              onRefresh={refetchListing}
              highestBidderId={listing.highestBidderId}
            />
          </TabsContent>
        )}
      </Tabs>
    </>
  );
};
