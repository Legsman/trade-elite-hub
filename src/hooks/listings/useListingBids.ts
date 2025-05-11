
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useListingBids = (listingIds: string[]) => {
  const [highestBids, setHighestBids] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const fetchHighestBids = useCallback(async () => {
    if (!listingIds.length) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // For demo purposes, use mock data instead of Supabase
      // Remove this in production and use the real Supabase connection
      const mockBids: Record<string, number> = {
        '1': 625,
      };
      
      // Simulate a delay for network request
      setTimeout(() => {
        setHighestBids(mockBids);
        setIsLoading(false);
        setRetryCount(0);
      }, 800);
      
      // Original Supabase code (commented out)
      /*
      // Get the highest bid for each listing
      const { data, error } = await supabase
        .from("bids")
        .select("listing_id, amount")
        .in("listing_id", listingIds)
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
      
      setHighestBids(bidMap);
      */
    } catch (err) {
      console.error("Error fetching highest bids:", err);
      setError("Failed to fetch bid information");
      
      // Add retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const retryDelay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchHighestBids();
        }, retryDelay);
      }
    } finally {
      // Always set loading to false after max retries
      if (retryCount >= MAX_RETRIES) {
        setIsLoading(false);
      }
    }
  }, [listingIds, retryCount]);
  
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
