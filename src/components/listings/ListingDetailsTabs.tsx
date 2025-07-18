
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Listing } from "@/types";

interface ListingDetailsTabsProps {
  listing: Listing;
}

export const ListingDetailsTabs = ({ listing }: ListingDetailsTabsProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Tabs defaultValue="description" className="space-y-4">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
      
      <TabsContent value="description" className="space-y-4">
        <div className="text-lg">
          {listing.description.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </TabsContent>
      
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
    </Tabs>
  );
};
