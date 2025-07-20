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
      // Use the new function that automatically checks and updates expired status
      const { data, error } = await supabase
        .rpc("get_listing_with_expiry_check", { listing_id: id });

      if (error) {
        throw error;
      }

      // Get the first result since the function returns SETOF
      const listingData = data && data.length > 0 ? data[0] : null;
      
      if (!listingData) {
        throw new Error("Listing not found");
      }

      // Convert database record to Listing type with proper camelCase
      const mappedListing: Listing = {
        id: listingData.id,
        sellerId: listingData.seller_id,
        title: listingData.title,
        description: listingData.description,
        category: listingData.category,
        type: listingData.type,
        price: Number(listingData.price),
        location: listingData.location,
        condition: listingData.condition,
        images: listingData.images,
        allowBestOffer: listingData.allow_best_offer,
        expiresAt: new Date(listingData.expires_at),
        createdAt: new Date(listingData.created_at),
        updatedAt: new Date(listingData.updated_at),
        status: listingData.status,
        views: listingData.views,
        saves: listingData.saves,
        currentBid: listingData.current_bid ? Number(listingData.current_bid) : null,
        highestBidderId: listingData.highest_bidder_id || null,
        saleAmount: listingData.sale_amount ? Number(listingData.sale_amount) : null,
        saleBuyerId: listingData.sale_buyer_id || null,
        saleDate: listingData.sale_date ? listingData.sale_date : null
      };

      setListing(mappedListing);

      // Track view using edge function (deduplicated)
      try {
        const resp = await fetch("https://hwnsooioeqydhyukenfe.supabase.co/functions/v1/track-listing-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ listingId: id }),
        });
        if (resp.ok) {
          const json = await resp.json();
          if (json && typeof json.views === "number") {
            setListing(l => l ? { ...l, views: json.views } : l); // Update local views
          }
        } else {
          // Fallback: refresh listing from db
          const refetch = await supabase
            .from("listings")
            .select("*")
            .eq("id", id)
            .maybeSingle();
          if (refetch.data && typeof refetch.data.views === "number") {
            setListing(l => l ? { ...l, views: refetch.data.views } : l);
          }
        }
      } catch (trackErr) {
        // Fallback: try to keep UI going
        console.error("Failed to call track-listing-view", trackErr);
      }

      // Optionally, refetch views after increment (for immediate UI update if needed)
      // You could poll or trigger a re-fetch here if needed
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
  }, [id]);

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
