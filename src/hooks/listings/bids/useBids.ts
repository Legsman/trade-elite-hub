import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBidActions } from "./useBidActions";
import { useBidDataFetcher } from "./useBidDataFetcher";
import { useBidStatus } from "./useBidStatus";
import { Bid } from "./types";
import { adaptBidTypes } from "./bidTypeAdapter";
import { toast } from "@/components/ui/use-toast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Bid as GlobalBid } from "@/types";

interface UseBidsProps {
  listingId: string;
}

export const useBids = ({ listingId }: UseBidsProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highestBid, setHighestBid] = useState<number | null>(null);
  
  // Debug state to track mapping issues
  const [dataFlowStats, setDataFlowStats] = useState({
    rawBidsCount: 0,
    mappedBidsCount: 0,
    hasProfileData: false
  });

  const { fetchBidsForListing, fetchHighestBid } = useBidDataFetcher();
  const { createBid, updateBid } = useBidActions();
  const { getUserBidStatus } = useBidStatus({ listingId, bids });

  // Fetch bids function with improved logging
  const fetchBids = useCallback(async () => {
    console.log(`[useBids] Fetching bids for listing ${listingId}`);
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedBids = await fetchBidsForListing(listingId);
      console.log(`[useBids] Fetched ${fetchedBids.length} bids`, fetchedBids);
      
      // Update debug stats
      const hasAnyProfileData = fetchedBids.some(bid => 
        bid.user_profile && (bid.user_profile.full_name || bid.user_profile.avatar_url)
      );
      
      setDataFlowStats({
        rawBidsCount: fetchedBids.length,
        mappedBidsCount: fetchedBids.length, // Will be updated after mapping
        hasProfileData: hasAnyProfileData
      });
      
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

  // Update diagnostic stats whenever bids change
  useEffect(() => {
    if (bids.length > 0) {
      const globalMappedBids = adaptBidTypes.toGlobalBids(bids);
      const hasAnyProfileData = bids.some(bid => 
        bid.user_profile && (bid.user_profile.full_name || bid.user_profile.avatar_url)
      );
      
      setDataFlowStats(prev => ({
        ...prev,
        mappedBidsCount: globalMappedBids.length,
        hasProfileData: hasAnyProfileData
      }));
      
      // Log diagnostic information
      console.log('[useBids] Data flow stats:', {
        rawBidsCount: bids.length,
        mappedBidsCount: globalMappedBids.length,
        hasProfileData: hasAnyProfileData
      });
      
      // Warning if we have bids but no profile data
      if (bids.length > 0 && !hasAnyProfileData) {
        console.warn('[useBids] ⚠️ Bids retrieved but NO PROFILE DATA found! Check foreign key constraints and data consistency');
      }
    }
  }, [bids]);

  // Set up realtime subscription with improved error handling
  useEffect(() => {
    console.log(`[useBids] Setting up realtime subscription for listing ${listingId}`);
    
    // Create a specific channel name for this listing
    const channelName = `auction-bids-${listingId}`;
    let channel: RealtimeChannel;
    
    try {
      channel = supabase
        .channel(channelName)
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
            fetchBids().catch(err => {
              console.error('[useBids] Failed to fetch bids after realtime update:', err);
            });
          }
        )
        .subscribe((status) => {
          console.log(`[useBids] Supabase realtime subscription status: ${status}`);
          if (status !== 'SUBSCRIBED') {
            console.warn(`[useBids] Subscription status is not 'SUBSCRIBED': ${status}`);
          }
        });
    
      // Initial fetch of bids after setting up subscription
      fetchBids().catch(err => {
        console.error('[useBids] Initial fetch failed:', err);
      });
      
      return () => {
        console.log(`[useBids] Cleaning up realtime subscription for ${channelName}`);
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    } catch (err) {
      console.error('[useBids] Error setting up realtime subscription:', err);
      setError('Failed to set up real-time updates. Please refresh the page.');
      
      // Still attempt to fetch bids even if subscription fails
      fetchBids().catch(error => {
        console.error('[useBids] Fallback fetch failed:', error);
      });
      
      return () => {};
    }
  }, [listingId, fetchBids]);

  // Place bid function - with improved error handling and proxy bidding support
  const placeBid = useCallback(async (amount: number) => {
    console.log(`[useBids] Attempting to place bid: ${amount}`);
    try {
      // Get the user's current bid status
      const { hasBid, userBid } = getUserBidStatus();
      
      let result;
      
      // If user already has a bid, update it instead of creating a new one
      if (hasBid && userBid) {
        console.log(`[useBids] User already has a bid (${userBid.id}), updating maximum bid to: ${amount}`);
        result = await updateBid(userBid.id, amount);
      } else {
        console.log('[useBids] Creating new bid with maximum bid:', amount);
        result = await createBid(listingId, amount);
      }
      
      if (result.success) {
        console.log('[useBids] Bid placed successfully:', result);
        toast({
          title: "Bid placed",
          description: `Your bid has been placed successfully. The current bid will be increased in £5 increments as needed.`,
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

  // Get global type compatible bids for components that expect the global Bid type
  const getGlobalBids = useCallback((): GlobalBid[] => {
    console.log(`[useBids] Converting ${bids.length} bids to global format`);
    const globalBids = adaptBidTypes.toGlobalBids(bids);
    
    // Debug log for mapping issues
    if (bids.length > 0 && globalBids.length === 0) {
      console.error('[useBids] ⚠️ Critical mapping error: Raw bids available but no global bids produced!');
    }
    
    return globalBids;
  }, [bids]);

  return {
    bids,
    globalBids: getGlobalBids(),
    isLoading,
    error,
    placeBid,
    fetchBids,
    highestBid,
    getUserBidStatus,
    // Expose diagnostics for troubleshooting
    diagnostics: dataFlowStats
  };
};
