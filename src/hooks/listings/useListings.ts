
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Listing } from "@/types";

type UseListingsOptions = {
  category?: string;
  type?: string;
  location?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  page?: string;
  allowBestOffer?: string;
  searchTerm?: string;
};

export const useListings = (options: UseListingsOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Extract options into variables
      const {
        category,
        type,
        location,
        condition,
        minPrice,
        maxPrice,
        sortBy = "created_at-desc",
        page = "1",
        allowBestOffer,
        searchTerm,
      } = options;

      // Create query
      let query = supabase
        .from("listings")
        .select("*", { count: "exact" }) // Get total count for pagination
        .eq("status", "active");

      // Apply filters
      if (category) {
        query = query.eq("category", category);
      }

      if (type) {
        query = query.eq("type", type);
      }

      if (location) {
        query = query.eq("location", location);
      }

      if (condition) {
        query = query.eq("condition", condition);
      }

      if (minPrice) {
        query = query.gte("price", minPrice);
      }

      if (maxPrice) {
        query = query.lte("price", maxPrice);
      }

      if (allowBestOffer === "true") {
        query = query.eq("allow_best_offer", true);
      }

      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      // Apply sorting - map JavaScript camelCase to database snake_case
      const sortFieldMap: Record<string, string> = {
        'createdAt': 'created_at',
        'updatedAt': 'updated_at',
        'price': 'price'
      };

      const [sortField, sortOrder] = sortBy.split("-");
      const dbSortField = sortFieldMap[sortField] || sortField;
      
      if (dbSortField && sortOrder) {
        query = query.order(dbSortField, { ascending: sortOrder === "asc" });
      }

      // Apply pagination
      const pageSize = 9; // Number of items per page
      const pageNumber = parseInt(page, 10) || 1;
      const start = (pageNumber - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);

      // Execute query
      const { data, error, count } = await query;

      if (error) throw error;

      // Map the data to Listing type
      const mappedListings: Listing[] = data.map(listing => ({
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
      }));

      setListings(mappedListings);
      setTotalCount(count || 0);
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
  }, [options]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    isLoading,
    error,
    totalCount,
    refetch: fetchListings,
  };
};
