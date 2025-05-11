
import { supabase } from "@/integrations/supabase/client";

export type FilterOptions = {
  category?: string;
  type?: string;
  location?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  allowBestOffer?: string;
  searchTerm?: string;
};

export const applyListingFilters = (query: any, filters: FilterOptions) => {
  const {
    category,
    type,
    location,
    condition,
    minPrice,
    maxPrice,
    allowBestOffer,
    searchTerm,
  } = filters;

  // Start with active listings
  let filteredQuery = query.eq("status", "active");

  // Apply category filter
  if (category && category !== "all_categories") {
    filteredQuery = filteredQuery.eq("category", category);
  }

  // Apply type filter
  if (type && type !== "all_types") {
    filteredQuery = filteredQuery.eq("type", type);
  }

  // Apply location filter
  if (location && location !== "all_locations") {
    filteredQuery = filteredQuery.eq("location", location);
  }

  // Apply condition filter
  if (condition && condition !== "all_conditions") {
    filteredQuery = filteredQuery.eq("condition", condition);
  }

  // Apply price range filters
  if (minPrice) {
    filteredQuery = filteredQuery.gte("price", minPrice);
  }

  if (maxPrice) {
    filteredQuery = filteredQuery.lte("price", maxPrice);
  }

  // Apply best offer filter
  if (allowBestOffer === "true") {
    filteredQuery = filteredQuery.eq("allow_best_offer", true);
  }

  // Apply search term filter
  if (searchTerm) {
    filteredQuery = filteredQuery.ilike("title", `%${searchTerm}%`);
  }

  return filteredQuery;
};
