
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useBidDataFetcher } from "./useBidDataFetcher";
import { useBidActions } from "./useBidActions";
import { useBidStatus } from "./useBidStatus";
import { adaptBidTypes } from "./bidTypeAdapter";
import { Bid, BidStatus } from "./types";
import { Bid as GlobalBid } from "@/types";
import { toast } from "@/hooks/use-toast";

interface UseBidsProps {
  listingId: string;
}

export const useBids = ({ listingId }: UseBidsProps) => {
  const { user } = useAuth();
  const { fetchBidsForListing, fetchHighestBid } = useBidDataFetcher();
  const { createBid, updateBid } = useBidActions();
  
  const [bids, setBids] = useState<Bid[]>([]);
  const [globalBids, setGlobalBids] = useState<GlobalBid[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [highestBid, setHighestBid] = useState<number | null>(null);
  
  // Initialize bid status hook with current bids
  const { getUserBidStatus } = useBidStatus({ listingId, bids });
  
  // Fetch bids and highest bid
  const fetchBids = useCallback(async () => {
    console.log("[useBids] Fetching bids for listing:", listingId);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First, try to get the highest bid - this is faster than fetching all bids
      const highestBidAmount = await fetchHighestBid(listingId);
      setHighestBid(highestBidAmount);
      
      // Fetch all bids for the listing
      let fetchedBids = await fetchBidsForListing(listingId);
      console.log("[useBids] Fetched bids:", fetchedBids);

      // Belt-and-suspenders: override the winning bid's visible amount
      try {
        const { data: listingData } = await supabase
          .from("listings")
          .select("current_bid, highest_bidder_id")
          .eq("id", listingId)
          .single();
        if (listingData?.current_bid != null && listingData.highest_bidder_id) {
          fetchedBids = fetchedBids.map(bid =>
            bid.user_id === listingData.highest_bidder_id && bid.status === "active"
              ? { ...bid, amount: Number(listingData.current_bid) }
              : bid
          );
          console.log(
            "[useBids] Overrode bid amount for winner:",
            listingData.highest_bidder_id,
            "→",
            listingData.current_bid
          );
        }
      } catch (err) {
        console.error("[useBids] Could not override bid amount:", err);
      }

      // Sort bids by the (possibly overridden) amount
      const sortedBids = fetchedBids.sort((a, b) => {
        if (b.amount !== a.amount) return b.amount - a.amount;
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateA.getTime() - dateB.getTime();
      });
      setBids(sortedBids);

      // Convert bids to the global Bid type
      const adaptedBids = adaptBidTypes.toGlobalBids(sortedBids);
      setGlobalBids(adaptedBids);
      
      // Also refresh the current listing data to get the latest current_bid
      try {
        const { data: listingData } = await supabase
          .from('listings')
          .select('current_bid')
          .eq('id', listingId)
          .single();
        
        if (listingData && listingData.current_bid) {
          console.log("[useBids] Updated current_bid from listing:", listingData.current_bid);
          if (!highestBidAmount || Number(listingData.current_bid) > highestBidAmount) {
            setHighestBid(Number(listingData.current_bid));
          }
        }
      } catch (listingErr) {
        console.error("[useBids] Error fetching listing current_bid:", listingErr);
      }
      
      setIsLoading(false);
      return true; // Return success indicator
    } catch (err) {
      console.error("[useBids] Error fetching bids:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch bids");
      setIsLoading(false);
      return false; // Return failure indicator
    }
  }, [listingId, fetchBidsForListing, fetchHighestBid]);
  
  // Set up realtime subscription for bid updates
  useEffect(() => {
    if (!listingId) return;
    
    console.log("[useBids] Setting up realtime subscription for bids on listing:", listingId);
    
    const channel = supabase
      .channel(`listing-bids-${listingId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'bids',
          filter: `listing_id=eq.${listingId}`
        },
        (payload) => {
          console.log("[useBids] Realtime update received:", payload);
          // Refresh bids when there's a change
          fetchBids();
        }
      )
      .subscribe((status) => {
        console.log("[useBids] Supabase realtime subscription status:", status);
      });
    
    // Also subscribe to the listing table for current_bid updates
    const listingChannel = supabase
      .channel(`listing-current-bid-${listingId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'listings',
          filter: `id=eq.${listingId}`
        },
        (payload) => {
          console.log("[useBids] Listing update received:", payload);
          // Check if current_bid has changed
          const newData = payload.new as any;
          
          if (newData && newData.current_bid) {
            console.log("[useBids] Updating highest bid to:", newData.current_bid);
            setHighestBid(Number(newData.current_bid));
          }
        }
      )
      .subscribe();
    
    // Initial fetch
    fetchBids();
    
    // Cleanup function
    return () => {
      console.log("[useBids] Cleaning up realtime subscription");
      supabase.removeChannel(channel);
      supabase.removeChannel(listingChannel);
    };
  }, [listingId, fetchBids]);
  
  // Place a new bid or update an existing one
  const placeBid = useCallback(async (amount: number): Promise<{ success: boolean; error?: string }> => {
    console.log(`[useBids] Placing bid on listing ${listingId} for amount ${amount}`);
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to place a bid",
        variant: "destructive",
      });
      return { success: false, error: "You must be logged in to place a bid" };
    }
    
    try {
      // Get the current bid status to check if user already has a bid
      const bidStatus = getUserBidStatus();
      
      let result;
      if (bidStatus.hasBid && bidStatus.userBid) {
        console.log("[useBids] User already has a bid, updating maximum bid", bidStatus.userBid);
        result = await updateBid(bidStatus.userBid.id, amount);
      } else {
        console.log("[useBids] Creating new bid");
        result = await createBid(listingId, amount);
      }
      
      if (result.success) {
        console.log("[useBids] Bid placed successfully");
        
        // Immediately refresh the bids to update the UI
        // Note: The listing refresh will be handled by the component
        await fetchBids();
        
        // We don't show a toast here since the component will handle it
        
        return { success: true };
      } else {
        console.error("[useBids] Error placing bid:", result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error("[useBids] Exception placing bid:", err);
      return { success: false, error: err instanceof Error ? err.message : "Failed to place bid" };
    }
  }, [user, listingId, createBid, updateBid, getUserBidStatus, fetchBids]);
  
  return {
    bids,
    globalBids,
    isLoading,
    error,
    highestBid,
    placeBid,
    fetchBids, // Explicitly expose fetchBids for manual refresh
    getUserBidStatus
  };
};
