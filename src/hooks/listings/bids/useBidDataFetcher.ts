
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Bid } from "./types";

export const useBidDataFetcher = () => {
  // Fetch all bids for a listing
  const fetchBidsForListing = useCallback(async (listingId: string): Promise<Bid[]> => {
    console.log(`[useBidDataFetcher] Fetching bids for listing: ${listingId}`);
    
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          id,
          user_id,
          listing_id,
          amount,
          status,
          created_at,
          maximum_bid,
          bid_increment,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('listing_id', listingId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('[useBidDataFetcher] Error fetching bids:', error);
        throw new Error(`Failed to fetch bids: ${error.message}`);
      }
      
      console.log('[useBidDataFetcher] Raw bid data returned:', data);
      
      // Transform the data to match the Bid interface
      const formattedBids: Bid[] = data.map(bid => {
        // Handle the profiles data safely with extra type checking
        let userName = null;
        let userAvatar = null;
        
        // Check if profiles exists and has the expected properties
        try {
          if (bid.profiles && typeof bid.profiles === 'object') {
            userName = (bid.profiles as any).full_name || null;
            userAvatar = (bid.profiles as any).avatar_url || null;
          }
        } catch (err) {
          console.error('[useBidDataFetcher] Error processing profile data:', err);
        }
        
        return {
          id: bid.id,
          listing_id: bid.listing_id,
          user_id: bid.user_id,
          amount: bid.amount,
          status: bid.status,
          created_at: bid.created_at,
          maximum_bid: bid.maximum_bid,
          bid_increment: bid.bid_increment,
          // Use the safely extracted profile data
          user_profile: {
            full_name: userName,
            avatar_url: userAvatar
          },
          // Add mapped properties for types/index.ts compatibility
          userId: bid.user_id,
          listingId: bid.listing_id,
          maximumBid: bid.maximum_bid,
          bidIncrement: bid.bid_increment,
          createdAt: bid.created_at ? new Date(bid.created_at) : new Date()
        };
      });
      
      console.log(`[useBidDataFetcher] Fetched and formatted ${formattedBids.length} bids:`, formattedBids);
      return formattedBids;
    } catch (err) {
      console.error('[useBidDataFetcher] Exception fetching bids:', err);
      throw err;
    }
  }, []);
  
  // Fetch just the highest bid amount for a listing
  const fetchHighestBid = useCallback(async (listingId: string): Promise<number | null> => {
    console.log(`[useBidDataFetcher] Fetching highest bid for listing: ${listingId}`);
    
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('amount')
        .eq('listing_id', listingId)
        .eq('status', 'active')
        .order('amount', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('[useBidDataFetcher] Error fetching highest bid:', error);
        throw new Error(`Failed to fetch highest bid: ${error.message}`);
      }
      
      if (data.length === 0) {
        console.log('[useBidDataFetcher] No bids found for this listing');
        return null;
      }
      
      console.log(`[useBidDataFetcher] Highest bid amount: ${data[0].amount}`);
      return Number(data[0].amount);
    } catch (err) {
      console.error('[useBidDataFetcher] Exception fetching highest bid:', err);
      throw err;
    }
  }, []);
  
  return {
    fetchBidsForListing,
    fetchHighestBid
  };
};
