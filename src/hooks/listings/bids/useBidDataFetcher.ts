
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Bid } from "./types";

export const useBidDataFetcher = () => {
  // Fetch all bids for a listing
  const fetchBidsForListing = useCallback(async (listingId: string): Promise<Bid[]> => {
    console.log(`[useBidDataFetcher] Fetching bids for listing: ${listingId}`);
    
    try {
      // Use an explicit join query instead of relying on the nested selection
      // This provides better control and visibility when debugging
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
          bid_increment
        `)
        .eq('listing_id', listingId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('[useBidDataFetcher] Error fetching bids:', error);
        throw new Error(`Failed to fetch bids: ${error.message}`);
      }
      
      console.log('[useBidDataFetcher] Raw bid data returned:', data);
      
      // If we have bids, fetch the corresponding profile data
      if (data && data.length > 0) {
        // Extract all user IDs from the bids
        const userIds = data.map(bid => bid.user_id);
        
        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        
        if (profilesError) {
          console.error('[useBidDataFetcher] Error fetching profiles:', profilesError);
        } else {
          console.log('[useBidDataFetcher] Profiles data:', profilesData);
          
          // Create a map of profiles by user ID for quick lookup
          const profilesMap = (profilesData || []).reduce((map, profile) => {
            if (profile && profile.id) {
              map[profile.id] = profile;
            }
            return map;
          }, {} as Record<string, any>);
          
          // Transform the data to match the Bid interface
          const formattedBids: Bid[] = data.map(bid => {
            // Look up the profile for this bid's user_id
            const userProfile = profilesMap[bid.user_id];
            
            if (!userProfile) {
              console.warn(`[useBidDataFetcher] No profile found for user_id: ${bid.user_id}`);
            }
            
            return {
              id: bid.id,
              listing_id: bid.listing_id,
              user_id: bid.user_id,
              amount: bid.amount,
              status: bid.status,
              created_at: bid.created_at,
              maximum_bid: bid.maximum_bid || 0,
              bid_increment: bid.bid_increment || 0,
              // Use the profile data from our map
              user_profile: {
                full_name: userProfile ? userProfile.full_name : null,
                avatar_url: userProfile ? userProfile.avatar_url : null,
                username: userProfile ? userProfile.full_name : null // Fallback to full_name since username column doesn't exist
              },
              // Add mapped properties for types/index.ts compatibility
              userId: bid.user_id,
              listingId: bid.listing_id,
              maximumBid: bid.maximum_bid || 0,
              bidIncrement: bid.bid_increment || 0,
              createdAt: bid.created_at ? new Date(bid.created_at) : new Date()
            };
          });
          
          console.log(`[useBidDataFetcher] Fetched and formatted ${formattedBids.length} bids:`, formattedBids);
          return formattedBids;
        }
      }
      
      // If no profiles were fetched or there was an error, fall back to returning bids without profile info
      return data.map(bid => ({
        id: bid.id,
        listing_id: bid.listing_id,
        user_id: bid.user_id,
        amount: bid.amount,
        status: bid.status,
        created_at: bid.created_at,
        maximum_bid: bid.maximum_bid || 0,
        bid_increment: bid.bid_increment || 0,
        user_profile: {
          full_name: null,
          avatar_url: null,
          username: null
        },
        userId: bid.user_id,
        listingId: bid.listing_id,
        maximumBid: bid.maximum_bid || 0,
        bidIncrement: bid.bid_increment || 0,
        createdAt: bid.created_at ? new Date(bid.created_at) : new Date()
      }));
    } catch (err) {
      console.error('[useBidDataFetcher] Exception fetching bids:', err);
      throw err;
    }
  }, []);
  
  // Fetch just the highest bid amount for a listing
  const fetchHighestBid = useCallback(async (listingId: string): Promise<number | null> => {
    console.log(`[useBidDataFetcher] Fetching highest bid for listing: ${listingId}`);
    
    try {
      // Try to get the current_bid first from the listings table
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('current_bid, highest_bidder_id')  // Changed from 'price' to 'current_bid, highest_bidder_id'
        .eq('id', listingId)
        .single();
      
      if (!listingError && listingData && listingData.current_bid) {
        console.log(`[useBidDataFetcher] Found current bid in listing: ${listingData.current_bid}`);
        return Number(listingData.current_bid);
      }
      
      // Fall back to the old method if current_bid is not available
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
