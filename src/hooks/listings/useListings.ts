import { useState, useEffect, useCallback, useRef } from "react";
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const optionsRef = useRef<string>("");
  const { getCachedData, setCachedData, registerSubscription, unregisterSubscription, invalidateListingCaches } = useListingsCache();
  
  // For error rate limiting
  const errorRef = useRef({
    count: 0,
    lastShown: 0,
    maxShown: 1
  });
  
  // Generate a cache key based on options
  const getCacheKey = useCallback((opts: UseListingsOptions) => {
    return `listings:${JSON.stringify(opts)}`;
  }, []);
  
  const fetchListings = useCallback(async (fromCache = true) => {
    // Generate a string representation of options for comparison
    const optionsString = JSON.stringify(options);
    
    // If options haven't changed and we're already loading, don't restart the fetch
    if (isLoading && optionsString === optionsRef.current) {
      return;
    }
    
    // Abort any in-progress requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    optionsRef.current = optionsString;
    const cacheKey = getCacheKey(options);
    
    // Try to get from cache first
    if (fromCache) {
      const cachedData = getCachedData<{listings: Listing[], totalCount: number}>(cacheKey);
      if (cachedData) {
        setListings(cachedData.listings);
        setTotalCount(cachedData.totalCount);
        setIsLoading(false);
        return;
      }
    }
    
    // Only show loading state if we don't have any listings yet or if options changed
    if (listings.length === 0 || optionsString !== optionsRef.current) {
      setIsLoading(true);
    }
    
    setError(null);

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

      // Execute query with abort signal
      // Note: Supabase doesn't directly support AbortController yet, but we
      // can still use it to track active requests on our side
      const { data, error, count } = await query;

      // Check if request was canceled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (error) throw error;

      // Transform the data
      const mappedListings = transformListingData(data);
      
      // Store in cache
      setCachedData(cacheKey, {
        listings: mappedListings,
        totalCount: count || 0
      });

      setListings(mappedListings);
      setTotalCount(count || 0);
      setIsLoading(false);
      
      // Reset error counter on success
      errorRef.current.count = 0;
    } catch (err) {
      console.error("Error fetching listings:", err);
      
      // Check if request was canceled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      setError("Failed to load listings. Please try again later.");
      
      // Don't clear previous listings data on error to preserve user experience
      // Only show loading spinner if we don't have any data yet
      if (listings.length === 0) {
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
      
      // Implement error rate limiting for toasts
      const now = Date.now();
      errorRef.current.count++;
      
      // Only show error toast if we haven't shown too many recently
      if (errorRef.current.count <= errorRef.current.maxShown || 
          now - errorRef.current.lastShown > 30000) { // 30 seconds
        toast({
          title: "Connection Error",
          description: "We're having trouble connecting to our servers. We'll keep trying.",
          variant: "destructive",
        });
        errorRef.current.lastShown = now;
      }
    }
  }, [options, listings.length, isLoading, getCacheKey, getCachedData, setCachedData]);

  // --- ENHANCED: Realtime subscription for per-row status updates ---
  useEffect(() => {
    // Fetch on mount and when options change
    fetchListings();
    
    const channelKey = 'listings-changes';
    const shouldSubscribe = registerSubscription(channelKey);

    let channel: any = null;

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
          (payload) => {
            // For UPDATED/INSERT/DELETE - handle real-time status changes and smart cache invalidation
            const newStatus = payload.new?.status;
            const oldStatus = payload.old?.status;
            const newExpiresAt = payload.new?.expires_at;
            const oldExpiresAt = payload.old?.expires_at;
            const affectedId = payload.new?.id || payload.old?.id;
            // For debug
            console.log("[Realtime listings] DB event:", payload);
            // If updated status, expires_at, or a row is deleted, invalidate
            if (
              payload.eventType === "UPDATE" &&
              (newStatus !== oldStatus || newExpiresAt !== oldExpiresAt)
            ) {
              if (affectedId) {
                invalidateListingCaches(affectedId);
                // Force reload from server, skip cache
                fetchListings(false);
                return;
              }
            } else if (
              payload.eventType === "INSERT" ||
              payload.eventType === "DELETE"
            ) {
              if (affectedId) {
                invalidateListingCaches(affectedId);
                fetchListings(false);
                return;
              }
            }
            // For any other event, default to full refetch
            fetchListings(false);
          }
        )
        .subscribe();
    }
    
    return () => {
      // Cleanup function
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (channel && unregisterSubscription(channelKey)) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchListings, registerSubscription, unregisterSubscription]);

  return {
    listings,
    isLoading,
    error,
    totalCount,
    refetch: () => fetchListings(false), // Force refresh from server
  };
};
