
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useListingBids = (listingIds: string[] = []) => {
  const [highestBids, setHighestBids] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHighestBids = async () => {
      if (listingIds.length === 0) return;
      
      setIsLoading(true);
      
      try {
        // For each listing ID, get the highest bid
        const highestBidsMap: Record<string, number> = {};
        
        // Since we may have a lot of listing IDs, we'll batch them
        const batchSize = 20;
        for (let i = 0; i < listingIds.length; i += batchSize) {
          const batchIds = listingIds.slice(i, i + batchSize);
          
          const { data, error } = await supabase
            .from("bids")
            .select("listing_id, amount")
            .in("listing_id", batchIds)
            .eq("status", "active")
            .order("amount", { ascending: false });
          
          if (error) throw error;
          
          // Group by listing_id and get highest amount
          for (const bid of data) {
            if (!highestBidsMap[bid.listing_id] || bid.amount > highestBidsMap[bid.listing_id]) {
              highestBidsMap[bid.listing_id] = Number(bid.amount);
            }
          }
        }
        
        setHighestBids(highestBidsMap);
      } catch (err) {
        console.error("Error fetching highest bids:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHighestBids();
  }, [listingIds]);

  // Set up real-time subscription for bids
  useEffect(() => {
    if (listingIds.length === 0) return;

    // Use a single channel for all listings
    const channel = supabase
      .channel(`listing-bids-${listingIds.join('-')}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
          filter: `listing_id=in.(${listingIds.join(',')})`,
        },
        () => {
          // Refetch bids when there's a change
          fetchHighestBids();
        }
      )
      .subscribe();
    
    // Fetch initially
    const fetchHighestBids = async () => {
      if (listingIds.length === 0) return;
      
      try {
        const batchSize = 20;
        const highestBidsMap: Record<string, number> = {};
        
        for (let i = 0; i < listingIds.length; i += batchSize) {
          const batchIds = listingIds.slice(i, i + batchSize);
          
          const { data, error } = await supabase
            .from("bids")
            .select("listing_id, amount")
            .in("listing_id", batchIds)
            .eq("status", "active")
            .order("amount", { ascending: false });
          
          if (error) throw error;
          
          // Group by listing_id and get highest amount
          for (const bid of data) {
            if (!highestBidsMap[bid.listing_id] || bid.amount > highestBidsMap[bid.listing_id]) {
              highestBidsMap[bid.listing_id] = Number(bid.amount);
            }
          }
        }
        
        setHighestBids(highestBidsMap);
      } catch (err) {
        console.error("Error fetching highest bids:", err);
      }
    };
    
    fetchHighestBids();
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingIds]);

  return {
    highestBids,
    isLoading
  };
};
