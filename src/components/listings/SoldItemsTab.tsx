
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { RelistForm } from "./RelistForm";
import { useRelistListing } from "@/hooks/listings/useRelistListing";

interface SoldItemsTabProps {
  userId: string;
}

export const SoldItemsTab = ({ userId }: SoldItemsTabProps) => {
  const navigate = useNavigate();
  const [soldItems, setSoldItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [relistingItem, setRelistingItem] = useState<any>(null);
  const { relistListing, isRelisting } = useRelistListing(relistingItem?.id);
  
  useEffect(() => {
    const fetchSoldItems = async () => {
      setIsLoading(true);
      try {
        // Fetch listings with status "sold"
        const { data: soldListings, error: listingsError } = await supabase
          .from("listings")
          .select(`
            *,
            offers (
              amount, 
              user_id,
              status,
              updated_at
            )
          `)
          .eq("seller_id", userId)
          .eq("status", "sold")
          .order("updated_at", { ascending: false });
        
        if (listingsError) throw listingsError;
        
        // Fetch user profiles separately for the buyers
        const buyerIds = soldListings
          .map(item => {
            const acceptedOffer = item.offers.find(o => o.status === "accepted");
            return acceptedOffer ? acceptedOffer.user_id : null;
          })
          .filter(id => id !== null);
        
        // Only fetch profiles if there are buyer IDs
        let buyerProfiles = {};
        if (buyerIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", buyerIds);
            
          if (profilesError) throw profilesError;
          
          // Create a map of user_id to profile data
          buyerProfiles = profiles.reduce((acc, profile) => {
            acc[profile.id] = {
              name: profile.full_name || "Unknown User",
              avatar: profile.avatar_url
            };
            return acc;
          }, {});
        }
        
        // Transform to include buyer info and sale price
        const transformedItems = soldListings.map(item => {
          // Find accepted offer to get sale details
          const acceptedOffer = item.offers.find(o => o.status === "accepted");
          
          // Get buyer profile from our map if available
          const buyerProfile = acceptedOffer && buyerProfiles[acceptedOffer.user_id];
          
          return {
            ...item,
            expiresAt: new Date(item.expires_at),
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            saleAmount: acceptedOffer ? acceptedOffer.amount : item.price,
            saleDate: acceptedOffer ? new Date(acceptedOffer.updated_at) : new Date(item.updated_at),
            buyer: acceptedOffer ? {
              id: acceptedOffer.user_id,
              name: buyerProfile?.name || "Unknown User",
              avatar: buyerProfile?.avatar
            } : null
          };
        });
        
        setSoldItems(transformedItems);
      } catch (error) {
        console.error("Error fetching sold items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSoldItems();
  }, [userId, isRelisting]);
  
  const handleRelistClick = (item) => {
    setRelistingItem(item);
  };
  
  const handleRelistSubmit = async (data) => {
    const success = await relistListing(data);
    if (success) {
      setRelistingItem(null);
      // Force reload sold items
      setIsLoading(true);
      // Timeout to ensure the UI updates properly
      setTimeout(() => {
        // No need to call fetch again, the useEffect will handle it
      }, 100);
    }
    return success;
  };
  
  if (isLoading) {
    return <Loading message="Loading sold items..." />;
  }
  
  if (soldItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <h3 className="text-lg font-medium mb-2">No sold items yet</h3>
        <p className="text-sm">Items you sell will appear here.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        Your Sold Items
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {soldItems.map(item => (
          <Card key={item.id} className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-1/4 md:w-1/5">
                <img 
                  src={item.images[0]} 
                  alt={item.title} 
                  className="w-full h-40 object-cover"
                />
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <div className="text-sm text-muted-foreground mb-2">
                  {new Intl.DateTimeFormat('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }).format(item.saleDate)}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Sale price:</span>{' '}
                  <span className="text-green-600 font-bold">
                    £{item.saleAmount.toLocaleString()}
                  </span>
                </div>
                {item.buyer && (
                  <div className="mb-4 text-sm">
                    <span className="font-medium">Buyer:</span>{' '}
                    <span>{item.buyer.name}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/listings/${item.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRelistClick(item)}
                  >
                    Relist Item
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {relistingItem && (
        <RelistForm
          open={!!relistingItem}
          onOpenChange={(open) => !open && setRelistingItem(null)}
          onRelist={handleRelistSubmit}
          listingTitle={relistingItem.title}
        />
      )}
    </div>
  );
};

export default SoldItemsTab;
