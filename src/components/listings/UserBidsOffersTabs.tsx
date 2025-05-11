
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Listing, Bid, Offer } from "@/types";
import { ListingCard } from "./ListingCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UserBidsOffersTabsProps {
  userId: string;
}

export const UserBidsOffersTabs: React.FC<UserBidsOffersTabsProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my-bids");
  const [bidListings, setBidListings] = useState<Listing[]>([]);
  const [offerListings, setOfferListings] = useState<Listing[]>([]);
  const [highestBids, setHighestBids] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user's bid listings
  useEffect(() => {
    const fetchBidListings = async () => {
      setIsLoading(true);
      try {
        // Get all bids by this user
        const { data: bids, error: bidsError } = await supabase
          .from("bids")
          .select("listing_id, amount")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
          
        if (bidsError) throw bidsError;
        
        if (bids && bids.length > 0) {
          // Extract unique listing IDs
          const listingIds = [...new Set(bids.map(bid => bid.listing_id))];
          
          // Get all these listings
          const { data: listings, error: listingsError } = await supabase
            .from("listings")
            .select("*")
            .in("id", listingIds);
            
          if (listingsError) throw listingsError;
          
          if (listings) {
            // Transform listings to the expected format
            const transformedListings = listings.map(listing => ({
              id: listing.id,
              sellerId: listing.seller_id,
              title: listing.title,
              description: listing.description,
              category: listing.category,
              type: listing.type,
              price: Number(listing.price),
              location: listing.location,
              condition: listing.condition,
              images: listing.images,
              allowBestOffer: listing.allow_best_offer,
              expiresAt: new Date(listing.expires_at),
              createdAt: new Date(listing.created_at),
              updatedAt: new Date(listing.updated_at),
              status: listing.status,
              views: listing.views,
              saves: listing.saves
            }));
            
            // Get highest bids for each listing
            const highestBidsMap: Record<string, number> = {};
            for (const listingId of listingIds) {
              const { data: highestBidData } = await supabase
                .from("bids")
                .select("amount")
                .eq("listing_id", listingId)
                .order("amount", { ascending: false })
                .limit(1);
                
              if (highestBidData && highestBidData.length > 0) {
                highestBidsMap[listingId] = Number(highestBidData[0].amount);
              }
            }
            
            setBidListings(transformedListings);
            setHighestBids(prevBids => ({ ...prevBids, ...highestBidsMap }));
          }
        }
      } catch (error) {
        console.error("Error fetching bid listings:", error);
      }
    };
    
    const fetchOfferListings = async () => {
      try {
        // Get all offers by this user
        const { data: offers, error: offersError } = await supabase
          .from("offers")
          .select("listing_id, amount")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
          
        if (offersError) throw offersError;
        
        if (offers && offers.length > 0) {
          // Extract unique listing IDs
          const listingIds = [...new Set(offers.map(offer => offer.listing_id))];
          
          // Get all these listings
          const { data: listings, error: listingsError } = await supabase
            .from("listings")
            .select("*")
            .in("id", listingIds);
            
          if (listingsError) throw listingsError;
          
          if (listings) {
            // Transform listings to the expected format
            const transformedListings = listings.map(listing => ({
              id: listing.id,
              sellerId: listing.seller_id,
              title: listing.title,
              description: listing.description,
              category: listing.category,
              type: listing.type,
              price: Number(listing.price),
              location: listing.location,
              condition: listing.condition,
              images: listing.images,
              allowBestOffer: listing.allow_best_offer,
              expiresAt: new Date(listing.expires_at),
              createdAt: new Date(listing.created_at),
              updatedAt: new Date(listing.updated_at),
              status: listing.status,
              views: listing.views,
              saves: listing.saves
            }));
            
            setOfferListings(transformedListings);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching offer listings:", error);
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchBidListings();
      fetchOfferListings();
    }
  }, [userId]);
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">
        Your Bids & Offers
      </h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-bids">My Bids</TabsTrigger>
          <TabsTrigger value="my-offers">My Offers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-bids">
          {bidListings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">No bids yet</h3>
              <p className="text-sm">You haven't placed any bids on auction listings.</p>
              <Button variant="link" className="mt-4" onClick={() => navigate("/listings?type=auction")}>
                Browse Auctions
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bidListings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing}
                  highestBid={highestBids[listing.id] || null}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-offers">
          {offerListings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">No offers yet</h3>
              <p className="text-sm">You haven't made any offers on listings.</p>
              <Button variant="link" className="mt-4" onClick={() => navigate("/listings?allowBestOffer=true")}>
                Browse Listings with Best Offer
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offerListings.map((listing) => (
                <div key={listing.id} className="relative">
                  <Badge className="absolute top-2 right-2 z-10">Offer Made</Badge>
                  <ListingCard 
                    listing={listing}
                    highestBid={null}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserBidsOffersTabs;
