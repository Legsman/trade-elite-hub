
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Listing } from "@/types";

export const useListings = (options?: {
  category?: string;
  searchTerm?: string;
  listingType?: string;
  priceRange?: string;
  sortBy?: string;
}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("listings")
        .select("*")
        .eq("status", "active");

      // Apply category filter
      if (options?.category) {
        query = query.eq("category", options.category);
      }

      // Apply search filter
      if (options?.searchTerm) {
        query = query.or(`title.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`);
      }

      // Apply listing type filter
      if (options?.listingType && options.listingType !== "all") {
        query = query.eq("type", options.listingType);
      }

      // Apply price range filter
      if (options?.priceRange && options.priceRange !== "any") {
        const [min, max] = options.priceRange.split("-").map(Number);
        if (max) {
          query = query.gte("price", min).lte("price", max);
        } else {
          query = query.gte("price", min);
        }
      }

      // Apply sorting
      if (options?.sortBy) {
        switch (options.sortBy) {
          case "newest":
            query = query.order("created_at", { ascending: false });
            break;
          case "price-low":
            query = query.order("price", { ascending: true });
            break;
          case "price-high":
            query = query.order("price", { ascending: false });
            break;
          case "popular":
            query = query.order("views", { ascending: false });
            break;
        }
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Convert database records to Listing type
      const mappedListings: Listing[] = data.map(item => ({
        id: item.id,
        sellerId: item.seller_id,
        title: item.title,
        description: item.description,
        category: item.category,
        type: item.type,
        price: Number(item.price),
        location: item.location,
        condition: item.condition,
        images: item.images,
        allowBestOffer: item.allow_best_offer,
        expiresAt: new Date(item.expires_at),
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        status: item.status,
        views: item.views,
        saves: item.saves,
      }));

      setListings(mappedListings);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to fetch listings. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [options?.category, options?.searchTerm, options?.listingType, options?.priceRange, options?.sortBy]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    isLoading,
    error,
    refetch: fetchListings,
  };
};
