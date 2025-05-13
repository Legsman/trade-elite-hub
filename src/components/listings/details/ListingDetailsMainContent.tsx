
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingImageGallery, ListingDetailsTabs, BidHistory, OfferSection } from "@/components/listings";
import { useBids } from "@/hooks/listings";
import { Listing, Bid } from "@/types";

interface ListingDetailsMainContentProps {
  listing: Listing;
  bids: Bid[];
  isOwner: boolean;
  userId?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ListingDetailsMainContent = ({ 
  listing, 
  isOwner,
  userId,
  activeTab,
  setActiveTab
}: ListingDetailsMainContentProps) => {
  const isAuction = listing.type === "auction";
  const isSold = listing.status === "sold";
  const { bids, isLoading, fetchBids, getUserBidStatus } = useBids({ listingId: listing.id });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <>
      {/* Image gallery */}
      <ListingImageGallery 
        images={listing.images}
        listingId={listing.id}
        title={listing.title}
      />

      {/* Listing information */}
      <ListingDetailsTabs listing={listing} />
      
      {/* Auction Bids / Make Offer Tab */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value={isAuction ? "bids" : "offers"}>
            {isAuction ? "Bids" : "Make an Offer"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>
                More information about this {isAuction ? "auction" : "listing"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Item Condition</h4>
                    <p className="font-medium">{listing.condition}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                    <p className="font-medium capitalize">{listing.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                    <p className="font-medium">{listing.location}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Listing Type</h4>
                    <p className="font-medium capitalize">{listing.type}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Listed On</h4>
                    <p className="font-medium">{formatDate(listing.createdAt)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <p className="font-medium capitalize">{listing.status}</p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                <div className="space-y-2">
                  {listing.description.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bids">
          {isAuction && (
            <div className="space-y-6">
              <BidHistory 
                bids={bids}
                isLoading={isLoading}
                onRefresh={fetchBids}
                currentUserId={userId}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="offers">
          {!isAuction && listing.allowBestOffer && !isSold && (
            <OfferSection 
              listingId={listing.id}
              listingTitle={listing.title}
              sellerId={listing.sellerId}
              currentPrice={listing.price}
              userId={userId}
            />
          )}
          
          {!isAuction && isSold && (
            <div className="p-6 text-center bg-muted rounded-md">
              <h3 className="text-lg font-medium mb-2">This item has been sold</h3>
              <p className="text-muted-foreground">
                This listing is no longer accepting offers as it has already been sold.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};
