
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Offer } from "@/types";
import { OfferState } from "./types";

export const useOfferDataFetcher = (listingId?: string) => {
  const [state, setState] = useState<OfferState>({
    offers: [],
    isLoading: false,
    error: null
  });

  const fetchOffers = useCallback(async () => {
    if (!listingId) {
      setState({
        offers: [],
        isLoading: false,
        error: null
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // First, fetch the offers
      const { data: offersData, error: offersError } = await supabase
        .from("offers")
        .select("*")
        .eq("listing_id", listingId)
        .order("amount", { ascending: false });

      if (offersError) {
        throw offersError;
      }

      // Collect user IDs to fetch their profiles in a single query
      const userIds = [...new Set(offersData.map(offer => offer.user_id))];
      
      // Get profiles for these users if there are any offers
      let profilesMap: Record<string, { full_name: string | null, avatar_url: string | null, username: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, username")
          .in("id", userIds);
        
        if (profilesError) {
          throw profilesError;
        }
        
        // Create a map of user_id to profile data for easy lookup
        profilesMap = profilesData.reduce((map, profile) => {
          map[profile.id] = { 
            full_name: profile.full_name, 
            avatar_url: profile.avatar_url,
            username: profile.username
          };
          return map;
        }, {} as Record<string, { full_name: string | null, avatar_url: string | null, username: string | null }>);
      }

      // Map offers with profile data
      const mappedOffers: Offer[] = offersData.map(item => {
        const profile = profilesMap[item.user_id];
        
        return {
          id: item.id,
          userId: item.user_id,
          listingId: item.listing_id,
          amount: Number(item.amount),
          message: item.message,
          status: item.status,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
          user: profile ? {
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            username: profile.username,
          } : undefined
        };
      });
      
      setState({
        offers: mappedOffers,
        isLoading: false,
        error: null
      });
    } catch (err) {
      console.error("Error fetching offers:", err);
      const errorMessage = "Failed to fetch offers. Please try again.";
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
    fetchOffers
  };
};
