
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useListings, useListingBids } from "@/hooks/listings";

export const useListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const pageSize = 9; // Number of items per page
  
  // Set up error display limits to prevent toast spam
  const [errorDisplayed, setErrorDisplayed] = useState(false);
  
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
  });
  
  // Calculate pagination
  const currentPage = parseInt(page) || 1;
  
  // Handle error toasting with rate limiting
  useEffect(() => {
    if (error && !errorDisplayed) {
      toast({
        title: "Error loading listings",
        description: "We're having trouble connecting to the server. Please try again later.",
        variant: "destructive",
      });
      setErrorDisplayed(true);
      
      // Reset error display flag after a delay to prevent continuous toasts
      const timer = setTimeout(() => {
        setErrorDisplayed(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [error, toast, errorDisplayed]);
  
  // Handle page changes
  const handlePageChange = (newPage: number) => {
    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.set("page", newPage.toString());
    setSearchParams(updatedParams);
  };
  
  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);
  
  // Add this to get the highest bids for all listings
  const { highestBids } = useListingBids(
    listings?.filter(listing => listing.type === "auction").map(listing => listing.id) || []
  );
  
  return {
    listings,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    highestBids,
    handlePageChange,
    handleClearFilters,
    refetch
  };
};
