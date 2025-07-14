import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Listing } from "@/types";
import {
  FilterOptions,
  applyListingFilters,
  getSortConfig,
  applySorting,
  transformListingData,
  applyPagination
} from "./utils";
import { useListingsCache } from "./useListingsCache";

type UseListingsOptions = FilterOptions & {
  sortBy?: string;
  page?: string;
};

export const useListings = (options: UseListingsOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { getCachedData, setCachedData, registerSubscription, unregisterSubscription } = useListingsCache();
  
  // Generate stable cache key
  const cacheKey = useMemo(() => {
    const keys = Object.keys(options).sort();
    const sortedOptions: Record<string, any> = {};
    keys.forEach(key => {
      sortedOptions[key] = options[key as keyof UseListingsOptions];
    });
    return `listings:${JSON.stringify(sortedOptions)}`;
  }, [options]);
  
  const fetchListings = useCallback(async (skipCache = false) => {
    // Try cache first unless explicitly skipping
    if (!skipCache) {
      const cachedData = getCachedData<{listings: Listing[], totalCount: number}>(cacheKey);
      if (cachedData) {
        setListings(cachedData.listings);
        setTotalCount(cachedData.totalCount);
        setIsLoading(false);
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Create base query
      let query = supabase
        .from("listings")
        .select("*", { count: "exact" });

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

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw queryError;
      }

      // Transform the data
      const mappedListings = transformListingData(data || []);
      
      // Store in cache
      const cacheData = {
        listings: mappedListings,
        totalCount: count || 0
      };
      setCachedData(cacheKey, cacheData);

      setListings(mappedListings);
      setTotalCount(count || 0);
      setIsLoading(false);
      
    } catch (err) {
      setError("Failed to load listings. Please try again later.");
      setIsLoading(false);
      
      toast({
        title: "Error Loading Listings",
        description: "Unable to load listings. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [options, cacheKey, getCachedData, setCachedData]);

  // Fetch listings when options change
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Debounced realtime subscription
  useEffect(() => {
    const channelKey = 'listings-changes';
    const shouldSubscribe = registerSubscription(channelKey);

    let channel: any = null;
    let debounceTimer: NodeJS.Timeout;

    if (shouldSubscribe) {
      channel = supabase
        .channel(channelKey)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'listings',
          },
          () => {
            // Debounce real-time updates to prevent excessive refetching
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              fetchListings(true);
            }, 1000); // Wait 1 second before refetching
          }
        )
        .subscribe();
    }
    
    return () => {
      clearTimeout(debounceTimer);
      if (channel && unregisterSubscription(channelKey)) {
        supabase.removeChannel(channel);
      }
    };
  }, [registerSubscription, unregisterSubscription, fetchListings]);

  return {
    listings,
    isLoading,
    error,
    totalCount,
    refetch: () => fetchListings(true), // Force refresh from server, skip cache
  };
};
