
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingImageGallery, AuctionSection, OfferSection, ListingDetailsTabs } from "@/components/listings";
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
  
  return (
    <>
      <ListingImageGallery 
        images={listing.images} 
        listingId={listing.id}
        title={listing.title}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          {isAuction && <TabsTrigger value="auction">Auction</TabsTrigger>}
          {listing.allowBestOffer && !isAuction && !isSold && <TabsTrigger value="offers">Offers</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <ListingDetailsTabs listing={listing} />
        </TabsContent>
        
        {isAuction && (
          <TabsContent value="auction" className="space-y-4">
            <AuctionSection 
              listingId={listing.id} 
              sellerId={listing.sellerId} 
              currentPrice={listing.currentBid ?? listing.price} 
              userId={userId}
              refetchListing={refetchListing}
              highestBidderId={listing.highestBidderId} // Added highestBidderId prop
            />
          </TabsContent>
        )}
        
        {listing.allowBestOffer && !isAuction && !isSold && (
          <TabsContent value="offers" className="space-y-4">
            <OfferSection
              listingId={listing.id}
              sellerId={listing.sellerId}
              currentPrice={listing.price}
              listingTitle={listing.title}
              userId={userId}
            />
          </TabsContent>
        )}
      </Tabs>
    </>
  );
};
