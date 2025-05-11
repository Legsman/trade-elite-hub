
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSoldItems = (userId: string, triggerRefresh: any) => {
  const [soldItems, setSoldItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
  }, [userId, triggerRefresh]);
  
  return { soldItems, isLoading };
};
