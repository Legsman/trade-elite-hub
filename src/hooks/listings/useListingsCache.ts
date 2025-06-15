
import { useState, useEffect, useRef, useCallback } from "react";
import { Listing } from "@/types";

interface CacheItem<T> {
  data: T;
  timestamp: number;
  cacheKey: string;
}

// Simple in-memory cache implementation
const memoryCache = new Map<string, CacheItem<any>>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Subscription tracking to prevent duplicate subscriptions
const activeSubscriptions = new Map<string, number>();

export const useListingsCache = () => {
  // Get cached data with expiry check
  const getCachedData = <T>(cacheKey: string): T | null => {
    const cached = memoryCache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_EXPIRY) {
      memoryCache.delete(cacheKey);
      return null;
    }

    return cached.data;
  };

  // Set data in cache
  const setCachedData = <T>(cacheKey: string, data: T) => {
    memoryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      cacheKey
    });
  };

  // Clear entire cache or specific key
  const clearCache = (cacheKey?: string) => {
    if (cacheKey) {
      memoryCache.delete(cacheKey);
    } else {
      memoryCache.clear();
    }
  };

  // --- NEW: Invalidate all listing caches containing listingId (for realtime updates) ---
  const invalidateListingCaches = (listingId: string) => {
    for (const key of Array.from(memoryCache.keys())) {
      if (key.includes(listingId)) {
        memoryCache.delete(key);
      }
    }
  };

  // Track active subscriptions
  const registerSubscription = (channelKey: string) => {
    const count = activeSubscriptions.get(channelKey) || 0;
    activeSubscriptions.set(channelKey, count + 1);
    return count === 0; // Return true if this is the first subscription
  };

  const unregisterSubscription = (channelKey: string) => {
    const count = activeSubscriptions.get(channelKey) || 0;
    if (count <= 1) {
      activeSubscriptions.delete(channelKey);
      return true; // Return true if this was the last subscription
    } else {
      activeSubscriptions.set(channelKey, count - 1);
      return false;
    }
  };

  return {
    getCachedData,
    setCachedData,
    clearCache,
    registerSubscription,
    unregisterSubscription,
    invalidateListingCaches // export for external use
  };
};
