
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Listing } from "@/types";

export const useSavedListings = () => {
  const { user } = useAuth();
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedListings = useCallback(async () => {
    if (!user) {
      setSavedListings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("saved_listings")
        .select(`
          listing_id,
          listings:listing_id (*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      // Map the joined data to Listing type
      const mappedListings: Listing[] = data
        .filter(item => item.listings) // Filter out any null listings
        .map(item => {
          const listing = item.listings as any;
          return {
            id: listing.id,
            sellerId: listing.seller_id,
            title: listing.title,
            description: listing.description,
            category: listing.category,
            type: listing.type,
            price: Number(listing.price),
            location: listing.location,
            condition: listing.condition,
            images: listing.images,
            allowBestOffer: listing.allow_best_offer,
            expiresAt: new Date(listing.expires_at),
            createdAt: new Date(listing.created_at),
            updatedAt: new Date(listing.updated_at),
            status: listing.status,
            views: listing.views,
            saves: listing.saves,
          };
        });

      setSavedListings(mappedListings);
    } catch (err) {
      console.error("Error fetching saved listings:", err);
      setError("Failed to fetch saved listings. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch saved listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-renders

  useEffect(() => {
    fetchSavedListings();
  }, [fetchSavedListings]);

  return {
    savedListings,
    isLoading,
    error,
    refetch: fetchSavedListings,
    fetchSavedListings // Explicitly expose this function
  };
};
