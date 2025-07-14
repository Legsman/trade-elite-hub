
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// This hook is used to get the highest bids for multiple listings
export const useListingBids = (listingIds: string[]) => {
  const [highestBids, setHighestBids] = useState<Record<string, number>>({});
  const [bidCounts, setBidCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const subscriptionRef = useRef<any>(null);
  const isInitialFetchRef = useRef(true);
  
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
    if (!stableListingIds.length) {
      if (isInitialFetchRef.current) {
        setHighestBids({});
        setBidCounts({});
        setLoading(false);
        isInitialFetchRef.current = false;
      }
      return;
    }
    
    setLoading(true);
    console.log('[useListingBids] Fetching bids for listings:', stableListingIds);
    
    try {
      // Create loading state maps to prevent flickering
      const loadingBidsMap: Record<string, number> = {};
      const loadingCountsMap: Record<string, number> = {};
      
      // If this is first fetch, don't show 0s - keep previous state or show loading
      if (!isInitialFetchRef.current) {
        // Initialize with previous values to prevent flickering
        stableListingIds.forEach(id => {
          loadingBidsMap[id] = highestBids[id] || 0;
          loadingCountsMap[id] = bidCounts[id] || 0;
        });
        setHighestBids(loadingBidsMap);
        setBidCounts(loadingCountsMap);
      }

      // Get both listings data and bid counts in parallel
      const [listingsResult, bidCountResults] = await Promise.all([
        // Get current bids from listings
        supabase
          .from("listings")
          .select("id, current_bid")
          .in("id", stableListingIds),
        
        // Get bid counts efficiently
        Promise.all(
          stableListingIds.map(async (listingId) => {
            const { count } = await supabase
              .from("bids")
              .select("*", { count: "exact", head: true })
              .eq("listing_id", listingId)
              .eq("status", "active");
            return { listingId, count: count || 0 };
          })
        )
      ]);

      const { data: listingsData, error: listingsError } = listingsResult;
      
      if (listingsError) {
        console.error('[useListingBids] Error fetching listings:', listingsError);
        return; // Don't throw, just return to prevent error cascading
      }
      
      // Create fresh maps
      const newBidsMap: Record<string, number> = {};
      const newCountsMap: Record<string, number> = {};
      
      // Process listings data
      listingsData?.forEach((listing) => {
        if (listing.current_bid) {
          newBidsMap[listing.id] = Number(listing.current_bid);
        }
      });
      
      // Process bid counts
      bidCountResults.forEach(({ listingId, count }) => {
        newCountsMap[listingId] = count;
      });
      
      console.log('[useListingBids] Setting new state - Bids:', newBidsMap, 'Counts:', newCountsMap);
      
      // Only update state if we have new data and it's different
      const hasBidsChanged = JSON.stringify(newBidsMap) !== JSON.stringify(highestBids);
      const hasCountsChanged = JSON.stringify(newCountsMap) !== JSON.stringify(bidCounts);
      
      if (hasBidsChanged) {
        setHighestBids(newBidsMap);
      }
      if (hasCountsChanged) {
        setBidCounts(newCountsMap);
      }
      
      isInitialFetchRef.current = false;
      
    } catch (error) {
      console.error("[useListingBids] Error fetching bids for listings:", error);
      // Don't update state on error to prevent clearing existing data
    } finally {
      setLoading(false);
    }
  }, [stableListingIds, highestBids, bidCounts]);

  // Stable debounced refetch function that doesn't change on every render
  const debouncedRefetch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      fetchBidsForListings();
    }, 300); // Reduced debounce time
  }, [fetchBidsForListings]);
  
  useEffect(() => {
    // Always fetch initial data
    fetchBidsForListings();
    
    // Clean up existing subscription before creating new one
    if (subscriptionRef.current) {
      console.log('[useListingBids] Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    if (stableListingIds.length === 0) {
      return;
    }
    
    // Set up single consolidated realtime subscription for both bids and listings
    console.log('[useListingBids] Setting up realtime subscription for:', stableListingIds);
    subscriptionRef.current = supabase
      .channel(`auction-changes-${listingIdsString}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
          filter: `listing_id=in.(${stableListingIds.join(',')})`
        },
        (payload) => {
          console.log('[useListingBids] Bids table change:', payload);
          debouncedRefetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'listings',
          filter: `id=in.(${stableListingIds.join(',')})` 
        },
        (payload) => {
          console.log('[useListingBids] Listings table change:', payload);
          debouncedRefetch();
        }
      )
      .subscribe((status, err) => {
        console.log('[useListingBids] Subscription status:', status);
        if (err) {
          console.error('[useListingBids] Subscription error:', err);
        }
      });
    
    return () => {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      if (subscriptionRef.current) {
        console.log('[useListingBids] Cleaning up subscription on unmount');
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [listingIdsString]); // Removed debouncedRefetch from deps to prevent infinite loop
  
  return { highestBids, bidCounts, loading };
};
