
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingImageGallery, ListingDetailsTabs, AuctionSection, OfferSection } from "@/components/listings";
import { Listing } from "@/types";

interface ListingDetailsMainContentProps {
  listing: Listing;
  isOwner: boolean;
  userId?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refetchListing: () => Promise<void>; // Make sure this prop exists
}

export const ListingDetailsMainContent = ({ 
  listing,
  isOwner,
  userId,
  activeTab,
  setActiveTab,
  refetchListing // Make sure we're passing this down
}: ListingDetailsMainContentProps) => {
  const isAuction = listing.type === "auction";
  const allowOffers = !isAuction && listing.allowBestOffer;
  
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
          {isAuction && <TabsTrigger value="bids">Bids</TabsTrigger>}
          {allowOffers && <TabsTrigger value="offers">Make Offer</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="details">
          <ListingDetailsTabs listing={listing} />
        </TabsContent>
        
        {isAuction && (
          <TabsContent value="bids">
            <AuctionSection 
              listingId={listing.id}
              sellerId={listing.sellerId}
              currentPrice={listing.currentBid || listing.price}
              userId={userId}
              refetchListing={refetchListing} // Pass down refetchListing
            />
          </TabsContent>
        )}
        
        {allowOffers && (
          <TabsContent value="offers">
            <OfferSection 
              listingId={listing.id}
              listingTitle={listing.title}
              sellerId={listing.sellerId}
              currentPrice={listing.price}
              userId={userId}
            />
          </TabsContent>
        )}
      </Tabs>
    </>
  );
};
