
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
  
  const createBid = useCallback(async (listingId: string, amount: number): Promise<BidResult> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to place a bid' };
    }
    
    try {
      console.log(`[useBidActions] Creating bid: listing=${listingId}, amount=${amount}, user=${user.id}`);
      
      const { data, error } = await supabase
        .from('bids')
        .insert({
          listing_id: listingId,
          user_id: user.id,
          amount: amount,
          status: 'active'
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('[useBidActions] Error creating bid:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
      
      console.log('[useBidActions] Bid created successfully:', data);
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
  }, [user]);
  
  const updateBid = useCallback(async (bidId: string, amount: number): Promise<BidResult> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to update a bid' };
    }
    
    try {
      console.log(`[useBidActions] Updating bid: id=${bidId}, amount=${amount}`);
      
      // First verify that this bid belongs to the current user
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .select('id, user_id')
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
      
      // Now perform the update
      const { error } = await supabase
        .from('bids')
        .update({
          amount: amount,
          // Update timestamp by setting created_at to now() to ensure it's considered the newest bid
          created_at: new Date().toISOString()
        })
        .eq('id', bidId);
      
      if (error) {
        console.error('[useBidActions] Error updating bid:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
      
      console.log('[useBidActions] Bid updated successfully');
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
  }, [user]);
  
  return {
    createBid,
    updateBid
  };
};
