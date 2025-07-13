
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// This hook is used to get the highest bids for multiple listings
export const useListingBids = (listingIds: string[]) => {
  const [highestBids, setHighestBids] = useState<Record<string, number>>({});
  const [bidCounts, setBidCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const subscriptionRef = useRef<any>(null);
  const listingsSubscriptionRef = useRef<any>(null);
  
  // Memoize and stabilize listingIds to prevent unnecessary re-subscriptions
  const stableListingIds = useMemo(() => {
    if (!listingIds || listingIds.length === 0) return [];
    // Sort and deduplicate to ensure array stability
    return [...new Set(listingIds)].sort();
  }, [listingIds]);

  // Check if listing IDs array actually changed
  const listingIdsString = stableListingIds.join(',');
  
  const fetchBidsForListings = useCallback(async () => {
    if (!stableListingIds.length) return;
    
    setLoading(true);
    console.log(`Fetching bids for ${stableListingIds.length} listings`);
    
    try {
    
      // For each listing, fetch the highest bid amount AND check the current_bid from listings
      const promises = stableListingIds.map(async (listingId) => {
          // First check current_bid from listings
          const { data: listingData, error: listingError } = await supabase
            .from("listings")
            .select("current_bid")
            .eq("id", listingId)
            .single();
          
          // Then check the highest bid from bids table
          const { data: bidData, error: bidError } = await supabase
            .from("bids")
            .select("amount")
            .eq("listing_id", listingId)
            .eq("status", "active")
            .order("amount", { ascending: false })
            .limit(1);
          
          // Use listingData.current_bid if available, otherwise use the highest bid
          const listingCurrentBid = listingData && listingData.current_bid 
            ? Number(listingData.current_bid) 
            : null;
            
          const highestBid = bidData && bidData.length > 0 
            ? Number(bidData[0].amount) 
            : null;
          
          // Use whichever is higher or available
          const effectiveHighestBid = listingCurrentBid !== null
            ? (highestBid !== null ? Math.max(listingCurrentBid, highestBid) : listingCurrentBid)
            : highestBid;
          
          // Also fetch the count of bids
          const { count, error: countError } = await supabase
            .from("bids")
            .select("id", { count: "exact", head: true })
            .eq("listing_id", listingId)
            .eq("status", "active");
          
          return { 
            listingId, 
            highestBid: effectiveHighestBid, 
            bidCount: count || 0 
          };
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
      } finally {
        setLoading(false);
      }
    }, [stableListingIds]);
  
  useEffect(() => {
    if (stableListingIds.length === 0) {
      setHighestBids({});
      setBidCounts({});
      setLoading(false);
      return;
    }
    
    // Initial fetch
    fetchBidsForListings();
    
    // Clean up existing subscriptions before creating new ones
    if (subscriptionRef.current) {
      console.log("Cleaning up existing bids subscription");
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    if (listingsSubscriptionRef.current) {
      console.log("Cleaning up existing listings subscription");
      supabase.removeChannel(listingsSubscriptionRef.current);
      listingsSubscriptionRef.current = null;
    }
    
    // Set up realtime subscription for all auction listings
    subscriptionRef.current = supabase
      .channel(`auction-bids-changes-${listingIdsString}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
          filter: `listing_id=in.(${stableListingIds.join(',')})`
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
      
    // Also subscribe to listing updates for current_bid changes
    listingsSubscriptionRef.current = supabase
      .channel(`auction-listings-changes-${listingIdsString}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'listings',
          filter: `id=in.(${stableListingIds.join(',')})` 
        },
        (payload) => {
          console.log("Realtime listing update received:", payload);
          // Refetch bids when there's a change to a listing
          fetchBidsForListings();
        }
      )
      .subscribe();
    
    return () => {
      if (subscriptionRef.current) {
        console.log("Cleaning up bids subscription for multiple listings");
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      if (listingsSubscriptionRef.current) {
        console.log("Cleaning up listings subscription for multiple listings");
        supabase.removeChannel(listingsSubscriptionRef.current);
        listingsSubscriptionRef.current = null;
      }
    };
  }, [listingIdsString, fetchBidsForListings]);
  
  return { highestBids, bidCounts, loading };
};
