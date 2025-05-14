
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";

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
      toast({
        title: "Authentication required",
        description: "You must be logged in to place a bid",
        variant: "destructive",
      });
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
        
        toast({
          title: "Bid Failed",
          description: userMessage,
          variant: "destructive",
        });
        
        return { 
          success: false, 
          error: userMessage 
        };
      }
      
      // Check if data exists and has the correct structure
      if (!data || !Array.isArray(data) || data.length === 0) {
        toast({
          title: "Bid Failed",
          description: "No data returned from bid operation",
          variant: "destructive",
        });
        
        return {
          success: false,
          error: 'No data returned from bid operation'
        };
      }
      
      console.log('[useBidActions] Bid processed successfully:', data[0]);
      
      // Display success toast with current bid amount
      toast({
        title: "Bid Placed Successfully",
        description: `Your maximum bid of £${maxBid} has been placed. Current price: £${data[0].new_current_bid}`,
      });
      
      // After successful bid, explicitly refresh the listing data to get the latest current_bid
      try {
        console.log('[useBidActions] Refreshing listing data after successful bid');
        await supabase
          .from('listings')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', listingId);
      } catch (refreshErr) {
        console.error('[useBidActions] Error refreshing listing data:', refreshErr);
        // Non-critical error, don't fail the operation
      }
      
      return { 
        success: true,
        bidId: existingBidId // Return the existing bid ID or undefined for new bids
      };
    } catch (err) {
      console.error('[useBidActions] Exception in bid operation:', err);
      
      toast({
        title: "Bid Failed",
        description: err instanceof Error ? err.message : 'Failed to process bid',
        variant: "destructive",
      });
      
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
        
        toast({
          title: "Bid Update Failed",
          description: "Could not find the bid to update",
          variant: "destructive",
        });
        
        return { 
          success: false, 
          error: 'Could not find the bid to update' 
        };
      }
      
      return placeOrUpdateBid(bidData.listing_id, amount, bidId);
    } catch (err) {
      console.error('[useBidActions] Exception retrieving bid data:', err);
      
      toast({
        title: "Bid Update Failed",
        description: err instanceof Error ? err.message : "Failed to update bid",
        variant: "destructive",
      });
      
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
