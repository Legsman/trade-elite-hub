
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useListingsCache } from "./useListingsCache";

export const useListingBids = (listingIds: string[]) => {
  const [highestBids, setHighestBids] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listingIdsRef = useRef<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { getCachedData, setCachedData, registerSubscription, unregisterSubscription } = useListingsCache();
  
  // Error handling state
  const errorRef = useRef({
    count: 0,
    lastTime: 0
  });
  
  // Generate a cache key for these listing IDs
  const getCacheKey = useCallback((ids: string[]) => {
    return `bids:${ids.sort().join(',')}`;
  }, []);
  
  const fetchHighestBids = useCallback(async (fromCache = true) => {
    if (!listingIds.length) return;
    
    // Sort and join IDs for comparison
    const idsString = listingIds.sort().join(',');
    const currentIdsString = listingIdsRef.current.sort().join(',');
    
    // If we're fetching the same listings and already loading, don't restart the fetch
    if (isLoading && idsString === currentIdsString) {
      return;
    }
    
    // Abort any in-progress requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    listingIdsRef.current = [...listingIds];
    const cacheKey = getCacheKey(listingIds);
    
    // Try to get from cache first
    if (fromCache) {
      const cachedBids = getCachedData<Record<string, number>>(cacheKey);
      if (cachedBids) {
        setHighestBids(prevBids => ({
          ...prevBids,
          ...cachedBids
        }));
        return;
      }
    }
    
    // Only set loading if we don't have data
    if (Object.keys(highestBids).length === 0) {
      setIsLoading(true);
    }
    
    setError(null);
    
    try {
      // Get the highest bid for each listing
      const { data, error } = await supabase
        .from("bids")
        .select("listing_id, amount")
        .in("listing_id", listingIds)
        .eq("status", "active")
        .order("amount", { ascending: false });
        
      // Check if request was canceled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
        
      if (error) throw error;
      
      // Create a map of listing_id to highest bid amount
      const bidMap: Record<string, number> = {};
      
      if (data) {
        data.forEach(bid => {
          // Only set the bid if it's not already set or if it's higher than the current value
          if (!bidMap[bid.listing_id] || Number(bid.amount) > bidMap[bid.listing_id]) {
            bidMap[bid.listing_id] = Number(bid.amount);
          }
        });
      }
      
      // Store in cache
      setCachedData(cacheKey, bidMap);
      
      setHighestBids(prevBids => ({
        ...prevBids, // Keep previous bids to avoid flashing
        ...bidMap    // Update with new data
      }));
      
      setIsLoading(false);
      // Reset error counter on success
      errorRef.current.count = 0;
    } catch (err) {
      // Check if request was canceled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      console.error("Error fetching highest bids:", err);
      
      // On error, we don't clear the existing data to prevent UI flashing
      setError("Failed to fetch bid information");
      
      // Don't update loading state if we already have some data
      if (Object.keys(highestBids).length === 0) {
        setIsLoading(false);
      }
      
      // Track errors to limit log spam
      errorRef.current.count++;
      errorRef.current.lastTime = Date.now();
    }
  }, [listingIds, isLoading, highestBids, getCacheKey, getCachedData, setCachedData]);
  
  // Set up data fetching and subscription
  useEffect(() => {
    if (listingIds.length > 0) {
      fetchHighestBids();
      
      // Set up realtime subscriptions for all listing IDs
      const channelKey = `bids-${listingIds.sort().join('-')}`;
      const shouldSubscribe = registerSubscription(channelKey);
      
      let channel: any = null;
      
      if (shouldSubscribe && listingIds.length > 0) {
        channel = supabase
          .channel(channelKey)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bids',
              filter: `listing_id=in.(${listingIds.join(',')})`
            },
            () => {
              // Refetch bids when there's a change, bypass cache
              fetchHighestBids(false);
            }
          )
          .subscribe();
      }
      
      return () => {
        // Cleanup function
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        if (channel && unregisterSubscription(channelKey)) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [fetchHighestBids, listingIds, registerSubscription, unregisterSubscription]);
  
  return {
    highestBids,
    isLoading,
    error,
    refetch: () => fetchHighestBids(false),
  };
};
