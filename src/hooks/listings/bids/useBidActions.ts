
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

interface BidResult {
  success: boolean;
  error?: string;
  bidId?: string;
}

export const useBidActions = () => {
  const { user } = useAuth();
  
  /**
   * Place a new bid or update an existing one using the server-side proxy bidding function
   */
  const placeOrUpdateBid = useCallback(async (
    listingId: string, 
    maxBid: number, 
    existingBidId?: string
  ): Promise<BidResult> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to place a bid' };
    }
    
    try {
      console.log(`[useBidActions] ${existingBidId ? 'Updating' : 'Creating'} bid with proxy function: listing=${listingId}, maxBid=${maxBid}`);
      
      // Call the RPC function with the correct parameters
      const { data, error } = await supabase.rpc('proxy_place_or_update_bid', {
        p_listing_id: listingId,
        p_bid_id: existingBidId || null,
        p_user_id: user.id,
        p_new_maximum: maxBid
      });
      
      if (error) {
        // Log the error for debugging
        console.error('[useBidActions] Error using proxy bid function:', error);
        
        // Provide user-friendly error based on error code
        let userMessage = 'Failed to process bid';
        if (error.code === 'P0001') {
          userMessage = 'You can only update your own bids';
        } else if (error.code === 'P0002') {
          userMessage = 'This listing was not found';
        }
        
        return { 
          success: false, 
          error: userMessage 
        };
      }
      
      // Check if data exists and has the correct structure
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          success: false,
          error: 'No data returned from bid operation'
        };
      }
      
      console.log('[useBidActions] Bid processed successfully:', data[0]);
      
      return { 
        success: true,
        bidId: existingBidId // Return the existing bid ID or undefined for new bids
      };
    } catch (err) {
      console.error('[useBidActions] Exception in bid operation:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to process bid' 
      };
    }
  }, [user]);
  
  /**
   * Create a new bid
   */
  const createBid = useCallback(async (listingId: string, amount: number): Promise<BidResult> => {
    return placeOrUpdateBid(listingId, amount);
  }, [placeOrUpdateBid]);
  
  /**
   * Update an existing bid
   */
  const updateBid = useCallback(async (bidId: string, amount: number): Promise<BidResult> => {
    // First get the listing ID for this bid
    try {
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .select('listing_id')
        .eq('id', bidId)
        .single();
      
      if (bidError || !bidData) {
        console.error('[useBidActions] Error retrieving bid for update:', bidError);
        return { 
          success: false, 
          error: 'Could not find the bid to update' 
        };
      }
      
      return placeOrUpdateBid(bidData.listing_id, amount, bidId);
    } catch (err) {
      console.error('[useBidActions] Exception retrieving bid data:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update bid' 
      };
    }
  }, [placeOrUpdateBid]);
  
  return {
    createBid,
    updateBid
  };
};
