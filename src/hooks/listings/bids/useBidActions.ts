
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
   * Helper function to recalculate proxy bid amounts for a listing.
   * Implements eBay-style proxy bidding where the visible bid amount is only
   * one increment above the second highest maximum bid.
   */
  const recalculateProxyBids = useCallback(async (listingId: string, bidIncrement: number = 5): Promise<{ success: boolean, error?: string }> => {
    try {
      console.log(`[useBidActions] Recalculating proxy bids for listing: ${listingId}, increment: £${bidIncrement}`);
      
      // Fetch all active bids for this listing
      const { data: allBids, error: fetchError } = await supabase
        .from('bids')
        .select('id, user_id, listing_id, amount, maximum_bid, created_at')
        .eq('listing_id', listingId)
        .eq('status', 'active')
        .order('maximum_bid', { ascending: false })
        .order('created_at', { ascending: true }); // Earliest bidder wins ties
      
      if (fetchError) {
        console.error('[useBidActions] Error fetching bids for recalculation:', fetchError);
        return { 
          success: false, 
          error: `Failed to fetch bids: ${fetchError.message}`
        };
      }
      
      if (!allBids || allBids.length === 0) {
        console.log('[useBidActions] No active bids found for recalculation');
        return { success: true }; // Nothing to recalculate
      }
      
      console.log(`[useBidActions] Found ${allBids.length} active bids for recalculation`, allBids);
      
      // Get the highest and second highest bids
      const highestBid = allBids[0]; // Already sorted by maximum_bid DESC
      const secondHighestBid = allBids.length > 1 ? allBids[1] : null;
      
      // If there's only one bid, we need to get the listing to know the starting price
      let startingPrice = 0;
      if (!secondHighestBid) {
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .select('price')
          .eq('id', listingId)
          .single();
          
        if (listingError) {
          console.error('[useBidActions] Error fetching listing for starting price:', listingError);
          return {
            success: false,
            error: `Failed to fetch listing: ${listingError.message}`
          };
        }
        
        startingPrice = listing ? Number(listing.price) : 0;
        console.log(`[useBidActions] Using listing starting price: £${startingPrice}`);
      }
      
      // Calculate the new visible bid amount using proxy bidding rules
      const secondHighestMax = secondHighestBid ? Number(secondHighestBid.maximum_bid) : startingPrice;
      const newBidAmount = Math.min(
        Number(highestBid.maximum_bid), 
        secondHighestMax + bidIncrement
      );
      
      console.log('[useBidActions] Calculated new bid amount with proxy rules:', {
        highestMax: highestBid.maximum_bid,
        secondHighestMax,
        bidIncrement,
        newBidAmount
      });
      
      // Update the highest bidder's visible amount
      const { data: updated, error: updateError } = await supabase
        .from('bids')
        .update({ amount: newBidAmount })
        .eq('id', highestBid.id)
        .select('*');
        
      if (updateError || !updated || updated.length === 0) {
        console.error('[useBidActions] Error updating proxy bid amount:', updateError);
        return {
          success: false,
          error: `Failed to update bid amount: ${updateError?.message || 'No rows updated'}`
        };
      }
      
      console.log('[useBidActions] Successfully updated bid with proxy logic:', updated[0]);
      
      return { success: true };
    } catch (err) {
      console.error('[useBidActions] Exception in recalculateProxyBids:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to recalculate bids'
      };
    }
  }, []);
  
  const createBid = useCallback(async (listingId: string, amount: number): Promise<BidResult> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to place a bid' };
    }
    
    try {
      console.log(`[useBidActions] Creating bid: listing=${listingId}, amount=${amount}, user=${user.id}`);
      
      // Insert the bid with maximum_bid set to the amount
      // The visible amount will be calculated by recalculateProxyBids
      const { data, error } = await supabase
        .from('bids')
        .insert({
          listing_id: listingId,
          user_id: user.id,
          amount: amount, // Initially set to the same as maximum_bid
          maximum_bid: amount, // This is the user's ceiling
          status: 'active',
          bid_increment: 5 // Default increment
        })
        .select('id, listing_id, bid_increment')
        .single();
      
      if (error) {
        console.error('[useBidActions] Error creating bid:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
      
      console.log('[useBidActions] Bid created successfully:', data);
      
      // Now recalculate all bids for this listing to apply proxy bidding logic
      const recalcResult = await recalculateProxyBids(data.listing_id, data.bid_increment);
      if (!recalcResult.success) {
        console.error('[useBidActions] Failed to recalculate bids after creation:', recalcResult.error);
        // We don't return an error here since the bid was successfully created
        // The UI will still show the bid, just not with the correct proxy amount
      }
      
      return { 
        success: true,
        bidId: data.id
      };
    } catch (err) {
      console.error('[useBidActions] Exception creating bid:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create bid' 
      };
    }
  }, [user, recalculateProxyBids]);
  
  const updateBid = useCallback(async (bidId: string, amount: number): Promise<BidResult> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to update a bid' };
    }
    
    try {
      console.log(`[useBidActions] Updating bid: id=${bidId}, maximum_bid=${amount}`);
      
      // First verify that this bid belongs to the current user
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .select('id, user_id, listing_id, bid_increment')
        .eq('id', bidId)
        .single();
      
      if (bidError) {
        console.error('[useBidActions] Error retrieving bid for update:', bidError);
        return { 
          success: false, 
          error: 'Could not verify bid ownership' 
        };
      }
      
      if (bidData.user_id !== user.id) {
        console.error('[useBidActions] Unauthorized bid update attempt');
        return { 
          success: false, 
          error: 'You can only update your own bids' 
        };
      }
      
      // Update the bid's maximum_bid value
      // The visible amount will be updated by recalculateProxyBids
      const { data, error } = await supabase
        .from('bids')
        .update({
          maximum_bid: amount,
          // Update timestamp to ensure it's considered for tie-breaking
          created_at: new Date().toISOString()
        })
        .eq('id', bidId)
        .select('*');
      
      if (error) {
        console.error('[useBidActions] Error updating bid maximum:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
      
      // Enhanced verification to confirm update was successful
      if (!data || data.length === 0) {
        console.error('[useBidActions] Bid update failed: No rows returned');
        return {
          success: false,
          error: 'Bid update failed. Please try again.'
        };
      }
      
      console.log('[useBidActions] Bid maximum updated successfully:', data[0]);
      
      // Now recalculate all bids for this listing to apply proxy bidding logic
      const recalcResult = await recalculateProxyBids(bidData.listing_id, bidData.bid_increment);
      if (!recalcResult.success) {
        console.error('[useBidActions] Failed to recalculate bids after update:', recalcResult.error);
        return {
          success: false,
          error: `Bid maximum updated, but failed to recalculate visible amounts: ${recalcResult.error}`
        };
      }
      
      return { 
        success: true,
        bidId: bidId
      };
    } catch (err) {
      console.error('[useBidActions] Exception updating bid:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update bid' 
      };
    }
  }, [user, recalculateProxyBids]);
  
  return {
    createBid,
    updateBid
  };
};
