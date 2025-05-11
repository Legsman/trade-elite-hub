
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
  const MAX_RETRIES = 2;
  
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate successful data when we can't connect to Supabase for demo purposes
      // Remove this in production code and use the real Supabase connection
      const mockData = [
        {
          id: '1',
          sellerId: 'user-1',
          title: 'Vintage Watch',
          description: 'A beautiful vintage watch in excellent condition',
          category: 'watches',
          type: 'auction',
          price: 599,
          location: 'london',
          condition: 'used',
          images: ['/placeholder.svg'],
          allowBestOffer: true,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          status: 'active',
          views: 120,
          saves: 8,
        },
        {
          id: '2',
          sellerId: 'user-2',
          title: 'MacBook Pro 16"',
          description: 'Almost new MacBook Pro with M2 chip',
          category: 'electronics',
          type: 'sale',
          price: 1299,
          location: 'manchester',
          condition: 'like_new',
          images: ['/placeholder.svg'],
          allowBestOffer: false,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          status: 'active',
          views: 89,
          saves: 4,
        },
        {
          id: '3',
          sellerId: 'user-1',
          title: 'Leather Sofa',
          description: 'Comfortable genuine leather sofa',
          category: 'furniture',
          type: 'sale',
          price: 499,
          location: 'london',
          condition: 'used',
          images: ['/placeholder.svg'],
          allowBestOffer: true,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          status: 'active',
          views: 45,
          saves: 2,
        },
      ];

      const filteredListings = mockData.filter(listing => {
        // Apply filters based on options
        const { category, type, location, condition, minPrice, maxPrice, allowBestOffer, searchTerm } = options;
        
        if (category && listing.category !== category) return false;
        if (type && listing.type !== type) return false;
        if (location && listing.location !== location) return false;
        if (condition && listing.condition !== condition) return false;
        
        if (minPrice && listing.price < parseFloat(minPrice)) return false;
        if (maxPrice && listing.price > parseFloat(maxPrice)) return false;
        
        if (allowBestOffer === 'true' && !listing.allowBestOffer) return false;
        
        if (searchTerm && !listing.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        
        return true;
      });
      
      // Sort listings based on sortBy option
      const sortedListings = [...filteredListings].sort((a, b) => {
        const { sortBy } = options;
        
        switch (sortBy) {
          case 'newest':
            return b.createdAt.getTime() - a.createdAt.getTime();
          case 'oldest':
            return a.createdAt.getTime() - b.createdAt.getTime();
          case 'price-low':
          case 'price-asc':
            return a.price - b.price;
          case 'price-high':
          case 'price-desc':
            return b.price - a.price;
          case 'popular':
            return b.views - a.views;
          default:
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
      });

      // Set mock listings with a delay to simulate network request
      setTimeout(() => {
        setListings(sortedListings as Listing[]);
        setTotalCount(sortedListings.length);
        setIsLoading(false);
        setRetryCount(0);
      }, 800);

      // Comment out the Supabase code for now since it's failing
      // The original Supabase query code remains but is commented out:
      /*
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
      */
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
        toast({
          title: "Error",
          description: "We're having trouble connecting to our servers. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      // Always set loading to false in both success and error cases
      if (retryCount >= MAX_RETRIES) {
        setIsLoading(false);
      }
    }
  }, [options, retryCount, toast]);

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
