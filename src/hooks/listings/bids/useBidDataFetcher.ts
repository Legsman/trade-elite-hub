import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Bid } from "./types";

export const useBidDataFetcher = () => {
  // Fetch all bids for a listing
  const fetchBidsForListing = useCallback(async (listingId: string, listingStatus?: string): Promise<Bid[]> => {
    console.log(`[useBidDataFetcher] Fetching bids for listing: ${listingId}`);
    
    try {
      // Use an explicit join query instead of relying on the nested selection
      // This provides better control and visibility when debugging
      let query = supabase
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
        .eq('listing_id', listingId);
      
      // Filter by status based on listing state
      if (listingStatus === 'sold' || listingStatus === 'expired' || listingStatus === 'ended') {
        // For completed listings, show both active and won bids to display full history
        query = query.in('status', ['active', 'won']);
      } else {
        // For active listings, only show active bids
        query = query.eq('status', 'active');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
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
          
          // Fix returned Bid type: for user_profile (always return full_name from profile)
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
              // User_profile type must contain username as optional, set null
              user_profile: {
                full_name: userProfile ? userProfile.full_name : null,
                avatar_url: userProfile ? userProfile.avatar_url : null,
                username: null
              },
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
  
  // Fetch just the highest bid amount and highest bidder ID for a listing
  const fetchHighestBid = useCallback(async (listingId: string): Promise<{amount: number | null, highestBidderId: string | null}> => {
    console.log(`[useBidDataFetcher] Fetching highest bid for listing: ${listingId}`);
    
    try {
      // Try to get the current_bid first from the listings table
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('current_bid, highest_bidder_id')
        .eq('id', listingId)
        .single();
      
      if (!listingError && listingData && listingData.current_bid) {
        console.log(`[useBidDataFetcher] Found current bid in listing: ${listingData.current_bid}`);
        console.log(`[useBidDataFetcher] Highest bidder ID: ${listingData.highest_bidder_id}`);
        return {
          amount: Number(listingData.current_bid),
          highestBidderId: listingData.highest_bidder_id
        };
      }
      
      // Fall back to the old method if current_bid is not available
      const { data, error } = await supabase
        .from('bids')
        .select('amount, user_id')
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
        return {amount: null, highestBidderId: null};
      }
      
      console.log(`[useBidDataFetcher] Highest bid amount: ${data[0].amount} from user: ${data[0].user_id}`);
      return {
        amount: Number(data[0].amount),
        highestBidderId: data[0].user_id
      };
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
