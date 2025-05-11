
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Bid } from "@/types";

interface UseBidsOptions {
  listingId?: string;
  onBidSuccess?: () => void;
}

export const useBids = ({ listingId, onBidSuccess }: UseBidsOptions = {}) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highestBid, setHighestBid] = useState<number | null>(null);
  const { user } = useAuth();

  const fetchBids = useCallback(async () => {
    if (!listingId) {
      setBids([]);
      setHighestBid(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, fetch the bids
      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select("*")
        .eq("listing_id", listingId)
        .order("amount", { ascending: false });

      if (bidsError) {
        throw bidsError;
      }

      // Collect user IDs to fetch their profiles in a single query
      const userIds = [...new Set(bidsData.map(bid => bid.user_id))];
      
      // Get profiles for these users if there are any bids
      let profilesMap: Record<string, { full_name: string | null, avatar_url: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);
        
        if (profilesError) {
          throw profilesError;
        }
        
        // Create a map of user_id to profile data for easy lookup
        profilesMap = profilesData.reduce((map, profile) => {
          map[profile.id] = { 
            full_name: profile.full_name, 
            avatar_url: profile.avatar_url 
          };
          return map;
        }, {} as Record<string, { full_name: string | null, avatar_url: string | null }>);
      }

      // Map bids with profile data
      const mappedBids: Bid[] = bidsData.map(item => {
        const profile = profilesMap[item.user_id];
        
        return {
          id: item.id,
          userId: item.user_id,
          listingId: item.listing_id,
          amount: Number(item.amount),
          createdAt: new Date(item.created_at),
          status: item.status,
          user: profile ? {
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
          } : undefined
        };
      });

      setBids(mappedBids);
      
      // Set highest bid if there are any bids
      if (mappedBids.length > 0) {
        setHighestBid(mappedBids[0].amount);
      }
    } catch (err) {
      console.error("Error fetching bids:", err);
      setError("Failed to fetch bids. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch bids. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

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
      // First, fetch the highest bid to validate the new bid
      const { data: currentBids, error: fetchError } = await supabase
        .from("bids")
        .select("amount")
        .eq("listing_id", listingId)
        .order("amount", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      // Check if new bid is higher than the current highest bid
      const currentHighBid = currentBids.length > 0 ? Number(currentBids[0].amount) : 0;
      if (amount <= currentHighBid) {
        toast({
          title: "Invalid Bid",
          description: `Your bid must be higher than the current highest bid (£${currentHighBid.toLocaleString()}).`,
          variant: "destructive",
        });
        return { success: false };
      }

      // Insert new bid
      const { error: insertError } = await supabase
        .from("bids")
        .insert({
          user_id: user.id,
          listing_id: listingId,
          amount,
          status: "active"
        });

      if (insertError) throw insertError;

      // Create notification for the listing owner
      const { data: listingData } = await supabase
        .from("listings")
        .select("seller_id, title")
        .eq("id", listingId)
        .single();

      if (listingData && listingData.seller_id !== user.id) {
        await supabase
          .from("notifications")
          .insert({
            user_id: listingData.seller_id,
            type: "new_bid",
            message: `New bid of £${amount.toLocaleString()} on your listing "${listingData.title}"`,
            metadata: {
              listing_id: listingId,
              bid_amount: amount,
              bidder_id: user.id
            }
          });
      }

      toast({
        title: "Bid Placed",
        description: `Your bid of £${amount.toLocaleString()} has been placed successfully.`,
      });

      // Refresh bids
      fetchBids();
      
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

  const getUserBidStatus = useCallback(() => {
    if (!user || bids.length === 0) {
      return {
        hasBid: false,
        isHighestBidder: false,
        userHighestBid: null
      };
    }

    const userBids = bids.filter(bid => bid.userId === user.id);
    const hasBid = userBids.length > 0;
    const highestBidAmount = bids[0].amount;
    const userHighestBid = hasBid ? Math.max(...userBids.map(bid => bid.amount)) : null;
    const isHighestBidder = hasBid && highestBidAmount === userHighestBid;

    return {
      hasBid,
      isHighestBidder,
      userHighestBid
    };
  }, [user, bids]);

  return {
    bids,
    isLoading,
    error,
    placeBid,
    fetchBids,
    highestBid,
    getUserBidStatus
  };
};
