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
          profiles:user_id (
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
      
      // Transform the data to match the Bid interface
      const formattedBids: Bid[] = data.map(bid => {
        // Handle the profiles data safely
        const profileData = bid.profiles as any; // Using any to bypass TypeScript error
        
        return {
          id: bid.id,
          listing_id: bid.listing_id,
          user_id: bid.user_id,
          amount: bid.amount,
          status: bid.status,
          created_at: bid.created_at,
          maximum_bid: bid.maximum_bid,
          bid_increment: bid.bid_increment,
          // Safely access profile properties
          user_profile: profileData ? {
            full_name: profileData?.full_name,
            avatar_url: profileData?.avatar_url
          } : undefined,
          // Add mapped properties for types/index.ts compatibility
          userId: bid.user_id,
          listingId: bid.listing_id,
          maximumBid: bid.maximum_bid,
          bidIncrement: bid.bid_increment,
          createdAt: bid.created_at ? new Date(bid.created_at) : undefined
        };
      });
      
      console.log(`[useBidDataFetcher] Fetched ${formattedBids.length} bids`);
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
