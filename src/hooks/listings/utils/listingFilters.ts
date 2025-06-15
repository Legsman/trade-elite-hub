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
  showCompleted?: string;
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
    showCompleted,
  } = filters;

  // --- DB Queries: always use DB status, effective status derives in UI ---
  let filteredQuery = query;

  if (showCompleted !== "true") {
    // Only show active and non-expired listings
    filteredQuery = filteredQuery
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString());
  } else {
    filteredQuery = filteredQuery.in("status", ["active", "completed", "expired", "sold"]);
    // NO expires_at filter when showing completed
  }

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

  // Apply condition filter - normalize condition for case insensitive comparison
  if (condition && condition !== "all_conditions") {
    // Convert conditions like "like_new" to "Like New" format for database comparison
    let formattedCondition = condition;
    
    if (condition === "like_new") {
      formattedCondition = "Like New";
    } else if (condition === "new") {
      formattedCondition = "New";
    } else if (condition === "used") {
      formattedCondition = "Used";
    } else if (condition === "fair") {
      formattedCondition = "Fair";
    }
    
    filteredQuery = filteredQuery.eq("condition", formattedCondition);
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
