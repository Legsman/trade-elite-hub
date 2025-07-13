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
  const { getCachedData, setCachedData, registerSubscription, unregisterSubscription, invalidateListingCaches } = useListingsCache();
  
  // Simple cache key generation
  const getCacheKey = useCallback((opts: UseListingsOptions) => {
    // Sort keys to ensure consistent cache keys
    const sortedOpts = Object.keys(opts).sort().reduce((sorted, key) => {
      sorted[key] = opts[key as keyof UseListingsOptions];
      return sorted;
    }, {} as any);
    return `listings:${JSON.stringify(sortedOpts)}`;
  }, []);
  
  const fetchListings = useCallback(async (skipCache = false) => {
    console.log("🔄 fetchListings called with options:", options, "skipCache:", skipCache);
    
    const cacheKey = getCacheKey(options);
    console.log("🔑 Cache key:", cacheKey);
    
    // Try cache first unless explicitly skipping
    if (!skipCache) {
      const cachedData = getCachedData<{listings: Listing[], totalCount: number}>(cacheKey);
      if (cachedData) {
        console.log("✅ Found cached data:", cachedData.listings.length, "listings");
        setListings(cachedData.listings);
        setTotalCount(cachedData.totalCount);
        setIsLoading(false);
        return;
      }
      console.log("🚫 No cached data found");
    }
    
    setIsLoading(true);
    setError(null);

    try {
      console.log("🌐 Making database query...");
      
      // First, let's check if there are ANY listings at all
      const { data: totalListings, error: totalError } = await supabase
        .from("listings")
        .select("id, status, expires_at")
        .limit(5);
        
      console.log("📋 Total listings check:", { 
        totalCount: totalListings?.length || 0, 
        totalError,
        sampleListings: totalListings 
      });
      
      // Create base query - start simple
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

      console.log("📡 Executing filtered query...");
      const { data, error: queryError, count } = await query;
      
      console.log("📊 Filtered query result:", { 
        dataLength: data?.length || 0, 
        count, 
        error: queryError 
      });

      if (queryError) {
        console.error("❌ Database query error:", queryError);
        throw queryError;
      }

      // Transform the data
      const mappedListings = transformListingData(data || []);
      console.log("🔄 Transformed listings:", mappedListings.length);
      
      // Store in cache
      const cacheData = {
        listings: mappedListings,
        totalCount: count || 0
      };
      setCachedData(cacheKey, cacheData);
      console.log("💾 Stored in cache");

      setListings(mappedListings);
      setTotalCount(count || 0);
      setIsLoading(false);
      
      console.log("✅ Successfully set listings:", mappedListings.length);
      
    } catch (err) {
      console.error("❌ Error fetching listings:", err);
      setError("Failed to load listings. Please try again later.");
      setIsLoading(false);
      
      toast({
        title: "Error Loading Listings",
        description: "Unable to load listings. Please refresh the page.",
        variant: "destructive",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options), getCacheKey, getCachedData, setCachedData]);

  // Fetch listings when options change
  useEffect(() => {
    console.log("🏁 useEffect triggered, fetching listings...");
    fetchListings();
  }, [fetchListings]);

  // Simplified realtime subscription
  useEffect(() => {
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
          (payload: any) => {
            console.log("🔄 Realtime event:", payload.eventType);
            // On any realtime event, refresh data (skip cache)
            fetchListings(true);
          }
        )
        .subscribe();
    }
    
    return () => {
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
