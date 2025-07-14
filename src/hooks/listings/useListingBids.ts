
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
  
  // Debounce timer for real-time updates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBidsForListings = useCallback(async () => {
    if (!stableListingIds.length) return;
    
    setLoading(true);
    
    try {
      // Simplified: Only use current_bid from listings table (which is kept updated by database triggers)
      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("id, current_bid")
        .in("id", stableListingIds);
      
      if (listingsError) throw listingsError;
      
      // Get bid counts for each listing
      const bidCountPromises = stableListingIds.map(async (listingId) => {
        const { count, error: countError } = await supabase
          .from("bids")
          .select("id", { count: "exact", head: true })
          .eq("listing_id", listingId)
          .eq("status", "active");
        
        return { listingId, count: count || 0 };
      });
      
      const bidCountResults = await Promise.all(bidCountPromises);
      
      // Create maps for highest bids and bid counts
      const bidsMap: Record<string, number> = {};
      const countsMap: Record<string, number> = {};
      
      listingsData?.forEach((listing) => {
        if (listing.current_bid) {
          bidsMap[listing.id] = Number(listing.current_bid);
        }
      });
      
      bidCountResults.forEach(({ listingId, count }) => {
        countsMap[listingId] = count;
      });
      
      setHighestBids(prev => ({ ...prev, ...bidsMap }));
      setBidCounts(prev => ({ ...prev, ...countsMap }));
      
    } catch (error) {
      console.error("Error fetching bids for listings:", error);
    } finally {
      setLoading(false);
    }
  }, [stableListingIds]);

  // Debounced refetch function
  const debouncedRefetch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      fetchBidsForListings();
    }, 500); // 500ms debounce
  }, [fetchBidsForListings]);
  
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
        () => {
          // Use debounced refetch to prevent excessive updates
          debouncedRefetch();
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
        () => {
          // Use debounced refetch to prevent excessive updates
          debouncedRefetch();
        }
      )
      .subscribe();
    
    return () => {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      if (listingsSubscriptionRef.current) {
        supabase.removeChannel(listingsSubscriptionRef.current);
        listingsSubscriptionRef.current = null;
      }
    };
  }, [listingIdsString, fetchBidsForListings]);
  
  return { highestBids, bidCounts, loading };
};
