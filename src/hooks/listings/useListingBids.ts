
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRetryLogic } from "./utils";

export const useListingBids = (listingIds: string[]) => {
  const [highestBids, setHighestBids] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastListingIds, setLastListingIds] = useState<string[]>([]);
  const { retryCount, setRetryCount, scheduleRetry } = useRetryLogic();
  const MAX_RETRIES = 2;

  const fetchHighestBids = useCallback(async () => {
    if (!listingIds.length) return;
    
    // If we're fetching the same listings and already loading, don't restart the fetch
    const idsString = listingIds.sort().join(',');
    const lastIdsString = lastListingIds.sort().join(',');
    
    if (isLoading && idsString === lastIdsString) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLastListingIds(listingIds);
    
    try {
      // Get the highest bid for each listing
      const { data, error } = await supabase
        .from("bids")
        .select("listing_id, amount")
        .in("listing_id", listingIds)
        .eq("status", "active")
        .order("amount", { ascending: false });
        
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
      
      setHighestBids(prevBids => ({
        ...prevBids, // Keep previous bids to avoid flashing
        ...bidMap    // Update with new data
      }));
      setIsLoading(false);
      setRetryCount(0);
    } catch (err) {
      console.error("Error fetching highest bids:", err);
      
      // On error, we don't clear the existing data to prevent UI flashing
      setError("Failed to fetch bid information");
      
      // Don't update loading state unless we're really out of options
      if (retryCount >= MAX_RETRIES) {
        setIsLoading(false);
      }
      
      // Add retry logic with exponential backoff
      scheduleRetry(fetchHighestBids, MAX_RETRIES);
    }
  }, [listingIds, retryCount, isLoading, lastListingIds, scheduleRetry, setRetryCount]);
  
  useEffect(() => {
    if (listingIds.length > 0) {
      fetchHighestBids();
    }
  }, [fetchHighestBids, listingIds]);
  
  return {
    highestBids,
    isLoading,
    error,
    refetch: fetchHighestBids,
  };
};
