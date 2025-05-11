
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Listing } from "@/types";
import {
  FilterOptions,
  applyListingFilters,
  getSortConfig,
  applySorting,
  transformListingData,
  applyPagination,
  useRetryLogic
} from "./utils";

type UseListingsOptions = FilterOptions & {
  sortBy?: string;
  page?: string;
};

export const useListings = (options: UseListingsOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [lastOptions, setLastOptions] = useState<string>(""); // Track last used options
  const { retryCount, setRetryCount, scheduleRetry } = useRetryLogic();
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
      // Create base query
      let query = supabase
        .from("listings")
        .select("*", { count: "exact" }); // Get total count for pagination

      // Apply filters
      query = applyListingFilters(query, options);

      // Apply sorting
      const sortConfig = getSortConfig(options.sortBy);
      query = applySorting(query, sortConfig);

      // Apply pagination
      query = applyPagination(query, { 
        page: options.page || "1",
        pageSize: 9 
      });

      // Execute query
      const { data, error, count } = await query;

      if (error) throw error;

      // Transform the data
      const mappedListings = transformListingData(data);

      setListings(mappedListings);
      setTotalCount(count || 0);
      setIsLoading(false);
      setRetryCount(0);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load listings. Please try again later.");
      
      // Don't clear previous listings data on error
      // Only show loading spinner if we don't have any data yet
      if (listings.length === 0) {
        setIsLoading(false);
      }
      
      // Add retry logic
      scheduleRetry(fetchListings, MAX_RETRIES);
      
      // Only show toast after max retries to prevent spamming
      if (retryCount === MAX_RETRIES) {
        toast({
          title: "Error",
          description: "We're having trouble connecting to our servers. Please try again later.",
          variant: "destructive",
        });
      }
    }
  }, [options, retryCount, listings.length, isLoading, lastOptions, scheduleRetry, setRetryCount]);

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
