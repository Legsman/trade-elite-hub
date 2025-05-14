
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ListingImageGallery, AuctionSection, OfferSection } from "@/components/listings";
import { Listing } from "@/types";

interface ListingDetailsMainContentProps {
  listing: Listing;
  bids: any[];
  isOwner: boolean;
  userId?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refetchListing?: () => Promise<void>;
}

export const ListingDetailsMainContent = ({
  listing,
  bids,
  isOwner,
  userId,
  activeTab,
  setActiveTab,
  refetchListing
}: ListingDetailsMainContentProps) => {
  const isAuction = listing.type === "auction";
  const acceptsOffers = listing.allowBestOffer;
  const isSold = listing.status === "sold";
  
  return (
    <>
      <ListingImageGallery 
        images={listing.images} 
        listingId={listing.id}
        title={listing.title}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="details">Details</TabsTrigger>
          {isAuction && <TabsTrigger value="bids">Bids</TabsTrigger>}
          {acceptsOffers && <TabsTrigger value="offers">Offers</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Description</h2>
              <p className="whitespace-pre-line">{listing.description}</p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Condition</h3>
                <p>{listing.condition}</p>
              </div>
              <div>
                <h3 className="font-medium">Category</h3>
                <p>{listing.category}</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {isAuction && (
          <TabsContent value="bids" className="mt-6">
            <AuctionSection 
              listingId={listing.id}
              sellerId={listing.sellerId}
              currentPrice={listing.currentBid || listing.price}
              userId={userId}
              refetchListing={refetchListing}
            />
          </TabsContent>
        )}
        
        {acceptsOffers && (
          <TabsContent value="offers" className="mt-6">
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
