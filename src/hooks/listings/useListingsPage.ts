import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useListings, useListingBids } from "@/hooks/listings";
import { useListingsCache } from "./useListingsCache";

export const useListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { clearCache } = useListingsCache();
  const pageSize = 9; // Number of items per page
  
  // Set up error display limits to prevent toast spam
  const [errorDisplayed, setErrorDisplayed] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get query parameters
  const category = searchParams.get("category") || "all_categories";
  const type = searchParams.get("type") || "all_types";
  const location = searchParams.get("location") || "all_locations";
  const condition = searchParams.get("condition") || "all_conditions";
  const minPrice = searchParams.get("minPrice") || "0";
  const maxPrice = searchParams.get("maxPrice") || "10000";
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = searchParams.get("page") || "1";
  const searchTerm = searchParams.get("search") || "";
  const allowBestOffer = searchParams.get("allowBestOffer") === "true";
  const showCompleted = searchParams.get("showCompleted") === "true";
  
  // Get listings
  const { listings, isLoading, error, totalCount, refetch } = useListings({
    category: category !== "all_categories" ? category : "",
    type: type !== "all_types" ? type : "",
    location: location !== "all_locations" ? location : "",
    condition: condition !== "all_conditions" ? condition : "",
    minPrice,
    maxPrice,
    sortBy,
    page,
    allowBestOffer: allowBestOffer ? "true" : "false",
    searchTerm,
    showCompleted: showCompleted ? "true" : "false",
  });
  
  // Calculate pagination
  const currentPage = parseInt(page) || 1;
  
  // Handle error toasting with rate limiting
  useEffect(() => {
    if (error && !errorDisplayed) {
      toast({
        title: "Connection Issue",
        description: "We're having trouble fetching listings. We'll keep trying automatically.",
        variant: "destructive",
      });
      
      setErrorDisplayed(true);
      
      // Reset error display flag after a delay to prevent continuous toasts
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      
      errorTimeoutRef.current = setTimeout(() => {
        setErrorDisplayed(false);
      }, 30000); // 30 seconds minimum between error toasts
    }
    
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error, toast, errorDisplayed]);
  
  // Handle page changes
  const handlePageChange = useCallback((newPage: number) => {
    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.set("page", newPage.toString());
    setSearchParams(updatedParams);
  }, [searchParams, setSearchParams]);
  
  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
    clearCache(); // Clear the entire cache when filters are reset
  }, [setSearchParams, clearCache]);
  
  // Add this to get the highest bids for all auction listings
  const auctionListingIds = listings
    ?.filter(listing => listing.type === "auction")
    .map(listing => listing.id) || [];
    
  const { highestBids, bidCounts } = useListingBids(auctionListingIds);
  
  // Remove auto-retry mechanism to prevent infinite loops
  
  return {
    listings,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    highestBids,
    bidCounts,
    handlePageChange,
    handleClearFilters,
    refetch
  };
};
