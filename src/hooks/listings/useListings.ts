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
  const [retryCount, setRetryCount] = useState(0);
  const [lastOptions, setLastOptions] = useState<string>(""); // Track last used options
  const MAX_RETRIES = 2;
  
  const fetchListings = useCallback(async () => {
    // Convert options to a string for comparison
    const optionsString = JSON.stringify(options);
    
    // If we're already loading with the same options, don't restart the fetch
    if (isLoading && optionsString === lastOptions) {
      return;
    }
    
    // Only show loading state if we don't have any listings yet or if options changed
    if (listings.length === 0 || optionsString !== lastOptions) {
      setIsLoading(true);
    }
    
    setError(null);
    setLastOptions(optionsString);

    try {
      // Extract options into variables
      const {
        category,
        type,
        location,
        condition,
        minPrice,
        maxPrice,
        sortBy = "newest",
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
      if (category && category !== "all_categories") {
        query = query.eq("category", category);
      }

      if (type && type !== "all_types") {
        query = query.eq("type", type);
      }

      if (location && location !== "all_locations") {
        query = query.eq("location", location);
      }

      if (condition && condition !== "all_conditions") {
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

      // Apply sorting - map UI sort values to database fields
      let dbSortField = "created_at";
      let isAscending = false;

      switch (sortBy) {
        case "newest":
          dbSortField = "created_at";
          isAscending = false;
          break;
        case "oldest":
          dbSortField = "created_at";
          isAscending = true;
          break;
        case "price-low":
        case "price-asc":
          dbSortField = "price";
          isAscending = true;
          break;
        case "price-high": 
        case "price-desc":
          dbSortField = "price";
          isAscending = false;
          break;
        case "popular":
          dbSortField = "views";
          isAscending = false;
          break;
        default:
          // If sortBy contains a dash, parse it
          if (sortBy && sortBy.includes("-")) {
            const [field, order] = sortBy.split("-");
            if (field === "created_at" || field === "price") {
              dbSortField = field;
              isAscending = order === "asc";
            }
          }
          break;
      }
      
      // Apply sorting
      query = query.order(dbSortField, { ascending: isAscending });

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
      setIsLoading(false);
      setRetryCount(0);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load listings. Please try again later.");
      
      // Add retry logic
      if (retryCount < MAX_RETRIES) {
        const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchListings();
        }, retryDelay);
      } else {
        // Only show toast after max retries to prevent spamming
        // Keep the old data if we have it while showing the error
        setIsLoading(false);
        
        // Rate limit the error toasts
        if (retryCount === MAX_RETRIES) {
          toast({
            title: "Error",
            description: "We're having trouble connecting to our servers. Please try again later.",
            variant: "destructive",
          });
        }
      }
    }
  }, [options, retryCount, listings.length, isLoading, lastOptions]);

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
