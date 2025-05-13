
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBidActions } from "./useBidActions";
import { useBidDataFetcher } from "./useBidDataFetcher";
import { useBidStatus } from "./useBidStatus";
import { Bid } from "./types";
import { toast } from "@/components/ui/use-toast";

interface UseBidsProps {
  listingId: string;
}

export const useBids = ({ listingId }: UseBidsProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highestBid, setHighestBid] = useState<number | null>(null);

  const { fetchBidsForListing, fetchHighestBid } = useBidDataFetcher();
  const { createBid, updateBid } = useBidActions();
  const { getUserBidStatus } = useBidStatus({ listingId, bids });

  // Fetch bids function with logging
  const fetchBids = useCallback(async () => {
    console.log(`[useBids] Fetching bids for listing ${listingId}`);
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedBids = await fetchBidsForListing(listingId);
      console.log(`[useBids] Fetched ${fetchedBids.length} bids`, fetchedBids);
      
      setBids(fetchedBids);
      
      // Update highest bid amount
      const highest = await fetchHighestBid(listingId);
      console.log(`[useBids] Highest bid amount: ${highest}`);
      setHighestBid(highest);
    } catch (err) {
      console.error('[useBids] Error fetching bids:', err);
      setError('Failed to load bids. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [listingId, fetchBidsForListing, fetchHighestBid]);

  // Set up realtime subscription
  useEffect(() => {
    console.log(`[useBids] Setting up realtime subscription for listing ${listingId}`);
    
    const channel = supabase
      .channel(`auction-bids-${listingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
          filter: `listing_id=eq.${listingId}`
        },
        (payload) => {
          console.log('[useBids] Realtime update received:', payload);
          // Immediately fetch the latest bids when a change is detected
          fetchBids();
        }
      )
      .subscribe((status) => {
        console.log(`[useBids] Supabase realtime subscription status: ${status}`);
      });
    
    return () => {
      console.log('[useBids] Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [listingId, fetchBids]);

  // Place bid function - now with improved update logic
  const placeBid = useCallback(async (amount: number) => {
    console.log(`[useBids] Attempting to place bid: ${amount}`);
    try {
      // Get the user's current bid status
      const { hasBid, userBid } = getUserBidStatus();
      
      let result;
      
      // If user already has a bid, update it instead of creating a new one
      if (hasBid && userBid) {
        console.log(`[useBids] User already has a bid (${userBid.id}), updating it`);
        result = await updateBid(userBid.id, amount);
      } else {
        console.log('[useBids] Creating new bid');
        result = await createBid(listingId, amount);
      }
      
      if (result.success) {
        console.log('[useBids] Bid placed successfully:', result);
        toast({
          title: "Bid placed",
          description: `Your bid of £${amount} has been placed successfully.`,
        });
        
        // Immediately fetch updated bids
        await fetchBids();
        return result;
      } else {
        console.error('[useBids] Error placing bid:', result.error);
        toast({
          variant: "destructive",
          title: "Bid failed",
          description: result.error || "Failed to place bid. Please try again.",
        });
        return result;
      }
    } catch (err) {
      console.error('[useBids] Exception when placing bid:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      toast({
        variant: "destructive",
        title: "Bid failed",
        description: errorMessage,
      });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [listingId, createBid, updateBid, getUserBidStatus, fetchBids]);

  return {
    bids,
    isLoading,
    error,
    placeBid,
    fetchBids,
    highestBid,
    getUserBidStatus
  };
};
