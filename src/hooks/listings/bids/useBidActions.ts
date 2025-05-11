
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useBidActions = (
  listingId?: string,
  onBidSuccess?: () => void,
  fetchBids?: () => Promise<void>
) => {
  const { user } = useAuth();

  const placeBid = useCallback(async (amount: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place a bid.",
        variant: "destructive",
      });
      return { success: false };
    }

    if (!listingId) {
      toast({
        title: "Error",
        description: "Listing not found.",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      // First, fetch the listing to get the current price
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("price, seller_id, title")
        .eq("id", listingId)
        .single();

      if (listingError) throw listingError;
      
      // Check if user is trying to bid on their own listing
      if (listingData.seller_id === user.id) {
        toast({
          title: "Invalid Bid",
          description: "You cannot bid on your own listing.",
          variant: "destructive",
        });
        return { success: false };
      }

      // Fetch all current active bids for this listing
      const { data: currentBids, error: bidsError } = await supabase
        .from("bids")
        .select("user_id, amount, maximum_bid")
        .eq("listing_id", listingId)
        .eq("status", "active")
        .order("maximum_bid", { ascending: false });

      if (bidsError) throw bidsError;

      // Default minimum bid is the listing price if no bids exist
      let minBidAmount = Number(listingData.price);
      
      // Find the highest existing maximum bid (which might not be the current visible bid)
      // and the current bid amount (visible)
      let highestMaxBid = 0;
      let currentHighBid = 0;
      let highestBidUserId = null;
      
      if (currentBids.length > 0) {
        // Sort by maximum_bid descending
        const sortedBids = [...currentBids].sort((a, b) => Number(b.maximum_bid) - Number(a.maximum_bid));
        highestMaxBid = Number(sortedBids[0].maximum_bid);
        highestBidUserId = sortedBids[0].user_id;
        
        // Current visible bid will be the highest amount (not maximum_bid)
        currentHighBid = Math.max(...currentBids.map(bid => Number(bid.amount)));
        
        // Minimum bid is current visible bid + increment (usually £5)
        minBidAmount = currentHighBid;
      }

      // Check if user already has an active bid on this listing
      const existingUserBid = currentBids.find(bid => bid.user_id === user.id);
      
      // Validation: New max bid must be higher than existing visible bid (or starting price)
      if (amount <= currentHighBid) {
        toast({
          title: "Invalid Bid",
          description: `Your bid must be higher than the current bid of £${currentHighBid.toLocaleString()}.`,
          variant: "destructive",
        });
        return { success: false };
      }
      
      // Validation: If this is a rebid, the new max must be higher than previous max
      if (existingUserBid && amount <= Number(existingUserBid.maximum_bid)) {
        toast({
          title: "Invalid Bid",
          description: `Your new maximum bid must be higher than your previous maximum bid of £${Number(existingUserBid.maximum_bid).toLocaleString()}.`,
          variant: "destructive",
        });
        return { success: false };
      }

      // Calculate the new visible bid amount based on proxy bidding rules
      let newVisibleBid;
      const bidIncrement = 5; // Fixed £5 increment
      
      if (highestBidUserId === user.id) {
        // User is already the highest bidder, just updating their maximum
        newVisibleBid = currentHighBid; // Visible bid doesn't change
      } else if (!existingUserBid && currentBids.length === 0) {
        // First bid on the listing - start at the listing price
        newVisibleBid = minBidAmount;
      } else if (amount > highestMaxBid) {
        // User's max bid is higher than the current highest max bid
        // Set visible bid to the second highest max + increment (or minimum if no second bid)
        if (currentBids.length > 1) {
          // Find the second highest maximum bid
          const secondHighestMax = currentBids.length > 1 
            ? Number(currentBids.filter(bid => bid.user_id !== highestBidUserId)
                .sort((a, b) => Number(b.maximum_bid) - Number(a.maximum_bid))[0]?.maximum_bid || 0)
            : 0;
            
          // If user is already second highest, use their current max as the reference
          const referenceMax = existingUserBid 
            ? Math.max(secondHighestMax, Number(existingUserBid.maximum_bid)) 
            : secondHighestMax;
            
          // New visible bid is the reference max + increment, but capped at user's max bid
          newVisibleBid = Math.min(referenceMax + bidIncrement, amount);
        } else {
          // Only one bidder (not the current user) - bid increment over current bid
          newVisibleBid = Math.min(currentHighBid + bidIncrement, amount);
        }
      } else {
        // User's max is lower than current highest max
        // Set visible bid to user's max, and the system will auto-increment the highest bidder's
        newVisibleBid = Math.min(amount + bidIncrement, highestMaxBid);
      }

      // Handle insert or update of user's bid
      if (existingUserBid) {
        // Update existing bid
        const { error: updateError } = await supabase
          .from("bids")
          .update({
            amount: newVisibleBid,
            maximum_bid: amount,
            bid_increment: bidIncrement
          })
          .eq("user_id", user.id)
          .eq("listing_id", listingId)
          .eq("status", "active");

        if (updateError) throw updateError;
      } else {
        // Insert new bid
        const { error: insertError } = await supabase
          .from("bids")
          .insert({
            user_id: user.id,
            listing_id: listingId,
            amount: newVisibleBid,
            maximum_bid: amount,
            bid_increment: bidIncrement,
            status: "active"
          });

        if (insertError) throw insertError;
      }

      // If there's a previous highest bidder who isn't the current user
      // and the new bid outbids them, create a notification
      if (highestBidUserId && highestBidUserId !== user.id && amount > highestMaxBid) {
        await supabase
          .from("notifications")
          .insert({
            user_id: highestBidUserId,
            type: "outbid",
            message: `You've been outbid on listing "${listingData.title}"`,
            metadata: {
              listing_id: listingId,
              bid_amount: newVisibleBid
            }
          });
      }

      // Always create notification for the seller (unless they're the bidder)
      if (listingData.seller_id !== user.id) {
        await supabase
          .from("notifications")
          .insert({
            user_id: listingData.seller_id,
            type: "new_bid",
            message: `New bid of £${newVisibleBid.toLocaleString()} on your listing "${listingData.title}"`,
            metadata: {
              listing_id: listingId,
              bid_amount: newVisibleBid,
              bidder_id: user.id
            }
          });
      }

      toast({
        title: "Bid Placed",
        description: `Your maximum bid of £${amount.toLocaleString()} has been placed successfully.`,
      });

      // Refresh bids
      if (fetchBids) {
        fetchBids();
      }
      
      // Call success callback if provided
      if (onBidSuccess) {
        onBidSuccess();
      }

      return { success: true };
    } catch (err) {
      console.error("Error placing bid:", err);
      toast({
        title: "Error",
        description: "Failed to place bid. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [user, listingId, fetchBids, onBidSuccess]);

  return { placeBid };
};
