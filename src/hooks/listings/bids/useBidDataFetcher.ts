
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Bid } from "@/types";
import { BidState } from "./types";

export const useBidDataFetcher = (listingId?: string) => {
  const [state, setState] = useState<BidState>({
    bids: [],
    isLoading: true,
    error: null,
    highestBid: null
  });

  const fetchBids = useCallback(async () => {
    if (!listingId) {
      setState({
        bids: [],
        highestBid: null,
        isLoading: false,
        error: null
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

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
          maximumBid: Number(item.maximum_bid),
          bidIncrement: Number(item.bid_increment),
          createdAt: new Date(item.created_at),
          status: item.status,
          user: profile ? {
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
          } : undefined
        };
      });

      const newHighestBid = mappedBids.length > 0 ? mappedBids[0].amount : null;
      
      setState({
        bids: mappedBids,
        highestBid: newHighestBid,
        isLoading: false,
        error: null
      });
    } catch (err) {
      console.error("Error fetching bids:", err);
      const errorMessage = "Failed to fetch bids. Please try again.";
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [listingId]);

  return {
    ...state,
    fetchBids
  };
};
