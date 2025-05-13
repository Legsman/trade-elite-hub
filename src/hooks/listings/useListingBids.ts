
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// This hook is used to get the highest bids for multiple listings
export const useListingBids = (listingIds: string[]) => {
  const [highestBids, setHighestBids] = useState<Record<string, number>>({});
  const [bidCounts, setBidCounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (!listingIds || listingIds.length === 0) return;
    
    const fetchBidsForListings = async () => {
      console.log(`Fetching bids for ${listingIds.length} listings`);
      
      try {
        // For each listing, fetch the highest bid amount
        const promises = listingIds.map(async (listingId) => {
          const { data, error } = await supabase
            .from("bids")
            .select("amount")
            .eq("listing_id", listingId)
            .eq("status", "active")
            .order("amount", { ascending: false })
            .limit(1);
          
          if (error) throw error;
          
          const highestBid = data.length > 0 ? Number(data[0].amount) : null;
          
          // Also fetch the count of bids
          const { count, error: countError } = await supabase
            .from("bids")
            .select("id", { count: "exact", head: true })
            .eq("listing_id", listingId)
            .eq("status", "active");
          
          if (countError) throw countError;
          
          return { listingId, highestBid, bidCount: count || 0 };
        });
        
        const results = await Promise.all(promises);
        
        // Create maps for highest bids and bid counts
        const bidsMap: Record<string, number> = {};
        const countsMap: Record<string, number> = {};
        
        results.forEach(({ listingId, highestBid, bidCount }) => {
          if (highestBid !== null) {
            bidsMap[listingId] = highestBid;
          }
          countsMap[listingId] = bidCount;
        });
        
        console.log("Highest bids fetched:", bidsMap);
        console.log("Bid counts fetched:", countsMap);
        
        setHighestBids(bidsMap);
        setBidCounts(countsMap);
      } catch (error) {
        console.error("Error fetching bids for listings:", error);
      }
    };
    
    // Initial fetch
    fetchBidsForListings();
    
    // Set up realtime subscription for all auction listings
    const channel = supabase
      .channel('auction-bids-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
          filter: `listing_id=in.(${listingIds.join(',')})`
        },
        (payload) => {
          console.log("Realtime bid update received for listing:", payload);
          // Refetch bids when there's a change
          fetchBidsForListings();
        }
      )
      .subscribe((status) => {
        console.log("Supabase realtime subscription status for auction bids:", status);
      });
    
    return () => {
      console.log("Cleaning up bids subscription for multiple listings");
      supabase.removeChannel(channel);
    };
  }, [listingIds]);
  
  return { highestBids, bidCounts };
};
