
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
        // Log the full error details for debugging
        console.error('[useBidActions] Error using proxy bid function:', error);
        
        // Provide detailed error message to user
        let userMessage = error.message || 'Failed to process bid';
        
        if (error.code === 'P0001') {
          userMessage = 'You can only update your own bids';
        } else if (error.code === 'P0002') {
          userMessage = 'This listing was not found';
        } else if (error.code === 'P0003') {
          userMessage = 'This auction has ended';
        } else if (error.code === 'P0004') {
          userMessage = 'This auction is no longer active';
        } else if (error.code === 'P0005') {
          userMessage = 'You cannot bid on your own auction';
        } else if (error.code === 'P0006') {
          userMessage = 'Bid amount must be a positive number';
        } else if (error.code === 'P0007') {
          userMessage = 'Maximum bid cannot be less than your bid amount';
        } else if (error.code === 'P0008') {
          userMessage = 'Your bid must meet the minimum increment requirement';
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
        const errorMsg = "No data returned from bid operation";
        console.error('[useBidActions]', errorMsg);
        
        toast({
          title: "Bid Failed",
          description: errorMsg,
          variant: "destructive",
        });
        
        return {
          success: false,
          error: errorMsg
        };
      }
      
      console.log('[useBidActions] Bid processed successfully:', data[0]);
      
      // Display success toast with current bid amount
      toast({
        title: "Bid Placed Successfully",
        description: `Your maximum bid of £${maxBid} has been placed. Current price: £${data[0].new_current_bid}`,
      });
      
      return { 
        success: true,
        bidId: data[0].listing_id // Return the listing ID for refetching
      };
    } catch (err) {
      console.error('[useBidActions] Exception in bid operation:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to process bid';
      
      toast({
        title: "Bid Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: errorMessage
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
          error: bidError ? bidError.message : 'Could not find the bid to update' 
        };
      }
      
      return placeOrUpdateBid(bidData.listing_id, amount, bidId);
    } catch (err) {
      console.error('[useBidActions] Exception retrieving bid data:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bid';
      
      toast({
        title: "Bid Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, [placeOrUpdateBid]);
  
  return {
    createBid,
    updateBid
  };
};
