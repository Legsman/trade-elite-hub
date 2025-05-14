
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Listing } from "@/types";

export const useListing = (id?: string) => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchListing = useCallback(async () => {
    if (!id) {
      setListing(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      // Convert database record to Listing type
      const mappedListing: Listing = {
        id: data.id,
        sellerId: data.seller_id,
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        price: Number(data.price),
        location: data.location,
        condition: data.condition,
        images: data.images,
        allowBestOffer: data.allow_best_offer,
        expiresAt: new Date(data.expires_at),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        status: data.status,
        views: data.views,
        saves: data.saves,
        current_bid: data.current_bid ? Number(data.current_bid) : null,
        highest_bidder_id: data.highest_bidder_id || null
      };

      setListing(mappedListing);

      // Increment view count
      if (data.seller_id !== user?.id) {
        await supabase
          .from("listings")
          .update({ views: data.views + 1 })
          .eq("id", id);
      }
    } catch (err) {
      console.error("Error fetching listing:", err);
      setError("Failed to fetch listing. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const toggleSaveListing = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save listings.",
        variant: "destructive",
      });
      return { success: false };
    }

    if (!listing) {
      return { success: false };
    }

    try {
      // Check if already saved
      const { data: savedData } = await supabase
        .from("saved_listings")
        .select("*")
        .eq("user_id", user.id)
        .eq("listing_id", listing.id)
        .maybeSingle();

      if (savedData) {
        // Remove from saved
        const { error } = await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listing.id);

        if (error) throw error;

        // Update saves count
        await supabase
          .from("listings")
          .update({ saves: listing.saves - 1 })
          .eq("id", listing.id);

        toast({
          title: "Listing Removed",
          description: "Listing has been removed from your saved items.",
        });

        setListing(prev => prev ? { ...prev, saves: prev.saves - 1 } : null);
        return { success: true, saved: false };
      } else {
        // Add to saved
        const { error } = await supabase
          .from("saved_listings")
          .insert({
            user_id: user.id,
            listing_id: listing.id,
          });

        if (error) throw error;

        // Update saves count
        await supabase
          .from("listings")
          .update({ saves: listing.saves + 1 })
          .eq("id", listing.id);

        toast({
          title: "Listing Saved",
          description: "Listing has been added to your saved items.",
        });

        setListing(prev => prev ? { ...prev, saves: prev.saves + 1 } : null);
        return { success: true, saved: true };
      }
    } catch (err) {
      console.error("Error toggling save status:", err);
      toast({
        title: "Error",
        description: "Failed to update saved status. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [listing, user]);

  const checkSavedStatus = useCallback(async () => {
    if (!user || !listing) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("saved_listings")
        .select("*")
        .eq("user_id", user.id)
        .eq("listing_id", listing.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error("Error checking saved status:", err);
      return false;
    }
  }, [listing, user]);

  return {
    listing,
    isLoading,
    error,
    refetch: fetchListing,
    toggleSave: toggleSaveListing,
    checkSaved: checkSavedStatus,
  };
};
